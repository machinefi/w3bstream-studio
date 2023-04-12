import getGolangTemplate from "./go";
import getJavascriptTemplate from "./js";
import getRustTemplate from "./rust";

export const getHTTPRequestTemplate = (
    language: string,
    projectName: string,
    body: {
      [x: string]: any;
    }
  ) => {
    switch (language) {
      case 'javascript':
        return getJavascriptTemplate(projectName, body);
      case 'go':
        return getGolangTemplate(projectName, body);
      case 'rust':
        return getRustTemplate(projectName, body);
      default:
        return '';
    }
  };