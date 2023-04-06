import React, { useState } from 'react';
import { WidgetProps } from '@rjsf/utils';
import { Text, Flex, Image, chakra, Box } from '@chakra-ui/react';
import { examples } from '@/constants/initWASMExamples';
import { helper } from '@/lib/helper';

type Options = {};

export interface InitWasmTemplateWidgetProps extends WidgetProps {
  options: Options;
}

export interface InitWasmTemplateWidgetUIOptions {
  'ui:widget': (props: InitWasmTemplateWidgetProps) => JSX.Element;
  'ui:options': Options;
}

function InitWasmTemplateWidget({ id, options, value, required, label, onChange }: InitWasmTemplateWidgetProps) {
  const [templateName, setTemplateName] = useState('');
  return (
    <>
      <Flex alignItems="center">
        <Text>{label}</Text>
        {required && (
          <chakra.span ml="0.25rem" color="#D34B46">
            *
          </chakra.span>
        )}
      </Flex>
      <Flex
        mt="10px"
        id={id}
        sx={{
          width: '100%',
          '& > div:not(:first-child)': {
            marginLeft: '10px'
          }
        }}
      >
        {examples?.children?.map((template) => (
          <Flex
            key={template.key}
            flexDir="column"
            justifyContent="center"
            alignItems="center"
            w="200px"
            h="200px"
            border="2px solid #EDEDED"
            borderRadius="8px"
            cursor="pointer"
            style={{
              borderColor: templateName === template.label ? '#946FFF' : '#EDEDED'
            }}
            onClick={() => {
              if (templateName === template.label) {
                onChange('');
                setTemplateName('');
              } else {
                onChange(template.data.code);
                setTemplateName(template.label);
              }
            }}
          >
            <Box mt="10px" fontWeight={700} fontSize="16px">
              {helper.string.firstUpperCase(template.label.replace('.ts', ''))}
            </Box>
          </Flex>
        ))}
      </Flex>
    </>
  );
}

export default InitWasmTemplateWidget;
