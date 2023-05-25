import dayjs from '@/lib/dayjs';
import { useStore } from '@/store/index';
import { Box, Flex } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef } from 'react';
import { VscClearAll, VscDebugStart } from 'react-icons/vsc';

export const ConsolePanel = observer(() => {
  const {
    w3s,
    w3s: {
      projectManager: { curFilesListSchema },
      lab
    }
  } = useStore();
  const terminalRef = useRef(null);

  useEffect(() => {
    terminalRef.current.scrollTop = terminalRef.current.scrollHeight * 10000;
  }, [lab.stdout]);

  return (
    <>
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
        css={{
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-track': {
            width: '8px'
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#999999'
            // borderRadius: '24px'
          }
        }}
        ref={terminalRef}
        id="terminal"
        fontFamily="monospace"
        w="100%"
        h="calc(100vh - 650px)"
        p="10px"
        bg="#1e1e1e"
        color="white"
        whiteSpace="pre-line"
        overflowY="auto"
        position="relative"
      >
        {lab.stdout?.map((i) => {
          return (
            <Flex color={i?.['@lv'] == 'error' ? 'red' : ''}>
              <Flex maxW="200px" mr={2} whiteSpace="nowrap">
                [<Box color="#d892ff">{i.prefix} </Box>
                <Box color="#ffd300">{dayjs(i?.['@ts']).format('hh:mm:ss')}</Box>]
              </Flex>
              <Flex w="90%" overflowWrap={'anywhere'}>
                {JSON.stringify(i)}
              </Flex>
            </Flex>
          );
        })}
      </Box>
    </>
  );
});
