import React from 'react';
import { observer } from 'mobx-react-lite';
import { JSONSchemaState } from '@/store/standard/JSONSchemaState';
import Form from '@rjsf/chakra-ui';

interface Props {
  jsonstate: JSONSchemaState<any>;
  children?: any;
}

export const JSONForm = observer(({ children, jsonstate: jsonState }: Props) => {
  if (!jsonState.dynamicData.ready) return <></>;
  return (
    <Form
      formData={jsonState.formData}
      readonly={jsonState.readonly}
      uiSchema={jsonState.uiSchema}
      schema={jsonState.schema}
      onChange={jsonState.onChange}
      onSubmit={jsonState.onSubmit}
      validator={jsonState.validator}
      widgets={jsonState.widgets}
    >
      {children && children}
    </Form>
  );
});
