import { useStore } from '@/store/index';
import { FilesItemType } from '@/store/lib/w3bstream/schema/filesList';
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { Box, Flex, Image, ImageProps, Portal } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { ContextMenu, ContextMenuTrigger } from 'react-contextmenu';
import { MenuItem, Menu } from '@/components/Menu';
import { toast } from '@/lib/helper';

export const FileIcon = (file: FilesItemType) => {
  //https://github.com/PKief/vscode-material-icon-theme/tree/main/icons
  const s: ImageProps = {
    h: 5,
    w: 5,
    mr: 1
  };
  if (file?.label.endsWith('.go')) {
    return <Image {...s} src="/images/icons/go.svg"></Image>;
  } else if (file?.label.endsWith('.html')) {
    return <Image {...s} src="/images/icons/html.svg"></Image>;
  } else if (file?.label.endsWith('.ts')) {
    return <Image {...s} src="/images/icons/typescript.svg"></Image>;
  } else if (file?.label.endsWith('.wasm')) {
    return <Image {...s} src="/images/icons/assembly.svg"></Image>;
  }

  if (file?.type == 'file') {
    return <Image {...s} src="/images/icons/file.svg"></Image>;
  }

  if (file?.label == 'Browser Files') {
    return <>{file.isOpen ? <Image {...s} src="/images/icons/folder-client-open.svg"></Image> : <Image {...s} src="/images/icons/folder-client.svg"></Image>}</>;
  }

  if (file?.label == 'Remote Files') {
    return <>{file.isOpen ? <Image {...s} src="/images/icons/folder-vscode-open.svg"></Image> : <Image {...s} src="/images/icons/folder-vscode.svg"></Image>}</>;
  }
};

type IProps = {
  data: FilesItemType[];
  onSelect?: (file: FilesItemType) => void;
};

export const Tree = observer(({ data, onSelect }: IProps) => {
  const { w3s } = useStore();
  const curFilekey = w3s.projectManager?.curFilesListSchema?.curActiveFile?.key;
  return (
    <Flex flexDirection="column" cursor="pointer">
      {data?.map?.((item: FilesItemType) => {
        return (
          <ContextMenuTrigger id={`ProjectItemContext${item.key}`} holdToDisplay={-1}>
            <Flex
              pl={5}
              key={item.key}
              flexDirection="column"
              onClick={(e) => {
                e.stopPropagation();
                if (item.type == 'folder') {
                  item.isOpen = !item.isOpen;
                } else {
                  onSelect(item);
                }
              }}
            >
              <Flex px={1} py={1} alignItems={'center'} _hover={{ bg: '#f6f6f6' }} bg={item.key == curFilekey ? '#f6f6f6' : ''}>
                {item.children && <> {item?.isOpen ? <ChevronDownIcon mr={1} /> : <ChevronRightIcon mr={1} />}</>}
                {FileIcon(item)}
                {item.isRename ? (
                  <input
                    autoFocus
                    type="text"
                    style={{ outline: 'none' }}
                    value={item.label}
                    onChange={(e) => {
                      item.label = e.target.value;
                    }}
                    onBlur={() => {
                      if (item.label == '') return toast.warning('name can not empty');
                      item.isRename = false;
                    }}
                  ></input>
                ) : (
                  <Box
                    cursor={'text'}
                    as="span"
                    userSelect="none"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      item.isRename = true;
                    }}
                  >
                    {item.label}
                  </Box>
                )}

                <Portal>
                  <ContextMenu id={`ProjectItemContext${item.key}`}>
                    <Menu bordered>
                      {item.type == 'folder' ? (
                        <>
                          <MenuItem
                            onItemSelect={() => {
                              w3s.projectManager.curFilesListSchema.createFileFormFolder(item, 'file');
                            }}
                          >
                            New File
                          </MenuItem>
                          <MenuItem
                            onItemSelect={() => {
                              w3s.projectManager.curFilesListSchema.createFileFormFolder(item, 'folder');
                            }}
                          >
                            New Folder
                          </MenuItem>
                          <MenuItem
                            onItemSelect={() => {
                              console.log(item);
                              w3s.projectManager.curFilesListSchema.deleteFile(item);
                            }}
                          >
                            Delete
                          </MenuItem>
                        </>
                      ) : (
                        <>
                          <MenuItem
                            onItemSelect={() => {
                              item.isRename = true;
                            }}
                          >
                            Rename
                          </MenuItem>
                          <MenuItem
                            onItemSelect={() => {
                              console.log(item);
                              w3s.projectManager.curFilesListSchema.deleteFile(item);
                            }}
                          >
                            Delete
                          </MenuItem>
                        </>
                      )}
                    </Menu>
                  </ContextMenu>
                </Portal>
              </Flex>
              {item.children && item.isOpen && <Tree data={item.children} onSelect={onSelect} />}
            </Flex>
          </ContextMenuTrigger>
        );
      })}
    </Flex>
  );
});
