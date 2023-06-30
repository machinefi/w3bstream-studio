import { rootStore } from '@/store/index';
import { Box, Center, Flex, Button, Text } from '@chakra-ui/react';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react-lite';

export const DataErrorFallback = observer(() => {
  const store = useLocalStore(() => ({
    isBackup: false
  }));

  return (
    <Flex px={4} direction={'column'} alignItems="center" width={'100%'} height={300} color="white">
      <Text size="sm" mt={4} opacity="0.5">
        An error has occurred, which may be caused by the data structure of your local file not matching the data structure of studio. You can fix this by backing up the current data and emptying the
        local data file.
      </Text>
      <Button
        mt={4}
        size="sm"
        color="red"
        onClick={(e) => {
          const dataStr = JSON.stringify(toJS(rootStore.w3s.projectManager.curFilesListSchema));
          const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
          const exportFileDefaultName = 'backup.json';
          const linkElement = document.createElement('a');
          linkElement.setAttribute('href', dataUri);
          linkElement.setAttribute('download', exportFileDefaultName);
          linkElement.click();
          store.isBackup = true;
        }}
      >
        Backup data
      </Button>

      <Button
        mt={4}
        size="sm"
        color="red"
        isDisabled={!store.isBackup}
        onClick={(e) => {
          rootStore.w3s.projectManager.unsafeClearFile();
          window.location.reload();
        }}
      >
        Clear data and fix
      </Button>
    </Flex>
  );
});
