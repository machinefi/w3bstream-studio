import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter'

class MyEmitter extends EventEmitter {
  emit(type: any, ...args: any[]) {
    super.emit('*', { type, args });
    return super.emit(type, ...args) || super.emit('', ...args);
  }
}

interface MessageEvents {
  // @ts-ignore
  '*': ({ type: string, args: [] }) => void;
  'user.login': () => void;
  'user.updatepwd': () => void;
  'project.list': (data: any[]) => void;
  'project.create': () => void;
  'applet.list': (data: any[]) => void;
  'applet.create': () => void;
  'instance.deploy': () => void;
  'instance.handle': () => void;

  signer: (signer: any) => void;
  provider: (signer: any) => void;
}

export const eventBus = new MyEmitter() as TypedEmitter<MessageEvents>;
