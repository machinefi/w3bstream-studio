import { useStore } from '@/store/index';
import { FilesItemType, VSCodeRemoteFolderName } from '@/store/lib/w3bstream/schema/filesList';
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu';
import { helper } from '@/lib/helper';
import toast from 'react-hot-toast';
import { hooks } from '@/lib/hooks';
import { Image, ImageProps, Box, Flex, Portal, Text, Tooltip, Divider, Center, Spinner } from '@chakra-ui/react';
import { VscCloudDownload, VscDebugStart, VscFile, VscFiles, VscFileSymlinkFile, VscFileZip, VscFolder, VscTrash } from 'react-icons/vsc';
import { v4 as uuidv4 } from 'uuid';
import { labExamples } from '@/constants/labExamples';
import { BiMemoryCard, BiPaste, BiRename } from 'react-icons/bi';
import { toJS } from 'mobx';
import { compileAndCreateProject, debugAssemblyscript, debugSimulation, debugDemo } from '@/components/IDE/Editor/EditorFunctions';
import { AiOutlineSetting } from 'react-icons/ai';
import { GrStatusGoodSmall } from 'react-icons/gr';
import { useTranslation } from 'react-i18next';

export const RightClickMenu = observer(({ item }: { item: FilesItemType }) => {
  const {
    w3s,
    w3s: { projectManager }
  } = useStore();
  const { t } = useTranslation();
  const RightClickStyle = {
    cursor: 'pointer',
    _hover: {
      bg: 'rgba(255, 255, 255, 0.1)'
    },
    borderRadius: 8,
    p: 1,
    transition: 'all 0.2s'
  };
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
          if (!formData.template) {
            return toast.error('Please select a template!');
          }
          const template = helper.json.safeParse(formData.template) ?? null;
          if (template && !template?.label?.startsWith('.')) {
            const [firstWord, ...rest] = template.label.split('.');
            const newFileName = `${firstWord}_${helper.string.random(4)}.${rest.join('.')}`;
            template.label = newFileName;
          }
          w3s.projectManager.curFilesListSchema.createFileFormFolder(item, 'file', template);
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
        name: 'Upload WASM',
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
        name: 'Import File',
        icon: <VscFileSymlinkFile />,
        onClick: async (item) => {
          const formData = await hooks.getFormData({
            title: 'Upload a File',
            size: '2xl',
            formList: [
              {
                form: w3s.lab.uploadProjectForm
              }
            ]
          });
          const fileInfo = formData.file.match(/name=(.*);base64,(.*)$/);
          const fileName = fileInfo?.[1];
          const fileData = fileInfo?.[2];
          console.log(fileName, atob(fileData));
          try {
            const res = helper.json.safeParse(atob(fileData));
            if (res && res.fileType == 'w3bstream.file.schema') {
              w3s.projectManager.curFilesListSchema.createFileFormFolder(item, res?.type ?? 'file', res);
            }
          } catch (error) {
            toast.error('Import project error');
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
          item.fileType = 'w3bstream.file.schema';
          const dataStr = JSON.stringify(toJS(item));
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
          item.fileType = 'w3bstream.file.schema';
          const dataStr = JSON.stringify(item);
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
  const GetColor = (item: FilesItemType, i: (typeof store.FolderSetting)[0]) => {
    if (item.label == 'VSCode Files') {
      return '#979797';
    }
    if (i.name == 'Paste') {
      return w3s.projectManager.curFilesListSchema.currentCopyFile ? '' : '#979797';
    }
    return i.color ?? '';
  };

  const GetDisabled = (item: FilesItemType, i: (typeof store.FolderSetting)[0]) => {
    if (item.label == 'VSCode Files') {
      return true;
    }
    return false;
  };

  return (
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
                      if (GetDisabled(item, i)) return;
                      i?.onClick?.(item);
                    }}
                  >
                    {i.divider && <Divider />}
                    <Box
                      {...RightClickStyle}
                      color={GetColor(item, i)}
                      position="relative"
                      onMouseEnter={(e) => {
                        if (GetDisabled(item, i)) return;
                        i.showChildren = true;
                      }}
                      onMouseLeave={(e) => {
                        if (GetDisabled(item, i)) return;
                        i.showChildren = false;
                      }}
                    >
                      <Flex alignItems={'center'}>
                        <Box mr={1}>{i.icon}</Box>
                        <Box fontSize={'14px'}>{i.name}</Box>
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
                        <Box fontSize={'14px'}>{i.name}</Box>
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
  );
});
