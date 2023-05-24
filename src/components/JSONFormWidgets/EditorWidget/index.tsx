import React, { useCallback, useContext, useEffect, useState } from 'react';
import { WidgetProps } from '@rjsf/utils';
import MonacoEditor from '@monaco-editor/react';
import { Button, Flex, Select, Box, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { useStore } from '@/store/index';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useLocalObservable } from 'mobx-react-lite';
import { NodeContext } from '@/components/FlowNode';
import { StorageState } from '@/store/standard/StorageState';

type Options = {
  emptyValue?: string;
  editorHeight?: string;
  editorTheme?: string;
  showLanguageSelector?: boolean;
  showCodeSelector?: { label: string; value: string; id: string }[];
  showSubmitButton?: boolean;
  readOnly?: boolean;
  onChangeLanguage?: (v: 'json' | 'text') => void;
  afterSubmit?: (v: string) => void;
  lang?: string;
};

export interface EditorWidgetProps extends WidgetProps {
  options: Options;
}

export type EditorWidgetUIOptions = {
  'ui:widget': (props: EditorWidgetProps) => JSX.Element;
  'ui:options': Options;
};

const EditorWidget = ({ id, label, options = {}, value, required, onChange }: EditorWidgetProps) => {
  const curFlowId = useContext(NodeContext);
  const {
    w3s: {
      projectManager: { curFilesListSchema }
    }
  } = useStore();

  const [language, setLanguage] = useState('json');
  const { editorHeight = '200px', editorTheme = 'vs-dark', showLanguageSelector = false, showCodeSelector = [], showSubmitButton = false, onChangeLanguage, afterSubmit, readOnly = false, lang = 'json' } = options;
  const store = useLocalObservable(() => ({
    curCodeLabel: new StorageState<string>({ key: curFlowId + 'curCodeLabel' ?? 'EditorWidget' }),
    curCodeId: new StorageState<string>({ key: curFlowId + 'curCodeId' ?? 'EditorWidget' }),
    get curEditorFile() {
      return curFilesListSchema.findFile(curFilesListSchema.files, store.curCodeId.value);
    }
  }));

  useEffect(() => {
    if (store.curCodeLabel.value) {
      if (!store.curEditorFile) {
        store.curCodeLabel.clear();
        store.curCodeId.clear();
        return;
      }
    }
  }, [store.curCodeLabel.value]);

  const handleChange = useCallback(
    (value) => {
      onChange(value === '' ? (options.emptyValue ? options.emptyValue : '') : value);
      if (store.curCodeId.value) {
        if (!store.curEditorFile) return;
        store.curEditorFile.data.code = value;
        curFilesListSchema.syncToIndexDb();
      }
    },
    [onChange, options.emptyValue]
  );
  return (
    <Box pos="relative">
      <Flex pos="absolute" right={0} top="-32px" zIndex={99} justifyContent="space-between" alignItems="center">
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
        {showCodeSelector.length != 0 && (
          <>
            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />} h="30px" fontSize="12px">
                {store.curCodeLabel?.value ?? 'Select Code '}
              </MenuButton>
              <MenuList p="8px">
                {showCodeSelector?.map((item) => {
                  return (
                    <MenuItem
                      key={item.id}
                      h="20px"
                      fontSize="12px"
                      onClick={(e) => {
                        store.curCodeLabel.save(item.label);
                        store.curCodeId.save(item.id);
                        handleChange(item.value);
                      }}
                    >
                      {item.label}
                    </MenuItem>
                  );
                })}
              </MenuList>
            </Menu>
          </>
        )}
      </Flex>
      {/* fix readonly issuse > https://github.com/suren-atoyan/monaco-react/issues/114  */}
      <Box border="1px solid #ddd">
        <MonacoEditor
          options={{
            readOnly,
            minimap: {
              enabled: false
            }
          }}
          height={editorHeight}
          theme={editorTheme}
          language={showLanguageSelector ? language : lang}
          value={readOnly ? (value ? value : '') : store.curCodeId.value ? store.curEditorFile?.data?.code ?? value : value}
          onChange={handleChange}
        />
      </Box>
      {showSubmitButton && (
        <Flex mt={2} justifyContent="flex-end">
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
      )}
    </Box>
  );
};

export default EditorWidget;
