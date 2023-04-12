import React, { AllHTMLAttributes, useEffect } from 'react';
import { useLocalObservable, observer } from 'mobx-react-lite';
import { _ } from '@/lib/lodash';
import { extendObservable, makeAutoObservable, toJS } from 'mobx';

// export let JSONRenderComponentsMap = {
//   div: Box,
//   WebhookSubmitWidget: WebhookSubmitWidget,
//   JSONForm: JSONForm,
// };
// @ts-ignore
export type JSONRenderComponent = keyof typeof JSONRenderComponentsMap;

export interface JSONSchemaRenderData {
  component: JSONRenderComponent;
  key: string;
  props?: AllHTMLAttributes<any> & { [key: string]: any };
  $props?: AllHTMLAttributes<any> & { [key: string]: any };
  $events?: Record<string, any>;
  extra?: {
    props: Record<string, any>;
  };
  children?: JSONSchemaRenderData[] | string | number | boolean;
  $children?: string;
}

interface Props {
  json: JSONSchemaRenderData;
  data?: any;
  store?: any;
  eventBus?: { emit: any };
  componentMaps: { [key: string]: React.ComponentType<any> | string };
}
// @ts-ignore
export type JSONRenderStoreCtx = Record<JSONRenderComponent, any> | {};

export class JSONRenderGlobalStore {
  store: Record<JSONRenderComponent, any> | {} = {};

  constructor() {
    makeAutoObservable(this);
  }
}

export const jsonRenderGlobalStore = new JSONRenderGlobalStore().store;

//@ts-ignore
export const JSONRender = observer((props: Props) => {
  const { json, data = {}, eventBus, componentMaps, store } = props;
  // useEffect(() => {
  //   if(JSONForm){
  //     componentMaps['JSONForm'] = JSONForm;
  //   }

  // }, [JSONForm]);
  if (!json.props) json.props = {};

  console.log('render');
  if (json.$children) {
    json.children = _.get(data, json.$children, '');
  }
  if (json.$events) {
    Object.keys(json.$events).forEach((key) => {
      json.props[key] = (e) => {
        eventBus.emit(json.$events[key], e);
      };
    });
  }

  if (json.$props) {
    const p = Object.keys(json.$props).reduce((acc, key) => {
      acc[key] = _.get(data, json.$props[key], '');
      return acc;
    }, {});
    Object.assign(json.props, p);
  }
  // if (!store[json.key]) {
  //   console.log('json', json);
  // }
  //todo: fix if same node ,the value will be override,but if the same jsonRender in one page show two same , it will be ok
  // store[json.key] = helper.deepAssign(store?.[json.key] || {}, json.props);
  store[json.key] = json.props;

  //@ts-ignore
  const Comp = componentMaps[json.component];

  if (typeof Comp !== 'undefined') {
    return (
      // {...toJS(store[json.key])} if toJs then JSONForm will not display
      // {...store[json.key]} if Storestore[json.key] then JSONForm will not work
      <>
        <Comp {...json.props} store={store}>
          {['string', 'number', 'boolean', 'undefined'].includes(typeof json.children)
            ? json.children
            : (json.children as any[]).map((c) => <JSONRender json={c} data={data} eventBus={eventBus} componentMaps={componentMaps} store={store} />)}
        </Comp>
      </>
    );
  }
  return <></>;
});
