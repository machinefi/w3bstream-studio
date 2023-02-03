import React, { useCallback, useState } from 'react';
import { WidgetProps } from '@rjsf/utils';
import MonacoEditor from '@monaco-editor/react';
import { Button, Flex, Select, Text } from '@chakra-ui/react';

type Options = {
  emptyValue?: string;
  editorHeight?: string;
  showLanguageSelector?: boolean;
  showSubmitButton?: boolean;
  readOnly?: boolean;
  onChangeLanguage?: (v: 'json' | 'text') => void;
  afterSubmit?: (v: string) => void;
};

export interface EditorWidgetProps extends WidgetProps {
  options: Options;
}

export type EditorWidgetUIOptions = {
  'ui:widget': (props: EditorWidgetProps) => JSX.Element;
  'ui:options': Options;
};

const EditorWidget = ({ id, label, options = {}, value, required, onChange }: EditorWidgetProps) => {
  const handleChange = useCallback((value) => onChange(value === '' ? (options.emptyValue ? options.emptyValue : '') : value), [onChange, options.emptyValue]);
  const [language, setLanguage] = useState('json');
  const { editorHeight = '200px', showLanguageSelector = false, showSubmitButton = false, onChangeLanguage, afterSubmit, readOnly = false } = options;
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
        {showLanguageSelector && (
          <Select
            w="100px"
            size="sm"
            onChange={(v) => {
              const language = v.target.value as 'json' | 'text';
              setLanguage(language);
              onChangeLanguage && onChangeLanguage(language);
            }}
          >
            <option value="json">JSON</option>
            <option value="text">Text</option>
          </Select>
        )}
      </Flex>
      {/* fix readonly issuse > https://github.com/suren-atoyan/monaco-react/issues/114  */}
      <MonacoEditor options={{ readOnly }} height={editorHeight} theme="vs-dark" language={language} value={readOnly ? (value ? value : '') : value} onChange={handleChange} />
      {
        showSubmitButton && <Flex mt={2} justifyContent="flex-end">
          <Button
            ml="10px"
            fontWeight={400}
            onClick={() => {
              afterSubmit && afterSubmit(value);
            }}
          >
            Save Changes
          </Button>
        </Flex>
      }
    </Flex>
  );
};

export default EditorWidget;
