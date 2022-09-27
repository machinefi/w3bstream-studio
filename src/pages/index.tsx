import React, { useEffect } from 'react';
import { createStyles, Container, Text, Button, Group, useMantineTheme, Box } from '@mantine/core';
import MainLayout from '@/components/Layout';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import { observer, useLocalObservable } from 'mobx-react-lite';
import Form, { FormState, IChangeEvent } from '@rjsf/core';
import { Code } from '@mantine/core';

const DEMO = observer(() => {
  const { w3s } = useStore();

  return (
    <Container>
      {[w3s.config, w3s.login, w3s.createProject].map((i) => {
        return (
          <Box key={i.schema.title} mt="xl">
            <Form formData={i.formData} uiSchema={i.uiSchema} schema={i.schema} onChange={i.onChange} onSubmit={i.onSubmit} validator={i.validator} />
          </Box>
        );
      })}
      <Box mt="xl">
        Projects:
        <Code block>{w3s.projects.value?.data.map((i) => `${i.name}-${i.version}-${i.createdAt}\n`)}</Code>
      </Box>
      {[w3s.deployProject, w3s.appletList].map((i) => {
        return (
          <Box key={i.schema.title} mt="xl">
            <Form formData={i.formData} uiSchema={i.uiSchema} schema={i.schema} onChange={i.onChange} onSubmit={i.onSubmit} validator={i.validator} />
          </Box>
        );
      })}
      <Box mt="xl">
        Applets:
        <Code block>{w3s.applets.value?.data.map((i) => `${i.name}-${i.createdAt}\n`)}</Code>
      </Box>
    </Container>
  );
});
export default DEMO;
