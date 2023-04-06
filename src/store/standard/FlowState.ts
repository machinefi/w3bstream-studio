import { FlowNodeData } from '@/components/FlowNode';
import { makeAutoObservable } from 'mobx';
import { addEdge, applyEdgeChanges, applyNodeChanges, Connection, Edge, EdgeChange, MarkerType, Node, NodeChange, OnConnectStartParams, ReactFlowInstance, updateEdge } from 'reactflow';
import { INodeType } from '../../server/nodes/types';
import { axios } from '@/lib/axios';
import { FlowNode } from './Node';
import { PromiseState } from './PromiseState';
import { _ } from '@/lib/lodash';
import { v4 as uuid } from 'uuid';
import { IndexDb } from '@/lib/dexie';

export class FlowState {
  curFlowId: number = null;
  curEditNodeId: string = '';
  reactFlowInstance: null | ReactFlowInstance<FlowNodeData, any> = null;
  nodes: Node<FlowNodeData>[] = [];
  edges: Edge<any>[] = [];
  nodeInstances: FlowNode[] = [];
  edgeUpdateSuccessful = false;
  connectingNodeId = '';
  isDropConnecting = false;
  copiedNodes: Node[] = [];
  copiedEdges: Edge[] = [];

  constructor() {
    makeAutoObservable(this);
    this.nodeInstances = [];
  }

  initNodes = new PromiseState({
    function: async () => {
      this.nodeInstances = [];
      const res = await axios.get('/api/nodes');
      res?.data?.forEach((i) => {
        this.nodeInstances.push(new FlowNode(i as INodeType));
      });
      return res.data;
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
    console.log('addNodes');
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

  async syncToIndexDb() {
    if (!this.curFlowId) return;
    const data = this.exportData();
    console.log('sync to db', data);
    const flow = await IndexDb.findFlowsById(this.curFlowId);
    console.log('flow', flow, this.curFlowId);
    const res = await IndexDb.updateFlowById(this.curFlowId, flow[0].name, data);
    console.log('res', res);
  }

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
    const edges = this.edges.map((edge) => {
      return {
        source: edge.source,
        target: edge.target
      };
    });
    return { nodes, edges };
  };

  exportJSON = () => {
    const data = this.exportData();
    return JSON.stringify(JSON.stringify(data));
  };

  importJSON = (json: { nodes: any[]; edges: any[] }) => {
    this.nodes = json.nodes;
    this.edges = json.edges.map((edge) => {
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
}
