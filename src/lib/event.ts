import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import { JSONSchemaModalState } from '../store/standard/JSONSchemaState';

class MyEmitter extends EventEmitter {
  emit(type: any, ...args: any[]) {
    super.emit('*', { type, args });
    return super.emit(type, ...args) || super.emit('', ...args);
  }
}

interface MessageEvents {
  // @ts-ignore
  '*': ({ type: string, args: [] }) => void;
  'app.ready': () => void;
  'user.login': () => void;
  'user.update-pwd': () => void;
  'project.list': (data: any[]) => void;
  'project.create': () => void;
  'applet.list': (data: any[]) => void;
  'applet.create': () => void;
  'applet.publish-event': () => void;
  'instance.deploy': () => void;
  'instance.handle': () => void;
  'publisher.create': () => void;
  'spotlight.register': (state: JSONSchemaModalState) => void;

  signer: (signer: any) => void;
  provider: (signer: any) => void;
}

export const eventBus = new MyEmitter() as TypedEmitter<MessageEvents>;
