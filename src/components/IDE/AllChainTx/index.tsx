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

const AllChainTx = observer(() => {
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
              title: 'Add blockchain transaction monitor',
              size: 'md',
              formList: [
                {
                  form: w3s.chainTx.form
                }
              ]
            });
            if (formData.projectID) {
              const res = await axios.request({
                method: 'post',
                url: `/api/w3bapp/monitor/chain_tx/${formData.projectID}`,
                data: formData
              });
              if (res.data) {
                await showNotification({ message: 'Blockchain transaction monitor successfully created' });
                eventBus.emit('chainTx.create');
              }
            }
          }}
        >
          Add blockchain transaction monitor
        </Button>
      </Flex>
      <JSONTable jsonstate={w3s.chainTx} />
    </>
  );
});

export default AllChainTx;
