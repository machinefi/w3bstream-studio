import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { Button, Flex } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { gradientButtonStyle } from '@/lib/theme';
import JSONTable from '@/components/JSONTable';

const AllPublishers = observer(() => {
  const { w3s } = useStore();

  return (
    <>
      <Flex alignItems="center">
        <Button
          h="32px"
          leftIcon={<AddIcon />}
          {...gradientButtonStyle}
          onClick={(e) => {
            w3s.publisher.form = w3s.publisher.createPublisherForm;
            w3s.publisher.modal.set({ show: true, title: 'Create Publisher' });
          }}
        >
          Add Publisher
        </Button>
      </Flex>
      <JSONTable jsonstate={w3s.publisher} />
    </>
  );
});

export default AllPublishers;
