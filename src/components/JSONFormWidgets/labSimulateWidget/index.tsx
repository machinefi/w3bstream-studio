import React, { useState } from 'react';
import { WidgetProps } from '@rjsf/utils';
import { Select } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { faker } from '@/components/IDE/Labs';

type Options = {};

export interface labSimulateWidgetWidgetProps extends WidgetProps {
  options: Options;
}

export interface labSimulateWidgetWidgetUIOptions {
  'ui:widget': (props: labSimulateWidgetWidgetProps) => JSX.Element;
  'ui:options': Options;
}

const LabSimulateHistory = observer(({ id, options, value, required, label, onChange }: labSimulateWidgetWidgetProps) => {
  const {
    w3s: { lab }
  } = useStore();

  return (
    <>
      <>
        {
          <Select
            mt="10px"
            placeholder="Select a history"
            onChange={async (e) => {
              const index = Number(e.target.value);
              const code = lab.simulations[index].code;
              const res = new Function('faker', code)((await faker()).faker);
              lab.simulationEventForm.value.set({
                wasmPayload: JSON.stringify(res, null, 2)
              });
            }}
          >
            {lab.simulations.map((item, index) => (
              <option value={index}>{item.label}</option>
            ))}
          </Select>
        }
      </>
    </>
  );
});

const labSimulateWidget = (props: labSimulateWidgetWidgetProps) => {
  return <LabSimulateHistory {...props} />;
};

export default labSimulateWidget;
