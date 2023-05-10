import React from 'react';
import { observer } from 'mobx-react-lite';
import { JSONSchemaFormState } from '@/store/standard/JSONSchemaState';
import Form from '@rjsf/chakra-ui';
import { Box, Flex, useDisclosure, Text, Collapse, Stack, Button } from '@chakra-ui/react';
import { BiChevronDown, BiChevronUp } from 'react-icons/bi';
import { ErrorListProps, FieldTemplateProps, getSubmitButtonOptions, ObjectFieldTemplateProps, SubmitButtonProps } from '@rjsf/utils';
import { defaultButtonStyle } from '@/lib/theme';
import PrefixWidget from '../JSONFormWidgets/PerfixWidget';
import EditorWidget from '../JSONFormWidgets/EditorWidget';
import RuntimeConsoleWidget from '../JSONFormWidgets/RuntimeConsoleWidget';
import FlowDatabaseWidget from '../JSONFormWidgets/FlowDatabaseWidget';

const renderLayout = (layout: any[], fields: { [k: string]: React.ReactElement }, n = 1) => {
  n++;
  return layout.map((item) => {
    if (Array.isArray(item)) {
      const even = (n & 1) === 0;
      return (
        <Flex
          direction={even ? 'row' : 'column'}
          justify="space-between"
          sx={{
            width: '100%',
            '& > div:not(:first-child)': {
              marginLeft: even ? '10px' : '0'
            }
          }}
        >
          {renderLayout(item, fields, n)}
        </Flex>
      );
    } else {
      return (
        <Box mb="10px" width="100%">
          {fields[item]}
        </Box>
      );
    }
  });
};

const ObjectFieldTemplate = ({ title, idSchema: { $id }, properties, uiSchema: { layout } }: ObjectFieldTemplateProps) => {
  const { isOpen, onToggle } = useDisclosure();
  const fields = Object.fromEntries(properties.map((item) => [item.name, item.content]));
  return (
    <Box w="100%">
      {$id === 'root' ? (
        layout ? (
          renderLayout(layout, fields)
        ) : (
          properties.map((element) => {
            return (
              <Box key={element.content.key} mb="10px">
                {element.content}
              </Box>
            );
          })
        )
      ) : (
        <>
          <Flex
            mt="20px"
            mb="10px"
            padding="5px 0"
            align="center"
            justify="space-between"
            cursor="pointer"
            borderTop="1px solid #E5E5EA"
            borderBottom="1px solid #E5E5EA"
            borderColor="gray.100"
            _hover={{ backgroundColor: 'gray.100' }}
            onClick={onToggle}
          >
            <Text fontSize="18px" fontWeight={700}>
              {title}
            </Text>
            {isOpen ? <BiChevronUp /> : <BiChevronDown />}
          </Flex>
          <Collapse in={isOpen} animateOpacity>
            {layout
              ? renderLayout(layout, fields)
              : properties.map((element) => {
                  return (
                    <Box key={element.content.key} mb="10px">
                      {element.content}
                    </Box>
                  );
                })}
          </Collapse>
        </>
      )}
    </Box>
  );
};

const FieldTemplate = (props: FieldTemplateProps) => {
  const handleVariableStyle = {
    width: '16px',
    height: '16px',
    borderRadius: '50px',
    backgroundColor: 'white',
    border: '4px solid #784be8',
    zIndex: 99
  };

  const { id, classNames, label, help, required, description, errors, children } = props;
  return (
    <Flex direction="column" className={classNames} position={'relative'}>
      {children}
      {help}
    </Flex>
  );
};

const ErrorListTemplate = ({ errors }: ErrorListProps) => {
  return (
    <Box mt="10px">
      <Text fontWeight={700}>Errors</Text>
      <Stack mt="10px">
        {errors.map((error) => (
          <Text color="red">{error.message}</Text>
        ))}
      </Stack>
    </Box>
  );
};

const SubmitButton = ({ uiSchema }: SubmitButtonProps) => {
  const { submitText, norender, props: submitButtonProps = {} } = getSubmitButtonOptions(uiSchema);
  if (norender) {
    return null;
  }
  return (
    <Button w="100%" type="submit" borderRadius="base" {...defaultButtonStyle}>
      {submitText}
    </Button>
  );
};

interface Props {
  formState: JSONSchemaFormState<any>;
  children?: any;
}

export const JSONForm = observer(({ children, formState }: Props) => {
  if (!formState.dynamicData.ready) return <></>;
  return (
    <Form
      showErrorList="bottom"
      templates={{
        FieldTemplate,
        ObjectFieldTemplate,
        ErrorListTemplate,
        ButtonTemplates: { SubmitButton }
      }}
      widgets={{ EditorWidget, PrefixWidget, RuntimeConsoleWidget ,FlowDatabaseWidget}}
      formData={formState.formData}
      readonly={formState.readonly}
      uiSchema={formState.uiSchema}
      schema={formState.schema}
      onChange={formState.onChange}
      onSubmit={formState.onSubmit}
      validator={formState.validator}
      customValidate={formState.customValidate}
    >
      {children && children}
    </Form>
  );
});
