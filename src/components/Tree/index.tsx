import { useStore } from '@/store/index';
import { FilesItemType, VSCodeRemoteFolderName } from '@/store/lib/w3bstream/schema/filesList';
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu';
import { useTranslation } from 'react-i18next';
import { FileActions, VSCodeRemoteState, VscodeRemoteCompilerButton, VscodeRemoteSettingButton } from './actionButtons';
import { RightClickMenu } from './rightClickMenu';
import { Tree as DNDTree, getBackendOptions, MultiBackend, useDragOver } from '@minoru/react-dnd-treeview';
import { DndProvider } from 'react-dnd';
import { FileIcon } from '@/components/Tree/fileIcon';
import { Box, Flex } from '@chakra-ui/react';

type IProps = {
  isHidden?: boolean;
  data: FilesItemType[];
  onSelect?: (file: FilesItemType) => void;
};

export type DNDTreeDataType = {
  id: string;
  parent: string;
  droppable: boolean;
  text: string;
  data: any;
};

const CustomDragPreview = (props) => {
  const item = props.monitorProps.item;
  return (
    <div>
      <div>{item.text}</div>
    </div>
  );
};

export const Tree = observer(({ data, onSelect, isHidden = false }: IProps) => {
  const {
    w3s,
    w3s: {
      projectManager,
      projectManager: { curFilesListSchema },
      lab
    }
  } = useStore();
  const { t } = useTranslation();

  const CustomNode = ({ node, depth, onToggle, isOpen }) => {
    const dragOverProps = useDragOver(node.id, isOpen, onToggle);
    return (
      <>
        <ContextMenuTrigger id={`ProjectItemContext${node.id}`} holdToDisplay={-1}>
          <div style={{ marginLeft: depth * 10 }} {...dragOverProps}>
            <Flex
              onClick={(e) => {
                if (node.data?.type == 'folder') {
                  onToggle();
                } else {
                  onSelect(node.data);
                }
              }}
              color={node.data.label?.startsWith('.') || isHidden ? '#979797' : ''}
              px={1}
              py={1}
              alignItems={'center'}
              _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
              bg={node.data.key == curFilekey ? 'rgba(255, 255, 255, 0.1)' : ''}
            >
              {node.droppable && <>{isOpen ? <ChevronDownIcon mr={1} onClick={onToggle} /> : <ChevronRightIcon mr={1} onClick={onToggle} />}</>}
              {FileIcon(node.data)}
              <FileActions item={getItem(node)} />
            </Flex>
          </div>
        </ContextMenuTrigger>
        <RightClickMenu item={getItem(node)} />
      </>
    );
  };

  const curFilekey = w3s.projectManager?.curFilesListSchema?.curActiveFile?.key;
  const getItem = (node) => projectManager.curFilesListSchema.findFile(projectManager.curFilesListSchema.files, node.id as string);
  return (
    <Flex flexDirection="column" cursor="pointer" ml="2">
      <DndProvider backend={MultiBackend} options={getBackendOptions()}>
        <DNDTree
          enableAnimateExpand={true}
          tree={projectManager?.curFilesListSchema?.filesFlatten}
          dragPreviewRender={(monitorProps) => <CustomDragPreview monitorProps={monitorProps} />}
          rootId={'0'}
          onDrop={(newTreeData, options) => {
            // console.log(newTreeData, options);
            const { dragSourceId, dropTargetId } = options;
            // console.log(projectManager?.curFilesListSchema.files);
            projectManager?.curFilesListSchema?.moveFileFromKey(dragSourceId as string, dropTargetId as string);
            // store.setTreeData(newTreeData as DNDTreeDataType[]);
          }}
          placeholderRender={(node, { depth }) => <Box background={'white'} height={'1px'}></Box>}
          render={(node, { depth, isOpen, onToggle }) => <CustomNode node={node} depth={depth} isOpen={isOpen} onToggle={onToggle} />}
        />
      </DndProvider>
    </Flex>
  );
});
