import { memo, useEffect } from 'react';
import { TbWebhook } from 'react-icons/tb';
import { AiOutlineCar, AiOutlineCode, AiOutlineClockCircle } from 'react-icons/ai';
import { SiAiohttp } from 'react-icons/si';
import { MdDeleteOutline, MdOutlineCopyAll, MdOutlineHttp } from 'react-icons/md';
import { GrRaspberry } from 'react-icons/gr';
import { ImEqualizer } from 'react-icons/im';
import { Handle, NodeTypes, Position, useStore as reactflowUseStore } from 'reactflow';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { INodeGroup, INodeIconType, INodeType } from '@/lib/nodes/types';
import { Radar2 } from 'tabler-icons-react';
import { JSONRender, jsonRenderGlobalStore } from '../JSONRender';
import React from 'react';
import { JSONForm } from '../JSONForm';
import { eventBus } from '@/lib/event';
import { CheckIcon, WarningTwoIcon } from '@chakra-ui/icons';
import { Box, Flex, Tooltip, Image, Input } from '@chakra-ui/react';
import { BaseNode } from '@/lib/nodes/baseNode';

export type FlowNodeData = {
  [x: string]: any;
  label: string;
};

export const NodeContainer = observer(({ id, nodeInstance, data }: { id: string; nodeInstance: BaseNode; data: FlowNodeData }) => {
  const {
    w3s: {
      flowModule: { flow }
    }
  } = useStore();

  const store = useLocalObservable(() => ({
    realNodeInstance: new BaseNode(nodeInstance),
    curFlowNodeResult: null,
    onFlowRunResult(result) {
      if (result.flowId == id) {
        store.curFlowNodeResult = result;
      }
    },
  }));

  const copied = flow.copiedNodes.findIndex((node) => node.id === id) > -1;

  useEffect(() => {
    const formState = store.realNodeInstance?.form.formList[0].form[0]?.props.formState;
    if (formState) {
      formState.afterChange = e => {
        flow.editNode(id, e.formData);
      }
    }
    eventBus.on('flow.run.result', store.onFlowRunResult);
    return () => {
      eventBus.off('flow.run.result', store.onFlowRunResult);
    };
  }, []);

  useEffect(() => {
    store.realNodeInstance?.setJSONFormValue(data);
  }, [flow.curFlowId]);

  return (
    <Flex
      pos="relative"
      direction="column"
      w="450px"
      h="max-content"
      bg="#ffffff"
      borderRadius={6}
      boxShadow="rgba(149, 157, 165, 0.2) 0px 8px 24px"
      _hover={{
        '.actionBox': {
          display: 'flex',
          zIndex: 99
        }
      }}
      style={{
        border: copied ? '2px solid green' : 'none'
      }}
      onClick={(e) => {
        flow.curEditNodeId = id;
      }}
    >
      <Flex bg="#d1d1d1" h="30px" w="100%" justify={'center'} align={'center'}>
        <Flex justify={'center'} align={'center'} flex={1} className="drag-handle" cursor="move">
          <NodeIcon icon={store.realNodeInstance?.description?.icon} size={10} />
          <Box ml="4px">
            <Input
              h="20px"
              p="0 2px"
              borderRadius={0}
              border="none"
              focusBorderColor="#fff"
              value={data?.label}
              onChange={e => {
                flow.editNode(id, {
                  label: e.target.value
                });
              }}
            />
          </Box>
        </Flex>
        {store.curFlowNodeResult && (
          <>
            {store.curFlowNodeResult?.success ? (
              <CheckIcon ml="auto" color="green" boxSize={4} mr={4} />
            ) : (
              <Tooltip label={store.curFlowNodeResult?.errMsg}>
                <WarningTwoIcon ml="auto" color="red" boxSize={4} mr={4} />
              </Tooltip>
            )}
          </>
        )}
      </Flex>
      {/* <Flex>{JSON.stringify(data)}</Flex> */}
      <Box style={{ fontSize: '12px' }} p={4}>
        <JSONRender
          key={id}
          json={{
            key: 'JSONRenderContainer' + id,
            component: 'div',
            children: store.realNodeInstance?.form.formList[0].form
          }}
          data={null}
          // eventBus={eventBus}
          store={jsonRenderGlobalStore}
          componentMaps={{
            div: Box,
            JSONForm: JSONForm
          }}
        />
      </Box>

      {/* <NodeIcon icon={nodeInstance.description.icon} size={30} /> */}
      <Box className="actionBox" display="none" pos="absolute" top="8px" left="0">
        <Tooltip label="Delete">
          <Box
            ml="5px"
            onClick={(e) => {
              e.stopPropagation();
              flow.onDeleteNode(id);
            }}
          >
            <MdDeleteOutline color="red" />
          </Box>
        </Tooltip>
        <Tooltip label="Copy">
          <Box
            ml="5px"
            onClick={(e) => {
              e.stopPropagation();
              flow.onCopyChange(id);
            }}
          >
            <MdOutlineCopyAll color={copied ? 'green' : '#000'} />
          </Box>
        </Tooltip>
      </Box>
    </Flex>
  );
});

export const NodeContext = React.createContext('NodeContext');

