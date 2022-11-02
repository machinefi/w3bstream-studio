import { Box, Input } from '@chakra-ui/react';
import debounce from 'lodash/debounce';
import { useEffect, useState, useRef } from 'react';

const DockerLogs = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [highlightLogs, setHighlightLogs] = useState<string[]>([]);
  const [showHighligh, setShowHighligh] = useState(false);
  const [inputV, setInputV] = useState('');
  const boxRef = useRef(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:9000');
    socket.addEventListener('open', () => {
      socket.send(
        JSON.stringify({
          type: 'logs'
        })
      );
    });

    socket.addEventListener('message', (event: any) => {
      const { type, data } = JSON.parse(event.data);
      if (type === 'logs') {
        setLogs((pre) => {
          if (pre.length === 20) {
            return pre.slice(1, 20).concat(data);
          } else {
            return pre.concat(data);
          }
        });
        const box = boxRef.current;
        if (box) {
          box.scrollTop = box.scrollHeight;
        }
      }
    });

    return () => {
      socket.close();
    };
  }, []);

  const filterDebounced = useRef(
    debounce((inputV: string, logs: string[]) => {
      const highlightLogs = logs
        .filter((item) => item.includes(inputV))
        .map((item) => {
          const [head, tail] = item.split(inputV);
          return `${head}<span style="color:#FFFF54">${inputV}</span>${tail}`;
        });

      setHighlightLogs(highlightLogs);
      setShowHighligh(true);
    }, 500)
  );

  useEffect(() => {
    if (inputV) {
      filterDebounced.current(inputV, logs);
    } else {
      setShowHighligh(false);
    }
  }, [inputV, logs]);

  const logStr = showHighligh ? highlightLogs.join('') : logs.join('');

  return (
    <Box w="100%" h="calc(100vh - 100px)" pos="relative">
      <Box w="100%" h="100%" p="10px" bg="#1D262D" color="#98AABA" whiteSpace="pre-line" overflowY="auto" dangerouslySetInnerHTML={{ __html: logStr }} ref={boxRef} />
      <Box pos="absolute" bottom="20px" right="20px" bg="#000">
        <Input
          placeholder="Search"
          color="#fff"
          onChange={(e) => {
            setInputV(e.target.value);
          }}
        />
      </Box>
    </Box>
  );
};

export default DockerLogs;
