const getJavascriptTemplate = (
  url: string,
  params: {
    eventID: string;
    eventType: string;
    timestamp: number;
  },
  body: string
) => {
  return `
fetch('${url}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/octet-stream'
  },
  params: ${JSON.stringify(params)},
  body: ${body}
})
.then(response => response.json())
.then(console.log)
.catch(console.error)
  `;
};

export default getJavascriptTemplate;
