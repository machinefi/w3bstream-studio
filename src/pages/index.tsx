import React, { useEffect } from 'react';
import { createStyles, Container, Text, Button, Group, useMantineTheme, Box } from '@mantine/core';
import { useStore } from '../store';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { Code } from '@mantine/core';
import { JSONForm } from '../components/JSONForm/index';

const DEMO = observer(() => {
  const { w3s } = useStore();

  return (
    <Container>
      {[w3s.config, w3s.login, w3s.createProject].map((i) => {
        console.log(i);
        return (
          <Box key={i.schema.title} mt="xl">
            <JSONForm jsonstate={i} />
          </Box>
        );
      })}
      <Box mt="xl">
        Projects:
        <Code block>{w3s.projects.value?.data.map((i) => `${i.name}-${i.version}-${i.createdAt}\n`)}</Code>
      </Box>
      {[w3s.uploadWASMScript, w3s.appletList].map((i) => {
        return (
          <Box key={i.schema.title} mt="xl">
            <JSONForm jsonstate={i} />
          </Box>
        );
      })}
      <Box mt="xl">
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
      </Box>
      {/* {w3s.projects.value &&
        w3s.applets.value &&
        [w3s.publishEvent].map((i) => {
          return (
            <Box key={i.schema.title} mt="xl">
              <JSONForm jsonstate={i} />
            </Box>
          );
        })} */}
    </Container>
  );
});
export default DEMO;
