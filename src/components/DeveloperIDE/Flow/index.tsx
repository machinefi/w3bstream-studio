import React, { useCallback, useEffect, useRef, useState } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import { BiChevronDown, BiChevronUp } from 'react-icons/bi';
import ReactFlow, { Background, Controls, MarkerType, NodeTypes } from 'reactflow';
import { useStore } from '@/store/index';
import { generateNodeGroupMenu, generateReactFlowNode, NodeIcon, NodeMenuItem } from '@/components/FlowNode';
import 'reactflow/dist/style.css';
import { INodeType } from '@/server/nodes/types';
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

// const useStyles = createStyles((theme) => ({
//   menuBox: {
//     width: '300px',
//     padding: '10px 20px',
//     borderRadius: '8px',
//     background: theme.colorScheme === 'dark' ? theme.colors.gray[8] : '#eee',
//     boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px'
//   },
//   menuItem: {
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: '5px 10px',
//     cursor: 'pointer',
//     borderRadius: '8px',
//     '&:hover': {
//       backgroundColor: theme.colorScheme === 'dark' ? theme.colors.gray[7] : theme.colors.gray[0]
//     }
//   },
//   subMenu: {
//     alignItems: 'center',
//     padding: '6px 40px',
//     cursor: 'pointer',
//     borderRadius: '8px',
//     '&:hover': {
//       backgroundColor: theme.colorScheme === 'dark' ? theme.colors.gray[7] : theme.colors.gray[0]
//     }
//   }
// }));

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
  selectFlow: (id: number) => void;
  currentFlowInfo: any;
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
      flowModule: { flow }
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
    currentFlowInfo: {},
    flowHasChanged: false,
    async init() {
      await flowModule.flow.initNodes.call();
      this.nodeTypes = generateReactFlowNode(flowModule.flow.nodeInstances);
      this.nodeMenu = generateNodeGroupMenu(flowModule.flow.nodeInstances);
    },
    async initFlow() {
      this.flows = await IndexDb.findFlows();
      if (this.flows.length > 0) {
        this.selectFlow(this.flows[0].id);
      }
    },
    async selectFlow(id: number) {
      // this.init();
      this.flows = await IndexDb.findFlows();
      const curFlow = this.flows.find((f) => f.id === id);
      console.log(curFlow);
      if (curFlow) {
        flow.curFlowId = id;
        this.currentFlowInfo = curFlow;
        flowModule.flow.importJSON(curFlow.data);
      }
    }
  }));

  useEffect(() => {
    // if (id) {
    //   flowModule.findFlowById(Number(id)).then((flow) => {
    //     store.currentFlowInfo = flow;
    //   });
    // }
    flow.onDataChange = () => {
      const flowData = flow.exportData();
      if (!_.isEqual(flowData, store.currentFlowInfo?.data)) {
        store.flowHasChanged = true;
      }
      flow.syncToIndexDb();
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
    };
    store.initFlow();
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
    <Flex w="100%" h="calc(100vh - 100px)">
      {/* left menu  */}
      <Flex overflowY="auto" direction={'column'} w="250px" h="100%" p="20px 10px" bg="#fff" mr={8} style={{ borderRadius: '12px' }}>
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
              direction={'column'}
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
            </Flex>
          ))}
        </Flex>
      </Flex>

      <Box pos="relative" w="100%" h="100%">
        {flow.curFlowId ? (
          <>
            <ContextMenuTrigger id="flow-box" holdToDisplay={-1}>
              <Box pos="absolute" top="0" left="0" w="100%" h="100%" ref={reactFlowWrapper}>
                <ReactFlow
                  fitView
                  selectNodesOnDrag={false}
                  minZoom={0.8}
                  maxZoom={1.5}
                  onInit={flow.onInit}
                  nodes={flow.nodes}
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
            {/* <Flex pos="absolute" top="20px" right="20px">
          {flow.copiedNodes.length > 0 && (
            <Button
              compact
              mr="10px"
              sx={(theme) => ({
                background: theme.colorScheme === 'dark' ? '#fff' : '#000',
                color: theme.colorScheme === 'dark' ? '#000' : '#fff',
                cursor: 'pointer',
                ':hover': {
                  background: theme.colorScheme === 'dark' ? theme.colors.gray[4] : theme.colors.dark[4]
                }
              })}
              onClick={() => {
                flow.pasteNodes();
              }}
            >
              Paste Nodes
            </Button>
          )}
          <ImportJSON
            tipLabel="Import"
            onJSON={(json) => {
              try {
                const { nodes, edges } = json;
                if (!nodes) {
                  showNotification({
                    color: 'red',
                    message: 'Invalid JSON'
                  });
                  return;
                }
                nodes.forEach((node: any) => {
                  if (node.type === 'WebhookNode') {
                    node.data.id = uuid();
                  }
                });
                flow.importJSON({ nodes, edges });
                store.flowHasChanged = true;
              } catch (error) {
                showNotification({
                  color: 'red',
                  message: error.message
                });
              }
            }}
          />
          <Button
            compact
            ml="10px"
            sx={(theme) => ({
              background: theme.colorScheme === 'dark' ? '#fff' : '#000',
              color: theme.colorScheme === 'dark' ? '#000' : '#fff',
              cursor: 'pointer',
              ':hover': {
                background: theme.colorScheme === 'dark' ? theme.colors.gray[4] : theme.colors.dark[4]
              }
            })}
            onClick={() => {
              if (store.currentFlowInfo) {
                helper.download.downloadJSON(`flow_data_${store.currentFlowInfo.name}`, flow.exportData());
              }
            }}
          >
            Export
          </Button>
          <Button
            compact
            ml="10px"
            sx={(theme) => ({
              background: theme.colorScheme === 'dark' ? '#fff' : '#000',
              color: theme.colorScheme === 'dark' ? '#000' : '#fff',
              cursor: 'pointer',
              ':hover': {
                background: theme.colorScheme === 'dark' ? theme.colors.gray[4] : theme.colors.dark[4]
              }
            })}
            onClick={async () => {
              const initEnv = store.currentFlowInfo?.env || {
                API_URL: '',
                SECRET: ''
              };
              flowModule.envForm.value.set({
                env: JSON.stringify(initEnv, null, 2)
              });
              const formData = await hooks.getFormData({
                title: 'Set environment variables',
                size: 'xl',
                formList: [
                  {
                    form: flowModule.envForm.JSONRenderComponent
                  }
                ],
                autoSubmission: false
              });
              const { env } = formData;
              if (env) {
                try {
                  const envdata = JSON.parse(env);
                  await flowModule.setEnv(Number(id), JSON.stringify(envdata));
                  store.currentFlowInfo.env = envdata;
                } catch (error) {
                  showNotification({
                    color: 'red',
                    message: error.message
                  });
                }
              }
            }}
          >
            Set environment variables
          </Button>

          <Indicator inline dot processing color="red" size={16} disabled={!store.flowHasChanged}>
            <Button
              compact
              ml="10px"
              sx={(theme) => ({
                background: theme.colorScheme === 'dark' ? '#fff' : '#000',
                color: theme.colorScheme === 'dark' ? '#000' : '#fff',
                cursor: 'pointer',
                ':hover': {
                  background: theme.colorScheme === 'dark' ? theme.colors.gray[4] : theme.colors.dark[4]
                }
              })}
              onClick={async () => {
                await flowModule.saveFlow(Number(id));
                store.flowHasChanged = false;
                store.currentFlowInfo.data = flow.exportData();
              }}
            >
              Save
            </Button>
          </Indicator>
        </Flex> */}
          </>
        ) : (
          <>No Flow</>
        )}
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
