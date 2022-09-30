import React, { useEffect } from 'react';
import { createStyles, Container, Text, Button, Group, useMantineTheme, Box, Select, Textarea } from '@mantine/core';
import { useStore } from '../store';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { Code } from '@mantine/core';
import { JSONForm } from '../components/JSONForm/index';

const STATUS = ['', 'idle', 'running', 'stop'];

const DEMO = observer(() => {
  const { w3s } = useStore();

  return (
    <Container>
      <Box sx={{ display: 'flex' }}>
        <Box>
          {[w3s.config, w3s.login, w3s.createProject, w3s.uploadWASMScript].map((i) => {
            return (
              <Box key={i.schema.title} mt="xl">
                <JSONForm jsonstate={i} />
              </Box>
            );
          })}
        </Box>

        <Box ml={30} mt={30} sx={{ minWidth: '400px' }}>
          <Box mt="xl">
            Projects:
            <Code block>
              {w3s.allProjects.value.map((i, index) => {
                return (
                  <Group>
                    <Box sx={{ color: w3s.curProjectIndex == index ? 'black' : '#999' }} onClick={(e) => (w3s.curProjectIndex = index)}>{`${i.f_name}`}</Box>
                    <Box>({i.applets.length}):</Box>
                    <Box>{i.f_project_id}</Box>
                  </Group>
                );
              })}
            </Code>
          </Box>

          <Box mt="xl">
            Applets:
            {!!w3s.curProject && (
              <Code block>
                {w3s.curProject.applets.map((i, index) => {
                  return (
                    <Group>
                      <Box sx={{ color: w3s.curAppletIndex == index ? 'black' : '#999' }} onClick={(e) => (w3s.curAppletIndex = index)}>{`${i.f_name}`}</Box>
                      <Box>({i.instances.length}):</Box>
                      <Box>{i.f_applet_id}</Box>
                      <Group>
                        <Button disabled={i.instances.length > 0} color="dark" size="xs" onClick={(e) => w3s.deployApplet.call({ appletID: i.f_applet_id })}>
                          Deploy
                        </Button>

                        <Button color="blue" size="xs" onClick={(e) => w3s.publishEvent.call({ appletID: i.f_applet_id, projectID: i.f_project_id })}>
                          Send Event
                        </Button>
                      </Group>
                    </Group>
                  );
                })}
              </Code>
            )}
          </Box>

          <Box mt="xl">
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
                      <Box mt="xl"></Box>
                    </Box>
                  );
                })}
              </Code>
            )}
          </Box>
        </Box>
      </Box>

      {/* <Box mt="xl">
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
