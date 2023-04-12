import { FromSchema } from 'json-schema-to-ts';
import { v4 as uuid } from 'uuid';
import { JSONSchemaRenderData } from '@/components/JSONRender';
import { BaseNode, BaseNodeForm } from '../baseNode';
import { IFormType, INodeTypeDescription } from '../types';
import { eventBus } from '@/lib/event';
//@ts-ignore
import { faker } from '@faker-js/faker';

const template = `
//https://github.com/faker-js/faker
function createRandomUser() {
  return {
    userId: faker.datatype.uuid(),
    username: faker.internet.userName(),
    email: faker.internet.email(),
    avatar: faker.image.avatar(),
    password: faker.internet.password(),
    birthdate: faker.date.birthdate(),
    registeredAt: faker.date.past(),
  };
}

return faker.helpers.multiple(createRandomUser, {
  count: 5,
});

`;
export const dataSimulationNodeSchema = {
  type: 'object',
  properties: {
    code: { type: 'string', title: 'Code' }
  },
  required: ['id', 'code']
} as const;

export type dataSimulationNodeSchemaType = FromSchema<typeof dataSimulationNodeSchema>;

export class SimulationNode extends BaseNode {
  uuid = uuid();
  description: INodeTypeDescription = {
    displayName: 'Simulation',
    name: 'SimulationNode',
    // nodeType: 'simulation',
    icon: 'TbWebhook',
    group: 'trigger',
    groupIcon: '/images/icons/icon_trigger.png',
    version: '1.0',
    description: 'Simulation node description',
    withTargetHandle: false,
    withSourceHandle: true
  };

  static node_type = 'SimulationNode';
  static async execute({ input, output, node, callStack, callStackCurIdx }) {
    try {
      node.input = {};
      //sdk https://github.com/nuysoft/Mock/wiki/Getting-Started mockjs
      const res = new Function('faker', node.data.code)(faker);
      node.output = res;
      console.log('simulation', res);
      eventBus.emit('flow.run.result', {
        flowId: node.id,
        success: true
      });
    } catch (e) {
      console.log(e.message, 'simulation');
      eventBus.emit('flow.run.result', {
        flowId: node.id,
        success: false,
        errMsg: e.message
      });
    }
  }

  form: IFormType = {
    title: 'Edit Webhook Node',
    size: '70%',
    formList: [
      {
        label: 'Simulation',
        form: [
          {
            key: 'JSONForm',
            component: 'JSONForm',
            props: {
              formState: {
                schema: dataSimulationNodeSchema,
                uiSchema: {
                  'ui:submitButtonOptions': {
                    norender: true,
                    submitText: 'OK'
                  },
                  code: {
                    // @ts-ignore
                    'ui:widget': 'EditorWidget',
                    'ui:options': {
                      emptyValue: ``,
                      lang: 'javascript',
                      editorHeight: '400px'
                    }
                  },
                  fieldLabelLayout: {
                    direction: 'horizontal',
                    labelWidth: '200px'
                  }
                },
                value: {
                  code: ''
                }
              }
            }
          }
        ]
      },
      BaseNodeForm({ label: 'Simulation' })
    ]
  };

  constructor() {
    super();
    this.form.formList[0].form[0].props.formState.value.code = template;
  }
}
