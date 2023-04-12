import { INodeType, INodeTypeDescription } from '../types';
import { WebhookNode } from '../webhookNode';

const template = `
{
  "events": [
    {
      "_id": "56db1f4613012711002229f8",
      "createdAt": "2023-02-15T11:46:14.401Z",
      "live": false,
      "type": "user.entered_geofence",
      "user": {
        "_id": "56db1f4613012711002229f4",
        "userId": "1",
        "deviceId": "C305F2DB-56DC-404F-B6C1-BC52F0B680D8",
        "metadata": {
          "customId": "123",
          "customFlag": false
        }
      },
      "geofence": {
        "_id": "56db1f4613012711002229fb",
        "tag": "neighborhood",
        "externalId": "4",
        "description": "Upper West Side"
      },
      "location": {
        "type": "Point",
        "coordinates": [
          -73.977797,
          40.783826
        ]
      },
      "locationAccuracy": 5,
      "confidence": 3
    },
    {
      "_id": "56db1f4613012711002229f6",
      "createdAt": "2023-02-15T11:46:14.401Z",
      "live": false,
      "type": "user.entered_geofence",
      "user": {
        "_id": "56db1f4613012711002229f4",
        "userId": "1",
        "deviceId": "C305F2DB-56DC-404F-B6C1-BC52F0B680D8",
        "metadata": {
          "customId": "123",
          "customFlag": false
        }
      },
      "place": {
        "_id": "5a631784f61757fe9bb9847a",
        "name": "Starbucks",
        "chain": {
          "name": "Starbucks",
          "slug": "starbucks",
          "domain": "starbucks.com"
        },
        "location": {
          "type": "Point",
          "coordinates": [
            -73.977797,
            40.783826
          ]
        },
        "categories": [
          "food-beverage",
          "cafe",
          "coffee-shop"
        ]
      },
      "location": {
        "type": "Point",
        "coordinates": [
          -73.977797,
          40.783826
        ]
      },
      "locationAccuracy": 5,
      "confidence": 2
    }
  ],
  "user": {
    "_id": "56db1f4613012711002229f4",
    "live": false,
    "userId": "1",
    "deviceId": "C305F2DB-56DC-404F-B6C1-BC52F0B680D8",
    "metadata": {
      "customId": "123",
      "customFlag": false
    },
    "updatedAt": "2023-02-15T11:46:14.401Z",
    "createdAt": "2023-02-15T11:46:14.401Z",
    "location": {
      "type": "Point",
      "coordinates": [
        -73.977797,
        40.783826
      ]
    },
    "locationAccuracy": 5,
    "stopped": true,
    "foreground": false,
    "deviceType": "iOS",
    "ip": "173.14.0.1",
    "geofences": [
      {
        "_id": "56db1f4613012711002229fb",
        "tag": "neighborhood",
        "externalId": "4",
        "description": "Upper West Side"
      }
    ],
    "place": {
      "_id": "5a631784f61757fe9bb9847a",
      "name": "Starbucks",
      "chain": {
        "name": "Starbucks",
        "slug": "starbucks",
        "domain": "starbucks.com"
      },
      "location": {
        "type": "Point",
        "coordinates": [
          -73.977797,
          40.783826
        ]
      },
      "categories": [
        "food-beverage",
        "cafe",
        "coffee-shop"
      ]
    }
  }
}
`;

export class RadarNode extends WebhookNode {
  description: INodeTypeDescription = {
    displayName: 'Radar',
    name: 'RadarNode',
    //@ts-ignore
    nodeType: 'webhook',
    icon: 'Radar2',
    group: 'trigger',
    groupIcon: 'SiAiohttp',
    version: '1.0',
    description: 'Webhook node description',
    withTargetHandle: false,
    withSourceHandle: true
  };

  constructor() {
    super();
    this.form.formList[0].form[1].props.templateValue = template;
  }
}
