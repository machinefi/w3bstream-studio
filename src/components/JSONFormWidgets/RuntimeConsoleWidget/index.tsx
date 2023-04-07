import React, { useEffect, useRef } from 'react';
import { WidgetProps } from '@rjsf/utils';
import { Copy } from '@/components/Common/Copy';
import { Box, Flex, Input, Text } from '@chakra-ui/react';
import { eventBus } from '@/lib/event';
import { useLocalObservable } from 'mobx-react-lite';
import { StdIOType } from '@/server/wasmvm';
import dayjs from 'dayjs';

type Options = {
  // prefix: string;
};

export interface RuntimeConsoleProps extends WidgetProps {
  options: Options;
}

const RuntimeConsoleWidget = ({ id, label, required, value, readonly, onChange, options = {  } }: RuntimeConsoleProps) => {
  // const { prefix } = options;
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
  }))
  
  useEffect(() => {
    eventBus.on('wasmvm.stdout', store.onStdout);
    eventBus.on('wasmvm.stderr', store.onStderr);
    return () => {
      eventBus.off('wasmvm.stdout', store.onStdout);
      eventBus.off('wasmvm.stderr', store.onStderr);
    };
  }, []);

  
  return (
    <Box ref={terminalRef} id="terminal" fontFamily="monospace" w="100%" h="calc(100vh - 480px)" p="10px" bg="#1e1e1e" color="white" whiteSpace="pre-line" overflowY="auto" position="relative">
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
  );
};

export default RuntimeConsoleWidget;
