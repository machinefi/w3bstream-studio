import { FlowNodeData } from '@/components/FlowNode';
import { makeAutoObservable } from 'mobx';
import { addEdge, applyEdgeChanges, applyNodeChanges, Connection, Edge, EdgeChange, MarkerType, Node, NodeChange, OnConnectStartParams, ReactFlowInstance, updateEdge } from 'reactflow';
import { INodeType } from '../../lib/nodes/types';
import { axios } from '@/lib/axios';
import { FlowNode } from './Node';
import { PromiseState } from './PromiseState';
import { _ } from '@/lib/lodash';
import { v4 as uuid } from 'uuid';
import { IndexDb } from '@/lib/dexie';
import { nodeManager } from '@/lib/nodes';
import { SimulationNode } from '@/lib/nodes/Trigger/SimulationNode';
import { BaseNode } from '@/lib/nodes/baseNode';
import { WasmNode } from '@/lib/nodes/Code/WasmNode';
import { VmRunTimeNode } from '@/lib/nodes/Runtime/VmRunTimeNode';

export class FlowState {
  curFlowId: number = null;
  curFlowRunning = false;
  curEditNodeId: string = '';
  reactFlowInstance: null | ReactFlowInstance<FlowNodeData, any> = null;
  nodes: Node<FlowNodeData>[] = [];
  edges: Edge<any>[] = [];
  nodeInstances: BaseNode[] = [];
  nodeAbstracts: INodeType[] = [];
  edgeUpdateSuccessful = false;
  connectingNodeId = '';
  isDropConnecting = false;
  copiedNodes: Node[] = [];
  copiedEdges: Edge[] = [];
  flowIntervals: Record<string, any> = {};

  constructor() {
    makeAutoObservable(this);
    this.nodeInstances = [];
  }

  initNodes = new PromiseState({
    function: async () => {
      this.nodeInstances = [new SimulationNode(), new WasmNode(), new VmRunTimeNode()];
    }
  });

  onInit = (reactFlowInstance: ReactFlowInstance<FlowNodeData, any>) => {
    this.reactFlowInstance = reactFlowInstance;
  };

  onNodesChange = (changes: NodeChange[]) => {
    this.nodes = applyNodeChanges(changes, this.nodes);
  };

  onEdgesChange = (changes: EdgeChange[]) => {
    this.edges = applyEdgeChanges(changes, this.edges);
  };

