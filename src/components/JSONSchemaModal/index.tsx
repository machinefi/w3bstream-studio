import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalBody, Box, ModalHeader, ModalCloseButton } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { JSONForm } from '@/components/JSONForm';
import { JSONSchemaFormState, JSONModalValue } from '@/store/standard/JSONSchemaState';

interface Props {
  jsonstate: {
    form: JSONSchemaFormState<any>,
    modal: JSONModalValue
  };
  children?: any;
}

const JSONSchemaModal = observer((props: Props) => {
  const { form, modal } = props.jsonstate;

  return (
    <Modal
      isOpen={modal?.value.show}
      onClose={() => {
        form.reset({ force: true });
        modal.set({
          show: false
        });
      }}
      size="2xl"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader bg="#FAFAFA" borderBottom="1px solid #eee">
          {modal.value.title}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box p="20px 30px">
            <JSONForm jsonstate={form} />
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});

export default JSONSchemaModal;
