import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalBody, Box } from '@chakra-ui/react';
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
        jsonstate.setExtraData({
          modal: {
            show: false,
          }
        });
      }}
      size="2xl"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalBody>
          <Box mt="2xl">
            <JSONForm jsonstate={jsonstate} />
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});

export default JSONSchemaModal;
