import React, { useCallback, useState } from 'react';
import { WidgetProps } from '@rjsf/utils';
import MonacoEditor from '@monaco-editor/react';
import { Flex, Select, Text } from '@chakra-ui/react';

type Options = {
  emptyValue?: string;
  editorHeight?: string;
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
  const [language, setLanguage] = useState('json');
  const { editorHeight = '200px' } = options;
  return (
    <Flex flexDir="column">
      <Flex justifyContent="space-between" alignItems="center" mb="10px">
        <Flex alignItems="center">
          <Text>{label}</Text>
          {required && (
            <Text ml="0.25rem" color="#D34B46">
              *
            </Text>
          )}
        </Flex>
        <Select w="100px" size="sm" onChange={(v) => setLanguage(v.target.value)}>
          <option value="json">JSON</option>
          <option value="text">Text</option>
        </Select>
      </Flex>
      <MonacoEditor height={editorHeight} theme="vs-dark" language={language} value={value} onChange={handleChange} />
    </Flex>
  );
};

export default EditorWidget;
