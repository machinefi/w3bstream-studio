import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();

export const config = {
  NEXT_PUBLIC_API_URL: publicRuntimeConfig.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
};
