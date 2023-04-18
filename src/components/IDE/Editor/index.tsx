import { useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { Box, Center, Flex, Portal, Text, Tooltip } from '@chakra-ui/react';
import { FilesItemType } from '@/store/lib/w3bstream/schema/filesList';
import { v4 as uuidv4 } from 'uuid';
import { helper, toast } from '@/lib/helper';
import _ from 'lodash';
import { VscDebugStart, VscClearAll } from 'react-icons/vsc';
import { FileIcon } from '@/components/Tree';
import { eventBus } from '@/lib/event';
import { StdIOType, WASM } from '@/server/wasmvm';
import { wasm_vm_sdk } from '@/server/wasmvm/sdk';
import dayjs from 'dayjs';
import { assemblyscriptJSONDTS } from '@/server/wasmvm/assemblyscript-json-d';
import { SmallCloseIcon } from '@chakra-ui/icons';
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu';
import { asc } from 'pages/_app';
import Flow from '@/components/DeveloperIDE/Flow';
import { hooks } from '@/lib/hooks';

const Editor = observer(() => {
  const {
    w3s,
    w3s: {
      projectManager: { curFilesListSchema },
      lab
    }
  } = useStore();
  const terminalRef = useRef(null);

  useEffect(() => {
    eventBus.on('wasmvm.stdout', store.onStdout);
    eventBus.on('wasmvm.stderr', store.onStderr);
    return () => {
      eventBus.off('wasmvm.stdout', store.onStdout);
      eventBus.off('wasmvm.stderr', store.onStderr);
    };
  }, []);

  const store = useLocalObservable(() => ({
    curPreviewRawData: null,
    showPreviewMode: false,
    lockFile: true,
    onStdout(message: StdIOType) {
      lab.stdout.push(message);
    },
    onStderr(message: StdIOType) {
      lab.stderr.push(message);
    },
    async onCompile(filesItem: FilesItemType) {
      if (filesItem.type != 'file') return;
      if (!filesItem.label.endsWith('.ts')) return;
      try {
        const code = wasm_vm_sdk + filesItem.data.code;
        const { error, binary, text, stats, stderr } = await asc.compileString(code, {
          optimizeLevel: 4,
          runtime: 'stub',
          lib: 'assemblyscript-json/assembly/index',
          debug: true
        });
        if (error) {
          console.log(error);
          return toast.error(error.message);
        }
        const currentFolder = curFilesListSchema.findCurFolder(curFilesListSchema.files);
        const wasmFileName = filesItem?.label.replace('.ts', '') + '.wasm';
        const curWasmIndex = _.findIndex(currentFolder.children, (i) => i.label == wasmFileName);
        const wasmFile: FilesItemType = {
          key: uuidv4(),
          label: wasmFileName,
          type: 'file',
          data: {
            code: text,
            extraData: {
              raw: binary
            }
          }
        };
        if (curWasmIndex == -1) {
          currentFolder.children.push(wasmFile);
        } else {
          wasmFile.key = currentFolder.children[curWasmIndex].key;
          currentFolder.children[curWasmIndex] = wasmFile;
        }
        curFilesListSchema.setActiveFiles(wasmFile);
        toast.success('Compile Success!');
      } catch (error) {
        console.log(error);
        toast.error('Compile Error!');
      }
    }
  }));

  useEffect(() => {
    const handleSave = (event) => {
      if (event.ctrlKey && event.key === 's') {
        if (curFilesListSchema?.curActiveFileIs('ts')) {
          store.onCompile(curFilesListSchema?.curActiveFile);
        }
        event.preventDefault();
      }
    };
    window.addEventListener('keydown', handleSave);
    return () => {
      window.removeEventListener('keydown', handleSave);
    };
  }, []);

  const CurActiveFileRightClickMenu = observer(({ activeFile }: { activeFile: FilesItemType }) => {
    return (
      <>
        <Portal>
          <ContextMenu id={`ActiveFileContent${activeFile.key}`} onShow={() => {}} onHide={() => {}}>
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

  return (
    <Box>
      {/* Active Bar Headers  */}
      <Flex w="full" bg="#2f3030" alignItems={'center'} position={'relative'}>
        {curFilesListSchema?.activeFiles.map((i, index) => {
          return (
            <>
              <ContextMenuTrigger id={`ActiveFileContent${i.key}`} holdToDisplay={-1}>
                {i?.label && (
                  <Box
                    onClick={() => {
                      store.showPreviewMode = false;
                      curFilesListSchema.setCurActiveFile(i);
                    }}
                    display="flex"
                    py={2}
                    px={2}
                    background={i?.key == curFilesListSchema?.curActiveFile?.key ? '#1e1e1e' : 'none'}
                    fontSize="sm"
                    color={i?.key == curFilesListSchema?.curActiveFile?.key ? '#a9dc76' : 'white'}
                    cursor="pointer"
                    alignItems={'center'}
                  >
                    {FileIcon(i)}
                    <Text mr="4">{i?.label}</Text>
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

        {curFilesListSchema?.curActiveFileIs('ts') && (
          <>
            <Tooltip label="Compile to wasm (ctrl+s)" placement="top">
              <Text ml="auto" cursor="pointer" mr={4} className="pi pi-bolt" color="white" onClick={() => store.onCompile(curFilesListSchema?.curActiveFile)}></Text>
            </Tooltip>
          </>
        )}

        {curFilesListSchema?.curActiveFileIs('wasm') && (
          <>
            <Tooltip label={`Upload to DevNet`} placement="top">
              <Text
                ml="auto"
                cursor="pointer"
                mr={4}
                className="pi pi-cloud-upload"
                color="white"
                onClick={async () => {
                  w3s.project.createProjectByWasmForm.value.set({
                    // projectName: w3s.project.curProject?.f_name,
                    file: helper.Uint8ArrayToWasmBase64FileData(curFilesListSchema?.curActiveFile.label, curFilesListSchema?.curActiveFile.data.extraData.raw)
                    // appletName: ''
                  });
                  w3s.project.createProjectByWasm();
                }}
              ></Text>
            </Tooltip>

            <Box position={'relative'}>
              <Box
                onClick={() => {
                  lab.simulationEventForm.value.set({
                    wasmPayload: curFilesListSchema.curActiveFile.data?.extraData?.payload || '{}'
                  });
                  lab.simulationEventForm.afterSubmit = async ({ formData }) => {
                    if (formData.wasmPayload) {
                      try {
                        const wasmPayload = JSON.parse(formData.wasmPayload);
                        lab.onDebugWASM(wasmPayload);
                        setTimeout(() => {
                          terminalRef.current.scrollTop = terminalRef.current.scrollHeight * 10000;
                        }, 1);
                      } catch (error) {}
                    }
                  };
                  hooks.getFormData({
                    title: 'Send Simulated Event',
                    size: 'xl',
                    isAutomaticallyClose: false,
                    isCentered: true,
                    formList: [
                      {
                        form: lab.simulationEventForm
                      }
                    ]
                  });
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
      </Flex>

      {/* Editor Body  */}
      {curFilesListSchema?.curActiveFile ? (
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div
            style={{
              display: 'flex'
            }}
            onMouseEnter={() => {
              curFilesListSchema.unlockFile();
            }}
            onMouseLeave={() => {
              curFilesListSchema.lockedFile();
            }}
          >
            {curFilesListSchema?.curActiveFileIs('wasm') ? (
              <Flex flexDirection={'column'} w="full">
                <Center bg={'#1e1e1e'} width={'100%'} height={300} color="white">
                  {/* This file is a binary file and cannot be opened in the editor! */}
                  <MonacoEditor key="wasm-monaco" theme="vs-dark" value={curFilesListSchema?.curActiveFile?.data?.code}></MonacoEditor>
                </Center>
                <Flex borderTop={'2px solid #090909'} bg="#1e1e1e" color="white" pt={1}>
                  <VscClearAll
                    onClick={() => {
                      lab.stdout = [];
                      lab.stderr = [];
                    }}
                    cursor={'pointer'}
                    style={{ marginLeft: 'auto', marginRight: '20px' }}
                  />
                </Flex>
                <Box
                  ref={terminalRef}
                  id="terminal"
                  fontFamily="monospace"
                  w="100%"
                  h="calc(100vh - 480px)"
                  p="10px"
                  bg="#1e1e1e"
                  color="white"
                  whiteSpace="pre-line"
                  overflowY="auto"
                  position="relative"
                >
                  {lab.stdout?.map((i) => {
                    return (
                      <Flex>
                        <Flex color="#d892ff" mr={2} whiteSpace="nowrap">
                          [wasmvm -{' '}
                          {
                            <>
                              <Box color="#ffd300" ml={1}>
                                {dayjs(i?.['@ts']).format('hh:mm:ss')}
                              </Box>
                            </>
                          }
                          ]
                        </Flex>{' '}
                        {JSON.stringify(i)}
                      </Flex>
                    );
                  })}
                </Box>
              </Flex>
            ) : (
              <>
                {curFilesListSchema?.curActiveFileIs('flow') ? (
                  <Flow></Flow>
                ) : (
                  <Flex flexDirection={'column'} w="full">
                    <MonacoEditor
                      // defaultLanguage={curFilesListSchema?.curActiveFile.data?.language}
                      width={'100%'}
                      height={400}
                      key="monaco"
                      theme="vs-dark"
                      defaultLanguage="typescript"
                      language="typescript"
                      defaultValue="export function test(): void {}"
                      value={curFilesListSchema?.curActiveFile?.data?.code}
                      beforeMount={(monaco) => {}}
                      onMount={async (editor, monaco) => {
                        monaco.languages.typescript.typescriptDefaults.addExtraLib(
                          `
                            declare const Log: (message:string) => void;
                            declare const SetDB: (key: string, value: number) => void;
                            declare const GetDB: (key: string) => string;
                            declare const SendTx: (chainId: number, to:string, value:string ,data:string) => string | null;
                            declare const GetDataByRID: (rid: number) => string;
                            `,
                          'sdk/index.d.ts'
                        );
                        monaco.languages.typescript.typescriptDefaults.addExtraLib(assemblyscriptJSONDTS, 'assemblyscript-json/index.d.ts');
                        // editor.createDecorationsCollection([
                        //   {
                        //     range: new monaco.Range(4, 17, 4, 22),
                        //     options: {
                        //       isWholeLine: true,
                        //       linesDecorationsClassName: 'myLineDecoration'
                        //     }
                        //   }
                        // ]);
                        // monaco.languages.registerHoverProvider('typescript', {
                        //   provideHover: function (model, position) {
                        //     const word = model.getWordAtPosition(position);
                        //     return {
                        //       contents: [{ value: 'Click to debug' }],
                        //       range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn)
                        //     };
                        //     return null;
                        //   }
                        // });
                        if (asc) monaco.languages.typescript.typescriptDefaults.addExtraLib(asc.definitionFiles.assembly, 'assemblyscript/std/assembly/index.d.ts');
                      }}
                      onChange={(e) => {
                        curFilesListSchema.setCurFileCode(e);
                      }}
                    />
                  </Flex>
                )}
              </>
            )}
          </div>
        </main>
      ) : (
        <>No File Selected!</>
      )}
    </Box>
  );
});

export default Editor;
