import { useEffect } from 'react';
import { Box, Flex, Stack, Input, Button, Text, Divider, Spinner, Center } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { defaultButtonStyle, defaultOutlineButtonStyle } from '@/lib/theme';
import JSONTable from '@/components/JSONTable';
import { hooks } from '@/lib/hooks';

export const ApiKeys = observer(() => {
  const { w3s } = useStore();
  return (
    <>
      <Flex>
        <Text fontSize={'18px'} fontWeight={600}>
          API Keys
        </Text>

        <Button
          ml="auto"
          size="sm"
          fontWeight={400}
          {...defaultButtonStyle}
          isLoading={w3s.apiKeys?.createApiKey?.loading?.value}
          onClick={async () => {
            const formData = await hooks.getFormData({
              title: 'Create Api Key',
              size: 'xl',
              formList: [
                {
                  form: w3s.apiKeys.form
                }
              ]
            });
            const res = await w3s.apiKeys.createApiKey.call(formData);
          }}
        >
          Create API Key
        </Button>
      </Flex>

      <Text fontSize="14px" color="#7a7a7a">
        Create your api keys
      </Text>

      <Divider my="10px" />

      {w3s.user.userSetting.loading.value ? (
        <Center w="full">
          <Spinner />
        </Center>
      ) : (
        <JSONTable jsonstate={w3s.apiKeys}></JSONTable>
      )}
    </>
  );
});
