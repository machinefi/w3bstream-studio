import { FilesListSchema } from '@/store/lib/w3bstream/schema/filesList';
import Dexie, { Table } from 'dexie';
import { toJS } from 'mobx';

export interface Files {
  id?: string;
  data: FilesListSchema;
}


export interface Kvs {
  key: string;
  value: string;
}

class IndexDatabase extends Dexie {
  public files!: Table<Files>;
  public kvs!: Table<Kvs>;

  public constructor() {
    super('IndexDatabase');
    this.version(8).stores({
      files: '++id,data',
      kvs: 'key,string'
    });
  }

  findFilesById(id: string) {
    return this.files.filter((i) => i.id == id).toArray();
  }
}
export const IndexDb = new IndexDatabase();
