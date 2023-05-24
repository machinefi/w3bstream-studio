import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImportJSONProps {
  displayType?: 'button' | 'dnd';
  tipLabel?: string;
  onJSON(json: any): void;
}

const ImportJSON = ({ displayType = 'button', tipLabel = '', onJSON }: ImportJSONProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      if (file.type !== 'application/json') {
        return;
      }
      // const name = file.name;
      // const fileName = name.substring(0, name.lastIndexOf('.'));
      const reader = new FileReader();
      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = (evt) => {
        const fileStr = evt.target.result as string;
        try {
          const jsonObj = JSON.parse(fileStr);
          onJSON(jsonObj);
        } catch (error) {
          console.log(error);
        }
      };
      reader.readAsText(file, 'UTF-8');
    });
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json']
    }
  });

  if (displayType === 'button') {
    return (
      <Box {...getRootProps({ className: 'dropzone' })}>
        <input {...getInputProps()} />
        <Button
          background={'#000'}
          color="#fff"
          cursor={'pointer'}
          _hover={{
            background: '#000'
          }}
        >
          {tipLabel}
        </Button>
      </Box>
    );
  } else {
    return (
      <Flex mb="20px" w="100%" h="100px" p="10px" direction="column" justify="center" align="center" border="2px dashed #eee" background="#000" {...getRootProps({ className: 'dropzone' })}>
        <input {...getInputProps()} />
        <Text fontSize={'14px'} color="#fff">
          Upload a JSON file
        </Text>
        <Text fontSize={'14px'} color="#fff">
          Drag 'n' drop a file here, or click to select a file
        </Text>
      </Flex>
    );
  }
};

export default ImportJSON;
