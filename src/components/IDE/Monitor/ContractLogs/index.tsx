import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { Button, Flex } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { defaultButtonStyle } from '@/lib/theme';
import JSONTable from '@/components/JSONTable';
import { hooks } from '@/lib/hooks';
import { axios } from '@/lib/axios';
import { showNotification } from '@mantine/notifications';
import { eventBus } from '@/lib/event';
import { useEffect } from 'react';

const ContractLogs = observer(() => {
  const { w3s } = useStore();

  useEffect(() => {
    if (w3s.config.form.formData.accountRole === 'DEVELOPER') {
      w3s.contractLogs.table.set({
        dataSource: w3s.contractLogs.curProjectContractLogs
      });
    } else {
      w3s.contractLogs.table.set({
        dataSource: w3s.contractLogs.allContractLogs.value
      });
    }
  }, [w3s.contractLogs.allContractLogs.value]);

  return (
    <>
      <Flex alignItems="center">
        <Button
          h="32px"
          leftIcon={<AddIcon />}
          {...defaultButtonStyle}
          onClick={async (e) => {
            if (w3s.config.form.formData.accountRole === 'DEVELOPER') {
              w3s.contractLogs.form.value.set({
                projectName: w3s.project.curProject?.f_name
              });
              w3s.contractLogs.form.uiSchema.projectName = {
                'ui:disabled': true
              };
            }
            const formData = await hooks.getFormData({
              title: 'Add Smart Contract event monitor',
              size: 'md',
              formList: [
                {
                  form: w3s.contractLogs.form
                }
              ]
            });
            if (formData.projectName) {
              const res = await axios.request({
                method: 'post',
                url: `/api/w3bapp/monitor/contract_log/${formData.projectName}`,
                data: formData
              });
              if (res.data) {
                await showNotification({ message: 'Smart Contract event monitor successfully created.' });
                eventBus.emit('contractlog.create');
              }
            }
          }}
        >
          Add Smart Contract event monitor
        </Button>
      </Flex>
      <JSONTable jsonstate={w3s.contractLogs} />
    </>
  );
});

export default ContractLogs;
