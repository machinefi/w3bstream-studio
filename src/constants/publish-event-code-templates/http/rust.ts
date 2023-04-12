const headers = {
  'Content-Type': 'text/plain'
};

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

const getRustTemplate = (
  projectName: string,
  body: {
    [x: string]: any;
  }
) => `extern crate reqwest;
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
export default getRustTemplate;
