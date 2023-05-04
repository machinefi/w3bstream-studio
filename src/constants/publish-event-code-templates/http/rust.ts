const getRustTemplate = (
  url: string,
  headers: { [key: string]: string },
  params: {
    eventType: string;
    timestamp: number;
  },
  body: string
) => `extern crate reqwest;
use reqwest::header;
use reqwest::Client;

fn main() -> Result<(), Box<dyn std::error::Error>> {
  let client = Client::new();
  let url = "${url}";
  let body = ${JSON.stringify(body)};
  let response = client.post(url)
    .header(header::AUTHORIZATION, "${headers.Authorization}")
    .header(header::CONTENT_TYPE, "application/octet-stream")
    .body(body.to_string())
    .send()?;
  println!("{}", response.text()?);
  Ok(())
}
`;
export default getRustTemplate;
