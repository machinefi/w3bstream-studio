import { eventBus } from '@/lib/event';
import { IFormType, INodeType, INodeTypeDescription } from '@/lib/nodes/types';
import { UiSchema } from '@rjsf/utils';
import { JSONSchemaFormState, JSONValue } from './JSONSchemaState';
import { v4 as uuid } from 'uuid';
import { _ } from '@/lib/lodash';
import { result } from 'lodash';
export class FlowNode {
  uuid: string;
  description: INodeTypeDescription;
  form: IFormType;
  input: Record<string, any> = {};
  output: Record<string, any> = {};
  originJSON: Partial<INodeType>;

  constructor(args: Partial<INodeType>) {
    this.originJSON = args;
    const contextJson = this.init(args);
    if (!contextJson) return;
    this.init(contextJson);
  }

  init(args: Partial<INodeType>): INodeType {
    Object.assign(this, args);
    const argsString = this.templateSyntaxInterpreter(JSON.stringify(args));
    // console.log(argsString);
    const argsJson: INodeType = JSON.parse(argsString);
    // console.log(argsJson);
    this.form = _.cloneDeep(argsJson.form);
    if (!this.form) return;
    this.form.formList = this.form?.formList?.map((item) => {
      return {
        ...item,
        form: item.form.map((form) => {
          // form.key = uuid();
          if (form.component == 'JSONForm') {
            form.key = uuid();
            form.props.formState = new JSONSchemaFormState({
              schema: form.props.formState?.schema,
              uiSchema: form.props.formState?.uiSchema,
              afterSubmit: async (e) => {
                eventBus.emit('base.formModal.afterSubmit', e.formData);
              },
              value: new JSONValue<any>({
                default: form.props.formState?.value,
                value: form.props.formState?.value
              })
            });
          }
          return form;
        })
      };
    });
    return argsJson;
  }

  setJSONFormValue = (value: any) => {
    this.form?.formList?.forEach((item, index) => {
      const jsonForm = item.form?.find((item) => item.component === 'JSONForm');
      const formState = jsonForm.props.formState as JSONSchemaFormState<any, any>;
      const newValue = {};
      Object.keys(value).forEach((key) => {
        Object.keys(formState.value.value).forEach((formKey) => {
          if (key === formKey) {
            newValue[key] = value[key];
          }
        });
      });
      jsonForm && formState.value.set(newValue);
    });
    return;
  };

  getJSONFormDefaultValue = () => {
    this.reInit();
    const value = {};
    this.form?.formList?.forEach((item, index) => {
      const jsonForm = item.form?.find((item) => item.component === 'JSONForm');
      const formState = jsonForm.props.formState as JSONSchemaFormState<any, any>;
      Object.keys(formState.value.value).forEach((key) => {
        value[key] = formState.value.default[key];
      });
    });
    return value;
  };

  getJSONFormValue = () => {
    const value = {};
    this.form?.formList?.forEach((item, index) => {
      const jsonForm = item.form?.find((item) => item.component === 'JSONForm');
      const formState = jsonForm.props.formState as JSONSchemaFormState<any, any>;
      Object.keys(formState.value.value).forEach((key) => {
        value[key] = formState.value.value[key];
      });
    });
    return value;
  };

  reInit() {
    const contextJson = this.init(this.originJSON);
    if (!contextJson) return;
    this.init(contextJson);
  }

  templateSyntaxInterpreter = (str: string): string => {
    str = str?.replace(/"=\{\{(.+?)\}\}="/g, (match, expression) => {
      try {
        const result = new Function('uuid', `return ${expression}`)(uuid);
        if (typeof result === 'string') {
          // console.log(result);
          return `"${result}"`;
        } else {
          // console.log(JSON.stringify(result));
          return JSON.stringify(result);
        }
      } catch (error) {
        console.log(expression, 'error');
        console.log(error);
        return `={{${expression.replace(/[\r\n]/g, '')}}}=`;
      }
    });
    return str;
  };

  mountScope = (expression: string): string => {
    globalThis.uuid = uuid;
    globalThis.currentFormList = this.form;
    if (expression.includes('this.')) {
      return expression.replace(/this\./g, 'globalThis.currentFormList.');
    }
    switch (expression) {
      case 'uuid()':
        return 'globalThis.uuid()';
      default:
        return expression;
    }
  };
}
