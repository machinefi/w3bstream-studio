import { Box, Stack, Select } from '@chakra-ui/react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { FilesItemType } from '@/store/lib/w3bstream/schema/filesList';
import { useEffect } from 'react';
import { WidgetProps } from '@rjsf/utils';
import { Indexer } from '@/lib/indexer';
import { Monitor } from 'pages/api/init';
import { ContractInstance } from '@/store/lib/ContractInstance';
import { helper } from '@/lib/helper';
import { ethers } from 'ethers';
import { MutiSelect } from '@/components/Common/MutiSelect';

const getSqlListAndEnvList = (fileList: FilesItemType[], sqlList: FilesItemType[] = [], envList: FilesItemType[] = []) => {
  fileList.forEach((item) => {
    if (item.type === 'folder') {
      return getSqlListAndEnvList(item.children, sqlList, envList);
    }
    if (item.type === 'file') {
      if (item.data?.dataType === 'sql') {
        sqlList.push(item);
      }
      if (item.data?.dataType === 'env') {
        envList.push(item);
      }
    }
  });
  return {
    sqlList,
    envList
  };
};

const convertEnvFile = (envFileStr: string) => {
  const projectEnv = {
    env: []
  };
  if (envFileStr) {
    const envLines = envFileStr.split('\n');
    for (const line of envLines) {
      if (line.trim() === '') {
        continue;
      }
      projectEnv.env.push(line.split('='));
    }
  }
  return JSON.stringify(projectEnv);
};

const convertMonitorLog = (monitorLog: typeof Indexer.indexderHistory.current) => {
  let monitor: Partial<Monitor['contractLog']> = {};
  if (monitorLog) {
    monitor.blockStart = monitorLog.startBlock;
    monitor.blockEnd = monitorLog.startBlock + 100;
    monitor.contractAddress = monitorLog.contractAddress;
    monitor.eventType = 'DEFAULT';
    monitor.chainID = monitorLog.chainId;
    const { abi, address } = helper.string.validAbi(monitorLog.contract);
    const contractInstance = new ContractInstance({
      abi,
      name: '',
      address: monitorLog.contractAddress
    });
    let transferEventSignature; // = 'Transfer(address,address,uint256)';
    const func = contractInstance.abi.find((item) => item.name === monitorLog.contractEventName);
    transferEventSignature = `${func.name}(${func.inputs.map((i) => i.type).join(',')})`;
    monitor.topic0 = ethers.utils.id(transferEventSignature);
  }
  return monitor;
};

type Options = {
  separator?: string;
};

export interface SelectSqlFileAndEnvFileWidgetProps extends WidgetProps {
  options: Options;
}

export type SelectSqlFileAndEnvFileWidgetUIOptions = {
  'ui:widget': (props: SelectSqlFileAndEnvFileWidgetProps) => JSX.Element;
  'ui:options': Options;
};

export const SelectSqlFileAndEnvFile = observer(({ options, onChange }: SelectSqlFileAndEnvFileWidgetProps) => {
  const {
    w3s: {
      projectManager: { curFilesList }
    }
  } = useStore();
  const store = useLocalObservable(() => ({
    sqlList: [],
    envList: [],
    value: ['', '', ''],
    setData(
      v: Partial<{
        sqlList: FilesItemType[];
        envList: FilesItemType[];
        value: string[];
      }>
    ) {
      Object.assign(store, v);
    }
  }));
  const { separator = '<--->' } = options;

  useEffect(() => {
    const { sqlList, envList } = getSqlListAndEnvList(curFilesList);
    store.setData({
      sqlList,
      envList
    });
  }, []);

  useEffect(() => {
    onChange(store.value.join(separator));
    console.log(store.value, store.value.join(separator));
  }, [store.value]);

  return (
    <Stack>
      <Box>SQL Schema File</Box>
      <Select
        placeholder="Select a SQL schema file"
        onChange={(e) => {
          store.setData({
            value: [e.target.value, store.value[1], store.value[2]]
          });
        }}
      >
        {store.sqlList.map((item) => {
          return <option value={item.data?.code}>{item.label}</option>;
        })}
      </Select>
      <Box>ENV File</Box>
      <Select
        placeholder="Select an ENV file"
        onChange={(e) => {
          const envCode = convertEnvFile(e.target.value);
          store.setData({
            value: [store.value[0], envCode, store.value[2]]
          });
        }}
      >
        {store.envList.map((item) => {
          return <option value={item.data?.code}>{item.label}</option>;
        })}
      </Select>
      <Box>Smart Contract Monitor</Box>
      <MutiSelect
        onChange={(e: { value: number; label: string }[]) => {
          console.log(e);
          const monitorLogList = [];
          e.forEach((i) => {
            Indexer.indexderHistory.currentIndex = Number(i.value);
            const monitorLog = convertMonitorLog(Indexer.indexderHistory.current);
            monitorLogList.push(monitorLog);
          });
          store.setData({
            value: [store.value[0], store.value[1], JSON.stringify(monitorLogList)]
          });
        }}
        isMulti
        options={Indexer.indexderHistory.list.map((item, index) => {
          return { value: index, label: `${item.chainId}-${item.contractAddress}-${item.contractEventName}` };
        })}
        className="basic-multi-select"
        classNamePrefix="select"
      />
      {/* <Select
        placeholder="Select an Indexer"
        onChange={(e) => {
          const index = Number(e.target.value);
          Indexer.indexderHistory.currentIndex = index;
          const monitorLog = convertMonitorLog(Indexer.indexderHistory.current);
          store.setData({
            value: [store.value[0], store.value[1], monitorLog]
          });
        }}
      >
        {Indexer.indexderHistory.list.map((item, index) => {
          return (
            <option value={index}>
              {item.chainId}-{item.contractAddress}-{item.contractEventName}
            </option>
          );
        })}
      </Select> */}
    </Stack>
  );
});

export const SelectSqlFileAndEnvFileWidget = (props: SelectSqlFileAndEnvFileWidgetProps) => {
  return <SelectSqlFileAndEnvFile {...props} />;
};
