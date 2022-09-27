import { LangStore } from './lang';
import { W3bStream } from './lib/w3bstream/index';

export default class RootStore {
  lang = new LangStore();
  // god = new GodStore(this);
  // user = new UserStore(this);
  // history = new TransactionHistoryStore(this);
  w3s = new W3bStream(this);
}
