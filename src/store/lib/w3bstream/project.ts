import { ProjectType } from '@/server/routers/w3bstream';
import { makeAutoObservable } from 'mobx';
import { MappingState } from '@/store/standard/MappingState';
import { FilesListSchema } from './schema/filesList';
import _ from 'lodash';
import { rootStore } from '../../index';
import { IndexDb } from '@/lib/dexie';
import { config } from '@/lib/config';
import { createClient, SubscribePayload, Client } from 'graphql-ws';
import { v4 as uuidv4 } from 'uuid';
import { JSONSchemaFormState, JSONValue } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import InitWasmTemplateWidget from '@/components/JSONFormWidgets/InitWasmTemplateWidget';
import { eventBus } from '@/lib/event';

export const initWasmTemplateFormSchema = {
  type: 'object',
  properties: {
    template: { type: 'string', title: 'Explore Templates' }
  },
  required: ['template']
} as const;
type InitWasmTemplateFormSchemaType = FromSchema<typeof initWasmTemplateFormSchema>;

export type VSCodeFilesType = {
  name: string;
  path: string;
  content: string;
  studioOptions: {
    dev: boolean;
    projectName: string;
    payload: string;
  };
};
export class ProjectManager {
  projects: ProjectType[] = [];
  rightClickLock: boolean = false;
  files: MappingState<FilesListSchema> = new MappingState({
    currentId: 'GLOBAL',
    map: {}
  });
  initWasmTemplateForm = new JSONSchemaFormState<InitWasmTemplateFormSchemaType>({
    //@ts-ignore
    schema: initWasmTemplateFormSchema,
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: false,
        submitText: 'Submit'
      },
      template: {
        'ui:widget': InitWasmTemplateWidget
      },
      layout: [['name', 'description'], 'template']
    },
    afterSubmit: async (e) => {
      eventBus.emit('base.formModal.afterSubmit', e.formData);
      this.initWasmTemplateForm.reset();
    },
    value: new JSONValue<InitWasmTemplateFormSchemaType>({
      default: {
        template: ''
      }
    })
  });
  wsClient: Client;
  isWSConnect = false;

  get curFilesList() {
    this.files.setCurrentId('GLOBAL');
    return this.files.current?.files;
  }

  get curFilesListSchema() {
    this.files.setCurrentId('GLOBAL');
    return this.files.current;
  }

  constructor() {
    makeAutoObservable(this);
  }

  async connectWs() {
    const query = `subscription{
      files {
        name
        path
        content
        studioOptions {
          dev
          projectName
          payload
        }
      }
  }`;
    this.wsClient = createClient({
      url: config.VSCODE_GRAPHQL_WS_ENDPOINT
    });
    await this.executeSubscribe({ query });
  }

  async executeSubscribe<T>(payload: SubscribePayload) {
    return new Promise<T>((resolve, reject) => {
      let result: any;
      this.wsClient.subscribe<T>(payload, {
        // @ts-ignore
        next: (data: {
          data: {
            files: VSCodeFilesType[];
          };
        }) => {
          this.curFilesListSchema.setVscodeRemotFile(data.data.files);
          this.curFilesListSchema.runAutoDevActions(data.data.files);
          result = data;
          this.isWSConnect = true;
        },
        error: () => {
          this.isWSConnect = false;
          reject();
        },
        complete: () => resolve(result)
      });
    });
  }
  sync() {
    _.each(rootStore?.w3s.project.allProjects.value, async (v: ProjectType, k) => {
      const project_id = 'GLOBAL';
      const IndexDbFile = await IndexDb.findFilesById(project_id);
      if (IndexDbFile[0]) {
        let filesListSchema = new FilesListSchema(IndexDbFile[0].data);
        this.files.setMap(project_id, filesListSchema);
      } else {
        this.files.setMap(project_id, new FilesListSchema({ project_id: project_id }));
      }
    });
  }
}
