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

export type VSCodeFilesType = {
  name: string;
  path: string;
  content: string;
};
export class ProjectManager {
  projects: ProjectType[] = [];
  rightClickLock: boolean = false;
  files: MappingState<FilesListSchema> = new MappingState({
    currentId: '',
    map: {}
  });
  wsClient: Client;
  isWSConnect = false;

  get curFilesList() {
    this.files.setCurrentId(String(rootStore?.w3s.curProject?.f_project_id));
    return this.files.current?.files;
  }

  get curFilesListSchema() {
    this.files.setCurrentId(String(rootStore?.w3s.curProject?.f_project_id));
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
          result = data;
          this.isWSConnect = true
        },
        error: ()=>{
          this.isWSConnect = false
          reject()
        },
        complete: () => resolve(result)
      });
    });
  }
  sync() {
    _.each(rootStore?.w3s.allProjects.value, async (v: ProjectType, k) => {
      const IndexDbFile = await IndexDb.findFilesById(String(v.f_project_id));
      if (IndexDbFile[0]) {
        let filesListSchema = new FilesListSchema(IndexDbFile[0].data);
        this.files.setMap(String(v.f_project_id), filesListSchema);
      } else {
        this.files.setMap(String(v.f_project_id), new FilesListSchema({ project_id: String(v.f_project_id) }));
      }
    });
  }
}
