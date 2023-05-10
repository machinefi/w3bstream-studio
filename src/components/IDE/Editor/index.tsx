import { useEffect, useRef } from 'react';
import MonacoEditor, { useMonaco } from '@monaco-editor/react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { rootStore, useStore } from '@/store/index';
import { Box, Button, Center, Flex, Portal, Select, Text, Tooltip } from '@chakra-ui/react';
import { FilesItemType } from '@/store/lib/w3bstream/schema/filesList';
import { v4 as uuidv4 } from 'uuid';
import { helper, toast } from '@/lib/helper';
import reactHotToast from 'react-hot-toast';
import _ from 'lodash';
import { VscDebugStart } from 'react-icons/vsc';
import { BsDatabaseFillAdd } from 'react-icons/bs';
import { FileIcon } from '@/components/Tree';
import { eventBus } from '@/lib/event';
import { StdIOType } from '@/server/wasmvm';
import { wasm_vm_sdk } from '@/server/wasmvm/sdk';
import { assemblyscriptJSONDTS } from '@/server/wasmvm/assemblyscript-json-d';
import { CheckCircleIcon, SmallCloseIcon } from '@chakra-ui/icons';
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu';
import { asc } from 'pages/_app';
import Flow, { FlowErrorFallback } from '@/components/DeveloperIDE/Flow';
import { hooks } from '@/lib/hooks';
import { StorageState } from '@/store/standard/StorageState';
import ErrorBoundary from '@/components/Common/ErrorBoundary';
import { CREATDB_TYPE, TableJSONSchema } from '@/server/wasmvm/sqldb';
import { defaultOutlineButtonStyle } from '@/lib/theme';
//@ts-ignore
import { faker } from '@faker-js/faker';
import { ConsolePanel } from './EditorBottomPanels/ConsolePanel';
import { ABIPanel } from './EditorBottomPanels/ABIPanel';
import { DBpanel } from './EditorBottomPanels/DBpanel';
import { Indexer } from '@/lib/indexer';
import HorizontalScroll from 'react-scroll-horizontal';

export const compileAssemblyscript = async (code: string) => {
  let { error, binary, text, stats, stderr } = await asc.compileString(wasm_vm_sdk + code, {
    optimizeLevel: 4,
    runtime: 'stub',
    lib: 'assemblyscript-json/assembly/index',
    debug: true
  });
  let _error = error + '';
  // @ts-ignore
  stderr?.map((i: Uint8Array) => {
    const errorText = new TextDecoder().decode(i);
    if (errorText.includes('ERROR')) {
      // console.log(errorText);
      _error += '\n\n' + errorText;
    }
  });
  return { error: error ? { message: _error } : null, binary, text, stats, stderr };
};

export const compileAndCreateProject = async (needCompile: boolean = true) => {
  const curActiveFile = rootStore?.w3s.projectManager.curFilesListSchema.curActiveFile;
  if (needCompile) {
    const { error, binary, text, stats, stderr } = await compileAssemblyscript(curActiveFile.data.code);
    if (error) {
      console.log(error);
      return toast.error(error.message);
    }
    rootStore?.w3s.project.createProjectByWasmForm.value.set({
      file: helper.Uint8ArrayToWasmBase64FileData(curActiveFile.label.replace('.ts', '.wasm'), binary)
    });
  } else {
    rootStore?.w3s.project.createProjectByWasmForm.value.set({
      file: helper.Uint8ArrayToWasmBase64FileData(curActiveFile.label.replace('.ts', '.wasm'), curActiveFile.data.extraData.raw)
    });
  }

  try {
    await rootStore?.w3s.project.createProjectByWasm();
    reactHotToast(
      (t) => (
        <span>
          Creact Project Success
          <Button
            size="sm"
            ml={2}
            onClick={async () => {
              reactHotToast.dismiss(t.id);
              rootStore.w3s.currentHeaderTab = 'PROJECTS';
              rootStore.w3s.project.resetSelectedNames();
              await rootStore?.w3s.project.allProjects.call();
              rootStore.w3s.project.allProjects.onSelect(0);
              rootStore.w3s.showContent = 'METRICS';
            }}
          >
            Go to
          </Button>
        </span>
      ),
      {
        duration: 5000,
        icon: <CheckCircleIcon color={'green'} />
      }
    );
  } catch (e) {
    console.log(e);
  }
};

