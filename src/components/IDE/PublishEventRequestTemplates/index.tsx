import { observer, useLocalObservable } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { Box, Button, ButtonProps, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import MonacoEditor from '@monaco-editor/react';
import copy from 'copy-to-clipboard';
import toast from 'react-hot-toast';
import { defaultButtonStyle, defaultOutlineButtonStyle } from '@/lib/theme';
import { helper } from '@/lib/helper';
import { CopyIcon } from '@chakra-ui/icons';
import { publicConfig } from '@/constants/config';

export const ShowRequestTemplatesButton = observer(({ props = {} }: { props?: ButtonProps }) => {
  const {
    w3s: {
      publisher,
      config: {
        form: {
          formData: { accountRole }
        }
      }
    }
  } = useStore();
  return (
    <Button
      {...defaultOutlineButtonStyle}
      {...props}
      onClick={() => {
        if (accountRole === 'ADMIN') {
          const { projectName } = publisher.publishEventForm.formData;
          if (!projectName) {
            toast.error('Please select the project first');
            return;
          }
        }
        publisher.showPublishEventRequestTemplates = true;
      }}
    >
      API Code Sample
    </Button>
  );
});

export const ShowRequestTemplatesButtonWidget = () => {
  return <ShowRequestTemplatesButton props={{ mt: '10px', w: '100%', h: '32px' }} />;
};

const PublishEventRequestTemplates = observer(() => {
  const {
    w3s: {
      publisher,
      config: {
        form: {
          formData: { accountRole }
        }
      },
      project: { curProject }
    }
  } = useStore();

  const store = useLocalObservable(() => ({
    get body() {
      if (accountRole === 'ADMIN') {
        const { body } = publisher.publishEventForm.formData;
        return publisher.parseBody(body);
      }
      return {
        events: [
          {
            header: {
              event_type: 'ANY',
              pub_id: '',
              token: '',
              pub_time: Date.now()
            },
            payload: helper.stringToBase64('')
          }
        ]
      };
    }
  }));

  const languages = ['javascript', 'go', 'rust'];
  const projectName = (accountRole === 'ADMIN' ? publisher.publishEventForm.formData.projectName : curProject?.f_name) || ':projectName';

  return (
    <Drawer
      isOpen={publisher.showPublishEventRequestTemplates}
      placement="right"
      size="xl"
      onClose={() => {
        publisher.showPublishEventRequestTemplates = false;
      }}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>API Code Sample</DrawerHeader>
        <DrawerBody>
          <Tabs variant="unstyled">
            <TabList>
              <Tab fontSize="xs" _selected={{ color: '#855EFF', fontWeight: 700, borderBottom: '2px solid #855EFF' }}>
                HTTP
              </Tab>
              <Tab fontSize="xs" _selected={{ color: '#855EFF', fontWeight: 700, borderBottom: '2px solid #855EFF' }}>
                MQTT
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel p="10px 0px">
                <Tabs orientation="vertical" variant="unstyled">
                  <TabList>
                    {languages.map((item) => (
                      <Tab key={item} _selected={{ color: '#855EFF', fontWeight: 700, borderRight: '2px solid #855EFF' }}>
                        {item}
                      </Tab>
                    ))}
                  </TabList>
                  <TabPanels p="0px">
                    {languages.map((item) => {
                      const codeStr = getHTTPRequestTemplate(item, { projectName, body: store.body });
                      return (
                        <TabPanel key={item}>
                          <Box pos="relative" width="100%" height="calc(100vh - 180px)">
                            <Button
                              zIndex={99}
                              pos="absolute"
                              bottom="20px"
                              right="20px"
                              {...defaultButtonStyle}
                              leftIcon={<CopyIcon />}
                              onClick={() => {
                                copy(codeStr);
                                toast.success('Copied');
                              }}
                            >
                              Copy
                            </Button>
                            <MonacoEditor width="100%" height="calc(100vh - 180px)" theme="vs-dark" language={item} value={codeStr} />
                          </Box>
                        </TabPanel>
                      );
                    })}
                  </TabPanels>
                </Tabs>
              </TabPanel>
              <TabPanel>
                <Tabs orientation="vertical" variant="unstyled">
                  <TabList>
                    {languages.map((item) => (
                      <Tab key={item} _selected={{ color: '#855EFF', fontWeight: 700, borderRight: '2px solid #855EFF' }}>
                        {item}
                      </Tab>
                    ))}
                  </TabList>
                  <TabPanels p="0px">
                    {languages.map((item) => {
                      const codeStr = getMQTTRequestTemplate(item, { projectName, message: '' });
                      return (
                        <TabPanel key={item}>
                          <Box pos="relative" width="100%" height="calc(100vh - 180px)">
                            <Button
                              zIndex={99}
                              pos="absolute"
                              bottom="20px"
                              right="20px"
                              {...defaultButtonStyle}
                              leftIcon={<CopyIcon />}
                              onClick={() => {
                                copy(codeStr);
                                toast.success('Copied');
                              }}
                            >
                              Copy
                            </Button>
                            <MonacoEditor width="100%" height="calc(100vh - 180px)" theme="vs-dark" language={item} value={codeStr} />
                          </Box>
                        </TabPanel>
                      );
                    })}
                  </TabPanels>
                </Tabs>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
});

const getHTTPRequestTemplate = (language: string, { projectName, body }: { projectName: string; body: any }) => {
  const headers = {
    'Content-Type': 'text/plain'
  };

  if (language === 'batch') {
    return `curl --location --request POST '${window.location.origin}/api/w3bapp/event/${projectName}' --header 'Content-Type: text/plain' --data-raw '${JSON.stringify(body)}'`;
  }

  if (language === 'javascript') {
    return `const data = ${JSON.stringify(body, null, 2)}

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
  }

  if (language === 'go') {
    return `package main

import (
  "fmt"
  "strings"
  "net/http"
  "io/ioutil"
)

func main() {
  url := "${window.location.origin}/api/w3bapp/event/${projectName}"

  method := "POST"

  payload := strings.NewReader(
    ${Object.entries(body).length > 0 ? `${JSON.stringify(body, null, 2)}` : '{}'}
  )

  client := &http.Client {}

  req, err := http.NewRequest(method, url, payload)

  if err != nil {
    fmt.Println(err)
    return
  }

  ${
    Object.entries(headers).length > 0 &&
    Object.entries(headers)
      .map(([key, value]) => {
        return `req.Header.Add("${key}", "${value}");`;
      })
      .join('')
  }

  res, err := client.Do(req)
  if err != nil {
    fmt.Println(err)
    return
  }

  defer res.Body.Close()

  body, err := ioutil.ReadAll(res.Body)
  if err != nil {
    fmt.Println(err)
    return
  }
  fmt.Println(string(body))
}`;
  }

  if (language === 'rust') {
    const getRequestBody = (body) => {
      if (Object.entries(body).length > 0) {
        return `"${Object.entries(body)
          .map(([key, value]) => {
            return `${key}": ${JSON.stringify(value)}`;
          })
          .join(', ')}`;
      }
      return '';
    };

    return `extern crate reqwest;
extern crate serde;
extern crate serde_json;

use serde_json::json;
use reqwest::Client;

#[tokio::main]
async fn main() ->  Result<()> {
  let request_body = json!({
    ${getRequestBody(body)}
  });
  let request_url = "${window.location.origin}/api/w3bapp/event/${projectName}";
  let response = Client::new()
      .post(request_url)
      ${Object.entries(headers).map(([key, value]) => {
        return `.header("${key}", "${value}")`;
      })}
      .json(&request_body)
      .send().await?;

  let result = response.json().await?;
  println!("result={:?}", result);

  Ok(())
}`;
  }

  return '';
};

const getMQTTRequestTemplate = (language: string, { projectName, message }: { projectName: string; message: string }) => {
  if (language === 'javascript') {
    return `const { connectAsync } = require('async-mqtt');

const handler = async () => {
  const topic = '${projectName}';
  const client = await connectAsync('${publicConfig.mqttURL}');
  const result = await client.publish(topic, message);
  await client.end();
  return result;
};

handler().then(console.log).catch(console.error);
`;
  }

  if (language === 'go') {
    return `package main
import (
  "fmt"
  "time"

  mqtt "github.com/eclipse/paho.mqtt.golang"
)

var messagePubHandler mqtt.MessageHandler = func(client mqtt.Client, msg mqtt.Message) {
  fmt.Printf("Topic: %s | %s\n", msg.Topic(), msg.Payload())
}

var connectHandler mqtt.OnConnectHandler = func(client mqtt.Client) {
  fmt.Println("Connected")
}

var connectLostHandler mqtt.ConnectionLostHandler = func(client mqtt.Client, err error) {
  fmt.Printf("Connect lost: %+v", err)
}

func main() {
  opts := mqtt.NewClientOptions()
  opts.AddBroker(fmt.Sprintf("${publicConfig.mqttURL}"))
  opts.SetClientID("go_mqtt_client")
  opts.SetUsername("admin")
  opts.SetPassword("instar")
  opts.SetDefaultPublishHandler(messagePubHandler)
  opts.OnConnect = connectHandler
  opts.OnConnectionLost = connectLostHandler
  client := mqtt.NewClient(opts)
  if token := client.Connect(); token.Wait() && token.Error() != nil {
    panic(token.Error())
  }

  sub(client)
  publish(client)

  client.Disconnect(250)
}

func publish(client mqtt.Client) {
  // Turn privacy mask 1 on and off again after 15s
  nums := []int{1, 0}
  for _, num := range nums {
    value := fmt.Sprintf("%d", num)
    token := client.Publish("cameras/115/multimedia/privacy/region1/enable/raw", 0, false, value)
    token.Wait()
    time.Sleep(15 * time.Second)
  }
}

func sub(client mqtt.Client) {
  // Subscribe to the LWT connection status
  topic := "${projectName}"
  token := client.Subscribe(topic, 1, nil)
  token.Wait()
  fmt.Println("Subscribed to LWT", topic)
}
`;
  }

  if (language === 'rust') {
    return `use std::{
  env,
  process,
  thread,
  time::Duration
};

extern crate paho_mqtt as mqtt;

const DFLT_BROKER:&str = "${publicConfig.mqttURL}";
const DFLT_CLIENT:&str = "rust_subscribe";
const DFLT_TOPICS:&[&str] = &["${projectName}"];
// The qos list that match topics above.
const DFLT_QOS:&[i32] = &[0, 1];

// Reconnect to the broker when connection is lost.
fn try_reconnect(cli: &mqtt::Client) -> bool
{
  println!("Connection lost. Waiting to retry connection");
  for _ in 0..12 {
    thread::sleep(Duration::from_millis(5000));
    if cli.reconnect().is_ok() {
      println!("Successfully reconnected");
      return true;
    }
  }
  println!("Unable to reconnect after several attempts.");
  false
}

// Subscribes to multiple topics.
fn subscribe_topics(cli: &mqtt::Client) {
  if let Err(e) = cli.subscribe_many(DFLT_TOPICS, DFLT_QOS) {
    println!("Error subscribes topics: {:?}", e);
    process::exit(1);
  }
}

fn main() {
  let host = env::args().nth(1).unwrap_or_else(||
    DFLT_BROKER.to_string()
  );

  // Define the set of options for the create.
  // Use an ID for a persistent session.
  let create_opts = mqtt::CreateOptionsBuilder::new()
    .server_uri(host)
    .client_id(DFLT_CLIENT.to_string())
    .finalize();

  // Create a client.
  let mut cli = mqtt::Client::new(create_opts).unwrap_or_else(|err| {
    println!("Error creating the client: {:?}", err);
    process::exit(1);
  });

  // Initialize the consumer before connecting.
  let rx = cli.start_consuming();

  // Define the set of options for the connection.
  let lwt = mqtt::MessageBuilder::new()
    .topic("test")
    .payload("Consumer lost connection")
    .finalize();
  let conn_opts = mqtt::ConnectOptionsBuilder::new()
    .keep_alive_interval(Duration::from_secs(20))
    .clean_session(false)
    .will_message(lwt)
    .finalize();

  // Connect and wait for it to complete or fail.
  if let Err(e) = cli.connect(conn_opts) {
    println!("Unable to connect:\n\t{:?}", e);
    process::exit(1);
  }

  // Subscribe topics.
  subscribe_topics(&cli);

  println!("Processing requests...");
  for msg in rx.iter() {
    if let Some(msg) = msg {
      println!("{}", msg);
    }
    else if !cli.is_connected() {
      if try_reconnect(&cli) {
        println!("Resubscribe topics...");
        subscribe_topics(&cli);
      } else {
        break;
      }
    }
  }

  // If still connected, then disconnect now.
  if cli.is_connected() {
    println!("Disconnecting");
    cli.unsubscribe_many(DFLT_TOPICS).unwrap();
    cli.disconnect(None).unwrap();
  }
  println!("Exiting");
}
  `;
  }

  return '';
};

export default PublishEventRequestTemplates;
