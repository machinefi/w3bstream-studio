import React, { useState } from 'react';
import { WidgetProps } from '@rjsf/utils';
import { Select } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';

type Options = {};

export interface labSimulateHistoryWidgetWidgetProps extends WidgetProps {
  options: Options;
}

export interface labSimulateHistoryWidgetWidgetUIOptions {
  'ui:widget': (props: labSimulateHistoryWidgetWidgetProps) => JSX.Element;
  'ui:options': Options;
}

const LabSimulateHistory = observer(({ id, options, value, required, label, onChange }: labSimulateHistoryWidgetWidgetProps) => {
  const {
    w3s: {
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
