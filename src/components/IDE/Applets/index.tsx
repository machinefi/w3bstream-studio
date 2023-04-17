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
              projectName: w3s.project.curProject?.f_name
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
            ]
          });
          const { projectName  } = formData;
          if (projectName) {
            const res = await axios.request({
              method: 'post',
              url: `${process.env.NEXT_PUBLIC_EVENT_URL}/srv-applet-mgr/v0/event/${projectName}`,
              data: w3s.publisher.parseBody(formData.body)
            });
            if (res.data) {
              await showNotification({ message: 'publish event succeeded' });
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
