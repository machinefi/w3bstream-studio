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

const ChainHeight = observer(() => {
  const { w3s } = useStore();

  useEffect(() => {
    if (w3s.config.form.formData.accountRole === 'DEVELOPER') {
      w3s.chainHeight.table.set({
        dataSource: w3s.chainHeight.curProjectChainHeight
      });
    } else {
      w3s.chainHeight.table.set({
        dataSource: w3s.chainHeight.allChainHeight.value
      });
    }
  }, [w3s.chainHeight.allChainHeight.value]);

  return (
    <>
      {w3s.config.form.formData.accountRole === 'ADMIN' && (
        <Flex alignItems="center">
          <CreateChainHeightButton />
        </Flex>
      )}
      <JSONTable jsonstate={w3s.chainHeight} />
    </>
  );
});

export const CreateChainHeightButton = observer(() => {
  const { w3s } = useStore();
  return (
    <Button
      h="32px"
      leftIcon={<AddIcon />}
      {...defaultButtonStyle}
      onClick={async (e) => {
        if (w3s.config.form.formData.accountRole === 'DEVELOPER') {
          w3s.chainHeight.form.value.set({
            projectName: w3s.project.curProject?.name
          });
          w3s.chainHeight.form.uiSchema.projectName = {
            'ui:widget': 'hidden'
          };
        }
        const formData = await hooks.getFormData({
          title: ' Create blockchain height monitor',
          size: 'md',
          formList: [
            {
              form: w3s.chainHeight.form
            }
          ]
        });
        if (formData.projectName) {
          const res = await axios.request({
            method: 'post',
            url: `/api/w3bapp/monitor/x/${formData.projectName}/chain_height`,
            data: formData
          });
          if (res.data) {
            showNotification({ message: 'Blockchain height monitor sucessfully created.' });
            eventBus.emit('chainHeight.create');
          }
        }
      }}
    >
      Create
    </Button>
  );
});

export default ChainHeight;
