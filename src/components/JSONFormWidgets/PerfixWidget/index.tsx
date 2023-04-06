import React from 'react';
import { WidgetProps } from '@rjsf/utils';
import { Copy } from '@/components/Common/Copy';
import { Flex, Input, Text } from '@chakra-ui/react';

type Options = {
  prefix: string;
};

export interface PrefixWidgetProps extends WidgetProps {
  options: Options;
}

const PrefixWidget = ({ id, label, required, value, readonly, onChange, options = { prefix: '' } }: PrefixWidgetProps) => {
  const { prefix } = options;
  const displayValue = prefix ? `${prefix}${value || ''}` : value;

  return (
    <Flex direction="column">
      <Flex align="center">
        <Input className={'form-control'} type="text" id={id} w="100%" value={value || ''} readOnly={readonly} onChange={(event) => onChange(event.target.value)} />
      </Flex>
      <Flex mt={2}>
        <Text  mt={2} w='-webkit-fill-available'>
          {displayValue}
        </Text>
        <Copy value={displayValue}></Copy>
      </Flex>
    </Flex>
  );
};

export default PrefixWidget;
