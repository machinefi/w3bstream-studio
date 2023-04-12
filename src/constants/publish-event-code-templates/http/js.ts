const getJavascriptTemplate = (
  projectName: string,
  body: {
    [x: string]: any;
  }
) => `const data = ${JSON.stringify(body, null, 2)}

fetch('${window.location.origin}/api/w3bapp/event/${projectName}', { 
  method: 'POST',
  headers: {
    'Content-Type': 'text/plain' 
  },
  body: JSON.stringify(data)
})
.then(response => response.json())
.then(console.log)
.catch(console.error)
  `;

export default getJavascriptTemplate;
