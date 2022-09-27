import React, { useEffect } from 'react';
import { createStyles, Container, Text, Button, Group, useMantineTheme } from '@mantine/core';
import MainLayout from '@/components/Layout';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import { observer } from 'mobx-react-lite';
import Form, { FormState, IChangeEvent } from '@rjsf/core';

const DEMO = observer(() => {
  const { w3s } = useStore();
  return (
    <Container>
      <Form {...w3s.config} />
      <div>{w3s.config.formData.w3bsream?.apiUrl}</div>
    </Container>
  );
});
export default DEMO;
