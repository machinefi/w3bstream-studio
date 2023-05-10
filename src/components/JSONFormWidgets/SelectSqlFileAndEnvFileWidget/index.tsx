import { Box, Stack, Select } from '@chakra-ui/react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { FilesItemType } from '@/store/lib/w3bstream/schema/filesList';
import { useEffect } from 'react';
import { WidgetProps } from '@rjsf/utils';

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
    value: ['', ''],
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
  }, [store.value]);

  return (
    <Stack>
      <Box>SQL Schema File</Box>
      <Select
        placeholder="Select a SQL schema file"
        onChange={(e) => {
          store.setData({
            value: [e.target.value, store.value[1]]
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
            value: [store.value[0], envCode]
          });
        }}
      >
        {store.envList.map((item) => {
          return <option value={item.data?.code}>{item.label}</option>;
        })}
      </Select>
    </Stack>
  );
});

export const SelectSqlFileAndEnvFileWidget = (props: SelectSqlFileAndEnvFileWidgetProps) => {
  return <SelectSqlFileAndEnvFile {...props} />;
};
