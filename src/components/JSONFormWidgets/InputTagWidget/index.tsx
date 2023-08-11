import React, { useRef } from 'react';
import { WidgetProps } from '@rjsf/utils';
import { Copy } from '@/components/Common/Copy';
import { Box, Flex, Input, Tag, Text, Tooltip } from '@chakra-ui/react';

type Options = {
  tags: {
    label: string;
    value: string;
    tooltip?: string;
  }[];
};

export interface InputTagWidgetProps extends WidgetProps {
  options: Options;
}

const InputTagWidget = ({ id, label, required, value, readonly, onChange, options }: InputTagWidgetProps) => {
  const { tags } = options;
  const ref = useRef(null);
  return (
    <Flex direction="column" ref={ref}>
      <Flex align="center">
        <Input className={'form-control'} type="text" id={id} w="100%" value={value || ''}onChange={(event) => onChange(event.target.value)} />
      </Flex>
      <Flex mt={2}>
        {
          tags?.map((tag) => (
            <Tooltip portalProps={{ containerRef: ref }} label={tag.tooltip} >
              <Tag  size="lg" key={tag.value} mr={2} cursor="pointer" onClick={() => onChange(tag.value)}>
              {tag.label}
              </Tag>
            </Tooltip>
          ))
        }
      </Flex>
    </Flex>
  );
};

export default InputTagWidget;
