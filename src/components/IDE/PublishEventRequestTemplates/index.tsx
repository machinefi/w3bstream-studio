import { observer, useLocalObservable } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { Box, Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, Select } from '@chakra-ui/react';
import MonacoEditor from '@monaco-editor/react';
import copy from 'copy-to-clipboard';
import toast from 'react-hot-toast';

const PublishEventRequestTemplates = observer(() => {
  const { w3s } = useStore();

  const store = useLocalObservable(() => ({
    curTemplateKey: '',
    curTemplate: {
      language: 'javascript',
      code: ''
    },
    templates: ['cURL', 'JS', 'Go', 'Rust'],
    get requestData() {
      const { projectID } = w3s.publishEvent.form.formData;
      const project = w3s.allProjects.value.find((item) => item.f_project_id.toString() === projectID);
      const data = w3s.publishEvent.generateBody();
      return {
        data,
        projectName: project?.f_name
      };
    },
    setData(v: Partial<{ curTemplateKey: string; curTemplate: { language: string; code: string } }>) {
      Object.assign(store, v);
    }
  }));

  const onClose = () => {
    w3s.showPublishEventRequestTemplates = false;
  };

  return (
    <Drawer isOpen={w3s.showPublishEventRequestTemplates} placement="right" size="lg" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Publish Event Request Templates</DrawerHeader>
        <DrawerBody>
          <Box h="100%">
            <Select
              mb="2"
              placeholder="Select a template"
              value={store.curTemplateKey}
              onChange={(e) => {
                const { value: curTemplateKey } = e.target;
                if (curTemplateKey) {
                  store.setData({
                    curTemplateKey,
                    curTemplate: getTemplate(curTemplateKey, store.requestData)
                  });
                }
              }}
            >
              {store.templates.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </Select>
            <MonacoEditor width="100%" height="100%" theme="vs-dark" language={store.curTemplate.language} value={store.curTemplate.code} />
          </Box>
        </DrawerBody>
        <DrawerFooter>
          <Button
            colorScheme="blue"
            onClick={() => {
              copy(store.curTemplate.code);
              toast.success('Copied');
            }}
          >
            Copy
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
});

const getTemplate = (curTemplateKey: string, { projectName, data }: { projectName: string; data: any }) => {
  if (curTemplateKey === 'cURL') {
    return {
      language: 'batch',
      code: `curl --location --request POST 'localhost:8888/srv-applet-mgr/v0/event/${projectName}' --header 'Content-Type: text/plain' --data-raw '${JSON.stringify(data)}'`
    };
  }

  if (curTemplateKey === 'JS') {
    return {
      language: 'javascript',
      code: `const url = 'http://localhost:8888/srv-applet-mgr/v0/event/${projectName}'\nconst data = ${JSON.stringify(
        data
      )}\n\nfetch(url, { \n  method: 'POST',\n  headers: {\n    'Content-Type': 'text/plain' \n  },\n  body: JSON.stringify(data)\n}).then(data => {\n  response.json();\n}).then(data => {\n  console.log(data);\n});`
    };
  }

  if (curTemplateKey === 'Go') {
    return {
      language: 'go',
      code: `package main\n\nimport (\n  "fmt"\n  "net/http"\n  "io/ioutil"\n)\n\nfunc main() {\n  url:= "http://localhost:8888/srv-applet-mgr/v0/event/${projectName}"\n  jsonStr :=[]byte(\`${JSON.stringify(
        data
      )}\`)\n  req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonStr))\n  req.Header.Set("Content-Type", "text/plain")\n  client := &http.Client{}\n  resp, err := client.Do(req)\n  if err != nil {\n    fmt.Println("Request failed:", err)\n    return\n  }\n  defer resp.Body.Close()\n  body, err := ioutil.ReadAll(rsps.Body)\n  if err != nil {\n    fmt.Println("Read body failed:", err)\n    return\n  }\n  fmt.Println(string(body))\n}`
    };
  }

  if (curTemplateKey === 'Rust') {
    return {
      language: 'rust',
      code: ``
    };
  }

  return {
    language: 'javascript',
    code: ''
  };
};

export default PublishEventRequestTemplates;
