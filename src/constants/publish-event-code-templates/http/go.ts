const headers = {
  'Content-Type': 'text/plain'
};

const getGolangTemplate = (
  projectName: string,
  body: {
    [x: string]: any;
  }
) => `package main

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

export default getGolangTemplate;
