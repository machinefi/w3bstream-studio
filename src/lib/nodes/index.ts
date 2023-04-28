import { INodeType } from './types';
import { SimulationNode } from './Trigger/SimulationNode';
import { WasmNode } from './Code/WasmNode';
import { VmRunTimeNode } from './Runtime/VmRunTimeNode';
import { AssemblyScriptNode } from './Code/AssemblyScriptNode';
import { DatabaseNode } from './Common/DatabaseNode';

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
      SimulationNode,
      WasmNode,
      VmRunTimeNode,
      AssemblyScriptNode,
      DatabaseNode
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