export const debugAssemblyscript = async (needCompile = true) => {
  const lab = rootStore?.w3s.lab;
  const curActiveFile = rootStore?.w3s.projectManager.curFilesListSchema.curActiveFile;
  const payloadCache = new StorageState<string>({
    key: curActiveFile.key + '_payload'
  });
  if (payloadCache.value) {
    lab.simulationEventForm.value.set({
      wasmPayload: payloadCache.value
    });
  } else {
    lab.simulationEventForm.value.set({
      wasmPayload: '{}'
    });
  }
  try {
    // curFilesListSchema.curActiveFile.data?.extraData?.payload ||
    lab.simulationEventForm.afterSubmit = async ({ formData }) => {
      if (formData.wasmPayload) {
        try {
          const wasmPayload = JSON.parse(formData.wasmPayload);
          await lab.onDebugWASM(wasmPayload, needCompile, formData.handleFunc);
          lab.simulationEventHistory.push({ wasmPayload, handleFunc: formData.handleFunc });
        } catch (error) {}
      }
    };
    lab.simulationIndexerForm.afterSubmit = async ({ formData }) => {
      const { contractAddress, chainId, startBlock, contract, contractEventName, handleFunc } = formData;
      let abi: any;
      if (contractAddress && chainId && startBlock && contract && contractEventName) {
        const { abi } = helper.string.validAbi(contract);
        const indexer = new Indexer({
          formData: {
            contractAddress,
            chainId,
            startBlock,
            abi,
            contractEventName
          }
        });
        const payload = await indexer.start();
        await lab.onDebugWASM(payload, needCompile, handleFunc);
        Indexer.indexderHistory.push({ contractAddress, chainId, startBlock, contract, contractEventName, handleFunc });
      }
    };
    hooks.getFormData({
      title: 'Send Simulated Event',
      size: 'xl',
      isAutomaticallyClose: false,
      isCentered: true,
      formList: [
        {
          label: 'Simulate',
          form: lab.simulationEventForm
        },
        {
          label: 'Indexer',
          form: lab.simulationIndexerForm
        }
      ]
    });
  } catch (e) {}
};

export const debugSimulation = () => {
  const lab = globalThis.store.w3s.lab;
  const code = globalThis.store.w3s.projectManager.curFilesListSchema.curActiveFile.data.code;
  const res = new Function('faker', code)(faker);
  const stdio: StdIOType = { '@lv': 'info', msg: res, '@ts': Date.now(), prefix: '' };
  lab.stdout.push(stdio);
};

