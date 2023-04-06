import { Box, Button, Flex, Text } from '@mantine/core';
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
      'application/json': ['.json'],
    },
  });

  if (displayType === 'button') {
    return (
      <Box {...getRootProps({ className: 'dropzone' })}>
        <input {...getInputProps()} />
        <Button
          compact
          sx={(theme) => ({
            background: theme.colorScheme === 'dark' ? '#fff' : '#000',
            color: theme.colorScheme === 'dark' ? '#000' : '#fff',
            cursor: 'pointer',
            ':hover': {
              background: theme.colorScheme === 'dark' ? theme.colors.gray[4] : theme.colors.dark[4],
            },
          })}
        >
          {tipLabel}
        </Button>
      </Box>
    );
  } else {
    return (
      <Flex
        mb="20px"
        w="100%"
        h="100px"
        p="10px"
        direction="column"
        justify="center"
        align="center"
        sx={(theme) => ({
          border: '2px dashed #eee',
          background: theme.colorScheme === 'dark' ? '#fff' : '#000',
        })}
        {...getRootProps({ className: 'dropzone' })}
      >
        <input {...getInputProps()} />
        <Text
          sx={(theme) => ({
            fontSize: '16px',
            color: theme.colorScheme === 'dark' ? '#000' : '#fff',
          })}
        >
          Upload a JSON file
        </Text>
        <Text
          sx={(theme) => ({
            fontSize: '14px',
            color: theme.colorScheme === 'dark' ? '#000' : '#fff',
          })}
        >
          Drag 'n' drop a file here, or click to select a file
        </Text>
      </Flex>
    );
  }
};

export default ImportJSON;
