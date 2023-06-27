import { useEffect } from 'react';
import { Box, Flex, Stack, Input, Button, Text, Divider } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { defaultButtonStyle, defaultOutlineButtonStyle } from '@/lib/theme';
import { v4 as uuidv4 } from 'uuid';
import { axios } from '@/lib/axios';
import { WidgetProps } from '@rjsf/utils';
import { eventBus } from '@/lib/event';
import toast from 'react-hot-toast';
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
            const res = await w3s.apiKeys.createApiKey(formData);
          }}
        >
          Create API Key
        </Button>
      </Flex>

      <Text fontSize="14px" color="#7a7a7a">
        Create your api keys
      </Text>

      <Divider my="10px" />

      <JSONTable jsonstate={w3s.apiKeys}></JSONTable>
    </>
  );
});
