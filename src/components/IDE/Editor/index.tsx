import { useEffect, useState, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { observer, useLocalObservable } from 'mobx-react-lite';
let asc: typeof import('assemblyscript/dist/asc');
import { useStore } from '@/store/index';
import { Box, Flex, Text, Tooltip } from '@chakra-ui/react';
import { FilesItemType } from '@/store/lib/w3bstream/schema/filesList';
import { v4 as uuidv4 } from 'uuid';
import { helper, toast } from '@/lib/helper';
import _ from 'lodash';
import { IChangeEvent } from '@rjsf/core';
import { FileIcon } from '@/components/Tree';
import { toJS } from 'mobx';

const Editor = observer(() => {
  const {
    w3s,
    w3s: {
      projectManager: {
        curFilesListSchema,
        curFilesListSchema: { curActiveFile, activeFiles }
      }
    }
  } = useStore();

  const store = useLocalObservable(() => ({
    curPreviewRawData: null,
    showPreviewMode: false,
    lockFile: true,

    async compile(filesItem: FilesItemType) {
      if (filesItem.type != 'file') return;
      if (!filesItem.label.endsWith('.ts')) return;
      try {
        const { error, binary, text, stats } = await asc.compileString(filesItem.data.code, {
          optimizeLevel: 4,
          runtime: 'stub',
          // debug: true
        });
        // console.log(binary, text);
        if (error) console.log(error);
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
      }
    },
    getCompileScript(raw) {
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
    genHTMLRawData(filesItem: FilesItemType) {
      const curWasmIndex = _.findIndex(curFilesListSchema?.activeFiles, (i) => i?.label.endsWith('.wasm'));
      console.log(curFilesListSchema?.activeFiles, curWasmIndex, activeFiles[curWasmIndex]);
      if (curWasmIndex == -1) return toast.error('No wasm file find!');
      const arr = [];
      console.log(curFilesListSchema?.activeFiles[curWasmIndex].data.extraData?.raw);
      for (let key in toJS(curFilesListSchema?.activeFiles[curWasmIndex].data.extraData?.raw)) {
        arr.push(toJS(curFilesListSchema?.activeFiles[curWasmIndex].data.extraData?.raw)[key]);
      }
      this.curPreviewRawData = window.btoa(this.getCompileScript(arr) + filesItem.data.code);
      this.showPreviewMode = true;
    },
    getLanguage(filesItem: FilesItemType) {
      if (filesItem.label.endsWith('.go')) {
        return 'go';
      }
      if (filesItem.label.endsWith('.html')) {
        return 'html';
      }
      if (filesItem.label.endsWith('.ts')) {
        return 'typescript';
      }
    }
  }));

  useEffect(() => {
    const asyncImportASC = async () => {
      asc = await import('assemblyscript/dist/asc');
    };
    asyncImportASC();
  }, []);

  return (
    <Box>
      {/* Active Bar Headers  */}
      <Flex w="full" bg="#2f3030" alignItems={'center'}>
        {activeFiles?.map((i) => {
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
                  background={i?.key == curActiveFile?.key ? '#1e1e1e' : 'none'}
                  fontSize="sm"
                  color={i?.key == curActiveFile?.key ? '#a9dc76' : 'white'}
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

        {curActiveFile?.label.endsWith('.html') && (
          <Tooltip label="Preview in html" placement="top">
            <Text ml="auto" cursor="pointer" mr={4} className="pi pi-play" color="white" onClick={() => store.genHTMLRawData(curActiveFile)}></Text>
          </Tooltip>
        )}

        {curActiveFile?.label.endsWith('.ts') && (
          <Tooltip label="Compile to wasm" placement="top">
            <Text ml="auto" cursor="pointer" mr={4} className="pi pi-bolt" color="white" onClick={() => store.compile(curActiveFile)}></Text>
          </Tooltip>
        )}

        {curActiveFile?.label.endsWith('.wasm') && (
          <Tooltip label={`Upload to ${w3s.curProject.f_name}`} placement="top">
            <Text
              ml="auto"
              cursor="pointer"
              mr={4}
              className="pi pi-cloud-upload"
              color="white"
              onClick={() => {
                //@ts-ignore
                w3s.createApplet.value.set({
                  projectID: w3s.curProject?.f_project_id.toString()
                });
                w3s.createApplet.extraValue.set({
                  modal: {
                    show: true
                  }
                });
                //@ts-ignore
                w3s.createApplet.value.set({
                  file: `data:application/wasm;name=${curActiveFile.label};base64,${Buffer.from(curActiveFile.data.extraData.raw, 'binary').toString('base64')}`,
                  projectID: w3s.curProject.f_project_id,
                  appletName: ''
                } as IChangeEvent);
              }}
            ></Text>
          </Tooltip>
        )}
      </Flex>

      {/* Editor Body  */}
      {curActiveFile ? (
        <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          {store.showPreviewMode ? (
            <iframe style={{ background: '#1e1e1e' }} frameBorder="0" height={400} src={`data:text/html;base64,${store.curPreviewRawData}`} sandbox="allow-scripts allow-pointer-lock"></iframe>
          ) : (
            <div
              style={{ display: 'flex' }}
              onMouseEnter={() => {
                curFilesListSchema.unlockFile();
              }}
              onMouseLeave={() => {
                curFilesListSchema.lockedFile();
              }}
            >
              <MonacoEditor
                width={'100%'}
                height={400}
                theme="vs-dark"
                language={store.getLanguage(curActiveFile)}
                defaultValue="export function test(): void {}"
                value={curActiveFile?.data?.code}
                beforeMount={(monaco) => {
                  if (asc) monaco.languages.typescript.typescriptDefaults.addExtraLib(asc.definitionFiles.assembly, 'assemblyscript/std/assembly/index.d.ts');
                }}
                onChange={(e) => {
                  curFilesListSchema.setCurFileCode(e);
                }}
              />
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
