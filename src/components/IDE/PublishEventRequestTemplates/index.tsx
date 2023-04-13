import { observer, useLocalObservable } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { Box, Button, ButtonProps, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import MonacoEditor from '@monaco-editor/react';
import copy from 'copy-to-clipboard';
import toast from 'react-hot-toast';
import { defaultButtonStyle, defaultOutlineButtonStyle } from '@/lib/theme';
import { helper } from '@/lib/helper';
import { CopyIcon } from '@chakra-ui/icons';
import { getHTTPRequestTemplate, getMQTTRequestTemplate } from '@/constants/publish-event-code-templates';

export const ShowRequestTemplatesButton = observer(({ props = {} }: { props?: ButtonProps }) => {
  const {
    w3s: {
      publisher,
      config: {
        form: {
          formData: { accountRole }
        }
      }
    }
  } = useStore();
  return (
    <Button
      {...defaultOutlineButtonStyle}
      {...props}
      onClick={() => {
        if (accountRole === 'ADMIN') {
          const { projectName } = publisher.publishEventForm.formData;
          if (!projectName) {
            toast.error('Please select the project first');
            return;
          }
        }
        publisher.showPublishEventRequestTemplates = true;
      }}
    >
      API Code Sample
    </Button>
  );
});

export const ShowRequestTemplatesButtonWidget = () => {
  return <ShowRequestTemplatesButton props={{ mt: '10px', w: '100%', h: '32px' }} />;
};

const UseDefaultTemplateButton = observer(({ props = {} }: { props?: ButtonProps }) => {
  const {
    w3s: { publisher }
  } = useStore();
  return (
    <Button
      {...defaultOutlineButtonStyle}
      {...props}
      onClick={() => {
        publisher.developerPublishEventForm.value.set({
          body: JSON.stringify(
            [
              {
                header: {
                  event_type: 'ANY',
                  pub_id: '',
                  token: '',
                  pub_time: Date.now()
                },
                payload: {
                  example: 'This is is an example payload'
                }
              }
            ],
            null,
            2
          )
        });
      }}
    >
      Use the default template
    </Button>
  );
});

export const UseDefaultTemplateButtonWidget = () => {
  return <UseDefaultTemplateButton />;
};

const PublishEventRequestTemplates = observer(() => {
  const {
    w3s: {
      publisher,
      config: {
        form: {
          formData: { accountRole }
        }
      },
      project: { curProject }
    }
  } = useStore();

  const store = useLocalObservable(() => ({
    get body() {
      if (accountRole === 'ADMIN') {
        const { body } = publisher.publishEventForm.formData;
        return publisher.parseBody(body);
      }
      return {
        events: [
          {
            header: {
              event_type: 'ANY',
              pub_id: '',
              token: '',
              pub_time: Date.now()
            },
            payload: helper.stringToBase64(
              JSON.stringify({
                example: 'This is is an example payload'
              })
            )
          }
        ]
      };
    }
  }));

  const languages = ['javascript', 'go', 'rust'];
  const projectName = (accountRole === 'ADMIN' ? publisher.publishEventForm.formData.projectName : curProject?.f_name) || ':projectName';

  return (
    <Drawer
      isOpen={publisher.showPublishEventRequestTemplates}
      placement="right"
      size="xl"
      onClose={() => {
        publisher.showPublishEventRequestTemplates = false;
      }}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>API Code Sample</DrawerHeader>
        <DrawerBody>
          <Tabs variant="unstyled">
            <TabList>
              <Tab _selected={{ color: '#855EFF', fontWeight: 700, borderBottom: '2px solid #855EFF' }}>HTTP</Tab>
              <Tab _selected={{ color: '#855EFF', fontWeight: 700, borderBottom: '2px solid #855EFF' }}>MQTT</Tab>
            </TabList>
            <TabPanels>
              <TabPanel p="10px 0px">
                <Tabs orientation="vertical" variant="unstyled">
                  <TabList>
                    {languages.map((item) => (
                      <Tab key={item} _selected={{ color: '#855EFF', fontWeight: 700, borderRight: '2px solid #855EFF' }}>
                        {item}
                      </Tab>
                    ))}
                  </TabList>
                  <TabPanels p="0px">
                    {languages.map((item) => {
                      const codeStr = getHTTPRequestTemplate(item, projectName, store.body);
                      return (
                        <TabPanel key={item}>
                          <Box pos="relative" width="100%" height="calc(100vh - 180px)">
                            <Button
                              zIndex={99}
                              pos="absolute"
                              bottom="20px"
                              right="20px"
                              {...defaultButtonStyle}
                              leftIcon={<CopyIcon />}
                              onClick={() => {
                                copy(codeStr);
                                toast.success('Copied');
                              }}
                            >
                              Copy
                            </Button>
                            <MonacoEditor width="100%" height="calc(100vh - 180px)" theme="vs-dark" language={item} value={codeStr} />
                          </Box>
                        </TabPanel>
                      );
                    })}
                  </TabPanels>
                </Tabs>
              </TabPanel>
              <TabPanel p="10px 0px">
                <Tabs orientation="vertical" variant="unstyled">
                  <TabList>
                    {languages.map((item) => (
                      <Tab key={item} _selected={{ color: '#855EFF', fontWeight: 700, borderRight: '2px solid #855EFF' }}>
                        {item}
                      </Tab>
                    ))}
                  </TabList>
                  <TabPanels p="0px">
                    {languages.map((item) => {
                      const codeStr = getMQTTRequestTemplate(item, projectName, JSON.stringify(JSON.stringify(store.body), null, 2));
                      return (
                        <TabPanel key={item}>
                          <Box pos="relative" width="100%" height="calc(100vh - 180px)">
                            <Button
                              zIndex={99}
                              pos="absolute"
                              bottom="20px"
                              right="20px"
                              {...defaultButtonStyle}
                              leftIcon={<CopyIcon />}
                              onClick={() => {
                                copy(codeStr);
                                toast.success('Copied');
                              }}
                            >
                              Copy
                            </Button>
                            <MonacoEditor width="100%" height="calc(100vh - 180px)" theme="vs-dark" language={item} value={codeStr} />
                          </Box>
                        </TabPanel>
                      );
                    })}
                  </TabPanels>
                </Tabs>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
});

export default PublishEventRequestTemplates;
