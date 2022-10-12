import { LangStore } from './lang';
import { W3bStream } from './lib/w3bstream';

export default class RootStore {
  lang = new LangStore();
  w3s = new W3bStream(this);
}
