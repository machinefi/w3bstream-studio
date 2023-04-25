import { PublishEventRequestBody } from '@/store/lib/w3bstream/schema/publisher';
import getGolangTemplate from './go';
import getJavascriptTemplate from './js';
import getRustTemplate from './rust';

export const getHTTPRequestTemplate = ({ language, url, projectName, body }: { language: string; url: string; projectName: string; body: PublishEventRequestBody }) => {
  switch (language) {
    case 'javascript':
      return getJavascriptTemplate(url, projectName, body);
    case 'go':
      return getGolangTemplate(url, projectName, body);
    case 'rust':
      return getRustTemplate(url, projectName, body);
    default:
      return '';
  }
};
