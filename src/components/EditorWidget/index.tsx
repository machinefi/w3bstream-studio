import React, { useCallback } from 'react';
import { WidgetProps } from '@rjsf/utils';
import MonacoEditor from '@monaco-editor/react';
import { Flex, Text } from '@chakra-ui/react';

type Options = {
  emptyValue?: string;
};

export interface EditorWidgetProps extends WidgetProps {
  options: Options;
}

export type EditorWidgetUIOptions = {
  'ui:widget': (props: EditorWidgetProps) => JSX.Element;
  'ui:options': Options;
};

const EditorWidget = ({ id, label, options = {}, value, required, onChange }: EditorWidgetProps) => {
  const handleChange = useCallback((value) => onChange(value === '' ? options.emptyValue : value), [onChange, options.emptyValue]);

  return (
    <Flex flexDir="column">
      <Flex alignItems="center" mb="10px">
        <Text>{label}</Text>
        {required && (
          <Text ml="0.25rem" color="#D34B46">
            *
          </Text>
        )}
      </Flex>
      <MonacoEditor height="200px" theme="vs-dark" defaultLanguage="json" value={value} onChange={handleChange} />
    </Flex>
  );
};

export default EditorWidget;
