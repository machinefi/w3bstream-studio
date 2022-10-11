import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalBody, Box, Stack, Text } from '@chakra-ui/react';
import { useStore } from '@/store/index';
import { observer } from 'mobx-react-lite';
import { JSONForm } from '@/components/JSONForm';

export const AppletModal = observer(() => {
  const { ide, w3s } = useStore();

  const { show, type } = ide.appletModal;

  return (
    <Modal
      isOpen={show}
      onClose={() => {
        ide.appletModal = {
          show: false,
          type: ''
        };
      }}
      size="2xl"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalBody>
          <Box mt="2xl">
            {type === 'add' ? (
              <JSONForm jsonstate={w3s.uploadWASMScript} />
            ) : (
              <>
                <Text fontWeight={600} fontSize="2xl">Detail</Text>
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
