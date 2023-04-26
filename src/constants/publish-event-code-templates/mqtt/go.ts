const getGolangTemplate = (url: string, projectName: string, message: string) => `package main
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
  opts.AddBroker(fmt.Sprintf("${url}"))
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

export default getGolangTemplate;
