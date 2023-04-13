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

  getClass(name: string) {
    return this.nodeClassMap[name];
  }

  constructor() {
    this.registerNode();
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
    return this.nodes;
  }

  getNodes() {
    return this.nodes;
  }
}

export const nodeManager = new NodeManager();
