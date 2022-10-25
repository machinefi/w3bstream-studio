import Document, { Head, Html, Main, NextScript } from 'next/document';
export default class _Document extends Document {
  render() {
    return (
      <Html>
        <Head>
          <title>W3bstream Studio</title>
          <link href="https://fonts.googleapis.com/css2?family=Oxanium&display=swap" rel="stylesheet" />
          <link rel="stylesheet" href="https://unpkg.com/primeicons/primeicons.css" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
