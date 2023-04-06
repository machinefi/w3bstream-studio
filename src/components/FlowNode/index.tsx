import { memo, useEffect, useState } from 'react';
import { Box, Flex, Text, Image, Tooltip, Tabs } from '@mantine/core';
import { TbWebhook } from 'react-icons/tb';
import { AiOutlineCar, AiOutlineCode, AiOutlineClockCircle } from 'react-icons/ai';
import { SiAiohttp } from 'react-icons/si';
import { MdDeleteOutline, MdOutlineCopyAll, MdOutlineHttp } from 'react-icons/md';
import { GrRaspberry } from 'react-icons/gr';
import { ImEqualizer } from 'react-icons/im';
import { Handle, NodeTypes, Position } from 'reactflow';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { INodeGroup, INodeIconType, INodeType } from '@/server/nodes/types';
import { hooks } from '@/lib/hooks';
import { FlowNode } from '@/store/standard/Node';
import { Radar2 } from 'tabler-icons-react';
import { JSONRender, JSONRenderComponentsMap, jsonRenderGlobalStore } from '../JSONRender';
import { toJS } from 'mobx';

export type FlowNodeData = {
  [x: string]: any;
  label: string;
};

export const NodeContainer = observer(({ id, nodeInstance, data }: { id: string; nodeInstance: FlowNode; data: FlowNodeData }) => {
  const {
    w3s: {
      flowModule: { flow }
    }
  } = useStore();
  const copied = flow.copiedNodes.findIndex((node) => node.id === id) > -1;

  useEffect(() => {
    function handleKeyDown(event) {
      if (id == flow.curEditNodeId) {
        flow.editNode(id, toJS(nodeInstance.getJSONFormValue()) as any);
        console.log(id, nodeInstance.getJSONFormValue());
      }
    }
    document.addEventListener('keyup', handleKeyDown);
    return () => {
      document.removeEventListener('keyup', handleKeyDown);
    };
  }, []);

  // useEffect(() => {
  //   console.log(flow.curFlowId, 'flow.curFlowId)', data);
  //   if (flow.curFlowId) {
  //     nodeInstance.reInit();
  //     data && nodeInstance.setJSONFormValue(data);
  //     // flow.editNode(id, formData as any);
  //   }
  // }, [flow.curFlowId]);

  return (
    <Flex
      pos="relative"
      // align="center"
      // justify="center"
      direction="column"
      w="350px"
      h="max-content"
      sx={(theme) => ({
        fontFamily: 'monospace',
        borderRadius: '6px',
        boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
        background: '#ffffff',
        // '&:hover': {
        //   backgroundColor: theme.colorScheme === 'dark' ? theme.colors.gray[8] : theme.colors.gray[3]
        // },
        '&:hover .actionBox': {
          display: 'flex',
          zIndex: 99
        }
      })}
      style={{
        border: copied ? '2px solid green' : 'none'
      }}
      onClick={(e) => {
        flow.curEditNodeId = id;
        console.log('click', id);
      }}
      onDoubleClick={async (e) => {
        // @ts-ignore
        // if (e.target?.nodeName !== 'DIV') return;
        // nodeInstance.reInit();
        // data && nodeInstance.setJSONFormValue(data);
        // const formData = await hooks.getFormData<typeof nodeInstance.form>({ ...nodeInstance.form, autoSubmission: true });
        // if (id) {
        //   flow.editNode(id, formData as any);
        // }
      }}
    >
      <Flex sx={(theme) => ({ borderRadius: '6px 6px 0 0' })} bg="#d1d1d1" h="30px" w="100%" justify={'center'} align={'center'}>
        <NodeIcon icon={nodeInstance.description.icon} size={10} />
        <Box ml="4">{data?.label}</Box>
      </Flex>
      {/* <Flex>{JSON.stringify(data)}</Flex> */}
      <Box style={{ fontSize: '12px' }} p={8}>
        {nodeInstance.form.formList?.length > 1 ? (
          <>
            <Tabs defaultValue={nodeInstance.form.formList[0].label}>
              <Tabs.List>
                {nodeInstance.form.formList.map((item) => (
                  <Tabs.Tab key={item.label} value={item.label}>
                    {item.label}
                  </Tabs.Tab>
                ))}
              </Tabs.List>
              {nodeInstance.form.formList.map((item, index) => (
                <Tabs.Panel key={item.label} value={item.label}>
                  <Box mt={10}>
                    <JSONRender
                      json={{
                        key: 'JSONRenderContainer',
                        component: 'div',
                        children: nodeInstance.form.formList[index].form
                      }}
                      data={null}
                      store={jsonRenderGlobalStore}
                      componentMaps={JSONRenderComponentsMap}
                    />
                  </Box>
                </Tabs.Panel>
              ))}
            </Tabs>
          </>
        ) : (
          <>
            <JSONRender
              json={{
                key: 'JSONRenderContainer',
                component: 'div',
                children: nodeInstance.form.formList[0].form
              }}
              data={null}
              // eventBus={eventBus}
              store={jsonRenderGlobalStore}
              componentMaps={JSONRenderComponentsMap}
            />
          </>
        )}
      </Box>

      {/* <NodeIcon icon={nodeInstance.description.icon} size={30} /> */}
      <Box className="actionBox" display="none" pos="absolute" top="8px" left="0">
        <Tooltip withArrow label="Delete">
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
        <Tooltip withArrow label="Copy">
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

//node style , write in backand
export const NodeLayout = memo(
  ({ id, data, nodeInstance, children }: { id: string; data: FlowNodeData; nodeInstance: FlowNode; children: any }) => {
    const handleStyle = {
      width: '16px',
      height: '16px',
      borderRadius: '50px',
      backgroundColor: 'white',
      border: '4px solid #784be8',
      zIndex: 99
    };

    return (
      <>
        {nodeInstance?.description?.withTargetHandle && (
          <Box
            sx={{
              '& > .react-flow__handle-left': {
                left: '-10px'
              }
            }}
          >
            <Handle type="target" position={Position.Left} style={handleStyle} />
          </Box>
        )}

        {children}

        {nodeInstance?.description?.withSourceHandle && (
          <>
            <Box
              sx={{
                '& > .react-flow__handle-right': {
                  right: '-10px'
                }
              }}
            >
              <Handle id="a" type="source" position={Position.Right} style={handleStyle} />
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

export const generateReactFlowNode = (nodeInstances: FlowNode[]): NodeTypes => {
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
  console.log(nodeMenu);
  return nodeMenu;
};
