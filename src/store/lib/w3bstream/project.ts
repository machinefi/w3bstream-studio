import { ProjectsType } from '@/server/routers/w3bstream';
import { makeAutoObservable } from 'mobx';
import { Type } from 'class-transformer';
import { MappingState } from '@/store/standard/MappingState';
import { FilesListSchema, FilesType } from './schema/filesList';
import _ from 'lodash';
import { rootStore } from '../../index';
// import RootStore from '@/store/root';
import { helper } from '@/lib/helper';
import { IndexDb } from '@/lib/dexie';
import { JSONValue } from '@/store/standard/JSONSchemaState';

export class ProjectManager {
  projects: ProjectsType[] = [];

  files: MappingState<FilesListSchema> = new MappingState({
    currentId: '',
    map: {}
  });

  get curFilesList() {
    this.files.setCurrentId(String(rootStore?.w3s.curProject?.f_project_id));
    return this.files.current?.extraData?.files;
  }

  get curFilesListSchema() {
    this.files.setCurrentId(String(rootStore?.w3s.curProject?.f_project_id));
    return this.files.current;
  }

  constructor() {
    makeAutoObservable(this);
  }

  sync() {
    _.each(rootStore?.w3s.allProjects.value, async (v: ProjectsType, k) => {
      const IndexDbFile = await IndexDb.findFilesById(String(v.f_project_id));
      if (IndexDbFile[0]) {
        const filesListSchema = new FilesListSchema({
          project_id: IndexDbFile[0].id
        });
        filesListSchema.extraData = IndexDbFile[0].data;
        this.files.setMap(String(v.f_project_id), filesListSchema);
      } else {
        this.files.setMap(String(v.f_project_id), new FilesListSchema({ project_id: String(v.f_project_id) }));
      }
    });
  }
}
