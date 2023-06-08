import 'reactflow/dist/style.css';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import { BiChevronDown, BiChevronUp } from 'react-icons/bi';
import ReactFlow, { Background, Controls, MarkerType, NodeTypes } from 'reactflow';
import { useStore } from '@/store/index';
import { generateNodeGroupMenu, generateReactFlowNode, NodeIcon, NodeMenuItem } from '@/components/FlowNode';
import { INodeType } from '@/lib/nodes/types';
import { helper } from '@/lib/helper';
import { _ } from '@/lib/lodash';
import { Box, Button, Collapse, Flex, Text } from '@chakra-ui/react';
import { VscDebugStart, VscDebugPause } from 'react-icons/vsc';
import { eventBus } from '@/lib/event';
import { BaseNode } from '@/lib/nodes/baseNode';

const MenuItemCollapse = ({ nodeMenuItem, addNode }: { nodeMenuItem: NodeMenuItem; addNode: (event: any, nodeInstance: INodeType) => void }) => {
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
      this.currentFlowInfo = curFilesListSchema?.curActiveFile?.data;
      flowModule.flow.importJSON(this.currentFlowInfo);
      flow.curFlowRunning = false;
    }
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

    eventBus.on('file.change', () => {
      store.init();
      store.initFlow();
    });
    return () => {
      eventBus.removeListener('file.change', () => {
        store.init();
        store.initFlow();
      });
    };
  }, []);

  const addNode = useCallback(
    (event, nodeInstance: BaseNode) => {
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
    <Flex w="100%" h="calc(100vh - 120px)" bg="white">
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
                nodes={flow.nodes?.map((i) => ({ ...i, dragHandle: '.drag-handle' }))}
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

export const FlowErrorFallback = () => {
  return (
    <Flex direction={'column'} alignItems="center" bg={'#1e1e1e'} width={'100%'} height={300} color="white">
      <Box mt={4} opacity="0.7">
        Someting went wrong
      </Box>
      <Button
        mt={4}
        color="red"
        onClick={(e) => {
          e.preventDefault();
          window.location.reload();
        }}
      >
        Click to refresh
      </Button>
    </Flex>
  );
};

export default Flow;
