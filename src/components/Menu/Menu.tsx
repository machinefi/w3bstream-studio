import React, { useCallback, useMemo, useState } from 'react';
import { Box, BoxProps, useColorModeValue } from '@chakra-ui/react';
import { MenuContext, MenuContextType } from './Context';
import { useEffect } from 'react';

export interface MenuProps extends BoxProps {
  children: React.ReactNode;
  selectedKey?: string;
  bordered?: boolean;
  onSelectedChange?: (selectedKey: string, selectedItem?: Record<string, any>) => void;
}

export const Menu = (props: MenuProps) => {
  const bg =  useColorModeValue('white', 'gray.700')
  const { children, selectedKey, onSelectedChange, bordered = false, ...restProps } = props;
  const [innerSelectedKey, setInnerSelectedKey] = useState(selectedKey);
  const handleSelect = useCallback(
    (currentKey, currentItem) => {
      if (innerSelectedKey !== currentKey) {
        onSelectedChange?.(currentKey, currentItem);
        if (selectedKey === undefined) {
          setInnerSelectedKey(currentKey);
        }
      }
    },
    [innerSelectedKey, onSelectedChange]
  );
  const providerValue = useMemo<MenuContextType>(
    () => ({
      onSelect: handleSelect,
      selectedKey: innerSelectedKey,
      bordered
    }),
    [innerSelectedKey, handleSelect, bordered]
  );

  useEffect(() => {
    setInnerSelectedKey(selectedKey);
  }, [selectedKey]);

  return (
    <Box bg={bg} wordBreak="break-all" borderStyle={'solid'} borderColor="grey.200" borderWidth={bordered ? '1px' : 0} fontSize="0.9rem" {...restProps}>
      <MenuContext.Provider value={providerValue}>{children}</MenuContext.Provider>
    </Box>
  );
};

Menu.displayName = 'Menu';
