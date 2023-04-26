import { useStore } from '@/store/index';
import { FilesItemType, VSCodeRemoteFolderName } from '@/store/lib/w3bstream/schema/filesList';
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu';
import { helper, toast } from '@/lib/helper';
import { hooks } from '@/lib/hooks';
import { Image, ImageProps, Box, Flex, Portal, Text, Tooltip, Divider } from '@chakra-ui/react';
import { VscCloudDownload, VscDebugStart, VscFile, VscFiles, VscFileSymlinkFile, VscFileZip, VscFolder, VscTrash } from 'react-icons/vsc';
import { asc } from 'pages/_app';
import { wasm_vm_sdk } from '@/server/wasmvm/sdk';
import { compileAndCreateProject, compileAssemblyscript, debugAssemblyscript } from '../IDE/Editor';
import { eventBus } from '@/lib/event';
import Draggable from 'react-draggable';
import { v4 as uuidv4 } from 'uuid';
import { labExamples } from '@/constants/labExamples';
import { BiPaste, BiRename } from 'react-icons/bi';

export const FileIcon = (file: FilesItemType) => {
  const {
    w3s: { projectManager }
  } = useStore();
  //https://github.com/PKief/vscode-material-icon-theme/tree/main/icons
  const s: ImageProps = {
    h: 5,
    w: 5,
    mr: 1
  };
  if (file?.label?.endsWith('.go')) {
    return <Image {...s} src="/images/icons/go.svg"></Image>;
  } else if (file?.label?.endsWith('.html')) {
    return <Image {...s} src="/images/icons/html.svg"></Image>;
  } else if (file?.label?.endsWith('.ts')) {
    return <Image {...s} src="/images/icons/typescript.svg"></Image>;
  } else if (file?.label?.endsWith('.wasm')) {
    return <Image {...s} src="/images/icons/assembly.svg"></Image>;
  } else if (file?.label?.endsWith('.flow')) {
    return <Image {...s} src="/images/icons/tree.svg"></Image>;
  } else if (file?.label?.endsWith('.json')) {
    return <Image {...s} src="/images/icons/json.svg"></Image>;
  } else if (file?.label == '.env') {
    return <Image {...s} src="/images/icons/settings.svg"></Image>;
  }

  if (file?.type == 'file') {
    return <Image {...s} src="/images/icons/file.svg"></Image>;
  }

  if (file?.label == 'Browser Files' || file.type == 'folder') {
    return <>{file.isOpen ? <Image {...s} src="/images/icons/folder-client-open.svg"></Image> : <Image {...s} src="/images/icons/folder-client.svg"></Image>}</>;
  } else if (file?.label == VSCodeRemoteFolderName) {
    return (
      <>
        {file.isOpen ? (
          <Image {...s} src="/images/icons/folder-vscode-open.svg" filter={!projectManager.isWSConnect ? 'grayscale(100%)' : ''}></Image>
        ) : (
          <Image filter={!projectManager.isWSConnect ? 'grayscale(100%)' : ''} {...s} src="/images/icons/folder-vscode.svg"></Image>
        )}
      </>
    );
  }
};

type IProps = {
  isHidden?: boolean;
  data: FilesItemType[];
  onSelect?: (file: FilesItemType) => void;
};

