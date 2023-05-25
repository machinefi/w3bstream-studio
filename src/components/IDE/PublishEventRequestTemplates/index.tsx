import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { Box, Button, ButtonProps, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import MonacoEditor from '@monaco-editor/react';
import copy from 'copy-to-clipboard';
import toast from 'react-hot-toast';
import { defaultButtonStyle, defaultOutlineButtonStyle } from '@/lib/theme';
import { CopyIcon } from '@chakra-ui/icons';
import { getHTTPRequestTemplate, getMQTTRequestTemplate } from '@/constants/publish-event-code-templates';
import { eventBus } from '@/lib/event';

export const ShowRequestTemplatesButton = observer(({ props = {} }: { props?: ButtonProps }) => {
  const {
    w3s: {
      publisher,
      config: {
        form: {
          formData: { accountRole }
        }
      }
    },
    lang: { t }
  } = useStore();
  return (
    <Button
      {...defaultOutlineButtonStyle}
      {...props}
      onClick={() => {
        if (accountRole === 'ADMIN') {
          const { projectName } = publisher.publishEventForm.formData;
          if (!projectName) {
            toast.error(t('error.api.code.msg'));
            return;
          }
        }
        eventBus.emit('base.formModal.abort');
        publisher.showPublishEventRequestTemplates = true;
      }}
    >
      API Code Sample
    </Button>
  );
});

const PublishEventRequestTemplates = observer(() => {
  const {
    w3s: {
      publisher,
      config: {
        form: {
          formData: { accountRole }
        }
      },
      project: { curProject },
      env: { envs }
    }
  } = useStore();
  const languages = ['javascript', 'go', 'rust'];
  const formData = accountRole === 'ADMIN' ? publisher.publishEventForm.formData : publisher.developerPublishEventForm.formData;
  const projectName = (accountRole === 'ADMIN' ? formData.projectName : curProject?.f_name) || ':projectName';
  const getHttpProps = () => {
    const eventType = (formData.type || 'DEFAULT') as string;
    const pub =
      accountRole === 'ADMIN'
        ? publisher.allData.find((item) => formData.publisher === item.f_publisher_id.toString())
        : publisher.allData.find((item) => item.project_id === curProject?.f_project_id);
    return {
      url: envs.value?.httpURL.replace(':projectName', projectName),
      body: formData.body,
      params: {
        eventType,
        timestamp: Date.now()
      },
      headers: {
        Authorization: pub?.f_token,
        'Content-Type': 'application/octet-stream'
      }
    };
  };

  return (
    <Drawer
      isOpen={publisher.showPublishEventRequestTemplates}
      placement="right"
      size="xl"
      onClose={() => {
        publisher.showPublishEventRequestTemplates = false;
      }}
    >
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
                      <Tab fontSize={"14px"} key={item} _selected={{ color: '#855EFF', fontWeight: 700, borderRight: '2px solid #855EFF' }}>
                        {item}
                      </Tab>
                    ))}
                  </TabList>
                  <TabPanels p="0px">
                    {languages.map((language) => {
                      const codeStr = getHTTPRequestTemplate({
                        ...getHttpProps(),
                        language
                      });
                      return (
                        <TabPanel key={language}>
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
                            <MonacoEditor
                              width="100%"
                              height="calc(100vh - 180px)"
                              theme="vs-dark"
                              language={language}
                              value={codeStr}
                              options={{
                                minimap: {
                                  enabled: false
                                }
                              }}
                            />
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
                    {languages.map((language) => {
                      const codeStr = getMQTTRequestTemplate({
                        language,
                        projectName,
                        url: envs.value?.mqttURL,
                        message: formData.body
                      });
                      return (
                        <TabPanel key={language}>
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
                            <MonacoEditor
                              width="100%"
                              height="calc(100vh - 180px)"
                              theme="vs-dark"
                              language={language}
                              value={codeStr}
                              options={{
                                minimap: {
                                  enabled: false
                                }
                              }}
                            />
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
