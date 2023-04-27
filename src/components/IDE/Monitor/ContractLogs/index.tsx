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
      {w3s.config.form.formData.accountRole === 'ADMIN' && (
        <Flex alignItems="center">
          <CreateContractLogButton />
        </Flex>
      )}
      <JSONTable jsonstate={w3s.contractLogs} />
    </>
  );
});

export const CreateContractLogButton = observer(() => {
  const { w3s } = useStore();
  return (
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
            'ui:widget': 'hidden'
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
            data: {...formData, chainID: Number(formData.chainID)}
          });
          if (res.data) {
            showNotification({ message: 'Smart Contract event monitor successfully created.' });
            eventBus.emit('contractlog.create');
          }
        }
      }}
    >
      Create
    </Button>
  );
});

export default ContractLogs;
