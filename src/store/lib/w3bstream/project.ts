import { ProjectType } from '@/server/routers/w3bstream';
import { makeAutoObservable } from 'mobx';
import { MappingState } from '@/store/standard/MappingState';
import { FilesListSchema } from './schema/filesList';
import { _ } from '@/lib/lodash';
import { IndexDb } from '@/lib/dexie';
import { createClient, SubscribePayload, Client } from 'graphql-ws';
import { JSONSchemaFormState, JSONValue } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import InitWasmTemplateWidget from '@/components/JSONFormWidgets/InitWasmTemplateWidget';
import { eventBus } from '@/lib/event';
import axios from 'axios';
import toast from 'react-hot-toast';

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
      console.log(e.formData);
    },
    value: new JSONValue<SetVscodeSettingFormSchemaType>({
      default: {
        port: 11400
      }
    })
  });

  isWSConnect = false;
  isWSConnectLoading = false;

  get wsPort() {
    return this.setVscodeSettingForm.value.value.port;
  }

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

  async uiConnectWs() {
    try {
      this.isWSConnectLoading = true;
      await this.connectWs();
    } catch (e) {
      toast.error(`Connect to port ${this.wsPort} failed!`);
      if (!this.isWSConnect) {
        window.open('vscode://w3bstream.w3bstream-vscode-extension');
      }
    }
  }
  async connectWs() {
    try {
      this.wsClient?.dispose();
    } catch (e) {}
    this.isWSConnectLoading = true;
    // await helper.promise.sleep(2000);
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
    toast.success('Compile Command Sent to VSCode!');
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
        }
      });

      this.wsClient.on('closed', (e) => {
        console.log('closed');
      });
    });
  }

  async unsubscribe() {
    this.wsClient?.dispose();
    this.curFilesListSchema.setVscodeRemotFile([]);
    this.isWSConnect = false;
    this.isWSConnectLoading = false;
  }

  sync() {
    _.each([undefined], async (v: ProjectType, k) => {
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
