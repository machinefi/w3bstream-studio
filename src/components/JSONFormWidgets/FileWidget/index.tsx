import React, { useCallback, useEffect, useState } from 'react';
import { Flex, chakra, Box, Text, Stack, FlexProps, Icon, Button } from '@chakra-ui/react';
import { dataURItoBlob, WidgetProps } from '@rjsf/utils';
import { Accept, useDropzone } from 'react-dropzone';
import { FiUploadCloud } from 'react-icons/fi';
import { DownloadIcon } from '@chakra-ui/icons';

function addNameToDataURL(dataURL: string, name: string) {
  if (dataURL === null) {
    return null;
  }
  return dataURL.replace(';base64', `;name=${encodeURIComponent(name)};base64`);
}

type FileInfoType = {
  dataURL?: string | null;
  name: string;
  size: number;
  type: string;
};

function processFile(file: File): Promise<FileInfoType> {
  const { name, size, type } = file;
  return new Promise((resolve, reject) => {
    const reader = new window.FileReader();
    reader.onerror = reject;
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        resolve({
          dataURL: addNameToDataURL(event.target.result, name),
          name,
          size,
          type
        });
      } else {
        resolve({
          dataURL: null,
          name,
          size,
          type
        });
      }
    };
    reader.readAsDataURL(file);
  });
}

function processFiles(files: File[]) {
  return Promise.all(Array.from(files).map(processFile));
}

function FilesInfo({ filesInfo }: { filesInfo: { name: string; size: number; type: string }[] }) {
  if (filesInfo.length === 0) {
    return null;
  }
  return (
    <Stack>
      {filesInfo.map((fileInfo, key) => {
        const { name, size, type } = fileInfo;
        return (
          <Box key={key}>
            <strong>{name}</strong> ({type}, {size} bytes)
          </Box>
        );
      })}
    </Stack>
  );
}

function extractFileInfo(dataURLs: string[]) {
  const res = dataURLs
    .filter((dataURL) => typeof dataURL !== 'undefined')
    .map((dataURL) => {
      const { blob, name } = dataURItoBlob(dataURL);
      return {
        name: name,
        size: blob.size,
        type: blob.type
      };
    });
  console.log(res);
  return res;
}

type Options = {
  accept?: Accept; // https://developer.mozilla.org/en-US/docs/Web/API/window/showOpenFilePicker
  maxFiles?: number; // Maximum accepted number of files The default value is 0 which means there is no limitation to how many files are accepted.
  multiple?: boolean; // Allow drag 'n' drop (or selection from the file dialog) of multiple files
  tips?: string;
  flexProps?: FlexProps;
  showDownload?: boolean;
};

export interface FileWidgetProps extends WidgetProps {
  options: Options;
}

export type FileWidgetUIOptions = {
  'ui:widget': (props: FileWidgetProps) => JSX.Element;
  'ui:options': Options;
};

const FileWidget = ({ id, readonly, disabled, required, onChange, label, value, autofocus = false, options }: FileWidgetProps) => {
  const { accept, maxFiles = 0, multiple = false, tips, flexProps = {}, showDownload = false } = options;
  const [filesInfo, setFilesInfo] = useState<FileInfoType[]>([]);
  useEffect(() => {
    if (value) {
      Array.isArray(value) ? setFilesInfo(extractFileInfo(value)) : setFilesInfo(extractFileInfo([value]));
    } else {
      setFilesInfo([]);
    }
  }, [value]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) {
        return;
      }

      processFiles(acceptedFiles).then((filesInfoEvent) => {
        setFilesInfo(filesInfoEvent);
        const newValue = filesInfoEvent.map((fileInfo) => {
          return fileInfo.dataURL;
        });
        if (multiple) {
          onChange(newValue);
        } else {
          onChange(newValue[0]);
        }
      });
    },
    [multiple, onChange]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxFiles,
    multiple,
    accept: accept ? accept : undefined
  });

  return (
    <Flex flexDir="column">
      <Flex alignItems="center">
        <Text>{label}</Text>
        {required && (
          <chakra.span ml="0.25rem" color="#D34B46">
            *
          </chakra.span>
        )}
      </Flex>
      <Flex
        mt="10px"
        w="100%"
        h="100px"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        border="2px dashed #eee"
        mb="20px"
        {...getRootProps({ className: 'dropzone' })}
        {...flexProps}
      >
        <input id={id} name={id} disabled={readonly || disabled} autoFocus={autofocus} {...getInputProps()} />
        <Icon mb="5px" boxSize={6} as={FiUploadCloud} color="#aaa" />
        {tips && (
          <Text fontSize="14px" color="#aaa">
            {tips}
          </Text>
        )}
      </Flex>
      <FilesInfo filesInfo={filesInfo} />
      {showDownload && (
        <Button
          mt={2}
          size="md"
          rightIcon={<DownloadIcon />}
          onClick={() => {
            if (value) {
              const link = document.createElement('a');
              if (Array.isArray(value)) {
                value.forEach((dataURL) => {
                  const { blob, name } = dataURItoBlob(dataURL);
                  link.href = window.URL.createObjectURL(blob);
                  link.download = name;
                  link.click();
                });
              } else {
                const { blob, name } = dataURItoBlob(value);
                link.href = window.URL.createObjectURL(blob);
                link.download = name;
                link.click();
              }
            }
          }}
        >
          Download File
        </Button>
      )}
    </Flex>
  );
};

export default FileWidget;
