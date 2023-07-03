import { useEffect } from 'react';
import { Box, Flex, Stack, Input, Button, Text, Divider, Spinner, Center, Alert, AlertIcon, CloseButton } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { defaultButtonStyle, defaultOutlineButtonStyle } from '@/lib/theme';
import JSONTable from '@/components/JSONTable';
import { hooks } from '@/lib/hooks';
import { TruncateStringWithCopy } from '@/components/Common/TruncateStringWithCopy';

export const ApiKeys = observer(() => {
  const { w3s } = useStore();
  useEffect(() => {
    w3s.apiKeys.apikey = null;
  }, []);
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

      {w3s.apiKeys.apikey && (
        <Alert background="#efe9ff" mt={2} status="success" borderRadius={4} flexDirection={'column'} display={'flex'} alignItems={'left'}>
          <Flex>
            <Text fontWeight={700}> Make sure to copy your personal access token now as you will not be able to see this again.</Text>
            {/* <CloseButton
              ml="auto"
              onClick={(e) => {
                w3s.apiKeys.apikey = null;
                console.log(w3s.apiKeys.apikey);
              }}
            /> */}
          </Flex>
          <Divider my="5px" />
          <Flex>Name: {w3s.apiKeys.apikey?.name}</Flex>
          <TruncateStringWithCopy fullString={w3s.apiKeys.apikey?.accessKey} strLen={60} />
        </Alert>
      )}

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
