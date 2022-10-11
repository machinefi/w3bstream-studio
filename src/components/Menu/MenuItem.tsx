import React from 'react';
import { Box, Flex, FlexProps, Icon, As, useColorModeValue } from '@chakra-ui/react';
import { useCallback, useContext, useMemo } from 'react';
import { MenuContext } from './Context'


export interface MenuItemProps extends FlexProps {
  children?: React.ReactNode;
  icon?: As;
  currentKey?: string;
  item?: Record<string, any>;
  onItemSelect?: (selectKey: string, selectedItem?: Record<string, any>, e?: MouseEvent) => void;
  onIconClick?: () => void
}

export const MenuItem = ({ children, icon, onItemSelect, currentKey, onIconClick, item, ...restPorps }: MenuItemProps) => {
  const context = useContext(MenuContext)
  const hoverBg = useColorModeValue('blue.50', 'whiteAlpha.200')
  const hoverColor = useColorModeValue('blue.400', '')
  
  const { selectedKey, onSelect } = context
  const isSelected = selectedKey && currentKey && selectedKey === currentKey
  const handleClick = useCallback((e) => {
    onItemSelect?.(currentKey, item, e)
    onSelect(currentKey, item)
  }, [onItemSelect, onSelect])

  return (
    <Flex w="100%" bg={isSelected ? hoverBg : 'transparent'} _hover={{bg: hoverBg, color: hoverColor}} overflow="hidden" pt="4px" pb="4px" pl="0.5rem" pr="0.5rem" color={isSelected ? 'blue.400' : ''} cursor="pointer" {...restPorps} onClick={handleClick}>
      {icon &&  <Icon
            mr="2"
            boxSize="4"
            as={icon}
            onClick={() => onIconClick?.()}
          />}
       <Box flex="auto">{children}</Box>
    </Flex>
  );
};

MenuItem.displayName = 'MenuItem';
