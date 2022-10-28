import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { Button, Flex } from '@chakra-ui/react';
import { gradientButtonStyle } from '@/lib/theme';
import { AddIcon } from '@chakra-ui/icons';
import JSONTable from '@/components/JSONTable';

const AllStrategies = observer(() => {
  const { w3s } = useStore();

  return (
    <>
      <Flex alignItems="center">
        <Button
          h="32px"
          leftIcon={<AddIcon />}
          {...gradientButtonStyle}
          onClick={(e) => {
            w3s.createStrategy.modal.set({ show: true, title: 'Create Strategy' });
          }}
        >
          Add Strategy
        </Button>
      </Flex>
      <JSONTable jsonstate={w3s.strategies} />
    </>
  );
});

export default AllStrategies;
