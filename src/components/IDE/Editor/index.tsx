import { useEffect, useState, useRef } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import MonacoEditor from '@monaco-editor/react';
import { observer, useLocalObservable } from 'mobx-react-lite';
let asc: typeof import('assemblyscript/dist/asc');
import { Button, Container, Group, Tabs } from '@mantine/core';
import { useStore } from '@/store/index';
import { Box, Flex, Text, Tooltip } from '@chakra-ui/react';
import { FilesItemType } from '@/store/lib/w3bstream/schema/filesList';
import { v4 as uuidv4 } from 'uuid';
import { helper, toast } from '@/lib/helper';
import _ from 'lodash';
import { IChangeEvent } from '@rjsf/core';
import { dataURItoBlob } from '@rjsf/utils';
import { FileIcon } from '@/components/Tree';
import { SmallCloseIcon } from '@chakra-ui/icons';

const Editor = observer(() => {
  const { w3s } = useStore();
  let curFilesListSchema = w3s.projectManager?.curFilesListSchema;
  let curActiveFile = curFilesListSchema?.curActiveFile;
  let activeFiles = curFilesListSchema?.activeFiles;

  const store = useLocalObservable(() => ({
    curPreviewRawData: null,
    showPreviewMode: false,
    lockFile: true,

    async compile(filesItem: FilesItemType) {
      if (filesItem.type != 'file') return;
      if (!filesItem.label.endsWith('.ts')) return;
      try {
        const { error, binary, text } = await asc.compileString(filesItem.data.code, {
          optimizeLevel: 4,
          runtime: 'minimal'
        });
        // console.log(binary, text);
        if (error) console.log(error);
        const currentFolder = curFilesListSchema.findCurFolder(curFilesListSchema.extraData.files);
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
          currentFolder.children[curWasmIndex] = wasmFile;
        }
        curFilesListSchema.setActiveFiles(wasmFile);
        console.log('current folder ->', helper.log(curFilesListSchema.findCurFolder(curFilesListSchema.extraData.files)));
        toast.success('Compile Success!');
      } catch (error) {
        console.log(error);
      }
    },
    getCompileScript(raw) {
      return `
      <head>
        <script>
          async function compile() {
            return await WebAssembly.compile(new Uint8Array([${raw}]));
          }
          async function instantiate(module, imports = {}) {
            const { exports } = await WebAssembly.instantiate(module, imports);
            return exports;
          }
          </script>
      </head>
      `;
    },
    genHTMLRawData(filesItem: FilesItemType) {
      const curWasmIndex = _.findIndex(activeFiles, (i) => i.label.endsWith('.wasm'));
      if (curWasmIndex == -1) return toast.error('No wasm file find!');
      this.curPreviewRawData = window.btoa(this.getCompileScript(activeFiles[curWasmIndex].data.extraData?.raw) + filesItem.data.code);
      this.showPreviewMode = true;
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
                  info: {
                    projectID: w3s.curProject?.f_project_id
                  }
                });
                w3s.createApplet.extraValue.set({
                  modal: {
                    show: true
                  }
                });
                w3s.createApplet.onChange({
                  formData: {
                    // @ts-ignore
                    file: `data:application/wasm;name=${curActiveFile.label};base64,${Buffer.from(curActiveFile.data.extraData.raw, 'binary').toString('base64')}`,
                    info: {
                      projectID: w3s.curProject.f_project_id,
                      appletName: ''
                    }
                  }
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
                language={curActiveFile?.data?.language}
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
        </main>
      ) : (
        <>No File Selected!</>
      )}
    </Box>
  );
});

export default Editor;
