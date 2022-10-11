import React from 'react';
import { VStack, StackProps, Box, Collapse } from '@chakra-ui/react';

export interface MenuListProps extends StackProps {
  name?: string;
  children: React.ReactNode;
}

export const MenuList = ({ children, name, ...restProps }: MenuListProps) => {
  return (
    <Box>
      <Box>{name}</Box>
      <Collapse>
        <VStack {...restProps}>{children}</VStack>
      </Collapse>
    </Box>
  );
};
MenuList.displayName = 'MenuList';
