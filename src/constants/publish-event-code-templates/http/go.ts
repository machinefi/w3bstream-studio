const getGolangTemplate = (
  url: string,
  headers: { [key: string]: string },
  params: {
    eventType: string;
    timestamp: number;
  },
  body: string
) => `package main

import (
  "fmt"
  "strings"
  "net/http"
  "io/ioutil"
)

func main() {
  url := "${url}"

  method := "POST"

  payload := strings.NewReader(
    ${JSON.stringify(body)}
  )

  client := &http.Client {}

  req, err := http.NewRequest(method, url, payload)
  req.Header.Add("Authorization", "${headers.Authorization}");
  req.Header.Add("Content-Type", "application/octet-stream");
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
