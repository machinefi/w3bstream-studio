import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { Button, Flex } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { gradientButtonStyle } from '@/lib/theme';
import JSONTable from '@/components/JSONTable';
import { hooks } from '@/lib/hooks';
import { axios } from '@/lib/axios';
import { showNotification } from '@mantine/notifications';
import { eventBus } from '@/lib/event';

const AllChainHeight = observer(() => {
  const { w3s } = useStore();

  return (
    <>
      <Flex alignItems="center">
        <Button
          h="32px"
          leftIcon={<AddIcon />}
          {...gradientButtonStyle}
          onClick={async (e) => {
            const formData = await hooks.getFormData({
              title: ' Create blockchain height monitor',
              size: 'md',
              formList: [
                {
                  form: w3s.chainHeight.form
                }
              ]
            });
            if (formData.projectID) {
              const res = await axios.request({
                method: 'post',
                url: `/api/w3bapp/monitor/chain_height/${formData.projectID}`,
                data: formData
              });
              if (res.data) {
                await showNotification({ message: 'Blockchain height monitor sucessfully created.' });
                eventBus.emit('chainHeight.create');
              }
            }
          }}
        >
          Create blockchain height monitor
        </Button>
      </Flex>
      <JSONTable jsonstate={w3s.chainHeight} />
    </>
  );
});

export default AllChainHeight;
