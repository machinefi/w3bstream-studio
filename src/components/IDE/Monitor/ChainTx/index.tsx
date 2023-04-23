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

const ChainTx = observer(() => {
  const { w3s } = useStore();

  useEffect(() => {
    if (w3s.config.form.formData.accountRole === 'DEVELOPER') {
      w3s.chainTx.table.set({
        dataSource: w3s.chainTx.curProjectChainTx
      });
    } else {
      w3s.chainTx.table.set({
        dataSource: w3s.chainTx.allChainTx.value
      });
    }
  }, [w3s.chainTx.allChainTx.value]);

  return (
    <>
      <Flex alignItems="center">
        <Button
          h="32px"
          leftIcon={<AddIcon />}
          {...defaultButtonStyle}
          onClick={async (e) => {
            if (w3s.config.form.formData.accountRole === 'DEVELOPER') {
              w3s.chainTx.form.value.set({
                projectName: w3s.project.curProject?.f_name
              });
              w3s.chainTx.form.uiSchema.projectName = {
                'ui:widget': 'hidden'
              };
            }
            const formData = await hooks.getFormData({
              title: 'Add blockchain transaction monitor',
              size: 'md',
              formList: [
                {
                  form: w3s.chainTx.form
                }
              ]
            });
            if (formData.projectName) {
              const res = await axios.request({
                method: 'post',
                url: `/api/w3bapp/monitor/x/${formData.projectName}/chain_tx`,
                data: formData
              });
              if (res.data) {
                await showNotification({ message: 'Blockchain transaction monitor successfully created' });
                eventBus.emit('chainTx.create');
              }
            }
          }}
        >
          Create
        </Button>
      </Flex>
      <JSONTable jsonstate={w3s.chainTx} />
    </>
  );
});

export default ChainTx;
