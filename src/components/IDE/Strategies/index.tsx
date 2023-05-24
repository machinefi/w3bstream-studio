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
    } else {
      w3s.strategy.table.set({
        dataSource: w3s.strategy.allData
      });
    }
  }, [w3s.strategy.allData]);

  return (
    <>
      {w3s.config.form.formData.accountRole === 'ADMIN' && (
        <Flex alignItems="center">
          <CreateStrategyButton />
        </Flex>
      )}
      <JSONTable jsonstate={w3s.strategy} />
    </>
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
        if (w3s.config.form.formData.accountRole === 'DEVELOPER') {
          const applet = w3s.project.curProject?.applets?.[0];
          if (applet) {
            w3s.strategy.form.value.set({
              appletID: applet.f_applet_id.toString()
            });
            w3s.strategy.form.uiSchema.appletID = {
              'ui:widget': 'hidden'
            };
          }
        }
        w3s.strategy.createStrategy();
      }}
    >
      Create
    </Button>
  );
});

export default Strategies;
