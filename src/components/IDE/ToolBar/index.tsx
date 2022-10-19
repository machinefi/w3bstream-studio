import React from 'react';
import { Flex, BoxProps, useColorModeValue, Image, Tooltip } from '@chakra-ui/react';
import { useStore } from '@/store/index';

interface ToolBar extends BoxProps {}

const ToolBar = (props: ToolBar) => {
  const bg = useColorModeValue('white', 'dark');
  const { w3s } = useStore();
  const iconStyle = {
    p: '0.5',
    h: '8',
    w: '8',
    mb: '2',
    cursor: 'pointer',
    _hover: { background: 'gray.200', borderRadius: '4px' }
  };
  const isSelect = (type) => {
    if (w3s.showContent == type) {
      return { background: 'gray.200' };
    }
  };

  return (
    <>
      <Flex h="100%" direction="column" justify="space-between" align="center" {...props} bg={bg} style={{ padding: '16px 0' }}>
        <Flex direction="column">
          <Tooltip label="Project" placement="right">
            <Image
              src="/images/icons/home.svg"
              onClick={() => {
                w3s.showContent = 'CURRENT_APPLETS';
              }}
              {...iconStyle}
              {...isSelect('CURRENT_APPLETS')}
            ></Image>
          </Tooltip>

          <Tooltip label="Editor" placement="right">
            <Image
              src="/images/icons/code.svg"
              onClick={() => {
                w3s.showContent = 'EDITOR';
              }}
              {...iconStyle}
              {...isSelect('EDITOR')}
            ></Image>
          </Tooltip>
          {/* <Tooltip label="Document(Comming Soon)" placement="right">
            <Image src="/images/icons/documents.svg" {...iconStyle} {...isSelect('')} onClick={() => {}}></Image>
          </Tooltip>
          <Tooltip label="Script" placement="right">
            <Image userSelect={'unset'} src="/images/icons/code.svg" {...iconStyle} {...isSelect('')} onClick={() => {}}></Image>
          </Tooltip> */}
        </Flex>
      </Flex>
    </>
  );
};

export default ToolBar;
