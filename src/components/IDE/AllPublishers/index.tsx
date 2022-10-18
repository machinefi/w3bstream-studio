import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import Table from '@/components/Table';
import { Button, Flex, Text } from '@chakra-ui/react';
import { AddIcon, CopyIcon } from '@chakra-ui/icons';
import { gradientButtonStyle } from '@/lib/theme';
import copy from 'copy-to-clipboard';
import toast from 'react-hot-toast';

export const tokenFormat = (token) => {
  const len = token.length;
  return `${token.substring(0, 12)}...${token.substring(len - 11, len)}`;
};

const AllPublishers = observer(() => {
  const {
    w3s,
    w3s: { allPublishers }
  } = useStore();

  return (
    <>
      <Flex alignItems="center">
        <Button
          h="32px"
          leftIcon={<AddIcon />}
          {...gradientButtonStyle}
          onClick={(e) => {
            if (w3s.showContent === 'CURRENT_APPLETS') {
              w3s.createPublisher.value.set({
                projectID: w3s.curProject?.f_project_id,
              });
            }
            w3s.createPublisher.extraValue.set({ modal: { show: true } });
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
