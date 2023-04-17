import React, { useEffect, useState } from 'react';
import { WidgetProps } from '@rjsf/utils';
import { Text, Flex, Image, chakra, Box, Menu, MenuButton, Button, MenuList, MenuGroup, MenuItem, MenuDivider } from '@chakra-ui/react';
import { assemblyScriptExample, flowExample, simulationExample } from '@/constants/initWASMExamples';
import { helper } from '@/lib/helper';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { v4 as uuidv4 } from 'uuid';
type Options = {};

export interface InitWasmTemplateWidgetProps extends WidgetProps {
  options: Options;
}

export interface InitWasmTemplateWidgetUIOptions {
  'ui:widget': (props: InitWasmTemplateWidgetProps) => JSX.Element;
  'ui:options': Options;
}

const InitWasmTemplate = observer(({ id, options, value, required, label, onChange }: InitWasmTemplateWidgetProps) => {
  const [templateName, setTemplateName] = useState('');
  const store = useLocalObservable<{ curTemplate: typeof assemblyScriptExample }>(() => ({
    curTemplate: null
  }));

  const templates = (v: typeof assemblyScriptExample, label: string) => {
    return (
      <>
        <Flex alignItems="center" mt={2}>
          <Text>{label}</Text>
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
          {v?.children?.map((template) => (
            <Flex
              key={template.key}
              flexDir="column"
              justifyContent="center"
              alignItems="center"
              w={100 / v?.children?.length + '%'}
              h="100px"
              border="2px solid #EDEDED"
              borderRadius="8px"
              cursor="pointer"
              style={{
                borderColor: templateName === template.label ? '#946FFF' : '#EDEDED'
              }}
              onClick={() => {
                onChange(JSON.stringify({ ...template, key: uuidv4() }));
                setTemplateName(template.label);
              }}
            >
              <Box mt="10px" fontWeight={700} fontSize="16px">
                {helper.string.firstUpperCase(template.label.split('.')[0])}
              </Box>
            </Flex>
          ))}
        </Flex>
      </>
    );
  };
  return (
    <>
      {templates(assemblyScriptExample, 'AssemblyScript')}
      {templates(flowExample, 'Flow')}
      {templates(simulationExample, 'Simulation')}
    </>
  );
});

const InitWasmTemplateWidget = (props: InitWasmTemplateWidgetProps) => {
  return <InitWasmTemplate {...props} />;
};

export default InitWasmTemplateWidget;
