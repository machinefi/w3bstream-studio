import getGolangTemplate from './go';
import getJavascriptTemplate from './js';
import getRustTemplate from './rust';

export const getHTTPRequestTemplate = ({
  language,
  headers,
  url,
  params,
  body
}: {
  language: string;
  url: string;
  headers: { [key: string]: string };
  params: {
    eventType: string;
    timestamp: number;
  };
  body: string;
}) => {
  switch (language) {
    case 'javascript':
      return getJavascriptTemplate(url, headers, params, body);
    case 'go':
      return getGolangTemplate(url, headers, params, body);
    case 'rust':
      return getRustTemplate(url, headers, params, body);
    default:
      return '';
  }
};
