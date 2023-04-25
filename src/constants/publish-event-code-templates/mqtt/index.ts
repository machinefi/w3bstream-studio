import getGolangTemplate from './go';
import getJavascriptTemplate from './js';
import getRustTemplate from './rust';

export const getMQTTRequestTemplate = ({ language, url, projectName, message }: { language: string; url: string; projectName: string; message: string }) => {
  switch (language) {
    case 'javascript':
      return getJavascriptTemplate(url, projectName, message);
    case 'go':
      return getGolangTemplate(url, projectName, message);
    case 'rust':
      return getRustTemplate(url, projectName, message);
    default:
      return '';
  }
};
