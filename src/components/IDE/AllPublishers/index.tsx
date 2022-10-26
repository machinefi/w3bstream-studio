import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import Table from '@/components/Table';
import { Button, Flex, Text } from '@chakra-ui/react';
import { AddIcon, CopyIcon } from '@chakra-ui/icons';
import { gradientButtonStyle } from '@/lib/theme';
import copy from 'copy-to-clipboard';
import toast from 'react-hot-toast';
import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';

export const tokenFormat = (token) => {
  const len = token.length;
  return `${token.substring(0, 12)}...${token.substring(len - 11, len)}`;
};

const AllPublishers = observer(() => {
  const {
    w3s,
    w3s: { allPublishers },
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
            w3s.createPublisher.extraValue.set({ modal: { show: true, title: 'Create Publisher' } });
          }}
        >
          Add Publisher
        </Button>
      </Flex>
      <Table
        columns={[
          {
            key: 'f_publisher_id',
            label: 'Publisher ID'
          },
          {
            key: 'f_name',
            label: 'name'
          },
          {
            key: 'f_key',
            label: 'Key'
          },
          {
            key: 'f_created_at',
            label: 'created at'
          },
          {
            key: 'f_token',
            label: 'token',
            render(item) {
              return (
                <Flex alignItems="center">
                  <Text>{tokenFormat(item.f_token)}</Text>
                  <CopyIcon
                    w="20px"
                    cursor="pointer"
                    onClick={() => {
                      copy(item.f_token);
                      toast.success('Copied');
                    }}
                  />
                </Flex>
              );
            }
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
                      w3s.createPublisher.value.set({
                        publisherID: item.f_publisher_id,
                        projectName: item.project_name,
                        projectID: item.project_id,
                        name: item.f_name,
                        key: item.f_key
                      });
                      w3s.createPublisher.extraValue.set({ modal: { show: true, title: 'Edit Publisher' } });
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
                          await axios.request({
                            method: 'delete',
                            url: `/srv-applet-mgr/v0/publisher/${item.project_name}?publisherID=${item.f_publisher_id}`
                          });
                          eventBus.emit('publisher.delete');
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
        dataSource={allPublishers}
        rowKey="f_publisher_id"
        chakraTableContainerProps={{ mt: '10px', h: 'calc(100vh - 200px)' }}
      />
    </>
  );
});

export default AllPublishers;
