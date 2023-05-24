import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalBody, Flex, ModalHeader, ModalCloseButton, Tabs, TabList, Tab, TabPanels, TabPanel, Box } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { JSONForm } from '@/components/JSONForm';
import { useStore } from '@/store/index';
import { eventBus } from '@/lib/event';
import Draggable from 'react-draggable';

const JSONModal = observer(() => {
  const {
    base: { formModal }
  } = useStore();
  const { formList, children } = formModal;

  if (formList.length === 0) {
    return children ? children : null;
  }

  return (
    <Modal
      isOpen={formModal.isOpen}
      onClose={() => {
        eventBus.emit('base.formModal.abort');
      }}
      size={formModal.size}
      isCentered
      closeOnOverlayClick={formModal.closeOnOverlayClick}
    >
      {formModal.showModalOverlay && <ModalOverlay />}
      <Box zIndex={9999} position="fixed" top={0} left={0} w="100vw" h="100vh">
        <Draggable handle=".draggable-handle">
          <Box>
            <ModalContent borderRadius={'14px'} overflow="hidden">
              {formModal.title && (
                <>
                  <ModalHeader bg="#F8F8FA"  px="1.5rem" fontSize={'1.2rem'} py="1.5rem" fontWeight={700} cursor="move" className="draggable-handle">
                    {formModal.title}
                    <ModalCloseButton mt="1rem" mr="0.5rem" color={'#7A7A7A'} fontSize={'1.125rem'} />
                  </ModalHeader>

                </>
              )}
              <ModalBody pb="1.5rem">
                {formList.length > 1 ? (
                  <>
                    <Tabs
                      onChange={(e) => {
                        formModal.currentTabIdx = e;
                        console.log(formModal.currentTabIdx);
                      }}
                    >
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
          </Box>
        </Draggable>
      </Box>
    </Modal>
  );
});

export default JSONModal;
