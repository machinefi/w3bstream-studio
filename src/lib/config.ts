import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();

export const config = {
  VSCODE_GRAPHQL_WS_ENDPOINT: publicRuntimeConfig.VSCODE_GRAPHQL_WS_ENDPOINT || 'ws://127.0.0.1:4000/graphql'
};
