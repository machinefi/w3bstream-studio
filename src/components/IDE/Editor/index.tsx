import { useEffect, useRef } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { Box, Center, Flex } from '@chakra-ui/react';
import { FilesItemType } from '@/store/lib/w3bstream/schema/filesList';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { _ } from '@/lib/lodash';
import { eventBus } from '@/lib/event';
import { StdIOType } from '@/server/wasmvm';
import Flow, { FlowErrorFallback } from '@/components/IDE/Flow';
import ErrorBoundary from '@/components/Common/ErrorBoundary';
import { ConsolePanel } from './EditorBottomPanels/ConsolePanel';
import { ABIPanel } from './EditorBottomPanels/ABIPanel';
import { DBpanel } from './EditorBottomPanels/DBpanel';
import { compileAssemblyscript } from './EditorFunctions';
import { EditorTopBarIcons } from './EditorTopBarIcons';
import { MoEditor } from './MonacEditor';
import { EditorEmptyArea } from './EditorEmptyArea';
import ReactSplit, { SplitDirection } from '@devbookhq/splitter';

const Editor = observer(() => {
  const {
    w3s: {
      projectManager: { curFilesListSchema },
      lab
    },
    lang: { t }
  } = useStore();
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
  const boxRef = useRef(null);
  const store = useLocalObservable(() => ({
    curPreviewRawData: null,
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
        const curWasmIndex = _.findIndex(currentFolder.children, (i: any) => i.label == wasmFileName);
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
        toast.success(t('error.compile.msg'));
      } catch (error) {
        console.log(error);
        toast.error(t('success.compile.msg'));
      }
    }
  }));

  if (!curFilesListSchema?.curActiveFile) return <EditorEmptyArea />;
  return (
    <ReactSplit direction={SplitDirection.Vertical} initialSizes={[70, 30]}>
      <Box ref={boxRef} h="full" w="full">
        {/* Active Bar Headers  */}
        {/* {boxRef.current?.clientHeight} */}
        <EditorTopBarIcons />
        {/* Editor Body  */}
        {curFilesListSchema?.curActiveFile && (
          <Flex h="full" w="full">
            {curFilesListSchema?.curActiveFileIs('wasm') ? (
              <Flex flexDirection={'column'} w="full">
                <Center bg={'#1e1e1e'} width={'100%'} height={300} color="white">
                  This file is a binary file and cannot be opened in the editor!
                </Center>
                <ConsolePanel />
              </Flex>
            ) : (
              <Box h="calc(100% - 40px)" w="full">
                {curFilesListSchema?.curActiveFileIs('flow') && (
                  <ErrorBoundary fallback={<FlowErrorFallback />}>
                    <Flow />
                  </ErrorBoundary>
                )}
                {curFilesListSchema?.curActiveFileIs(['ts', 'json', 'wasm', 'env', 'as']) && curFilesListSchema?.curActiveFile?.data?.dataType != 'abi' && <MoEditor />}
                {curFilesListSchema?.curActiveFile?.data?.dataType == 'abi' && <MoEditor />}
              </Box>
            )}
          </Flex>
        )}
      </Box>

      {curFilesListSchema?.curActiveFileIs(['ts', 'json', 'wasm', 'env', 'as']) && curFilesListSchema?.curActiveFile?.data?.dataType != 'abi' && (
        <>
          {curFilesListSchema?.curActiveFile?.data?.dataType == 'assemblyscript' && <ConsolePanel />}
          {curFilesListSchema?.curActiveFile?.data?.dataType == 'sql' && <DBpanel />}
          {curFilesListSchema?.curActiveFile?.data?.dataType == 'simulation' && <ConsolePanel />}
          {curFilesListSchema?.curActiveFile?.data?.dataType == 'demo' && <ConsolePanel />}
        </>
      )}

      {curFilesListSchema?.curActiveFile?.data?.dataType == 'abi' && <ABIPanel />}
    </ReactSplit>
  );
});

export default Editor;
