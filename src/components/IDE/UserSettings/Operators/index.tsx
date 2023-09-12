import { Flex, Button, Text, Spinner, Center } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { defaultButtonStyle } from '@/lib/theme';
import JSONTable from '@/components/JSONTable';
import { hooks } from '@/lib/hooks';

export const Operators = observer(() => {
  const {
    w3s: { operator }
  } = useStore();
  operator.useOperators();

  return (
    <>
      <Flex>
        <Text fontSize={'18px'} fontWeight={600}>
          Operators
        </Text>
        <Button
          ml="auto"
          size="sm"
          fontWeight={400}
          {...defaultButtonStyle}
          isLoading={operator.createOperator.loading.value}
          onClick={async () => {
            const formData = await hooks.getFormData({
              title: 'Create operator',
              size: 'xl',
              formList: [
                {
                  form: operator.form
                }
              ]
            });
            operator.createOperator.call(formData);
          }}
        >
          Create operator
        </Button>
      </Flex>

      <Text fontSize="14px" color="#7a7a7a">
        Create your operators
      </Text>
      {operator.list.loading.value ? (
        <Center w="full">
          <Spinner />
        </Center>
      ) : (
        <JSONTable jsonstate={operator} />
      )}
    </>
  );
});
