import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalBody, Box, Stack, Text } from '@chakra-ui/react';
import { useStore } from '@/store/index';
import { observer } from 'mobx-react-lite';
import { JSONForm } from '@/components/JSONForm';

export const ProjectModal = observer(() => {
  const { ide, w3s } = useStore();

  const { show, type } = ide.projectModal;

  return (
    <Modal
      isOpen={show}
      onClose={() => {
        ide.projectModal = {
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
              <JSONForm jsonstate={w3s.createProject} />
            ) : (
              <>
                <Text fontWeight={600} fontSize="2xl">Detail</Text>
                {w3s.curProject && (
                  <Stack my={4}>
                    <Box>Name: {w3s.curProject.f_name}</Box>
                    <Box>Number of applets: {w3s.curProject.applets.length}</Box>
                    <Box>ID: {w3s.curProject.f_project_id}</Box>
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
