import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();

export const config = {
  NEXT_PUBLIC_API_URL: publicRuntimeConfig.NEXT_PUBLIC_API_URL || 'http://localhost:8888',
  VSCODE_GRAPHQL_WS_ENDPOINT: publicRuntimeConfig.VSCODE_GRAPHQL_WS_ENDPOINT || 'ws://127.0.0.1:4000/graphql'
};
