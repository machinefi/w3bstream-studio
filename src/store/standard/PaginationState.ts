import { makeAutoObservable } from 'mobx';

type ArgsType = { page: number; limit: number; total: number };

export class PaginationState {
  page = 1;
  limit = 10;
  total = 0;

  constructor(args: Partial<ArgsType>) {
    Object.assign(this, args);
    makeAutoObservable(this);
  }

  get offset() {
    return (this.page - 1) * this.limit;
  }

  setData(v: Partial<ArgsType>) {
    Object.assign(this, v);
  }
}
