import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { Button, Flex } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { defaultButtonStyle } from '@/lib/theme';
import JSONTable from '@/components/JSONTable';
import { hooks } from '@/lib/hooks';
import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const ContractLogs = observer(() => {
  const { w3s } = useStore();

  useEffect(() => {
    w3s.contractLogs.table.set({
      dataSource: w3s.contractLogs.curProjectContractLogs
    });
  }, [w3s.contractLogs.curProjectContractLogs]);

  return <JSONTable jsonstate={w3s.contractLogs} />;
});

export const CreateContractLogButton = observer(() => {
  const { w3s } = useStore();
  const projectName = w3s.project.curProject?.name;
  const ids = w3s.project.curProject.contractLogs.map((item) => String(item.f_contractlog_id));
  return (
    <Flex>
      <Button
        mr={2}
        h="32px"
        size="sm"
        {...defaultButtonStyle}
        onClick={async () => {
          eventBus.emit('contractlog.create');
        }}
      >
        Refresh
      </Button>
      <Button
        mr={2}
        h="32px"
        size="sm"
        {...defaultButtonStyle}
        onClick={async () => {
          await axios.request({
            method: 'put',
            url: `/api/w3bapp/monitor/x/${projectName}/contract_log/START`,
            data: { ids }
          });
          eventBus.emit('contractlog.delete');
          toast.success('start successfully');
        }}
      >
        Start all
      </Button>
      <Button
        mr={2}
        h="32px"
        size="sm"
        {...defaultButtonStyle}
        onClick={async () => {
          await axios.request({
            method: 'put',
            url: `/api/w3bapp/monitor/x/${projectName}/contract_log/PAUSE`,
            data: { ids }
          });
          eventBus.emit('contractlog.delete');
          toast.success('pause successfully');
        }}
      >
        Pause all
      </Button>
      <Button
        h="32px"
        size="sm"
        leftIcon={<AddIcon />}
        {...defaultButtonStyle}
        onClick={async (e) => {
          w3s.contractLogs.form.value.set({
            projectName: w3s.project.curProject?.name
          });
          w3s.contractLogs.form.uiSchema.projectName = {
            'ui:widget': 'hidden'
          };
          const formData = await hooks.getFormData({
            title: 'Add Smart Contract event monitor',
            size: 'xl',
            formList: [
              {
                form: w3s.contractLogs.form
              }
            ]
          });
          if (formData.projectName) {
            formData.chainID = Number(formData.chainID);
            const res = await axios.request({
              method: 'post',
              url: `/api/w3bapp/monitor/x/${formData.projectName}/contract_log`,
              data: formData
            });
            if (res.data) {
              toast.success('Smart Contract event monitor successfully created.');
              eventBus.emit('contractlog.create');
            }
          }
        }}
      >
        Create
      </Button>
    </Flex>
  );
});

export default ContractLogs;
