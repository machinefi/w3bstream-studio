import { FromSchema } from 'json-schema-to-ts';

export const createFlowSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', title: 'Flow Name' },
  },
  required: ['name'],
} as const;

export const codeNodeSchema = {
  type: 'object',
  properties: {
    label: { type: 'string', title: 'Node Label' },
    code: { type: 'string', title: 'Code' },
  },
  required: ['label'],
} as const;

export const webhookNodeSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', title: 'ID', readonly: true },
    label: { type: 'string', title: 'Node Label' },
    url: { type: 'string', title: 'URL', readonly: true },
    authentication: {
      type: 'string',
      title: 'Authentication',
    },
    method: {
      type: 'string',
      title: 'Method',
      enum: ['GET', 'POST', 'PUT', 'DELETE'],
      default: 'GET',
    },
    body: { type: 'string', title: 'Body' },
  },
  required: ['label', 'url', 'authentication', 'method'],
} as const;

export const envSchema = {
  type: 'object',
  properties: {
    env: { type: 'string', title: ' ' },
  },
} as const;

export type CreateFlowSchemaType = FromSchema<typeof createFlowSchema>;
export type CodeNodeSchemaType = FromSchema<typeof codeNodeSchema>;
export type WebhookNodeSchemaType = FromSchema<typeof webhookNodeSchema>;
export type EnvSchemaType = FromSchema<typeof envSchema>;
