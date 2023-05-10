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

export interface labSimulateHistoryWidgetWidgetProps extends WidgetProps {
  options: Options;
}

export interface labSimulateHistoryWidgetWidgetUIOptions {
  'ui:widget': (props: labSimulateHistoryWidgetWidgetProps) => JSX.Element;
  'ui:options': Options;
}

const LabSimulateHistory = observer(({ id, options, value, required, label, onChange }: labSimulateHistoryWidgetWidgetProps) => {
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
              lab.simulationEventHistory.currentIndex = index;
              lab.simulationEventForm.value.set({
                ...lab.simulationEventHistory.current,
                wasmPayload: JSON.stringify(lab.simulationEventHistory.current?.wasmPayload, null, 2)
              });
            }}
          >
            {lab.simulationEventHistory.list.map((item, index) => (
              <option value={index}>{JSON.stringify(item?.wasmPayload)}</option>
            ))}
          </Select>
        }
      </>
    </>
  );
});

const labSimulateHistoryWidget = (props: labSimulateHistoryWidgetWidgetProps) => {
  return <LabSimulateHistory {...props} />;
};

export default labSimulateHistoryWidget;
