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
            w3s.applet.form.value.set({
              projectID: w3s.curProject?.f_project_id.toString()
            });
          }
          w3s.applet.modal.set({ show: true });
        }}
      >
        Add Applet
      </Button>
    </Flex>
  );
});

const Applets = observer(() => {
  const { w3s } = useStore();

  useEffect(() => {
    if (w3s.showContent === 'CURRENT_APPLETS') {
      const applets = w3s.curProject?.applets || [];
      w3s.applet.table.set({
        dataSource: applets
      });
    } else {
      w3s.applet.table.set({
        dataSource: w3s.applet.allData
      });
    }
  }, [w3s.curProject, w3s.showContent]);

  return (
    <>
      <AddBtn />
      <JSONTable jsonstate={w3s.applet} />
    </>
  );
});

export default Applets;
