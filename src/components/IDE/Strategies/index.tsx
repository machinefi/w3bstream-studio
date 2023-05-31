import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { Button, Flex } from '@chakra-ui/react';
import { defaultButtonStyle } from '@/lib/theme';
import { AddIcon } from '@chakra-ui/icons';
import JSONTable from '@/components/JSONTable';
import { useEffect } from 'react';

const Strategies = observer(() => {
  const { w3s } = useStore();

  useEffect(() => {
    if (w3s.config.form.formData.accountRole === 'DEVELOPER') {
      w3s.strategy.table.set({
        dataSource: w3s.strategy.curStrategies
      });
    }
  }, [w3s.strategy.curStrategies]);

  return (
    <JSONTable jsonstate={w3s.strategy} />
  );
});

export const CreateStrategyButton = observer(() => {
  const { w3s } = useStore();
  return (
    <Button
      h="32px"
      size="sm"
      leftIcon={<AddIcon />}
      {...defaultButtonStyle}
      onClick={async (e) => {
        w3s.strategy.createStrategy();
      }}
    >
      Create
    </Button>
  );
});

export default Strategies;
