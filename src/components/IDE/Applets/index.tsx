import { Badge, Button, Flex } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { AddIcon } from '@chakra-ui/icons';
import copy from 'copy-to-clipboard';
import toast from 'react-hot-toast';
import { gradientButtonStyle } from '@/lib/theme';
import Table from '@/components/Table';
import { InstanceActions, InstanceStatus } from '../AllInstances';

const Applets = observer(() => {
  const { w3s } = useStore();

  const applets = w3s.showContent === 'CURRENT_APPLETS' ? w3s.curProject?.applets || [] : w3s.allApplets;

  return (
    <>
      <Flex alignItems="center">
        <Button
          h="32px"
          leftIcon={<AddIcon />}
          {...gradientButtonStyle}
          onClick={(e) => {
            if (w3s.showContent === 'CURRENT_APPLETS') {
              w3s.createApplet.form.value.set({
                projectID: w3s.curProject?.f_project_id.toString()
              });
            }

            w3s.createApplet.modal.set({ show: true });
          }}
        >
          Add Applet
        </Button>
      </Flex>
      <Table
        columns={[
          {
            key: 'f_applet_id',
            label: 'Applet ID'
          },
          {
            key: 'f_name',
            label: 'Name'
          },
          {
            key: 'project_name',
            label: 'Project Name'
          },
          {
            key: 'actions',
            label: 'Actions',
            render(item) {
              return (
                <>
                  {item.instances.length > 0 ? (
                    <>
                      <Button
                        h="32px"
                        bg="#6FB2FF"
                        color="#fff"
                        _hover={{ opacity: 0.8 }}
                        _active={{
                          opacity: 0.6
                        }}
                        onClick={(e) => {
                          w3s.curPublisherProjectID = item.f_project_id;
                          w3s.publishEvent.form.value.set({
                            projectName: item.project_name
                          });
                          w3s.publishEvent.modal.set({
                            show: true
                          });
                        }}
                      >
                        Send Event
                      </Button>
                      <Button
                        ml="8px"
                        h="32px"
                        variant="outline"
                        borderColor="#6FB2FF"
                        color="#6FB2FF"
                        onClick={() => {
                          copy(
                            `curl --location --request POST 'localhost:8888/srv-applet-mgr/v0/event/${item.project_name}' --header 'Content-Type: text/plain' --data-raw '{"payload":"xxx yyy zzz"}'`
                          );
                          toast.success('Copied');
                        }}
                      >
                        Copy
                      </Button>
                    </>
                  ) : (
                    <Button
                      colorScheme="blue"
                      size="xs"
                      onClick={(e) => {
                        if (item.instances.length === 0) {
                          w3s.deployApplet.call({ appletID: item.f_applet_id });
                        }
                      }}
                    >
                      Deploy
                    </Button>
                  )}
                </>
              );
            }
          }
        ]}
        dataSource={applets}
        extendedTables={[
          {
            key: 'instances',
            columns: [
              {
                key: 'f_instance_id',
                label: 'Instance ID'
              },
              {
                key: 'f_state',
                label: 'Status',
                render(item) {
                  return <InstanceStatus state={item.f_state} />;
                }
              },
              {
                key: 'actions',
                label: 'Actions',
                render(item) {
                  return <InstanceActions data={item} />;
                }
              }
            ]
          },
          {
            key: 'strategies',
            columns: [
              {
                key: 'f_strategy_id',
                label: 'Strategy ID'
              },
              {
                key: 'f_event_type',
                label: 'Event Type'
              },
              {
                key: 'f_handler',
                label: 'handler'
              }
            ]
          }
        ]}
        rowKey="f_applet_id"
        chakraTableContainerProps={{ mt: 4, h: 'calc(100vh - 200px)', overflowY: 'auto' }}
      />
    </>
  );
});

export default Applets;
