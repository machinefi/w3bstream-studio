import { Button, Flex } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { AddIcon } from '@chakra-ui/icons';
import { gradientButtonStyle } from '@/lib/theme';
import JSONTable from '@/components/JSONTable';
import { useEffect } from 'react';

const AddBtn = observer(() => {
  const { w3s } = useStore();
  return (
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
  );
});

export const AllApplets = observer(() => {
  const { w3s } = useStore();
  return (
    <>
      <AddBtn />
      <JSONTable jsonstate={w3s.applets} />
    </>
  );
});

export const CurProjectApplets = observer(() => {
  const { w3s } = useStore();
  const applets = w3s.curProject?.applets || [];
  useEffect(() => {
    w3s.curProjectApplets.table.set({
      dataSource: applets
    });
  }, [applets]);
  return (
    <>
      <AddBtn />
      <JSONTable jsonstate={w3s.curProjectApplets} />
    </>
  );
});
