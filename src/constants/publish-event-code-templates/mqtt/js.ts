const getJavascriptTemplate = (url: string, projectName: string, message: string) => `const { connectAsync } = require('async-mqtt');

const handler = async () => {
  const topic = '${projectName}';
  const message = ${JSON.stringify(message)};
  const client = await connectAsync('${url}');
  const result = await client.publish(topic, message);
  await client.end();
  return result;
};

handler().then(console.log).catch(console.error);
`;

export default getJavascriptTemplate;
