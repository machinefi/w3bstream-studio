import { Button, Flex } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { AddIcon } from '@chakra-ui/icons';
import { defaultButtonStyle } from '@/lib/theme';
import JSONTable from '@/components/JSONTable';
import { useEffect } from 'react';
import { hooks } from '@/lib/hooks';
import { axios } from '@/lib/axios';
import { showNotification } from '@mantine/notifications';
import { eventBus } from '@/lib/event';
import { ShowRequestTemplatesButton } from '../PublishEventRequestTemplates';

const AddBtn = observer(() => {
  const { w3s } = useStore();
  return (
    <Flex alignItems="center">
      <Button
        h="32px"
        leftIcon={<AddIcon />}
        {...defaultButtonStyle}
        onClick={async (e) => {
          if (w3s.showContent === 'CURRENT_APPLETS') {
            w3s.applet.form.value.set({
              projectName: w3s.project.curProject?.name
            });
          }
          w3s.applet.createApplet();
        }}
      >
        Add Applet
      </Button>
      <Button
        ml="20px"
        h="32px"
        {...defaultButtonStyle}
        onClick={async (e) => {
          if (w3s.showContent === 'CURRENT_APPLETS') {
            w3s.showContent = 'CURRENT_EVENT_LOGS';
            return;
          }
          const formData = await hooks.getFormData({
            title: 'Publish Event',
            size: '2xl',
            formList: [
              {
                form: w3s.publisher.publishEventForm
              }
            ],
            children: (
              <ShowRequestTemplatesButton
                props={{
                  mt: '10px',
                  w: '100%'
                }}
              />
            )
          });
          const { projectName } = formData;
          if (projectName) {
            const pub = w3s.publisher.allData.find((item) => item.f_publisher_id.toString() === formData.publisher);
            if (!pub) {
              showNotification({ message: 'publisher not found' });
              return;
            }
            const res = await axios.request({
              method: 'post',
              url: `/api/w3bapp/event/${projectName}`,
              headers: {
                Authorization: pub.f_token,
                'Content-Type': 'application/octet-stream'
              },
              params: {
                eventType: 'DEFAULT',
                timestamp: Date.now()
              },
              data: formData.body
            });
            if (res.data) {
              showNotification({ message: 'publish event succeeded' });
              eventBus.emit('applet.publish-event');
            }
          }
        }}
      >
        Send Event
      </Button>
    </Flex>
  );
});

const Applets = observer(() => {
  const { w3s } = useStore();

  useEffect(() => {
    if (w3s.showContent === 'CURRENT_APPLETS') {
      const applets = w3s.project.curProject?.applets || [];
      w3s.applet.table.set({
        dataSource: applets
      });
    } else {
      w3s.applet.table.set({
        dataSource: w3s.applet.allData
      });
    }
  }, [w3s.project.curProject, w3s.showContent]);

  return (
    <>
      <AddBtn />
      <JSONTable jsonstate={w3s.applet} />
    </>
  );
});

export default Applets;
