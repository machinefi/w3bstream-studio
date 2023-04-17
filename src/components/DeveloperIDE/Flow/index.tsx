import React, { useCallback, useEffect, useRef, useState } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import { BiChevronDown, BiChevronUp } from 'react-icons/bi';
import ReactFlow, { Background, Controls, MarkerType, NodeTypes } from 'reactflow';
import { useStore } from '@/store/index';
import { generateNodeGroupMenu, generateReactFlowNode, NodeIcon, NodeMenuItem } from '@/components/FlowNode';
import 'reactflow/dist/style.css';
import { INodeType } from '@/lib/nodes/types';
import { helper } from '@/lib/helper';
import { FlowNode } from '@/store/standard/Node';
import { hooks } from '@/lib/hooks';
// import LogView from '@/components/LogView';
import { _ } from '@/lib/lodash';
// import { IconArrowLeft } from '@tabler/icons';
import { AiOutlinePlus } from 'react-icons/ai';
import { defaultButtonStyle } from '@/lib/theme';
import { Flows, IndexDb } from '@/lib/dexie';
import { Box, Button, Collapse, Flex, Text } from '@chakra-ui/react';
import { getSelectedStyles } from '../ToolBar';
import { DeleteIcon } from '@chakra-ui/icons';
import { VscDebugStart, VscDebugPause } from 'react-icons/vsc';

const MenuItemCollapse = ({ nodeMenuItem, addNode }: { nodeMenuItem: NodeMenuItem; addNode: (event: any, nodeInstance: INodeType) => void }) => {
  // const { classes } = useStyles();
  const [opened, setOpened] = useState(true);
  return (
    <>
      <Flex
        style={{
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '5px 10px',
          cursor: 'pointer',
          borderRadius: '8px'
        }}
        onClick={() => setOpened((o) => !o)}
      >
        <Flex align="center">
          <NodeIcon icon={nodeMenuItem.icon} size={20} />
          <Text ml="10px">{helper.string.fristUpper(nodeMenuItem.group)}</Text>
        </Flex>
        {opened ? <BiChevronUp size={20} /> : <BiChevronDown size={20} />}
      </Flex>
      <Collapse in={opened}>
        {nodeMenuItem.children.map((node) => (
          <MenuItem key={node.description.name} data={node} onClick={addNode}>
            <Flex
              style={{
                alignItems: 'center',
                padding: '6px 40px',
                cursor: 'pointer',
                borderRadius: '8px'
              }}
              _hover={{
                backgroundColor: '#ffffff!important'
              }}
            >
              <NodeIcon icon={node.description.icon} size={20} />
              <Text ml="10px">{node.description.displayName}</Text>
            </Flex>
          </MenuItem>
        ))}
      </Collapse>
    </>
  );
};

type LocalStoreType = {
  // selectFlow: (id: number) => void;
  currentFlowInfo: { nodes: any[]; edges: any[] };
  nodeTypes: NodeTypes;
  nodeMenu: NodeMenuItem[];
  flowHasChanged: boolean;
  init: () => void;
  flows: Flows[];
  initFlow: () => void;
};

