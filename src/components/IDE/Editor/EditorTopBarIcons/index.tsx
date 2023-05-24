import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { Box, Button, Center, Flex, Portal, Select, Text, Tooltip } from '@chakra-ui/react';
import { FilesItemType } from '@/store/lib/w3bstream/schema/filesList';
import _ from 'lodash';
import { VscDebugStart } from 'react-icons/vsc';
import { BsDatabaseFillAdd } from 'react-icons/bs';
import { FileIcon } from '@/components/Tree';
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu';
import { asc } from 'pages/_app';
import { compileAndCreateProject, debugAssemblyscript, debugSimulation, onCreateDB } from '../EditorFunctions';
import { HorizontalScrollBox } from '@/components/Common/HorizontalScrollBox';
import { SmallCloseIcon } from '@chakra-ui/icons';

export const CurActiveFileRightClickMenu = observer(({ activeFile }: { activeFile: FilesItemType }) => {
  const {
    w3s: {
      projectManager: { curFilesListSchema }
    }
  } = useStore();

  return (
    <>
      <Portal>
        <ContextMenu id={`ActiveFileContent${activeFile?.key}`} onShow={() => {}} onHide={() => {}}>
          <Box p={2} bg="#fff" boxShadow="rgba(100, 100, 111, 0.2) 0px 7px 29px 0px">
            <MenuItem
              onClick={() => {
                curFilesListSchema.deleteActiveFiles(activeFile);
              }}
            >
              <Box cursor="pointer">Close</Box>
            </MenuItem>
            <MenuItem
              onClick={() => {
                curFilesListSchema.deleteOtherActiveFiles(activeFile);
              }}
            >
              <Box cursor="pointer">Close Other</Box>
            </MenuItem>
            <MenuItem
              onClick={() => {
                curFilesListSchema.deleteRightActiveFiles(activeFile);
              }}
            >
              <Box cursor="pointer">Close the TAB on the right</Box>
            </MenuItem>
            <MenuItem
              onClick={() => {
                curFilesListSchema.deleteLeftActiveFiles(activeFile);
              }}
            >
              <Box cursor="pointer">Close the TAB on the left</Box>
            </MenuItem>
          </Box>
        </ContextMenu>
      </Portal>
    </>
  );
});

export const EditorTopBarIcons = observer(() => {
  const {
    w3s,
    w3s: {
      projectManager: { curFilesListSchema },
      lab
    }
  } = useStore();
  return (
    <Flex w="full" bg="#2f3030" alignItems={'center'} position={'relative'}>
      {/* style={{ marginRight: '15px' }} */}
      <HorizontalScrollBox w="calc(100vw - 450px)">
        {curFilesListSchema?.activeFiles?.map((i, index) => {
          return (
            <>
              <ContextMenuTrigger id={`ActiveFileContent${i?.key}`} holdToDisplay={-1}>
                {i?.label && (
                  <Box
                    w="max-content"
                    whiteSpace={'nowrap'}
                    onClick={() => {
                      curFilesListSchema.setCurActiveFile(i);
                    }}
                    display="flex"
                    py={1.5}
                    px={2}
                    background={i?.key == curFilesListSchema?.curActiveFile?.key ? '#1e1e1e' : 'none'}
                    fontSize="sm"
                    color={i?.key == curFilesListSchema?.curActiveFile?.key ? '#a9dc76' : 'white'}
                    cursor="pointer"
                    alignItems={'center'}
                  >
                    {FileIcon(i)}
                    <Text mr="4" fontSize={"13px"}>{i?.label}</Text>
                    <SmallCloseIcon
                      _hover={{ bg: '#3f3f3f' }}
                      color="white"
                      ml="auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        curFilesListSchema.deleteActiveFiles(i);
                      }}
                    />
                  </Box>
                )}
              </ContextMenuTrigger>
              <CurActiveFileRightClickMenu activeFile={i} />
            </>
          );
        })}
      </HorizontalScrollBox>

      {curFilesListSchema?.curActiveFile?.data?.dataType == 'assemblyscript' && (
        <>
          <Tooltip label={`Upload to Devnet`} placement="top">
            <Text
              ml="auto"
              cursor="pointer"
              mr={4}
              className="pi pi-cloud-upload"
              color="white"
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
                color="white"
                style={{
                  marginRight: '10px',
                  cursor: 'pointer'
                }}
              />
            </Box>
          </Box>
        </>
      )}

      {curFilesListSchema?.curActiveFile?.data?.dataType == 'sql' && (
        <>
          <Box
            ml="auto"
            onClick={() => {
              onCreateDB();
            }}
          >
            <BsDatabaseFillAdd
              color="white"
              style={{
                marginRight: '10px',
                cursor: 'pointer'
              }}
            />
          </Box>
        </>
      )}

      {curFilesListSchema?.curActiveFile?.data?.dataType == 'wasm' && (
        <>
          <Tooltip label={`Upload to Devnet`} placement="top">
            <Text
              ml="auto"
              cursor="pointer"
              mr={4}
              className="pi pi-cloud-upload"
              color="white"
              onClick={async () => {
                compileAndCreateProject(false);
              }}
            ></Text>
          </Tooltip>

          <Box position={'relative'}>
            <Box
              onClick={() => {
                debugAssemblyscript(false);
              }}
            >
              <VscDebugStart
                color="white"
                style={{
                  marginRight: '10px',
                  cursor: 'pointer'
                }}
              />
            </Box>
          </Box>
        </>
      )}

      {curFilesListSchema?.curActiveFile?.data?.dataType == 'simulation' && (
        <Box ml="auto">
          <Box onClick={debugSimulation}>
            <VscDebugStart
              color="white"
              style={{
                marginRight: '10px',
                cursor: 'pointer'
              }}
            />
          </Box>
        </Box>
      )}
    </Flex>
  );
});
