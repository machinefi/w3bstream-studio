import { Base } from './base';
import { GodStore } from './god';
import { LangStore } from './lang';
import { W3bStream } from './lib/w3bstream';

export default class RootStore {
  base = new Base();
  lang = new LangStore();
  god = new GodStore();
  w3s = new W3bStream(this);
}
