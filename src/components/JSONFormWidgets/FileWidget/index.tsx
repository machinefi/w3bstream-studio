import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Flex, chakra, Box, Text, Stack, FlexProps, Icon, Button, Spinner, Image } from '@chakra-ui/react';
import { dataURItoBlob, WidgetProps } from '@rjsf/utils';
import { Accept, useDropzone } from 'react-dropzone';
import { FiUploadCloud } from 'react-icons/fi';
import { DownloadIcon } from '@chakra-ui/icons';
import { useS3Upload } from 'next-s3-upload';
import MonacoEditor from '@monaco-editor/react';
import { _ } from '@/lib/lodash';

function addNameToDataURL(dataURL: string, name: string) {
  if (dataURL === null) {
    return null;
  }
  return dataURL.replace(';base64', `;name=${encodeURIComponent(name)};base64`);
}

type FileInfoType = {
  dataURL?: string;
  result?: string;
  name: string;
  size: number;
  type: string;
};

function processFile(file: File, resultType: 'dataURL' | 'JSON'): Promise<FileInfoType> {
  const { name, size, type } = file;
  return new Promise((resolve, reject) => {
    const reader = new window.FileReader();
    reader.onerror = reject;
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        resolve({
          name,
          size,
          type,
          result: resultType === 'JSON' ? result : null,
          dataURL: resultType === 'dataURL' ? addNameToDataURL(result, name) : null
        });
      } else {
        resolve({
          name,
          size,
          type
        });
      }
    };
    if (resultType === 'dataURL') {
      reader.readAsDataURL(file);
    }
    if (resultType === 'JSON') {
      reader.readAsText(file, 'UTF-8');
    }
  });
}

function processFiles(files: File[], resultType: 'dataURL' | 'JSON'): Promise<FileInfoType[]> {
  return Promise.all(Array.from(files).map((file: File) => processFile(file, resultType)));
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
  return res;
}

type Options = {
  accept?: Accept; // https://developer.mozilla.org/en-US/docs/Web/API/window/showOpenFilePicker
  maxFiles?: number; // Maximum accepted number of files The default value is 0 which means there is no limitation to how many files are accepted.
  multiple?: boolean; // Allow drag 'n' drop (or selection from the file dialog) of multiple files
  tips?: string;
  flexProps?: FlexProps;
  showDownload?: boolean;
  mode?: 'general' | 'image';
  resultType?: 'dataURL' | 'JSON';
};

export interface FileWidgetProps extends WidgetProps {
  options: Options;
}

export type FileWidgetUIOptions = {
  'ui:widget': (props: FileWidgetProps) => JSX.Element;
  'ui:options': Options;
};

const FileWidget = ({ id, readonly, disabled, required, onChange, label, value, autofocus = false, options }: FileWidgetProps) => {
  const { mode = 'general', resultType = 'dataURL', accept, maxFiles = 0, multiple = false, tips = '', flexProps = {}, showDownload = false } = options;
  const [filesInfo, setFilesInfo] = useState<FileInfoType[]>([]);
  const { uploadToS3 } = useS3Upload();
  const [loading, setLoading] = useState(false);
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) {
        return;
      }

      if (mode === 'image') {
        const file = acceptedFiles[0];
        setLoading(true);
        uploadToS3(file)
          .then(({ url }) => {
            onChange(url);
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        processFiles(acceptedFiles, resultType).then((filesInfoEvent) => {
          const newValue = filesInfoEvent.map((fileInfo) => {
            if (resultType === 'dataURL') {
              setFilesInfo(filesInfoEvent);
              return fileInfo.dataURL;
            } else {
              return fileInfo.result;
            }
          });
          if (multiple) {
            onChange(newValue);
          } else {
            onChange(newValue[0]);
          }
        });
      }
    },
    [multiple, onChange]
  );
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxFiles,
    multiple,
    accept: accept ? accept : undefined,
    disabled: resultType === 'JSON' && value
  });
  const changeCodeRef = useRef(
    _.debounce((codeStr: string) => {
      onChange(codeStr);
    }, 800)
  );

  useEffect(() => {
    if (mode === 'image' || !value) {
      setFilesInfo([]);
      return;
    }

    if (resultType === 'dataURL') {
      Array.isArray(value) ? setFilesInfo(extractFileInfo(value)) : setFilesInfo(extractFileInfo([value]));
    }
  }, [value]);

  return (
    <Flex flexDir="column">
      {/* <Flex alignItems="center" className=''>
        <Text>{label}</Text>
        {required && (
          <chakra.span ml="0.25rem" color="#D34B46">
            *
          </chakra.span>
        )}
      </Flex> */}
      <Flex
        w="100%"
        h="100px"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        border="2px dashed #eee"
        mb="20px"
        cursor="pointer"
        {...getRootProps({ className: 'dropzone' })}
        {...flexProps}
      >
        <input id={id} name={id} autoFocus={autofocus} {...getInputProps()} />
        {loading ? (
          <Spinner />
        ) : mode === 'general' ? (
          <>
            {value && resultType === 'JSON' ? (
              <MonacoEditor
                height="100%"
                theme="vs-dark"
                language={resultType === 'JSON' ? 'json' : 'text'}
                value={value}
                onChange={(v) => {
                  changeCodeRef.current && changeCodeRef.current(v);
                }}
              />
            ) : (
              <>
                <Icon mb="5px" boxSize={6} as={FiUploadCloud} color="#aaa" />
                <Text fontSize="14px" color="#aaa">
                  {tips}
                </Text>
              </>
            )}
          </>
        ) : (
          <>
            {tips && !value && (
              <>
                <Icon mb="5px" boxSize={6} as={FiUploadCloud} color="#aaa" />
                <Text fontSize="14px" color="#aaa">
                  {tips}
                </Text>
              </>
            )}
            {mode === 'image' && value && <Image w="100%" h="100%" src={value} alt="" />}
          </>
        )}
      </Flex>
      {resultType === 'dataURL' && <FilesInfo filesInfo={filesInfo} />}
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
