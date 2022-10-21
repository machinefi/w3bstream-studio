import { FilesType } from '@/store/lib/w3bstream/schema/filesList';
import Dexie, { Table } from 'dexie';

export interface Files {
  id?: string;
  data: FilesType;
}

class IndexDatabase extends Dexie {
  public files!: Table<Files>;

  public constructor() {
    super('IndexDatabase');
    this.version(5).stores({
      files: '++id,data'
    });
  }

  findFilesById(id: string) {
    return this.files.filter((i) => i.id == id).toArray();
  }
}
export const IndexDb = new IndexDatabase();
