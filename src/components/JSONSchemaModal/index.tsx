import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalBody, Box, ModalHeader, ModalCloseButton } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { JSONForm } from '@/components/JSONForm';
import { JSONSchemaState } from '@/store/standard/JSONSchemaState';
import { JSONSchemaModalState } from '@/store/standard/JSONSchemaState';

interface Props {
  jsonstate: JSONSchemaState<any, { modal: JSONSchemaModalState }>;
  children?: any;
}

const JSONSchemaModal = observer((props: Props) => {
  const { jsonstate } = props;

  return (
    <Modal
      isOpen={jsonstate.extraData.modal.show}
      onClose={() => {
        jsonstate.reset().extraValue.set({
          modal: {
            ...jsonstate.extraData.modal,
            show: false
          }
        });
      }}
      size="2xl"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader bg="#FAFAFA" borderBottom="1px solid #eee">
          {jsonstate.extraData.modal.title}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box p="20px 30px">
            <JSONForm jsonstate={jsonstate} />
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});

export default JSONSchemaModal;
