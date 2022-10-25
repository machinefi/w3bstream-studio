import React, { useCallback, useMemo, useState } from 'react';
import { Flex, chakra, Box, Text, Stack } from '@chakra-ui/react';
import { dataURItoBlob, WidgetProps } from '@rjsf/utils';
import { Accept, useDropzone } from 'react-dropzone';

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
  return dataURLs
    .filter((dataURL) => typeof dataURL !== 'undefined')
    .map((dataURL) => {
      const { blob, name } = dataURItoBlob(dataURL);
      return {
        name: name,
        size: blob.size,
        type: blob.type
      };
    });
}

interface CustomFileWidgetProps extends WidgetProps {
  options: {
    accept?: Accept;
    maxFiles?: number;
    multiple?: boolean;
    tips?: string;
  };
}

const CustomFileWidget = ({ id, readonly, disabled, required, onChange, label, value, autofocus = false, options }: CustomFileWidgetProps) => {
  const { accept, maxFiles = 0, multiple = false, tips } = options;
  const extractedFilesInfo = useMemo(() => (Array.isArray(value) ? extractFileInfo(value) : extractFileInfo([value])), [value]);
  const [filesInfo, setFilesInfo] = useState<FileInfoType[]>(extractedFilesInfo);

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
      <Flex mt="10px" w="100%" h="100px" flexDirection="column" justifyContent="center" alignItems="center" border="2px dashed #eee" mb="20px" {...getRootProps({ className: 'dropzone' })}>
        <input id={id} name={id} disabled={readonly || disabled} autoFocus={autofocus} {...getInputProps()} />
        <Text>{label}</Text>
        {tips && (
          <Text fontSize="14px" color="#aaa">
            {tips}
          </Text>
        )}
      </Flex>
      <FilesInfo filesInfo={filesInfo} />
    </Flex>
  );
};

export default CustomFileWidget;
