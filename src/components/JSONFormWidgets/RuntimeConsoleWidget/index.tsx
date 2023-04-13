import React, { useContext, useEffect, useRef } from 'react';
import { WidgetProps } from '@rjsf/utils';
import { Copy } from '@/components/Common/Copy';
import { Box, Flex, Input, Text } from '@chakra-ui/react';
import { eventBus } from '@/lib/event';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { StdIOType } from '@/server/wasmvm';
import dayjs from 'dayjs';
import { NodeContext } from '@/components/FlowNode';

type Options = {};

export interface RuntimeConsoleProps extends WidgetProps {
  options: Options;
}

const RuntimeConsole = observer(({ label, required, value, readonly, onChange, options }: RuntimeConsoleProps) => {
  // const {} = options;
  const context = useContext(NodeContext);
  const terminalRef = useRef(null);

  const store = useLocalObservable(() => ({
    stdout: [],
    stderr: [],
    onStdout(message: StdIOType) {
      store.stdout.push(message);
    },
    onStderr(message: StdIOType) {
      store.stderr.push(message);
    },
    onFlowRunResult(message: any) {
      console.log('onFlowRunResult2', message.flowId == context);
      if (message.flowId == context) {
        store.stdout = message?.extra?.stdout;
        console.log('onFlowRunResult2', store.stdout);
      }
    }
  }));

  useEffect(() => {
    eventBus.on('flow.run.result', store.onFlowRunResult);
    return () => {
      eventBus.off('flow.run.result', store.onFlowRunResult);
    };
  }, []);

  // useEffect(() => {
  //   eventBus.on('wasmvm.stdout', store.onStdout);
  //   eventBus.on('wasmvm.stderr', store.onStderr);
  //   return () => {
  //     eventBus.off('wasmvm.stdout', store.onStdout);
  //     eventBus.off('wasmvm.stderr', store.onStderr);
  //   };
  // }, []);

  return (
    <Box ref={terminalRef} id="terminal" fontFamily="monospace" w="100%" h="calc(100vh - 480px)" p="10px" bg="#1e1e1e" color="white" whiteSpace="pre-line" overflowY="auto" position="relative">
      {store.stdout?.map((i) => {
        return (
          <Flex userSelect={'text'}>
            <Flex color="#d892ff" mr={2} whiteSpace="nowrap">
              <>
                <Box color="#ffd300" ml={1}>
                  {dayjs(i?.['@ts']).format('hh:mm:ss')}
                </Box>
              </>
            </Flex>
            <Flex wordBreak={'break-all'}>{JSON.stringify(i)}</Flex>
          </Flex>
        );
      })}
    </Box>
  );
});

export const RuntimeConsoleWidget = (props: RuntimeConsoleProps) => {
  return <RuntimeConsole {...props} />;
};

export default RuntimeConsoleWidget;
