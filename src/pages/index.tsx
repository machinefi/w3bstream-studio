import React, { useEffect } from 'react';
import { createStyles, Container, Text, Button, Group, useMantineTheme, Box, Select, Textarea, Title, Center } from '@mantine/core';
import { useStore } from '../store';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { Code } from '@mantine/core';
import { JSONForm } from '../components/JSONForm/index';
import { Copy } from '../components/Common/Copy';

const STATUS = ['', 'idle', 'running', 'stop'];

const DEMO = observer(() => {
  const { w3s } = useStore();

  return (
    <Container size={'md'}>
      <Box mt="50px"></Box>
      <Center>
        <Title>Welcome to W3bstream!</Title>
      </Center>
      <Box sx={{ display: 'flex' }}>
        {!w3s.isLogin && (
          <Box m="md">
            <Box>
              <JSONForm jsonstate={w3s.login} />
            </Box>
          </Box>
        )}
        {w3s.isLogin && (
          <Box>
            <Box m="md">
              <JSONForm jsonstate={w3s.createProject} />
            </Box>
            <Box m="md">
              <JSONForm jsonstate={w3s.uploadWASMScript} />
            </Box>
          </Box>
        )}

        {w3s.isLogin && (
          <Box ml={30} mt={30} sx={{ minWidth: '400px' }}>
            <Box>Project Management</Box>
            <Box mt="md">
              <Code block>
                {w3s.allProjects.value.map((i, index) => {
                  return (
                    <Group>
                      <Box sx={{ color: w3s.curProjectIndex == index ? 'black' : '#999', cursor: 'pointer' }} onClick={(e) => (w3s.curProjectIndex = index)}>{`${i.f_name}`}</Box>
                      <Box>({i.applets.length})</Box>
                      <Box>{i.f_project_id}</Box>
                    </Group>
                  );
                })}
              </Code>
            </Box>

            <Box mt="md">
              Applets:
              {!!w3s.curProject && (
                <Code block>
                  {w3s.curProject.applets.map((i, index) => {
                    return (
                      <Group>
                        <Box sx={{ color: w3s.curAppletIndex == index ? 'black' : '#999', cursor: 'pointer' }} onClick={(e) => (w3s.curAppletIndex = index)}>{`${i.f_name}`}</Box>
                        <Box>({i.instances.length})</Box>
                        <Box>{i.f_applet_id}</Box>
                        {i.instances.length > 0 ? (
                          <Group>
                            <Button color="blue" size="xs" onClick={(e) => w3s.publishEvent.call({ appletID: i.f_applet_id, projectID: i.f_project_id })}>
                              Send Event
                            </Button>
                            <Copy
                              value={`curl --location --request POST 'localhost:8888/srv-applet-mgr/v0/event/${i.f_project_id}/${i.f_applet_id}/start' --header 'publisher: "admin"' --header 'Content-Type: text/plain' --data-raw 'input event'`}
                            ></Copy>
                          </Group>
                        ) : (
                          <Button disabled={i.instances.length > 0} color="dark" size="xs" onClick={(e) => w3s.deployApplet.call({ appletID: i.f_applet_id })}>
                            Deploy
                          </Button>
                        )}
                      </Group>
                    );
                  })}
                </Code>
              )}
            </Box>

            <Box mt="md">
              Instance:
              {!!w3s.curApplet && (
                <Code block>
                  {w3s.curApplet.instances.map((i, index) => {
                    return (
                      <Box>
                        <Box>{`${i.f_instance_id}`}</Box>
                        <Box>Status: {STATUS[i.f_state]}</Box>
                        <Group>
                          <Button color="green" size="xs" mx="xs" onClick={(e) => w3s.handleInstance.call({ instaceID: i.f_instance_id, event: 'START' })}>
                            Start
                          </Button>
                          <Button color="yellow" size="xs" mx="xs" onClick={(e) => w3s.handleInstance.call({ instaceID: i.f_instance_id, event: 'Restart' })}>
                            Restart
                          </Button>
                          <Button color="red" size="xs" onClick={(e) => w3s.handleInstance.call({ instaceID: i.f_instance_id, event: 'STOP' })}>
                            Stop
                          </Button>
                        </Group>
                        <Box mt="md"></Box>
                      </Box>
                    );
                  })}
                </Code>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* <Box mt="md">
        Applets:
        <pre>
          {w3s.applets.value?.data.map((i) => {
            return (
              <Group>
                <Box sx={{ width: '100px' }}>{`${i.name}\n`}</Box>
                <Button color="dark" size="xs" onClick={(e) => w3s.deployApplet.call({ appletID: i.appletID })}>
                  Deploy
                </Button>
                <Button size="xs" mx="xs" onClick={(e) => w3s.publishEvent.call({ projectID: i.projectID, appletID: i.appletID, event: 'start' })}>
                  Start
                </Button>
                <Button color="red" size="xs" onClick={(e) => w3s.publishEvent.call({ projectID: i.projectID, appletID: i.appletID, event: 'stop' })}>
                  Stop
                </Button>
              </Group>
            );
          })}
        </pre>
      </Box> */}
    </Container>
  );
});
export default DEMO;
