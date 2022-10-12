import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalBody, Box, Stack, Text } from '@chakra-ui/react';
import { useStore } from '@/store/index';
import { observer } from 'mobx-react-lite';
import { JSONForm } from '@/components/JSONForm';
import { JSONSchemaState } from '@/store/standard/JSONSchemaState';
import { JSONSchemaModalState } from '../../../store/standard/JSONSchemaState';

interface Props {
  jsonstate: JSONSchemaState<any, { modal: JSONSchemaModalState }>;
  children?: any;
}

export const AppletModal = observer((props: Props) => {
  const { w3s } = useStore();
  const { jsonstate } = props;

  return (
    <Modal
      isOpen={jsonstate.extraData.modal.show}
      onClose={() => {
        jsonstate.setExtraData({
          modal: {
            show: false,
            type: 'add'
          }
        });
      }}
      size="2xl"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalBody>
          <Box mt="2xl">
            {jsonstate.extraData.modal.type === 'add' ? (
              <JSONForm jsonstate={jsonstate} />
            ) : (
              <>
                <Text fontWeight={600} fontSize="2xl">
                  Detail
                </Text>
                {w3s.curApplet && (
                  <Stack my={4}>
                    <Box>Name: {w3s.curApplet.f_name}</Box>
                    <Box>Number of instances: {w3s.curApplet.instances.length}</Box>
                    <Box>ID: {w3s.curApplet.f_applet_id}</Box>
                  </Stack>
                )}
              </>
            )}
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});
