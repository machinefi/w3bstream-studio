import { makeAutoObservable } from 'mobx';

type ArgsType = { page: number; limit: number; total: number, onPageChange: (page: number) => void };

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

  onPageChange(page: number) {}

  setData(v: Partial<ArgsType>) {
    Object.assign(this, v);
    if (v.page) {
      this.onPageChange(v.page);
    }
  }
}
