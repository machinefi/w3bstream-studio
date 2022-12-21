import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalBody, Box, ModalHeader, ModalCloseButton, Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { JSONForm } from '@/components/JSONForm';
import { JSONSchemaFormState, JSONModalValue } from '@/store/standard/JSONSchemaState';

interface Props {
  jsonstate: {
    form: JSONSchemaFormState<any>;
    modal: JSONModalValue;
    formList?: {
      label: string;
      form: JSONSchemaFormState<any>;
    }[];
  };
  children?: any;
}

const JSONModal = observer((props: Props) => {
  const { form, modal, formList } = props.jsonstate;
  const { children } = props;

  return (
    <Modal
      isOpen={modal?.value.show}
      onClose={() => {
        if (modal.value.autoReset) {
          form.reset({ force: true });
        }
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
          {formList ? (
            <Tabs>
              <TabList>
                {formList.map((item) => (
                  <Tab key={item.label}>{item.label}</Tab>
                ))}
              </TabList>
              <TabPanels>
                {formList.map((item) => (
                  <TabPanel key={item.label}>
                    <Box>
                      <JSONForm jsonstate={item.form} />
                      {children && children}
                    </Box>
                  </TabPanel>
                ))}
              </TabPanels>
            </Tabs>
          ) : (
            <Box p="20px 30px">
              <JSONForm jsonstate={form} />
              {children && children}
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});

export default JSONModal;