export const onCreateDB = async () => {
  const curActiveFile = rootStore?.w3s.projectManager.curFilesListSchema.curActiveFile;
  const tableJSONSchema: TableJSONSchema = JSON.parse(curActiveFile?.data?.code);
  await rootStore.god.sqlDB.createTableByJSONSchema(tableJSONSchema);
};

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
    const handleSave = (event) => {
      if (event.ctrlKey && event.key === 's') {
        if (curFilesListSchema?.curActiveFileIs('ts')) {
          store.onCompile(curFilesListSchema?.curActiveFile);
        }
        event.preventDefault();
      }
    };
    window.addEventListener('keydown', handleSave);
    eventBus.on('wasmvm.stdout', store.onStdout);
    eventBus.on('wasmvm.stderr', store.onStderr);
    return () => {
      eventBus.off('wasmvm.stdout', store.onStdout);
      eventBus.off('wasmvm.stderr', store.onStderr);
      window.removeEventListener('keydown', handleSave);
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
        const { error, binary, text, stats, stderr } = await compileAssemblyscript(filesItem.data.code);
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

  const CurActiveFileRightClickMenu = observer(({ activeFile }: { activeFile: FilesItemType }) => {
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

  const EditorTopBarIcons = observer(() => {
    return (
      <Flex w="full" bg="#2f3030" alignItems={'center'} position={'relative'} h="35px">
        <HorizontalScroll style={{ marginRight: '15px' }}>
          <Flex>
            {curFilesListSchema?.activeFiles?.map((i, index) => {
              return (
                <>
                  <ContextMenuTrigger id={`ActiveFileContent${i?.key}`} holdToDisplay={-1}>
                    {i?.label && (
                      <Box
                        w="max-content"
                        whiteSpace={'nowrap'}
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
          </Flex>
        </HorizontalScroll>

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

  const MoEditor = (props) => {
    const monaco = useMonaco();
    if (monaco) {
      monaco.languages.register({ id: 'env' });
      monaco.languages.setMonarchTokensProvider('myEnv', {
        tokenizer: {
          root: [
            [/^[^=]+/, 'identifier'],
            [/=/, 'delimiter'],
            [/[^=]+$/, 'string']
          ]
        }
      });
    }
    return (
      <>
        <MonacoEditor
          width={'100%'}
          height={350}
          key={curFilesListSchema?.curActiveFile.data?.language}
          theme="vs-dark"
          defaultLanguage={curFilesListSchema?.curActiveFile.data?.language}
          language={curFilesListSchema?.curActiveFile.data?.language}
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
        declare const ExecSQL: (query: string,args?:any[]) => i32;
        declare const QuerySQL: (query: string,args?:any[]) => string;
        declare const GetEnv: (key:string) => string;
        declare const faker: any;
        declare const CallContract:(chainId: number, to:string, data:string) => string;
        declare const hexToUtf8(hex: string): string;
        declare const hexToInt(hex: string): i32;
        declare const hexToBool(hex: string): bool;
        declare const hexToAddress(hex: string): string;
        `,
              'sdk/index.d.ts'
            );
            monaco.languages.typescript.typescriptDefaults.addExtraLib(assemblyscriptJSONDTS, 'assemblyscript-json/index.d.ts');
            if (asc) monaco.languages.typescript.typescriptDefaults.addExtraLib(asc.definitionFiles.assembly, 'assemblyscript/std/assembly/index.d.ts');
          }}
          onChange={(e) => {
            curFilesListSchema.setCurFileCode(e);
          }}
          {...props}
        />
      </>
    );
  };

  return (
    <Box>
      {/* Active Bar Headers  */}
      <EditorTopBarIcons />
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
                <Center fontFamily={'sans-serif'} bg={'#1e1e1e'} width={'100%'} height={300} color="white">
                  This file is a binary file and cannot be opened in the editor!
                </Center>
                <ConsolePanel />
              </Flex>
            ) : (
              <>
                {curFilesListSchema?.curActiveFileIs('flow') && (
                  <ErrorBoundary fallback={<FlowErrorFallback />}>
                    <Flow />
                  </ErrorBoundary>
                )}

                {curFilesListSchema?.curActiveFileIs(['ts', 'json', 'wasm', 'env']) && curFilesListSchema?.curActiveFile?.data?.dataType != 'abi' && (
                  <>
                    <Flex flexDirection={'column'} w="full">
                      <MoEditor />
                      {curFilesListSchema?.curActiveFile?.data?.dataType == 'assemblyscript' && <ConsolePanel />}
                      {curFilesListSchema?.curActiveFile?.data?.dataType == 'sql' && <DBpanel />}
                      {curFilesListSchema?.curActiveFile?.data?.dataType == 'simulation' && <ConsolePanel />}
                      {/* {curFilesListSchema?.curActiveFile?.data?.dataType == 'abi' && <ABIPanel />} */}
                    </Flex>
                  </>
                )}

                {curFilesListSchema?.curActiveFile?.data?.dataType == 'abi' && (
                  <Flex flexDirection={'row'} width="calc(100vw - 380px)" ml="auto" h="calc(100vh - 190px)">
                    {/* ts-ignore  */}
                    <MoEditor height="auto" w="50%" />
                    <ABIPanel />
                  </Flex>
                )}
              </>
            )}
          </div>
        </main>
      ) : (
        <Flex justify={'center'} align="center" direction="column" w="full">
          <Flex justify={'center'} mt={12}>
            No File Selected!
          </Flex>
          <Button
            mt={4}
            w="50%"
            {...defaultOutlineButtonStyle}
            onClick={async () => {
              const formData = await hooks.getFormData({
                title: 'Create a File',
                size: '2xl',
                formList: [
                  {
                    form: w3s.projectManager.initWasmTemplateForm
                  }
                ]
              });
              w3s.projectManager.curFilesListSchema.createFileFormFolder(w3s.projectManager.curFilesList[0], 'file', helper.json.safeParse(formData.template) ?? null);
            }}
          >
            New File
          </Button>
        </Flex>
      )}
    </Box>
  );
});

export default Editor;
