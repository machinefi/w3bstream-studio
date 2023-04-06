import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalBody, ModalHeader, ModalCloseButton, Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { JSONForm } from '@/components/JSONForm';
import { useStore } from '@/store/index';
import { eventBus } from '@/lib/event';

const JSONModal = observer(() => {
  const {
    base: { formModal }
  } = useStore();
  const { formList, children } = formModal;

  if (formList.length === 0) {
    return null;
  }

  return (
    <Modal
      isOpen={formModal.isOpen}
      onClose={() => {
        eventBus.emit('base.formModal.abort');
      }}
      size={formModal.size}
    >
      <ModalOverlay />
      <ModalContent>
        {formModal.title && (
          <>
            <ModalHeader bg="#FAFAFA" borderBottom="1px solid #eee">
              {formModal.title}
            </ModalHeader>
            <ModalCloseButton />
          </>
        )}
        <ModalBody>
          {formList.length > 1 ? (
            <>
              <Tabs>
                <TabList>
                  {formList.map((item) => (
                    <Tab key={item.label}>{item.label}</Tab>
                  ))}
                </TabList>
                <TabPanels>
                  {formList.map((item) => (
                    <TabPanel key={item.label}>
                      <JSONForm formState={item.form} />
                    </TabPanel>
                  ))}
                </TabPanels>
              </Tabs>
              {children && children}
            </>
          ) : (
            <>
              <JSONForm formState={formList[0].form} />
              {children && children}
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});

export default JSONModal;
