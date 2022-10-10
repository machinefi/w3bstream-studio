import { LangStore } from './lang';
import { GodStore } from './god';
import { UserStore } from './user';
import { TransactionHistoryStore } from './history';
import { W3bStream } from './lib/w3bstream';
import { Base } from './base';
import { IDEStore } from './ide';

export default class RootStore {
  lang = new LangStore();
  god = new GodStore(this);
  user = new UserStore(this);
  history = new TransactionHistoryStore(this);
  w3s = new W3bStream(this);
  base = new Base();
  ide = new IDEStore();
}
