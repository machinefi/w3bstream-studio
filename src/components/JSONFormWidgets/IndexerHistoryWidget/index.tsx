import React, { useEffect, useState } from 'react';
import { WidgetProps } from '@rjsf/utils';
import { Box, Flex, Input, Tabs, TabList, TabPanels, Tab, TabPanel, Select } from '@chakra-ui/react';
import { assemblyScriptExample, envExample, flowExample, simulationExample, SqlExample } from '@/constants/initWASMExamples';
import { helper } from '@/lib/helper';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { v4 as uuidv4 } from 'uuid';
import { FileIcon } from '@/components/Tree';
import { Schema, TableJSONSchema } from '@/server/wasmvm/sqldb';
import { useStore } from '@/store/index';
import { JSONSchemaTableState } from '@/store/standard/JSONSchemaState';
import { toJS } from 'mobx';
import JSONTable from '@/components/JSONTable';
import { eventBus } from '@/lib/event';
import { Indexer } from '@/lib/indexer';
type Options = {};

export interface IndexerHistoryWidgetWidgetProps extends WidgetProps {
  options: Options;
}

export interface IndexerHistoryWidgetWidgetUIOptions {
  'ui:widget': (props: IndexerHistoryWidgetWidgetProps) => JSX.Element;
  'ui:options': Options;
}

const IndexerHistory = observer(({ id, options, value, required, label, onChange }: IndexerHistoryWidgetWidgetProps) => {
  const [templateName, setTemplateName] = useState('');
  const {
    god: { sqlDB },
    w3s,
    w3s: {
      projectManager: { curFilesListSchema },
      lab
    }
  } = useStore();

  return (
    <>
      <>
        {
          <Select
            mt="10px"
            placeholder="Select a history"
            onChange={(e) => {
              const index = Number(e.target.value);
              Indexer.indexderHistory.currentIndex = index;
              lab.simulationIndexerForm.value.set({
                ...Indexer.indexderHistory.current
              });
              console.log(lab.simulationIndexerForm);
            }}
          >
            {Indexer.indexderHistory.list.map((item, index) => (
              <option value={index}>
                {item.chainId}-{item.contractAddress}-{item.contractEventName}
              </option>
            ))}
          </Select>
        }
      </>
    </>
  );
});

const IndexerHistoryWidget = (props: IndexerHistoryWidgetWidgetProps) => {
  return <IndexerHistory {...props} />;
};

export default IndexerHistoryWidget;
