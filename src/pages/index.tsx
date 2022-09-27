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
      {w3s.forms.map((i, index) => {
        return (
          <Box key={index} mt="xl">
            <Form formData={i.formData} uiSchema={i.uiSchema} schema={i.schema} onChange={i.onChange} onSubmit={i.onSubmit} validator={i.validator} />
          </Box>
        );
      })}
      <Code block>{JSON.stringify(w3s.projects.value, null, 2)}</Code>
    </Container>
  );
});
export default DEMO;
