import React from 'react';
import { Flex, BoxProps, useColorModeValue, Image, Tooltip } from '@chakra-ui/react';
import { useStore } from '@/store/index';

interface ToolBar extends BoxProps {}

const ToolBar = (props: ToolBar) => {
  const bg = useColorModeValue('white', 'dark');
  const { ide } = useStore();
  const toogleTab = (index) => {
    ide.tabIndex = index;
  };
  const iconStyle = {
    p: '0.5',
    h: '8',
    w: '8',
    mb: '2',
    cursor: 'pointer',
    _hover: { background: 'gray.200', borderRadius: '4px' }
  };
  const isSelect = (index) => {
    if (ide.tabIndex == index) {
      return { background: 'gray.200' };
    }
  };
  return (
    <>
      <Flex h="100%" direction="column" justify="space-between" align="center" {...props} bg={bg} style={{ padding: '16px 0' }}>
        <Flex direction="column">
          <Tooltip label="Project" placement="right">
            <Image onClick={() => toogleTab(0)} src="/images/icons/home.svg" {...iconStyle} {...isSelect(0)}></Image>
          </Tooltip>
          {/* <Tooltip label="Document(Comming Soon)" placement="right">
            <Image src="/images/icons/documents.svg" {...iconStyle} {...isSelect(1)}></Image>
          </Tooltip>
          <Tooltip label="Script" placement="right">
            <Image userSelect={'unset'} onClick={() => toogleTab(2)} src="/images/icons/code.svg" {...iconStyle} {...isSelect(2)}></Image>
          </Tooltip> */}
        </Flex>
      </Flex>
    </>
  );
};

export default ToolBar;
