import Document, { Head, Html, Main, NextScript } from 'next/document';
export default class _Document extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link href="https://fonts.googleapis.com/css2?family=Oxanium&display=swap" rel="stylesheet" />
          <link rel="stylesheet" href="https://unpkg.com/primeicons/primeicons.css" />
          <link rel="stylesheet" href="https://unpkg.com/primereact/resources/primereact.min.css" />
          <link rel="stylesheet" href="https://unpkg.com/primeflex@3.2.1/primeflex.min.css" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
