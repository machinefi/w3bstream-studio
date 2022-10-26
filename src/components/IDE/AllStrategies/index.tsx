import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import Table from '@/components/Table';
import { Button, Flex } from '@chakra-ui/react';
import { gradientButtonStyle } from '@/lib/theme';
import { AddIcon } from '@chakra-ui/icons';
import toast from 'react-hot-toast';
import { eventBus } from '@/lib/event';
import { axios } from '@/lib/axios';

const AllStrategies = observer(() => {
  const {
    w3s,
    w3s: { allStrategies },
    base: { confirm }
  } = useStore();

  return (
    <>
      <Flex alignItems="center">
        <Button
          h="32px"
          leftIcon={<AddIcon />}
          {...gradientButtonStyle}
          onClick={(e) => {
            w3s.createStrategy.extraValue.set({ modal: { show: true, title: 'Create Strategy' } });
          }}
        >
          Add Strategy
        </Button>
      </Flex>
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
            label: 'Event Type',
            render(item) {
              return <>Any</>;
            }
          },
          {
            key: 'f_handler',
            label: 'handler'
          },
          {
            key: 'actions',
            label: 'Actions',
            render(item) {
              return (
                <>
                  <Button
                    h="32px"
                    bg="#37A169"
                    color="#fff"
                    _hover={{ opacity: 0.8 }}
                    _active={{
                      opacity: 0.6
                    }}
                    onClick={(e) => {
                      w3s.createStrategy.value.set({
                        strategyID: item.f_strategy_id,
                        appletID: item.f_applet_id,
                        eventType: String(item.f_event_type),
                        handler: item.f_handler
                      });
                      w3s.createStrategy.extraValue.set({ modal: { show: true, title: 'Edit Strategy' } });
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    ml="8px"
                    h="32px"
                    bg="#E53E3E"
                    color="#fff"
                    _hover={{ opacity: 0.8 }}
                    _active={{
                      opacity: 0.6
                    }}
                    onClick={(e) => {
                      confirm.show({
                        title: 'Warning',
                        description: 'Are you sure you want to delete it?',
                        async onOk() {
                          const p = w3s.allProjects.value.find((p) => String(p.f_project_id) === item.f_project_id);
                          if (!p) {
                            return;
                          }
                          await axios.request({
                            method: 'delete',
                            url: `/srv-applet-mgr/v0/strategy/${p.f_name}?strategyID=${item.f_strategy_id}`
                          });
                          eventBus.emit('strategy.delete');
                          toast.success('Deleted successfully');
                        }
                      });
                    }}
                  >
                    Delete
                  </Button>
                </>
              );
            }
          }
        ]}
        dataSource={allStrategies}
        rowKey="f_strategy_id"
        chakraTableContainerProps={{ mt: '10px', h: 'calc(100vh - 200px)' }}
      />
    </>
  );
});

export default AllStrategies;
