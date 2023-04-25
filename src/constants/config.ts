import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

export const publicConfig = {
  version: 'v0.1.5',
  httpURL: publicRuntimeConfig['NEXT_PUBLIC_GATEWAY_HTTP_URL'] || 'https://dev.w3bstream.com/api/w3bapp/event/:projectName',
  mqttURL: publicRuntimeConfig['NEXT_PUBLIC_GATEWAY_MQTT_URL'] || 'mqtt://dev.w3bstream.com:1883'
};
