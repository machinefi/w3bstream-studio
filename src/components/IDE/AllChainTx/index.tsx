import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { Button, Flex } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { gradientButtonStyle } from '@/lib/theme';
import JSONTable from '@/components/JSONTable';

const AllChainTx = observer(() => {
  const { w3s } = useStore();

  return (
    <>
      <Flex alignItems="center">
        <Button
          h="32px"
          leftIcon={<AddIcon />}
          {...gradientButtonStyle}
          onClick={(e) => {
            w3s.chainTx.modal.set({ show: true });
          }}
        >
          Add blockchain transaction monitor
        </Button>
      </Flex>
      <JSONTable jsonstate={w3s.chainTx} />
    </>
  );
});

export default AllChainTx;
