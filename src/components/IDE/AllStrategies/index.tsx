import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { Button, Flex } from '@chakra-ui/react';
import { defaultButtonStyle } from '@/lib/theme';
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
          {...defaultButtonStyle}
          onClick={async (e) => {
            w3s.strategy.createStrategy();
          }}
        >
          Add Strategy
        </Button>
      </Flex>
      <JSONTable jsonstate={w3s.strategy} />
    </>
  );
});

export default AllStrategies;
