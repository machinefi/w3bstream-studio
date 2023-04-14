import React, { useEffect, useState } from 'react';
import { WidgetProps } from '@rjsf/utils';
import { Text, Flex, Image, chakra, Box, Menu, MenuButton, Button, MenuList, MenuGroup, MenuItem, MenuDivider } from '@chakra-ui/react';
import { assemblyScriptExample, flowExample, simulationExample } from '@/constants/initWASMExamples';
import { helper } from '@/lib/helper';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { ChevronDownIcon } from '@chakra-ui/icons';

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
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            {store.curTemplate?.label || 'Select a template'}
          </MenuButton>
          <MenuList>
            <MenuGroup title="Assemblyscript">
              {assemblyScriptExample.children.map((item) => {
                return (
                  <MenuItem
                    w="90%"
                    ml={4}
                    key={item.label}
                    onClick={() => {
                      onChange(JSON.stringify(item));
                      store.curTemplate = item;
                      setTemplateName(item.label);
                    }}
                  >
                    {item.label}
                  </MenuItem>
                );
              })}
            </MenuGroup>
            <MenuDivider />
            <MenuGroup title="Flow">
              {flowExample.children.map((item) => {
                return (
                  <MenuItem
                    w="90%"
                    ml={4}
                    key={item.label}
                    onClick={() => {
                      onChange(JSON.stringify(item));
                      store.curTemplate = item;
                      setTemplateName(item.label);
                    }}
                  >
                    {item.label}
                  </MenuItem>
                );
              })}
            </MenuGroup>
            <MenuDivider />
            <MenuGroup title="Simulation">
              {simulationExample.children.map((item) => {
                return (
                  <MenuItem
                    w="90%"
                    ml={4}
                    key={item.label}
                    onClick={() => {
                      onChange(JSON.stringify(item));
                      store.curTemplate = item;
                      setTemplateName(item.label);
                    }}
                  >
                    {item.label}
                  </MenuItem>
                );
              })}
            </MenuGroup>
          </MenuList>
        </Menu>
        {/* {store.examples?.children?.map((template) => (
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
              {helper.string.firstUpperCase(template.label.split('.')[0])}
            </Box>
          </Flex>
        ))} */}
      </Flex>
    </>
  );
});

const InitWasmTemplateWidget = (props: InitWasmTemplateWidgetProps) => {
  return <InitWasmTemplate {...props} />;
};

export default InitWasmTemplateWidget;
