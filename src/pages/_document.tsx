import Document, { Head, Html, Main, NextScript } from 'next/document';
export default class _Document extends Document {
  render() {
    return (
      <Html>
        <Head>
          <title>W3bstream Devnet</title>
          {/* <link href="https://fonts.googleapis.com/css2?family=Oxanium&display=swap" rel="stylesheet" /> */}
          <link rel="stylesheet" href="https://unpkg.com/primeicons/primeicons.css" />
          <link rel="icon" href="favicon.svg" sizes="any" type="image/svg+xml" />
          <style>{`
            @font-face{
              font-family:"helvetica";
              src:url("https://candyfonts.com/wp-data/2018/10/26/11538/HELR45W.ttf") format("woff"),
              url("https://candyfonts.com/wp-data/2018/10/26/11538/HELR45W.ttf") format("opentype"),
              url("https://candyfonts.com/wp-data/2018/10/26/11538/HELR45W.ttf") format("truetype");
            }
            .react-horizontal-scrolling-menu--scroll-container::-webkit-scrollbar {
              display: none;
            }

            .react-horizontal-scrolling-menu--scroll-container {
              -ms-overflow-style: none; /* IE and Edge */
              scrollbar-width: none; /* Firefox */
            }
          `}</style>
        </Head>
        <body style={{fontFamily: "helvetica"}}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
