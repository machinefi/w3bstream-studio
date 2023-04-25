import { PublishEventRequestBody } from '@/store/lib/w3bstream/schema/publisher';

const getRequestBody = (body: PublishEventRequestBody) => {
  return Object.entries(body)
    .map(([key, value]) => {
      return `"${key}": ${JSON.stringify(value)}`;
    })
    .join(',');
};

const getRustTemplate = (url: string, projectName: string, body: PublishEventRequestBody) => `extern crate reqwest;
extern crate serde;
extern crate serde_json;

use serde_json::json;
use reqwest::Client;

#[tokio::main]
async fn main() ->  Result<()> {
let request_body = json!({
  ${getRequestBody(body)}
});
let request_url = ${url};
let response = Client::new()
  .post(request_url)
  .json(&request_body)
  .send().await?;

let result = response.json().await?;
println!("result={:?}", result);

Ok(())
}`;
export default getRustTemplate;
