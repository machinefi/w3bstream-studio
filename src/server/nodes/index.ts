import { INodeType } from './types';
import { CodeNode } from './codeNode';
import { WebhookNode } from './webhookNode';
import { CarNode } from './Trigger/SmartCar';
import { RadarNode } from './Trigger/Radar';
import { SimulationNode } from './Trigger/SimulationNode';
import { WasmNode } from './Code/WasmNode';
import { VmRunTimeNode } from './Runtime/VmRunTimeNode';

export class NodeManager {
  nodes: INodeType[] = [];
  nodeClassMap: Record<string, any> = {};
  nodesJSON: any[] = [];

  // getNodeInstancesMap(): Record<string, INodeType> {
  //   if (!this.nodes.length) this.registerNode();
  //   return this.nodes.reduce((acc, cur) => {
  //     acc[cur.description.name] = cur;
  //     return acc;
  //   }, {});
  // }

  getClass(name: string) {
    return this.nodeClassMap[name];
  }

  constructor() {
    this.registerNode();
    // console.log(this.nodes);
  }

  registerNode() {
    this.nodeClassMap = {
      // WebhookNode,
      SimulationNode,
      WasmNode,
      VmRunTimeNode
      // CarNode,
      // RadarNode,
    };

    //@ts-ignore
    this.nodes = Object.values(this.nodeClassMap).map((i) => new i());
    this.nodesJSON = this.nodes.map((node) => node.toJSON());

    // console.log(this.nodes);
    // console.log('nodesJSON', this.nodesJSON);
    return this.nodes;
  }

  getNodes() {
    return this.nodes;
  }
}

export const nodeManager = new NodeManager();
