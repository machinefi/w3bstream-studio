const getJavascriptTemplate = (
  url: string,
  headers: { [key: string]: string },
  params: {
    eventType: string;
    timestamp: number;
  },
  body: string
) => {
  return `
fetch('${url}', {
  method: 'POST',
  headers: ${JSON.stringify(headers)},
  params: ${JSON.stringify(params)},
  body: ${JSON.stringify(body)}
})
.then(response => response.json())
.then(console.log)
.catch(console.error)
  `;
};

export default getJavascriptTemplate;
