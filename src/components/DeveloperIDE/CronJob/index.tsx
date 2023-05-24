import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { Button } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { defaultButtonStyle } from '@/lib/theme';
import JSONTable from '@/components/JSONTable';
import { hooks } from '@/lib/hooks';
import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';
import { useEffect } from 'react';

const CronJobs = observer(() => {
  const {
    w3s: {
      cronJob,
      project: { curProject }
    }
  } = useStore();

  useEffect(() => {
    if (curProject) {
      cronJob.list.call(curProject.f_project_id);
    }
  }, [curProject]);

  return <JSONTable jsonstate={cronJob} />;
});

export const CreateCronJobButton = observer(() => {
  const {
    w3s: {
      cronJob,
      project: { curProject }
    }
  } = useStore();
  return (
    <Button
      h="32px"
      size="sm"
      leftIcon={<AddIcon />}
      {...defaultButtonStyle}
      onClick={async (e) => {
        const formData = await hooks.getFormData({
          title: 'Create Cron Job',
          size: 'md',
          formList: [
            {
              form: cronJob.form
            }
          ]
        });
        const projectId = curProject?.f_project_id;
        if (projectId && formData.cronExpressions) {
          const res = await axios.request({
            method: 'post',
            url: `/api/w3bapp/cronjob/${projectId}`,
            data: formData
          });
          if (res.data) {
            eventBus.emit('cronJob.create', projectId);
          }
        }
      }}
    >
      Create
    </Button>
  );
});

export default CronJobs;
