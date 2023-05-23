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
import axios from 'axios';
import { toast } from '@/lib/helper';

export const initWasmTemplateFormSchema = {
  type: 'object',
  properties: {
    template: { type: 'string', title: 'Explore Templates' }
  },
  required: ['template']
} as const;
type InitWasmTemplateFormSchemaType = FromSchema<typeof initWasmTemplateFormSchema>;

export const setVscodeSettingFormSchema = {
  type: 'object',
  properties: {
    port: { type: 'number', title: 'VSCode extension connect port' }
  },
  required: ['port']
} as const;
type SetVscodeSettingFormSchemaType = FromSchema<typeof setVscodeSettingFormSchema>;

export type VSCodeFilesType = {
  name: string;
  path: string;
  content: string;
  size: number;
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
      }
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
  wsPort = 11400;
  setVscodeSettingForm = new JSONSchemaFormState<SetVscodeSettingFormSchemaType>({
    //@ts-ignore
    schema: setVscodeSettingFormSchema,
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: false,
        submitText: 'Submit'
      },
      template: {
        'ui:widget': InitWasmTemplateWidget
      }
    },
    afterSubmit: async (e) => {
      eventBus.emit('base.formModal.afterSubmit', e.formData);
      this.setVscodeSettingForm.reset();
      console.log(e.formData);
      this.wsPort = e.formData.port;
      await this.connectWs();
      if (!this.isWSConnect) {
        toast.error('Connect VSCode extension Failed!');
      }
    },
    value: new JSONValue<SetVscodeSettingFormSchemaType>({
      default: {
        port: this.wsPort
      }
    })
  });

  isWSConnect = false;
  isWSConnectLoading = false;

  get curFilesList() {
    this.files.setCurrentId('GLOBAL');
    return this.files.current?.files;
  }

  get curFilesListSchema() {
    this.files.setCurrentId('GLOBAL');
    return this.files.current;
  }

  init() {
    this.files.setCurrentId('GLOBAL');
    this.sync();
  }
  constructor() {
    makeAutoObservable(this);
  }

  get vscodeEndPoint() {
    return {
      ws: `ws://127.0.0.1:${this.wsPort}/graphql`,
      http: `http://127.0.0.1:${this.wsPort}/graphql`
    };
  }

  async connectWs() {
    try {
      this.wsClient?.dispose();
    } catch (e) {}
    this.isWSConnectLoading = true;
    const query = `subscription{
      files {
        name
        path
        content
        size
      }
  }`;
    this.wsClient = createClient({
      url: this.vscodeEndPoint.ws
    });
    await this.executeSubscribe({ query });
  }

  async compiler() {
    const res = await axios.post(this.vscodeEndPoint.http, {
      query: `mutation { compile }`
    });
    toast.success('Command Sended to VSCode!');
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
          console.log(data, 'data');
          this.curFilesListSchema.setVscodeRemotFile(data.data.files);
          // this.curFilesListSchema.runAutoDevActions(data.data.files);
          result = data;
          this.isWSConnect = true;
          this.isWSConnectLoading = false;
        },
        error: (e) => {
          console.log('error Connect', e);
          this.curFilesListSchema.setVscodeRemotFile([]);
          this.isWSConnect = false;
          this.isWSConnectLoading = false;
          // toast.error('Connect VSCode extension Failed!');
          reject();
        },
        complete: () => {
          resolve(result);
          this.isWSConnectLoading = false;
        },
        unsubscribe: () => {
          // console.log('unsubscribe ');
        },
        start: () => {
          // console.log('start');
        }
      });
    });
  }
  sync() {
    _.each([undefined], async (v: ProjectType, k) => {
      console.log('ssssync');
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
