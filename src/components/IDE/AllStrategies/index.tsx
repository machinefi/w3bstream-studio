import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import Table from '@/components/Table';

const AllStrategies = observer(() => {
  const {
    w3s: { allStrategies }
  } = useStore();

  return (
    <Table
      columns={[
        {
          key: 'f_strategy_id',
          label: 'Strategy ID'
        },
        {
          key: 'f_applet_id',
          label: 'Applet ID'
        },
        {
          key: 'f_project_id',
          label: 'Project ID'
        },
        {
          key: 'f_event_type',
          label: 'Event Type'
        },
        {
          key: 'f_handler',
          label: 'handler'
        }
      ]}
      dataSource={allStrategies}
      rowKey="f_strategy_id"
      chakraTableContainerProps={{ h: 'calc(100vh - 160px)' }}
    />
  );
});

export default AllStrategies;