  onConnect = (connection: Connection) => {
    this.edges = addEdge(
      {
        ...connection,
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed }
      },
      this.edges
    );
  };

  addNodes = (newNode: Node<FlowNodeData> | Node<FlowNodeData>[]) => {
    this.nodes = this.nodes.concat(newNode);
    this.onDataChange();
  };

  addEdges = (eds: Edge<any> | Edge<any>[]) => {
    this.edges = this.edges.concat(eds);
  };

  onConnectStart = (_: any, { nodeId, handleType }: OnConnectStartParams) => {
    // console.log('onConnectStart', { nodeId, handleType });
    this.connectingNodeId = nodeId;
  };

  onConnectEnd = (event) => {
    // console.log('onConnectEnd', event);
  };

  onEdgeUpdateStart = () => {
    this.edgeUpdateSuccessful = false;
  };

  onEdgeUpdate = (oldEdge: Edge<any>, newConnection: Connection) => {
    this.edgeUpdateSuccessful = true;
    this.edges = updateEdge(oldEdge, newConnection, this.edges);
  };

  onEdgeUpdateEnd = (event: MouseEvent, edge: Edge<any>) => {
    if (!this.edgeUpdateSuccessful) {
      this.edges = this.edges.filter((e) => e.id !== edge.id);
    }
    this.edgeUpdateSuccessful = true;
    this.onDataChange();
  };

  onDeleteNode = (id: string) => {
    const node = this.nodes.find((node) => node.id === id);
    this.reactFlowInstance.deleteElements({ nodes: [node] });
    this.onDataChange();
  };

  editNode = (id: string, data: FlowNodeData) => {
    this.nodes = this.nodes.map((node) => {
      if (node.id === id) {
        if (!_.isEqual(node.data, data)) {
          setTimeout(() => {
            this.onDataChange();
          }, 500);
        }
        node.data = data;
      }
      return node;
    });
  };

  // async syncToIndexDb() {
  //   if (!this.curFlowId) return;
  //   const data = this.exportData();
  //   console.log('sync to db', data);
  //   const flow = await IndexDb.findFlowsById(this.curFlowId);
  //   console.log('flow', flow, this.curFlowId);
  //   const res = await IndexDb.updateFlowById(this.curFlowId, flow[0].name, data);
  //   console.log('res', res);
  // }

  exportData = () => {
    const nodes = this.nodes.map((node) => {
      return {
        id: node.id,
        type: node.type,
        position: {
          x: Math.floor(node.position.x),
          y: Math.floor(node.position.y)
        },
        data: node.data
      };
    });
    const edges = this.edges;
    return { nodes, edges };
  };

  exportJSON = () => {
    const data = this.exportData();
    return JSON.stringify(JSON.stringify(data));
  };

  importJSON = (json: { nodes: any[]; edges: any[] }) => {
    this.nodes = json.nodes;
    this.edges = json.edges?.map((edge) => {
      return {
        ...edge,
        id: `reactflow__edge-${edge.source}-${edge.target}`,
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed }
      };
    });
  };

  reset = () => {
    this.nodes = [];
    this.edges = [];
  };

  onDataChange = () => {};

  onCopyChange = (nodeId: string) => {
    // Check if the node is copied
    const index = this.copiedNodes.findIndex((node) => node.id === nodeId);
    if (index > -1) {
      this.copiedNodes.splice(index, 1);
    } else {
      // Get the copied node
      const node = this.nodes.find((node) => node.id === nodeId);
      this.copiedNodes.push(node);
    }
    // Get the edges of the copied nodes
    const edges = this.edges.filter((edge) => {
      return this.copiedNodes.some((node) => node.id === edge.source);
    });
    this.copiedEdges = edges;
  };

  pasteNodes = () => {
    if (this.copiedNodes.length === 0) return;
    const nodeNewIdMap = {};
    // Paste nodes
    const newNodes = this.copiedNodes.map((node) => {
      const newNode = _.cloneDeep(node);
      // Set the id of the new node
      newNode.id = uuid();
      // Record the relationship between the old node and the new node
      nodeNewIdMap[node.id] = newNode.id;
      // Set the position of the new node
      newNode.position = {
        x: node.position.x + 100,
        y: node.position.y + 100
      };
      // Set the id of the webhook node
      if (newNode.type === 'WebhookNode') {
        newNode.data.id = uuid();
      }
      return newNode;
    });
    this.addNodes(newNodes);

    // Paste edges
    const newEdges = this.copiedEdges.map((edge) => {
      const newSource = nodeNewIdMap[edge.source];
      const newTarget = nodeNewIdMap[edge.target];
      return {
        id: `reactflow__edge-${newSource}-${newTarget}`,
        source: newSource,
        target: newTarget,
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed }
      };
    });
    this.addEdges(newEdges);

    // Clear the copied nodes
    this.copiedNodes = [];
    // Clear the copied edges
    this.copiedEdges = [];
  };

  async executeFlow() {
    this.nodes = this.nodes.map((node) => ({ ...node, input: {}, output: {} }));
    const triggerNodes = this.nodes.filter((node) => node.type === 'SimulationNode');
    await Promise.all(
      triggerNodes.map(async (node) => {
        if (node.data.triggerInterval >= 0) {
          this.flowIntervals[node.id] = setInterval(async () => {
            if (!this.curFlowRunning) {
              clearInterval(this.flowIntervals[node.id]);
              this.curFlowRunning = false;
            } else {
              await this.executeFlowByTriggerId(node.id);
            }
          }, node.data.triggerInterval * 1000);
        } else {
          await this.executeFlowByTriggerId(node.id);
        }
      })
    );
    // all flow finished
    if (triggerNodes.every((i) => i.data.triggerInterval < 0)) {
      this.curFlowRunning = false;
    }
  }

  async handleVariable(curFlowId: string): Promise<{ [key: string]: any }> {
    const variablesFlows = this.edges
      .filter((edge) => edge.target === curFlowId && edge.targetHandle)
      .map((i) => i.source)
      .map((i) => {
        const variableNode = this.nodes.find((node) => node.id === i);
        // console.log(variableNode, 'variableNode');
        return variableNode;
      });
    let vars = {};
    await Promise.all(
      variablesFlows.map(async (i, index) => {
        const NodeClass2 = nodeManager.getClass(i.type);
        if (NodeClass2?.node_type == 'WasmNode') {
          await NodeClass2.execute({
            input: {},
            output: {},
            node: i,
            callStack: [],
            callStackCurIdx: index
          });
          //@ts-ignore
          //@ts-ignore
          Object.assign(vars, i?.output);
        }
      })
    );
    return vars;
  }

  async executeFlowByTriggerId(nodeId: string): Promise<{ is_run_over: boolean }> {
    const nodeMap = _.keyBy(this.nodes, 'id');
    const edgeMap = _.keyBy(this.edges, 'source');
    let nextId = nodeId ? this.nodes.find((i) => i?.id == nodeId)?.id : nodeId;
    const callStack = [nodeMap[nextId]];

    do {
      nextId = edgeMap[nextId]?.target;
      if (nextId) {
        callStack.push(nodeMap[nextId]);
      }
    } while (!!edgeMap[nextId]);

    if (callStack.length <= 1) return { is_run_over: true };
    for await (const [index, node] of callStack.entries()) {
      const variables = await this.handleVariable(node.id);
      const NodeClass = nodeManager.getClass(node.type);
      if (NodeClass?.node_type == 'SimulationNode') {
        await NodeClass.execute({
          input: {},
          output: {},
          node,
          callStack,
          callStackCurIdx: index
        });
        continue;
      }
      if (NodeClass?.node_type == 'WasmNode') {
        await NodeClass.execute({
          input: {},
          output: {},
          node,
          callStack,
          callStackCurIdx: index
        });
        continue;
      }

      if (NodeClass?.node_type == 'VmRunTimeNode') {
        await NodeClass.execute({
          input: {},
          output: {},
          node,
          variables,
          callStack,
          callStackCurIdx: index
        });
      }

      let isLastNode = index === callStack.length - 1;
    }
    return { is_run_over: true };
  }
}
