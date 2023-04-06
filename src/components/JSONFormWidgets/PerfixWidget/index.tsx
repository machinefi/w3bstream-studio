import React from 'react';
import { WidgetProps } from '@rjsf/utils';
import { Flex, Input, Text } from '@mantine/core';
import { Copy } from '@/components/Common/Copy';

type Options = {
  prefix: string;
};

export interface PrefixWidgetProps extends WidgetProps {
  options: Options;
}

const PrefixWidget = ({
  id,
  label,
  required,
  value,
  readonly,
  onChange,
  options = { prefix: '' },
}: PrefixWidgetProps) => {
  const { prefix } = options;
  const displayValue = prefix ? `${prefix}${value || ''}` : value;

  return (
    <Flex direction="column">
      <Flex align="center">
        <Input
          className={'form-control'}
          type="text"
          id={id}
          w="100%"
          value={value || ''}
          readOnly={readonly}
          onChange={(event) => onChange(event.target.value)}
        />
      </Flex>
      <Flex mt={6}>
        <Text ml={2} mt={2}>
          {displayValue}
        </Text>
        <Copy value={displayValue}></Copy>
      </Flex>
    </Flex>
  );
};

export default PrefixWidget;
