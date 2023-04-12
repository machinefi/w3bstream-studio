import { publicConfig } from '../../config';

const getJavascriptTemplate = (projectName: string, message: string) => `const { connectAsync } = require('async-mqtt');

const handler = async () => {
  const topic = '${projectName}';
  const message = '${message}';
  const client = await connectAsync('${publicConfig.mqttURL}');
  const result = await client.publish(topic, message);
  await client.end();
  return result;
};

handler().then(console.log).catch(console.error);
`;

export default getJavascriptTemplate;