const Flow = observer(() => {
  const {
    w3s: {
      flowModule,
      flowModule: { flow },
      projectManager: { curFilesListSchema }
    }
  } = useStore();
  // const { classes } = useStyles();
  const reactFlowWrapper = useRef(null);
  const contextMenuWrapper = useRef(null);
  // const router = useRouter();
  // const { id } = router.query;

  const store = useLocalObservable<LocalStoreType>(() => ({
    flows: [],
    nodeTypes: {},
    nodeMenu: [],
    currentFlowInfo: null,
    flowHasChanged: false,
    async init() {
      await flowModule.flow.initNodes.call();
      this.nodeTypes = generateReactFlowNode(flowModule.flow.nodeInstances);
      this.nodeMenu = generateNodeGroupMenu(flowModule.flow.nodeInstances);
    },
    async initFlow() {
      // this.flows = await IndexDb.findFlows();
      // if (this.flows.length > 0) {
      //   this.selectFlow(this.flows[0].id);
      // }
      this.currentFlowInfo = curFilesListSchema?.curActiveFile.data;
      flowModule.flow.importJSON(this.currentFlowInfo);
      flow.curFlowRunning = false;
    }
    // async selectFlow(id: number) {
    //   // this.init();
    //   this.flows = await IndexDb.findFlows();
    //   const curFlow = this.flows.find((f) => f.id === id);
    //   console.log(curFlow);
    //   if (curFlow) {
    //     flow.curFlowId = id;
    //     this.currentFlowInfo = curFlow;
    //     flowModule.flow.importJSON(curFlow.data);
    //   }
    // }
  }));

  useEffect(() => {
    store.initFlow();

  }, [curFilesListSchema.curActiveFileId]);

  useEffect(() => {
    flow.onDataChange = () => {
      curFilesListSchema.curActiveFile.data = flow.exportData();
      curFilesListSchema.syncToIndexDb();
    };

    flow.onConnectEnd = (event) => {
      const targetIsPane = event.target.classList.contains('react-flow__pane');
      if (targetIsPane) {
        const { top, left } = reactFlowWrapper.current.getBoundingClientRect();
        flow.isDropConnecting = true;
        // https://github.com/vkbansal/react-contextmenu/blob/d9018dbfbd6e21423cb2b753b3762adf5a6d77b0/src/ContextMenu.js#L114
        contextMenuWrapper.current.handleShow({
          detail: {
            id: 'flow-box',
            position: {
              x: event.clientX - left + 300,
              y: event.clientY - top
            }
          }
        });
      }
      curFilesListSchema.curActiveFile.data = flow.exportData();
      curFilesListSchema.syncToIndexDb();
    };

    store.init();
  }, []);

  const addNode = useCallback(
    (event, nodeInstance: FlowNode) => {
      event.preventDefault();
      if (!flow.reactFlowInstance) {
        return;
      }
      //this type is NodeType's Key,like HTTPNode,CodeNode
      const type = nodeInstance.description.name;
      if (!type) {
        return;
      }
      const id = new Date().getTime().toString();
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = flow.reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top
      });
      if (flow.isDropConnecting) {
        flow.addNodes({
          id,
          type,
          position,
          data: {
            label: nodeInstance.description.displayName,
            ...nodeInstance.getJSONFormDefaultValue()
          }
        });
        if (nodeInstance.description.withSourceHandle && nodeInstance.description.withTargetHandle) {
          flow.addEdges({
            id,
            source: flow.connectingNodeId,
            target: id,
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed }
          });
        }
        flow.isDropConnecting = false;
      } else {
        flow.addNodes({
          id,
          type,
          position,
          data: {
            // ...nodeInstance.jsonSchema.value,
            label: nodeInstance.description.displayName,
            ...nodeInstance.getJSONFormDefaultValue()
          }
        });
      }
    },
    [flow.reactFlowInstance]
  );

  return (
    <Flex w="100%" h="calc(100vh - 180px)">
      {/* left menu  */}
      {/* <Flex overflowY="auto" direction={'column'} w="250px" h="100%" p="20px 10px" bg="#fff" mr={8} style={{ borderRadius: '12px' }}>
        <Box>
          <Button
            leftIcon={<AiOutlinePlus />}
            h="32px"
            {...defaultButtonStyle}
            onClick={async () => {
              const { name } = await hooks.getFormData({
                title: 'New Flow',
                size: 'md',
                formList: [
                  {
                    form: flowModule.createFlowForm
                  }
                ]
              });
              await IndexDb.insertFlow(name, { nodes: [], edges: [] });
              store.initFlow();
            }}
          >
            Create New Flow
          </Button>
        </Box>

        <Flex direction={'column'} mt={4}>
          {store.flows.map((flowItem) => (
            <Flex
              key={flowItem.id}
              p="18px"
              bg="#f7f7f7"
              mt={2}
              borderRadius="8px"
              {...getSelectedStyles(Number(flowItem.id) === Number(flow.curFlowId))}
              onClick={() => {
                store.selectFlow(Number(flowItem.id));
              }}
            >
              <Text>{flowItem.name}</Text>
              <DeleteIcon
                ml="auto"
                onClick={async (e) => {
                  e.stopPropagation();
                  IndexDb.deleteFlow(flowItem.id);
                  store.flows = await IndexDb.findFlows();
                }}
              ></DeleteIcon>
            </Flex>
          ))}
        </Flex>
      </Flex> */}

      <Box pos="relative" w="100%" h="100%">
        <>
          <ContextMenuTrigger id="flow-box" holdToDisplay={-1}>
            <Box pos="absolute" top="0" left="0" w="100%" h="100%" ref={reactFlowWrapper}>
              <ReactFlow
                fitView
                selectNodesOnDrag={false}
                minZoom={0.5}
                maxZoom={1.5}
                onInit={flow.onInit}
                nodes={flow.nodes.map((i) => ({ ...i, dragHandle: '.drag-handle' }))}
                edges={flow.edges}
                onNodesChange={flow.onNodesChange}
                onEdgesChange={flow.onEdgesChange}
                onConnect={flow.onConnect}
                nodeTypes={store.nodeTypes}
                onConnectStart={flow.onConnectStart}
                onConnectEnd={flow.onConnectEnd}
                onEdgeUpdateStart={flow.onEdgeUpdateStart}
                onEdgeUpdate={flow.onEdgeUpdate}
                onEdgeUpdateEnd={flow.onEdgeUpdateEnd}
              >
                <Background />
                <Controls />
              </ReactFlow>
            </Box>
          </ContextMenuTrigger>
          <Flex pos="absolute" top="20px" right="20px">
            {flow.copiedNodes.length > 0 && (
              <Button
                mr="10px"
                style={{
                  background: '#000',
                  color: '#fff',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  flow.pasteNodes();
                }}
              >
                Paste Nodes
              </Button>
            )}
            <Button
              mr="0px"
              style={{
                background: '#000',
                color: '#fff',
                cursor: 'pointer'
              }}
              // VscDebugPause
              rightIcon={flow.curFlowRunning ? <VscDebugPause /> : <VscDebugStart />}
              onClick={() => {
                if (flow.curFlowRunning) {
                  flow.curFlowRunning = false;
                  return;
                } else {
                  flow.curFlowRunning = true;
                  flow.executeFlow();
                }
              }}
            >
              {flow.curFlowRunning ? 'Pause' : 'Start'}
            </Button>
          </Flex>
        </>
      </Box>

      <ContextMenu
        id="flow-box"
        hideOnLeave
        ref={contextMenuWrapper}
        onMouseLeave={() => {
          flow.isDropConnecting = false;
        }}
        style={{
          width: '300px',
          padding: '10px 20px',
          borderRadius: '8px',
          background: '#eee',
          boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px'
        }}
      >
        <Box>
          <Box mb="10px">Add Node</Box>
          {store.nodeMenu.map((nodeMenuItem: NodeMenuItem) => (
            <MenuItemCollapse key={nodeMenuItem.group} nodeMenuItem={nodeMenuItem} addNode={addNode} />
          ))}
        </Box>
      </ContextMenu>
    </Flex>
  );
});

export default Flow;
