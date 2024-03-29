import { generateOpenApiDocument } from 'trpc-openapi';

import { appRouter } from './routers/_app';

// Generate OpenAPI schema document
export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'Example CRUD API',
  description: 'OpenAPI compliant REST API built using tRPC with Next.js',
  version: '1.0.0',
  baseUrl: `localhost:3000/api`,
  docsUrl: 'https://github.com/jlalmes/trpc-openapi',
  tags: []
});
