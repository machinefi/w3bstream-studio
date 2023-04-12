import getGolangTemplate from "./go";
import getJavascriptTemplate from "./js";
import getRustTemplate from "./rust";

export const getMQTTRequestTemplate = (language: string, projectName: string, message: string) => {
  switch (language) {
    case 'javascript':
      return getJavascriptTemplate(projectName, message);
    case 'go':
      return getGolangTemplate(projectName, message);
    case 'rust':
      return getRustTemplate(projectName, message);
    default:
      return '';
  }
};