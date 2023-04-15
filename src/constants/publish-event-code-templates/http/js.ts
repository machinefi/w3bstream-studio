import { publicConfig } from '@/constants/config';
import { PublishEventRequestBody } from '@/store/lib/w3bstream/schema/publisher';

const getJavascriptTemplate = (projectName: string, body: PublishEventRequestBody) => {
  const { events } = body;
  return `
const data = {
  "events": [
    ${events.map((item) => {
      return `{
        ${Object.entries(item)
          .map(([key, value]) => {
            if (key === 'payload') {
              return `"${key}": btoa(JSON.stringify(${JSON.stringify(
                {
                  example: 'This is is an example payload'
                },
                null,
                2
              )}))`;
            }
            return `"${key}": ${JSON.stringify(value)}`;
          })
          .join(',')}
      }`;
    })}
  ]
}

fetch('${publicConfig.httpURL}', {
  method: 'POST',
  body: JSON.stringify(data)
})
.then(response => response.json())
.then(console.log)
.catch(console.error)
  `;
};

export default getJavascriptTemplate;
