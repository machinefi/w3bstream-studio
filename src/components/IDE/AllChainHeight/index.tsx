import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { Button, Flex } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { gradientButtonStyle } from '@/lib/theme';
import JSONTable from '@/components/JSONTable';

const AllChainHeight = observer(() => {
  const { w3s } = useStore();

  return (
    <>
      <Flex alignItems="center">
        <Button
          h="32px"
          leftIcon={<AddIcon />}
          {...gradientButtonStyle}
          onClick={(e) => {
            w3s.chainHeight.modal.set({ show: true });
          }}
        >
          Post blockchain height monitor
        </Button>
      </Flex>
      <JSONTable jsonstate={w3s.chainHeight} />
    </>
  );
});

export default AllChainHeight;