export const Tree = observer(({ data, onSelect, isHidden = false }: IProps) => {
  const {
    w3s,
    w3s: {
      projectManager: { curFilesListSchema },
      lab
    }
  } = useStore();

  const store = useLocalObservable(() => ({
    FolderSetting: [
      {
        name: 'New File',
        icon: <VscFile />,
        onClick: async (item) => {
          const formData = await hooks.getFormData({
            title: 'Create a File',
            size: '2xl',
            formList: [
              {
                form: w3s.projectManager.initWasmTemplateForm
              }
            ]
          });
          w3s.projectManager.curFilesListSchema.createFileFormFolder(item, 'file', helper.json.safeParse(formData.template) ?? null);
        }
      },
      {
        name: 'New Example',
        icon: <VscFileZip />,
        showChildren: false,
        children: (props: { descFolder: any }) => {
          return (
            <>
              {labExamples.map((item) => {
                return (
                  <Box
                    {...RightClickStyle}
                    onClick={(e) => {
                      // e.stopPropagation();
                      console.log(props.descFolder);
                      w3s.projectManager.curFilesListSchema.createFileFormFolder(props.descFolder, 'folder', item);
                    }}
                  >
                    {item.label}
                  </Box>
                );
              })}
            </>
          );
        }
      },
      {
        name: 'Upload File',
        icon: <VscFileSymlinkFile />,
        onClick: async (item) => {
          const formData = await hooks.getFormData({
            title: 'Upload a File',
            size: '2xl',
            formList: [
              {
                form: w3s.lab.uploadWasmForm
              }
            ]
          });
          const fileInfo = formData.file.match(/name=(.*);base64,(.*)$/);
          const fileName = fileInfo?.[1];
          const fileData = fileInfo?.[2];
          console.log(helper.base64ToUint8Array(fileData));
          if (fileName.endsWith('.wasm')) {
            w3s.projectManager.curFilesListSchema.createFileFormFolder(item, 'file', {
              type: 'file',
              key: uuidv4(),
              label: fileName,
              isRename: true,
              data: { extraData: { raw: helper.base64ToUint8Array(fileData) }, dataType: 'wasm' }
            });
          }
        }
      },
      {
        name: 'New Folder',
        icon: <VscFolder />,
        onClick: (item) => w3s.projectManager.curFilesListSchema.createFileFormFolder(item, 'folder')
      },
      {
        name: 'Copy',
        icon: <VscFiles />,
        onClick: (item) => (w3s.projectManager.curFilesListSchema.currentCopyFile = item)
      },
      {
        name: 'Paste',
        icon: <BiPaste />,
        onClick: (item) => {
          w3s.projectManager.curFilesListSchema.createFileFormFolder(item, 'folder', w3s.projectManager.curFilesListSchema.currentCopyFile);
          w3s.projectManager.curFilesListSchema.currentCopyFile = null;
        }
      },
      {
        name: 'Export',
        icon: <VscCloudDownload />,
        onClick: (item) => {
          //download json file
          const dataStr = JSON.stringify(item.data);
          const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
          const exportFileDefaultName = item.label + '.json';
          const linkElement = document.createElement('a');
          linkElement.setAttribute('href', dataUri);
          linkElement.setAttribute('download', exportFileDefaultName);
          linkElement.click();
        }
      },
      {
        name: 'Delete',
        icon: <VscTrash />,
        color: 'red',
        divider: true,
        onClick: (item) => w3s.projectManager.curFilesListSchema.deleteFile(item)
      }
    ],
    FileSetting: [
      {
        name: 'Rename',
        icon: <BiRename />,
        onClick: (item) => (item.isRename = true)
      },
      {
        name: 'Copy',
        icon: <VscFiles />,
        onClick: (item) => (w3s.projectManager.curFilesListSchema.currentCopyFile = item)
      },
      {
        name: 'Export',
        icon: <VscCloudDownload />,
        onClick: (item) => {
          //download json file
          const dataStr = JSON.stringify(item.data);
          const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
          const exportFileDefaultName = item.label + '.json';
          const linkElement = document.createElement('a');
          linkElement.setAttribute('href', dataUri);
          linkElement.setAttribute('download', exportFileDefaultName);
          linkElement.click();
        }
      },
      {
        color: 'red',
        divider: true,
        icon: <VscTrash />,
        name: 'Delete',
        onClick: (item) => w3s.projectManager.curFilesListSchema.deleteFile(item)
      }
    ]
  }));

  const curFilekey = w3s.projectManager?.curFilesListSchema?.curActiveFile?.key;

  const RightClickStyle = {
    cursor: 'pointer',
    _hover: {
      bg: '#f6f6f6'
    },
    borderRadius: 8,
    p: 1,
    transition: 'all 0.2s'
  };

  return (
    <Flex flexDirection="column" cursor="pointer">
      {data?.map?.((item: FilesItemType) => {
        return (
          <>
            <Flex
              key={item.key}
              pl={item.label === 'Browser Files' || item.label === 'VSCode Files' ? 0 : 5}
              flexDirection="column"
              onClick={(e) => {
                e.stopPropagation();
                if (w3s.projectManager?.rightClickLock) return;
                if (item.type == 'folder') {
                  item.isOpen = !item.isOpen;
                } else {
                  onSelect(item);
                }
              }}
            >
              <ContextMenuTrigger id={`ProjectItemContext${item.key}`} holdToDisplay={-1}>
                <Flex color={item.label.startsWith('.') || isHidden ? '#979797' : ''} px={1} py={1} alignItems={'center'} _hover={{ bg: '#f6f6f6' }} bg={item.key == curFilekey ? '#f6f6f6' : ''}>
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
                  {item?.data?.dataType == 'assemblyscript' && curFilesListSchema?.curActiveFileId == item?.key && (
                    <>
                      <Tooltip label={`Upload to DevNet`} placement="top">
                        <Text
                          ml="auto"
                          cursor="pointer"
                          mr={4}
                          className="pi pi-cloud-upload"
                          color="black"
                          onClick={async () => {
                            compileAndCreateProject();
                          }}
                        ></Text>
                      </Tooltip>

                      <Box position={'relative'}>
                        <Box
                          onClick={() => {
                            debugAssemblyscript();
                          }}
                        >
                          <VscDebugStart
                            color="black"
                            style={{
                              marginRight: '10px',
                              cursor: 'pointer'
                            }}
                          />
                        </Box>
                      </Box>
                    </>
                  )}
                </Flex>
                {item.children && item.isOpen && <Tree isHidden={isHidden ? true : item.label.startsWith('.')} data={item.children} onSelect={onSelect} />}
              </ContextMenuTrigger>
            </Flex>

            <Portal>
              <ContextMenu
                id={`ProjectItemContext${item.key}`}
                onShow={() => {
                  w3s.projectManager.rightClickLock = true;
                  console.log('show', w3s.projectManager.rightClickLock);
                }}
                onHide={() => {
                  setTimeout(() => {
                    w3s.projectManager.rightClickLock = false;
                  }, 500);
                }}
              >
                <Box borderRadius={'8px'} p={2} bg="#fff" boxShadow="rgba(100, 100, 111, 0.4) 0px 7px 29px 0px">
                  {item.type == 'folder' ? (
                    <>
                      {store.FolderSetting.map((i) => {
                        return (
                          <MenuItem
                            onClick={() => {
                              i?.onClick?.(item);
                            }}
                          >
                            {i.divider && <Divider />}
                            <Box
                              {...RightClickStyle}
                              color={i?.color ?? (i.name == 'Paste' ? (w3s.projectManager.curFilesListSchema.currentCopyFile ? '' : '#979797') : '')}
                              position="relative"
                              onMouseEnter={(e) => {
                                i.showChildren = true;
                              }}
                              onMouseLeave={(e) => {
                                i.showChildren = false;
                              }}
                            >
                              <Flex alignItems={'center'}>
                                <Box mr={1}>{i.icon}</Box>
                                <Box>{i.name}</Box>
                                {i.children && <ChevronRightIcon />}
                              </Flex>

                              {i.children && (
                                <Flex
                                  direction="column"
                                  onMouseEnter={(e) => {
                                    i.showChildren = true;
                                  }}
                                  display={i.showChildren ? 'flex' : 'none'}
                                  className={'test'}
                                  top={0}
                                  position={'absolute'}
                                  right={'-135px'}
                                  minWidth={'135px'}
                                  zIndex={1}
                                  borderRadius={'8px'}
                                  p={2}
                                  bg="#fff"
                                  boxShadow="rgba(100, 100, 111, 0.4) 0px 7px 29px 0px"
                                >
                                  <i.children descFolder={item} />
                                </Flex>
                              )}
                            </Box>
                          </MenuItem>
                        );
                      })}
                    </>
                  ) : (
                    <>
                      {store.FileSetting.map((i) => {
                        return (
                          <MenuItem
                            onClick={() => {
                              i.onClick(item);
                            }}
                          >
                            <Box {...RightClickStyle} color={i?.color ?? ''}>
                              <Flex alignItems={'center'}>
                                <Box mr={1}>{i.icon}</Box>
                                <Box>{i.name}</Box>
                              </Flex>
                            </Box>
                          </MenuItem>
                        );
                      })}
                    </>
                  )}
                </Box>
              </ContextMenu>
            </Portal>
          </>
        );
      })}
    </Flex>
  );
});