const Placeholder = ({ label }: { label: string }) => (
  <Box w="200px" p="10px 10px 15px 10px" bg="#fff" border="1px solid #555" borderRadius="5px">
    <Box w="100%" fontWeight={700} textAlign="center">{label}</Box>
    <Box mt="10px" w="100%" h="10px" bg="#eee" />
    <Box mt="4px" w="100%" h="10px" bg="#eee" />
    <Box mt="4px" w="100%" h="10px" bg="#eee" />
  </Box>
);

const zoomSelector = (s) => s.transform[2] >= 0.8;

//node style , write in backand
export const NodeLayout = memo(
  ({ id, data, nodeInstance, children }: { id: string; data: FlowNodeData; nodeInstance: BaseNode; children: any }) => {
    const handleStyle = {
      width: '14px',
      height: '14px',
      borderRadius: '2px',
      backgroundColor: '#e8864b',
      // border: '4px solid #784be8',
      zIndex: 99
    };

    const handleVariableStyle = {
      width: '14px',
      height: '14px',
      borderRadius: '50px',
      backgroundColor: 'white',
      border: '4px solid #784be8',
      zIndex: 99
    };

    const showContent = reactflowUseStore(zoomSelector);

    return (
      <>
        {nodeInstance?.description?.withTargetHandle && (
          <>
            <Box
              sx={{
                '& > .react-flow__handle-left': {
                  left: '-10px',
                  top: '14px'
                }
              }}
            >
              <Handle
                isValidConnection={(connection) => {
                  return connection.sourceHandle == 'flow-source';
                }}
                id="flow-target"
                type="target"
                position={Position.Left}
                style={handleStyle}
              />
            </Box>
            {nodeInstance?.description?.withVariableHandle?.map((i, index) => {
              return (
                <Box
                  sx={{
                    '& > .react-flow__handle-left': {
                      left: '-10px',
                      top: `${90 + index * 30}px`
                    }
                  }}
                >
                  <Tooltip label={i}>
                    <Handle
                      isValidConnection={(connection) => {
                        return connection.targetHandle == 'variable-source';
                      }}
                      id={`variable-target-${i}`}
                      type="target"
                      position={Position.Left}
                      style={handleVariableStyle}
                    />
                  </Tooltip>
                </Box>
              );
            })}
          </>
        )}

        {showContent ? <NodeContext.Provider value={id}>{children}</NodeContext.Provider> : <Placeholder label={data.label} />}

        {(nodeInstance?.description?.withSourceHandle || nodeInstance?.description?.isVariableNode) && (
          <>
            <Box
              sx={{
                '& > .react-flow__handle-right': {
                  right: '-10px',
                  top: '14px'
                }
              }}
            >
              <Handle
                isValidConnection={(connection) => {
                  if (nodeInstance?.description?.isVariableNode) {
                    return connection.targetHandle.includes('variable-target');
                  } else {
                    return connection.targetHandle === 'flow-target';
                  }
                }}
                id={!nodeInstance?.description?.isVariableNode ? 'flow-source' : 'variable-source'}
                type="source"
                position={Position.Right}
                style={!nodeInstance?.description?.isVariableNode ? handleStyle : handleVariableStyle}
              />
            </Box>
          </>
        )}
      </>
    );
  },
  (prevProps, nextProps) => {
    if (JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)) {
      return true;
    }
    return false;
  }
);

type NodeIconProps = {
  icon: INodeIconType;
  size: string | number;
};
export const NodeIcon = ({ icon, size }: NodeIconProps) => {
  const IconsMap = {
    TbWebhook,
    AiOutlineCode,
    GrRaspberry,
    MdOutlineHttp,
    SiAiohttp,
    AiOutlineCar,
    AiOutlineClockCircle,
    ImEqualizer,
    Radar2
  };

  if (typeof icon === 'string') {
    const InnerIcon = IconsMap[icon];
    if (InnerIcon) {
      return <InnerIcon size={size} />;
    }
    return <Image src={icon} width={typeof size == 'string' ? size : `${size}px`} height={typeof size == 'string' ? size : `${size}px`} />;
  } else if (typeof icon === 'function') {
    return icon({ size });
  }
};

export const generateReactFlowNode = (nodeInstances: BaseNode[]): NodeTypes => {
  const nodeTypes: NodeTypes = {};
  nodeInstances.forEach((node) => {
    const Node = (props: { id: string; data: FlowNodeData }) => (
      <NodeLayout {...props} nodeInstance={node}>
        <NodeContainer id={props.id} nodeInstance={node} data={props.data} />
      </NodeLayout>
    );
    nodeTypes[node.description.name] = Node;
  });
  return nodeTypes;
};

export type NodeMenuItem = {
  group: INodeGroup;
  icon: INodeIconType;
  children: INodeType[];
};
export type NodeMenu = NodeMenuItem[];

export const generateNodeGroupMenu = (nodeInstances: INodeType[]): NodeMenu => {
  const nodeMenu: NodeMenu = [];
  nodeInstances.forEach((node) => {
    const group = nodeMenu.find((item) => item.group === node.description.group);
    if (group) {
      group.children.push(node);
    } else {
      nodeMenu.push({
        group: node.description.group,
        icon: node.description.groupIcon,
        children: [node]
      });
    }
  });
  return nodeMenu;
};
