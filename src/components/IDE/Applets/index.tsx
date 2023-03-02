import { Button, Flex } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { AddIcon } from '@chakra-ui/icons';
import { gradientButtonStyle } from '@/lib/theme';
import JSONTable from '@/components/JSONTable';
import { useEffect } from 'react';
import { hooks } from '@/lib/hooks';
import { dataURItoBlob } from '@rjsf/utils';
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
        {...gradientButtonStyle}
        onClick={async (e) => {
          if (w3s.showContent === 'CURRENT_APPLETS') {
            w3s.applet.form.value.set({
              projectID: w3s.curProject?.f_project_id.toString(),
              projectName: w3s.curProject?.f_name
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
        {...gradientButtonStyle}
        onClick={async (e) => {
          if (w3s.showContent === 'CURRENT_APPLETS') {
            w3s.publisher.publishEventForm.value.set({
              projectID: w3s.curProject?.f_project_id.toString(),
              projectName: w3s.curProject?.f_name
            });
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
          const { projectID } = formData;
          if (projectID) {
            const project = w3s.allProjects.value.find((item) => item.f_project_id.toString() === projectID);
            const res = await axios.request({
              method: 'post',
              url: `/api/w3bapp/event/${project.f_name}`,
              headers: {
                'Content-Type': 'text/plain'
              },
              data: w3s.publisher.generateBody()
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
      const applets = w3s.curProject?.applets || [];
      w3s.applet.table.set({
        dataSource: applets
      });
    } else {
      w3s.applet.table.set({
        dataSource: w3s.applet.allData
      });
    }
  }, [w3s.curProject, w3s.showContent]);

  return (
    <>
      <AddBtn />
      <JSONTable jsonstate={w3s.applet} />
    </>
  );
});

export default Applets;
