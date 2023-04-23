import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { Button, Flex } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { defaultButtonStyle } from '@/lib/theme';
import JSONTable from '@/components/JSONTable';
import { useEffect } from 'react';
import { hooks } from '@/lib/hooks';
import { axios } from '@/lib/axios';
import { showNotification } from '@mantine/notifications';
import { eventBus } from '@/lib/event';

const Publishers = observer(() => {
  const { w3s } = useStore();

  useEffect(() => {
    if (w3s.showContent === 'CURRENT_PUBLISHERS') {
      const publishers = w3s.project.curProject?.publishers || [];
      w3s.publisher.table.set({
        dataSource: publishers
      });
    } else {
      w3s.publisher.table.set({
        dataSource: w3s.publisher.allData
      });
    }
  }, [w3s.project.curProject, w3s.showContent]);

  return (
    <>
      <Flex alignItems="center">
        <Button
          h="32px"
          leftIcon={<AddIcon />}
          {...defaultButtonStyle}
          onClick={async (e) => {
            if (w3s.showContent === 'CURRENT_PUBLISHERS') {
              w3s.publisher.createPublisherForm.value.set({
                projectName: w3s.project.curProject?.f_name
              });
              w3s.publisher.createPublisherForm.uiSchema.projectName = {
                // 'ui:disabled': true,
                'ui:widget': 'hidden'
              };
            }
            const formData = await hooks.getFormData({
              title: 'Create Device',
              size: 'md',
              formList: [
                {
                  form: w3s.publisher.createPublisherForm
                }
              ]
            });
            const { projectName, key } = formData;
            if (projectName && key) {
              try {
                await axios.request({
                  method: 'post',
                  url: `/api/w3bapp/publisher/x/${projectName}`,
                  data: {
                    key,
                    name: key
                  }
                });
                await showNotification({ message: 'create publisher succeeded' });
                eventBus.emit('publisher.create');
              } catch (error) {}
            }
          }}
        >
          Add Device
        </Button>
      </Flex>
      <JSONTable jsonstate={w3s.publisher} />
    </>
  );
});

export default Publishers;
