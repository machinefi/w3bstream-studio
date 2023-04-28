import getGolangTemplate from './go';
import getJavascriptTemplate from './js';
import getRustTemplate from './rust';

export const getHTTPRequestTemplate = ({
  language,
  url,
  params,
  body
}: {
  language: string;
  url: string;
  params: {
    eventID: string;
    eventType: string;
    timestamp: number;
  };
  body: string;
}) => {
  switch (language) {
    case 'javascript':
      return getJavascriptTemplate(url, params, body);
    case 'go':
      return getGolangTemplate(url, params, body);
    case 'rust':
      return getRustTemplate(url, params, body);
    default:
      return '';
  }
};
