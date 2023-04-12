import React, { useEffect } from 'react';
import { Flex, Text, Box, Button } from '@chakra-ui/react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import MonacoEditor from '@monaco-editor/react';
import { JSONRenderComponent, JSONRenderStoreCtx } from '..';
import { axios } from '@/lib/axios';
import { StorageState } from '@/store/standard/StorageState';

export const WebhookSubmitWidget = observer(({ store, templateValue }: { store: JSONRenderStoreCtx; templateValue: string }) => {
  let localTemplateValue = new StorageState({
    //@ts-ignore
    key: `webhookTemplateValue-${store?.JSONForm?.formState?.value?.value?.id}`
  });

  useEffect(() => {
    console.log(localTemplateValue.value, templateValue);
  }, []);

  return (
    <Flex direction={'column'} mt={2}>
      <Text sx={{ fontWeight: 700 }}>Example Event</Text>
      <Box mt={4}>
        <MonacoEditor
          height={200}
          theme="vs-dark"
          language={'json'}
          //@ts-ignore
          value={localTemplateValue.value ?? templateValue}
          onChange={(e) => {
            console.log(e);
            localTemplateValue.save(e);
          }}
          onMount={(editor, monaco) => {}}
        />
      </Box>
      <Button
        mt={20}
        onClick={async () => {
          //@ts-ignore
          console.log(store?.JSONForm?.formState?.value?.value);
          //@ts-ignore
          const formData = store?.JSONForm?.formState?.value?.value;
          const id = formData.id;
          console.log(templateValue);
          if (id) {
            try {
              axios.post(`${window.location.origin}/api/openapi/webhook/${id}`, {
                //@ts-ignore
                ...JSON.parse(localTemplateValue.value ?? templateValue),
                id,
                extra: {
                  loading: true
                }
              });
            } catch (error) {
              console.log(error);
            }
            // eventBus.emit('base.formModal.afterSubmit', formData);
          }
        }}
      >
        Mock Trigger
      </Button>
    </Flex>
  );
});

export default WebhookSubmitWidget;
