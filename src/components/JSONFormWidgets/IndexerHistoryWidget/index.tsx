import React, { useState } from 'react';
import { WidgetProps } from '@rjsf/utils';
import { Select } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
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
              Indexer.indexderHistory.currentIndex = index;
              lab.simulationIndexerForm.value.set({
                ...Indexer.indexderHistory.current
              });
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
