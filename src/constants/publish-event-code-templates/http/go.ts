import { publicConfig } from '@/constants/config';
import { PublishEventRequestBody } from '@/store/lib/w3bstream/schema/publisher';

const getGolangTemplate = (projectName: string, body: PublishEventRequestBody) => `package main

import (
  "fmt"
  "strings"
  "net/http"
  "io/ioutil"
)

func main() {
  url := ${publicConfig.httpURL}

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

export default getGolangTemplate;
