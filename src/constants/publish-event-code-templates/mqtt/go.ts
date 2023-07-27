const getGolangTemplate = (url: string, projectName: string, message: string) => `package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path"
	"strconv"
	"strings"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/golang/protobuf/proto"
	"github.com/google/uuid"
	"github.com/pkg/errors"

	"github.com/machinefi/w3bstream/pkg/depends/base/types"
	confmqtt "github.com/machinefi/w3bstream/pkg/depends/conf/mqtt"
	"github.com/machinefi/w3bstream/pkg/depends/protocol/eventpb"
	"github.com/machinefi/w3bstream/pkg/depends/x/misc/retry"
	"github.com/machinefi/w3bstream/pkg/modules/event"
)

var (
	broker *confmqtt.Broker
	raw    []byte         // mqtt message
	msg    *eventpb.Event // mqtt message (protobuf)
	topic  string
	cid    string
)

func init() {

	cid = uuid.NewString()
	token := "\${headers.Authorization}"
	topic = "\${projectName}"
	data := ""
	urls := strings.Split("\${url}", ":")
	scheme := urls[0]
	host := urls[1][2:]
	port, _ := strconv.Atoi(urls[2])

	broker = &confmqtt.Broker{
		Server: types.Endpoint{
			Scheme:   scheme,
			Hostname: host,
			Port:     uint16(port),
			// if have username and password
			//Username: "",
			//Password: types.Password(""),
		},
		Retry:     *retry.Default,
		Timeout:   types.Duration(time.Second * time.Duration(10)),
		Keepalive: types.Duration(time.Second * time.Duration(10)),
		QoS:       confmqtt.QOS__ONCE,
	}

	broker.SetDefault()
	if err := broker.Init(); err != nil {
		panic(errors.Wrap(err, "init broker"))
	}

	var err error

	pl := []byte(data)
	if len(data) > 0 && data[0] == '@' {
		pl, err = os.ReadFile(data[1:])
		if err != nil {
			panic(errors.Wrap(err, "read file: "+data[1:]))
		}
	}

	msg = &eventpb.Event{
		Header: &eventpb.Header{
			Token:   token,
			PubTime: time.Now().UTC().UnixMicro(),
			EventId: uuid.NewString(),
			PubId:   uuid.NewString(),
		},
		Payload: pl,
	}

	raw, err = proto.Marshal(msg)
	if err != nil {
		panic(errors.Wrap(err, "build message"))
	}
}

func main() {
	c, err := broker.Client(cid)
	if err != nil {
		fmt.Println(err)
		return
	}
	err = c.WithTopic(topic).Publish(raw)
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(">>>> message published")

	rspChannel := path.Join(topic, cid)
	rspChan := make(chan interface{}, 0)

	err = c.WithTopic(rspChannel).Subscribe(func(cli mqtt.Client, msg mqtt.Message) {
		fmt.Println("<<<< message ack received")
		rsp := &event.EventRsp{}
		if err = json.Unmarshal(msg.Payload(), rsp); err != nil {
			fmt.Println(err)
		}
		ack, err := json.MarshalIndent(rsp, "", "  ")
		if err != nil {
			fmt.Println(err)
		}
		fmt.Println(string(ack))
		rspChan <- 0
	})
	if err != nil {
		fmt.Println(err)
	}
	select {
	case <-rspChan:
	case <-time.After(time.Second * time.Duration(10)):
		fmt.Println("**** message ack timeout")
	}
	_ = c.WithTopic(rspChannel).Unsubscribe()
}
`;

export default getGolangTemplate;
