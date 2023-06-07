import React, { useState } from 'react';
import { WidgetProps } from '@rjsf/utils';
import {
  Text,
  Flex,
  useDisclosure,
  Collapse
} from '@chakra-ui/react';
import { abiExample, assemblyScriptExample, demoExample, envExample, flowExample, simulationExample, SqlExample } from '@/constants/initWASMExamples';
import { observer } from 'mobx-react-lite';
import { v4 as uuidv4 } from 'uuid';
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { FileIcon } from '@/components/Tree/fileIcon';

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
  const { isOpen, onToggle } = useDisclosure();

  const templates = (v: typeof assemblyScriptExample, label: string, isExperimental = false) => {
    return (
      <>
        <Flex alignItems="center" mt={2}>
          <Text>{label}</Text>
          <Text ml="5px" fontSize="12px" color="#999">
            {isExperimental ? '[Experimental]' : ''}
          </Text>
        </Flex>
        <Flex
          mt="5px"
          id={id}
          flexWrap="wrap"
          sx={{
            width: '100%',
            '& > div:not(:first-of-type)': {
              marginLeft: '10px'
            }
          }}
        >
          {v?.children?.map((template) => (
            <Flex
              ml={2}
              mt={1}
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
              <Flex mt="10px" fontWeight={700} fontSize="14px">
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
      {templates(demoExample, 'Test', true)}
      <Flex mt="20px" pb="10px" alignItems="center" cursor="pointer" borderBottom="1px solid #eee" onClick={onToggle}>
        {isOpen ? <ChevronDownIcon w={6} h={6} /> : <ChevronRightIcon w={6} h={6} />}
        <Text ml="5px">Other templates</Text>
      </Flex>
      <Collapse in={isOpen} animateOpacity>
        {templates(flowExample, 'Flow', true)}
        {templates(simulationExample, 'Simulation', true)}
        {templates(SqlExample, 'Database')}
        {templates(envExample, 'ENV')}
        {templates(abiExample, 'ABI')}
      </Collapse>
    </>
  );
});

const InitWasmTemplateWidget = (props: InitWasmTemplateWidgetProps) => {
  return <InitWasmTemplate {...props} />;
};

export default InitWasmTemplateWidget;
