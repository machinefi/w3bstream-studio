import { INodeType, INodeTypeDescription } from '../types';
import { WebhookNode } from '../webhookNode';

const template = `
{
   "version": "2.0",
   "webhookId": "6f9c7e43-2278-4a9b-b273-cdacab9ed83c",
   "eventName": "schedule",
   "mode": "live",
   "payload": {
      "vehicles": [
         {
         "vehicleId": "1a9fdd59-b65e-4bf1-8264-5448812eac83",
         "requestId": "6c22cd5c-34df-48ae-ad90-b324170629be",
         "data": [
            {
               "path": "/",
               "code": 200,
               "body": {
                  "id": "1a9fdd59-b65e-4bf1-8264-5448812eac83",
                  "make": "BMW",
                  "model": "i3 94 (+ REX)",
                  "year": 2017
               },
               "headers": {}
            },
            {
               "path": "/fuel",
               "code": 200,
               "body": {
                  "range": 44.12,
                  "percentRemaining": 0.57,
                  "amountRemaining": 1.32
               },
               "headers": {
                  "sc-data-age": "2020-05-11T23:44:31.000Z",
                  "sc-unit-system": "imperial"
               }
            },
            {
               "path": "/vin",
               "code": 200,
               "body": {
                  "vin": "WBY1Z8C54HV550878"
               },
               "headers": {}
            }
         ],
         "timestamp": "2020-05-13T22:00:01.288Z"
         }
      ]
   }
}


`;

export class CarNode extends WebhookNode {
  description: INodeTypeDescription = {
    displayName: 'SmartCar',
    name: 'CarNode',
    nodeType: 'webhook',
    icon: 'AiOutlineCar',
    group: 'trigger',
    groupIcon: 'SiAiohttp',
    version: '1.0',
    description: 'Webhook node description',
    withTargetHandle: false,
    withSourceHandle: true,
  };

  constructor() {
    super();
    // this.jsonSchema.value.body = template;
    // this.setJSONFormValue({ body: template });
    this.form.formList[0].form[1].props.templateValue = template;
  }
}
