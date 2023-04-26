import React, { useEffect, useState } from 'react';
import { WidgetProps } from '@rjsf/utils';
import {
  Text,
  Flex,
} from '@chakra-ui/react';
import { assemblyScriptExample, envExample, flowExample, simulationExample, SqlExample } from '@/constants/initWASMExamples';
import { helper } from '@/lib/helper';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { v4 as uuidv4 } from 'uuid';
import { FileIcon } from '@/components/Tree';
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
              ml={2}
              key={template.key}
              style={{
                borderColor: templateName === template.label ? '#946FFF' : '#EDEDED'
              }}
              borderWidth="1px"
              px={2}
              pb={2}
              borderRadius="8px"
              cursor="pointer"
              onClick={(e) => {
                e.stopPropagation();
                onChange(JSON.stringify({ ...template, key: uuidv4() }));
                setTemplateName(template.label);
              }}
            >
              <Flex mt="10px" fontWeight={700} fontSize="16px">
                {FileIcon(template)}
                {template.label}
              </Flex>
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
      {templates(SqlExample, 'Database')}
      {templates(envExample, 'ENV')}
    </>
  );
});

const InitWasmTemplateWidget = (props: InitWasmTemplateWidgetProps) => {
  return <InitWasmTemplate {...props} />;
};

export default InitWasmTemplateWidget;
