import React, { useCallback, useState } from 'react';
import { WidgetProps } from '@rjsf/utils';
import { Text, Flex, Image, chakra, Box } from '@chakra-ui/react';
import initTemplates from '@/constants/initTemplates.json';

type Options = {};

export interface InitializationTemplateWidgetProps extends WidgetProps {
  options: Options;
}

export interface InitializationTemplateWidgetUIOptions {
  'ui:widget': (props: InitializationTemplateWidgetProps) => JSX.Element;
  'ui:options': Options;
}

function InitializationTemplateWidget({ id, options, value, required, label, onChange }: InitializationTemplateWidgetProps) {
  const [templateName, setTemplateName] = useState('');
  const handleClick = useCallback(
    (name) => {
      onChange(name);
      setTemplateName(name);
    },
    [onChange]
  );

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
        {initTemplates.templates.map((template) => (
          <Flex
            key={template.name}
            flexDir="column"
            justifyContent="center"
            alignItems="center"
            w="200px"
            h="200px"
            border="2px solid #EDEDED"
            cursor="pointer"
            style={{
              borderColor: templateName === template.name ? '#946FFF' : '#EDEDED'
            }}
            onClick={() => {
              handleClick(template.name);
            }}
          >
            <Image w="40px" src={template.image} />
            <Box mt="10px" fontWeight={700} fontSize="16px">
              {template.name}
            </Box>
          </Flex>
        ))}
      </Flex>
    </>
  );
}

export default InitializationTemplateWidget;
