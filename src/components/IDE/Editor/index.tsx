import { useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { observer, useLocalObservable } from 'mobx-react-lite';
let asc: typeof import('assemblyscript/dist/asc');
import { useStore } from '@/store/index';
import { Box, Button, Center, Flex, Popover, PopoverBody, PopoverContent, PopoverTrigger, Text, Tooltip } from '@chakra-ui/react';
import { FilesItemType } from '@/store/lib/w3bstream/schema/filesList';
import { v4 as uuidv4 } from 'uuid';
import { helper, toast } from '@/lib/helper';
import _ from 'lodash';
import { VscDebugStart, VscClearAll } from 'react-icons/vsc';
import { FileIcon } from '@/components/Tree';
import { toJS } from 'mobx';
import { eventBus } from '@/lib/event';
import { StdIOType, WASM } from '@/server/wasmvm';
import { wasm_vm_sdk } from '@/server/wasmvm/sdk';
import dayjs from 'dayjs';
import { assemblyscriptJSONDTS } from '@/server/wasmvm/assemblyscript-json-d';
import { defaultButtonStyle } from '@/lib/theme';

const Editor = observer(() => {
  const {
    w3s,
    w3s: {
      projectManager: { curFilesListSchema }
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
    stdout: [],
    stderr: [],
    wasmPayload: '',
    onStdout(message: StdIOType) {
      store.stdout.push(message);
    },
    onStderr(message: StdIOType) {
      store.stderr.push(message);
    },
    async onCompile(filesItem: FilesItemType) {
      if (filesItem.type != 'file') return;
      if (!filesItem.label.endsWith('.ts')) return;
      try {
        const code = wasm_vm_sdk + filesItem.data.code;
        console.log(code);
        const { error, binary, text, stats, stderr } = await asc.compileString(code, {
          optimizeLevel: 4,
          runtime: 'stub',
          lib: 'assemblyscript-json/assembly/index',
          debug: true
        });
        console.log(binary, text);
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
        console.log('current folder ->', helper.log(curFilesListSchema.findCurFolder(curFilesListSchema.files)));
        toast.success('Compile Success!');
      } catch (error) {
        console.log(error);
        toast.error('Compile Error!');
      }
    },
    async onDebugWASM() {
      const buffer = Buffer.from(curFilesListSchema?.curActiveFile.data.extraData?.raw);
      const wasi = new WASM(buffer);
      wasi.sendEvent(JSON.stringify(store.wasmPayload));
      const { stderr, stdout } = await wasi.start();
      store.stdout = store.stdout.concat(stdout ?? []);
      store.stderr = store.stderr.concat(stderr ?? []);
      console.log(stderr, stdout);
      setTimeout(() => {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight * 10000;
      }, 1);
    },
    onGetCompileScript(raw) {
      console.log(raw);
      return `
      <head>
        <script>
          async function compile() {
            return await WebAssembly.compile(new Uint8Array([${raw}]));
          }
          async function instantiate(module, imports = {}) {
            const __module0 = imports.module;
            const adaptedImports = {
              env: Object.assign(Object.create(globalThis), imports.env || {}, {
                "Math.random": (
                  Math.random
                ),
              }),
              module: __module0,
            };
            const { exports } = await WebAssembly.instantiate(module, adaptedImports);
            return exports;
          }
          </script>
      </head>
      `;
    },
    onGenHTMLRawData(filesItem: FilesItemType) {
      const curWasmIndex = _.findIndex(curFilesListSchema?.activeFiles, (i) => i?.label.endsWith('.wasm'));
      console.log(curFilesListSchema?.activeFiles, curWasmIndex, curFilesListSchema?.activeFiles[curWasmIndex]);
      if (curWasmIndex == -1) return toast.error('No wasm file find!');
      const arr = [];
      console.log(curFilesListSchema?.activeFiles[curWasmIndex].data.extraData?.raw);
      for (let key in toJS(curFilesListSchema?.activeFiles[curWasmIndex].data.extraData?.raw)) {
        arr.push(toJS(curFilesListSchema?.activeFiles[curWasmIndex].data.extraData?.raw)[key]);
      }
      this.curPreviewRawData = window.btoa(this.getCompileScript(arr) + filesItem.data.code);
      this.showPreviewMode = true;
    }
  }));

  useEffect(() => {
    const asyncImportASC = async () => {
      asc = await import('assemblyscript/dist/asc');
    };
    asyncImportASC();

    const handleSave = (event) => {
      if (event.ctrlKey && event.key === 's') {
        console.log('ctrl+s pressed');
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

  useEffect(() => {
    if (curFilesListSchema?.curActiveFile?.data?.extraData?.payload && store.wasmPayload == '') {
      store.wasmPayload = curFilesListSchema.curActiveFile.data?.extraData?.payload;
    }
  }, [curFilesListSchema?.curActiveFile]);

  return (
    <Box>
      {/* Active Bar Headers  */}
      <Flex w="full" bg="#2f3030" alignItems={'center'} position={'relative'}>
        {curFilesListSchema?.activeFiles.map((i) => {
          return (
            <>
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
                  {/* <SmallCloseIcon _hover={{ bg: '#3f3f3f' }} color="white" ml="auto" onClick={()=>{
                  curFilesListSchema.deleteActiveFiles(i)
                }}/> */}
                </Box>
              )}
            </>
          );
        })}

        {/* {curFilesListSchema?.curActiveFileIs('html') && (
          <Tooltip label="Preview in html" placement="top">
            <Text ml="auto" cursor="pointer" mr={4} className="pi pi-play" color="white" onClick={() => store.onGenHTMLRawData(curFilesListSchema?.curActiveFile)}></Text>
          </Tooltip>
        )} */}

        {curFilesListSchema?.curActiveFileIs('ts') && (
          <>
            <Tooltip label="Compile to wasm (ctrl+s)" placement="top">
              <Text ml="auto" cursor="pointer" mr={4} className="pi pi-bolt" color="white" onClick={() => store.onCompile(curFilesListSchema?.curActiveFile)}></Text>
            </Tooltip>
          </>
        )}

        {curFilesListSchema?.curActiveFileIs('wasm') && (
          <>
            <Tooltip label={`Upload to ${w3s.project.curProject.f_name}`} placement="top">
              <Text
                ml="auto"
                cursor="pointer"
                mr={4}
                className="pi pi-cloud-upload"
                color="white"
                onClick={async () => {
                  w3s.applet.form.value.set({
                    projectName: w3s.project.curProject?.f_name,
                    file: helper.Uint8ArrayToWasmBase64FileData(curFilesListSchema?.curActiveFile.label, curFilesListSchema?.curActiveFile.data.extraData.raw),
                    appletName: ''
                  });
                  w3s.applet.createApplet();
                }}
              ></Text>
            </Tooltip>

            <Box position={'relative'}>
              <Tooltip label="Compile to wasm" placement="top">
                <Popover placement="top-start" offset={[0, 19]} variant="ghost" trigger="hover">
                  <PopoverTrigger>
                    <Box>
                      <VscDebugStart
                        color="white"
                        style={{
                          marginRight: '10px',
                          cursor: 'pointer'
                        }}
                      />
                    </Box>
                  </PopoverTrigger>
                  <PopoverContent right="0" border="none" w="600px">
                    {/* <PopoverArrow />
                  <PopoverCloseButton />
                <PopoverHeader>Confirmation!</PopoverHeader> */}
                    <PopoverBody>
                      <MonacoEditor
                        height={300}
                        language="json"
                        key="json-monaco"
                        theme="vs-dark"
                        value={JSON.stringify(store.wasmPayload, null, 2)}
                        onChange={(e) => {
                          try {
                            store.wasmPayload = JSON.parse(e);
                          } catch (error) {}
                          console.log(e);
                        }}
                      ></MonacoEditor>
                      <Button
                        size="sm"
                        mt={4}
                        variant="ghost"
                        {...defaultButtonStyle}
                        onClick={async () => {
                          store.onDebugWASM();
                        }}
                      >
                        Send Simulated Event
                      </Button>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              </Tooltip>
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
          {store.showPreviewMode ? (
            <iframe
              style={{
                background: '#1e1e1e'
              }}
              frameBorder="0"
              height={400}
              src={`data:text/html;base64,${store.curPreviewRawData}`}
              sandbox="allow-scripts allow-pointer-lock"
            ></iframe>
          ) : (
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
              {curFilesListSchema?.curActiveFile.label.endsWith('.wasm') ? (
                <Flex flexDirection={'column'} w="full">
                  <Center bg={'#1e1e1e'} width={'100%'} height={300} color="white">
                    {/* This file is a binary file and cannot be opened in the editor! */}
                    <MonacoEditor key="wasm-monaco" theme="vs-dark" value={curFilesListSchema?.curActiveFile?.data?.code}></MonacoEditor>
                  </Center>
                  <Flex borderTop={'2px solid #090909'} bg="#1e1e1e" color="white" pt={1}>
                    <VscClearAll
                      onClick={() => {
                        store.stdout = [];
                        store.stderr = [];
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
                    {store.stdout?.map((i) => {
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
                      asc = await import('assemblyscript/dist/asc');
                      console.log(asc);
                      if (asc) monaco.languages.typescript.typescriptDefaults.addExtraLib(asc.definitionFiles.assembly, 'assemblyscript/std/assembly/index.d.ts');
                    }}
                    onChange={(e) => {
                      curFilesListSchema.setCurFileCode(e);
                    }}
                  />
                </Flex>
              )}
            </div>
          )}
          {/* <Box mt={4} w="100%" h="200px" p="10px" bg="#1D262D" color="#98AABA" whiteSpace="pre-line" overflowY="auto" dangerouslySetInnerHTML={{ __html: '123123' }} /> */}
        </main>
      ) : (
        <>No File Selected!</>
      )}
    </Box>
  );
});

export default Editor;
