import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { Button, Flex } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { gradientButtonStyle } from '@/lib/theme';
import JSONTable from '@/components/JSONTable';
import { useEffect } from 'react';

const Publishers = observer(() => {
  const { w3s } = useStore();

  useEffect(() => {
    if (w3s.showContent === 'CURRENT_PUBLISHERS') {
      const publishers = w3s.curProject?.publishers || [];
      w3s.publisher.table.set({
        dataSource: publishers
      });
    } else {
      w3s.publisher.table.set({
        dataSource: w3s.publisher.allData
      });
    }
  }, [w3s.curProject, w3s.showContent]);

  return (
    <>
      <Flex alignItems="center">
        <Button
          h="32px"
          leftIcon={<AddIcon />}
          {...gradientButtonStyle}
          onClick={(e) => {
            if (w3s.showContent === 'CURRENT_PUBLISHERS') {
              w3s.publisher.form.value.set({
                projectName: w3s.curProject?.f_name
              });
            }
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

export default Publishers;
