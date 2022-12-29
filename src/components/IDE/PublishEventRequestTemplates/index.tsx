import { observer, useLocalObservable } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { Box, Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, Select } from '@chakra-ui/react';
import MonacoEditor from '@monaco-editor/react';
import copy from 'copy-to-clipboard';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

const PublishEventRequestTemplates = observer(() => {
  const { w3s } = useStore();

  const store = useLocalObservable(() => ({
    curTemplateKey: '',
    curTemplate: {
      language: 'javascript',
      code: ''
    },
    templates: ['cURL', 'JS', 'Go', 'Rust'],
    requestData() {
      const { projectID } = w3s.publisher.publishEventForm.formData;
      const project = w3s.allProjects.value.find((item) => item.f_project_id.toString() === projectID);
      const data = w3s.publisher.generateBody();
      return {
        data,
        projectName: project?.f_name
      };
    },
    setData(v: Partial<{ curTemplateKey: string; curTemplate: { language: string; code: string } }>) {
      Object.assign(store, v);
    }
  }));

  useEffect(() => {
    const curTemplateKey = store.curTemplateKey || 'JS';
    store.setData({
      curTemplateKey,
      curTemplate: getTemplate(curTemplateKey, store.requestData())
    });
  }, [w3s.publisher.publishEventForm.formData]);

  const onClose = () => {
    w3s.publisher.showPublishEventRequestTemplates = false;
  };

  return (
    <Drawer isOpen={w3s.publisher.showPublishEventRequestTemplates} placement="right" size="lg" onClose={onClose}>
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
                    curTemplate: getTemplate(curTemplateKey, store.requestData())
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

export const ShowRequestTemplatesButton = observer(() => {
  const { w3s } = useStore();
  return (
    <Button
      mt="10px"
      w="100%"
      h="32px"
      variant="outline"
      borderColor="#6FB2FF"
      color="#6FB2FF"
      onClick={() => {
        const { projectID } = w3s.publisher.publishEventForm.formData;
        if (!projectID) {
          toast.error('Please select the project first');
          return;
        }
        w3s.publisher.showPublishEventRequestTemplates = true;
      }}
    >
      Show Request Templates
    </Button>
  );
});

export const ShowRequestTemplatesButtonWidget = () => {
  return <ShowRequestTemplatesButton />;
};

const getTemplate = (curTemplateKey: string, { projectName, data }: { projectName: string; data: any }) => {
  if (curTemplateKey === 'cURL') {
    return {
      language: 'batch',
      code: `curl --location --request POST '${window.location.origin}/api/w3bapp/event/${projectName}' --header 'Content-Type: text/plain' --data-raw '${JSON.stringify(data)}'`
    };
  }

  if (curTemplateKey === 'JS') {
    return {
      language: 'javascript',
      code: `const url = '${window.location.origin}/api/w3bapp/event/${projectName}'\nconst data = ${JSON.stringify(
        data
      )}\n\nfetch(url, { \n  method: 'POST',\n  headers: {\n    'Content-Type': 'text/plain' \n  },\n  body: JSON.stringify(data)\n}).then(response => {\n  return response.json();\n}).then(data => {\n  console.log(data);\n});`
    };
  }

  if (curTemplateKey === 'Go') {
    return {
      language: 'go',
      code: `package main\n\nimport (\n  "fmt"\n  "net/http"\n  "io/ioutil"\n)\n\nfunc main() {\n  url:= "${
        window.location.origin
      }/api/w3bapp/event/${projectName}"\n  jsonStr :=[]byte(\`${JSON.stringify(
        data
      )}\`)\n  req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonStr))\n  req.Header.Set("Content-Type", "text/plain")\n  client := &http.Client{}\n  resp, err := client.Do(req)\n  if err != nil {\n    fmt.Println("Request failed:", err)\n    return\n  }\n  defer resp.Body.Close()\n  body, err := ioutil.ReadAll(rsps.Body)\n  if err != nil {\n    fmt.Println("Read body failed:", err)\n    return\n  }\n  fmt.Println(string(body))\n}`
    };
  }

  if (curTemplateKey === 'Rust') {
    return {
      language: 'rust',
      code: `use std::collections::HashMap;\nuse reqwest::header::HeaderMap;\nuse serde_json::value::Value;\n\nasync fn publish_event() -> Result<HashMap<String, Value>, reqwest::Error>{\n  let client = reqwest::Client::new();\n\n  let mut headers = HeaderMap::new();\n  headers.insert("Content-Type", "text/plain".parse().unwrap());\n\n  let mut header = HashMap::new();\n  header.insert("event_type", "${
        data.header.event_type
      }")\n  header.insert("pub_id", "${data.header.pub_id}")\n  header.insert("token", "${data.header.token}")\n  header.insert("pub_time", "${
        data.header.pub_time
      }")\n  let mut data = HashMap::new();\n  data.insert("header", header)\n  data.insert("payload", ${JSON.stringify(data.payload)});\n  Ok(client.post("${
        window.location.origin
      }/api/w3bapp/event/${projectName}").headers(headers).json(&data).send().await?.json::<HashMap<String, Value>>().await?);\n}\n\nasync fn main() {\n  if let Ok(res) = publish_event().await {\n    println!("{:#?}", res);\n  }\n}`
    };
  }

  return {
    language: 'javascript',
    code: ''
  };
};

export default PublishEventRequestTemplates;
