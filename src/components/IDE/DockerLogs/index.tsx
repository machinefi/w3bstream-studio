import { Box } from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';

const DockerLogs = () => {
  const [logs, setLogs] = useState([]);
  const boxRef = useRef(null);
  const countRef = useRef(0);

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
          const count = countRef.current;
          if (count === 20) {
            countRef.current = count - 1;
            return pre.slice(1, 20).concat(data);
          } else {
            countRef.current = count + 1;
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

  const logStr = logs.join('');

  return <Box w="100%" h="calc(100vh - 100px)" p="10px" bg="#1D262D" color="#98AABA" whiteSpace="pre-line" overflowY="auto" dangerouslySetInnerHTML={{ __html: logStr }} ref={boxRef} />;
};

export default DockerLogs;
