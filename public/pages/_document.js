import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Favicon & Logo */}
        <link rel="icon" href="/apple.png" />
        <link rel="apple-touch-icon" href="/apple.png" />

        {/* Title */}
        <title>Saksham Digital Works</title>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
