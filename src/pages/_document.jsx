import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="theme-color" content="#1b9810" />
        <meta name="description" content="Uptora Electronics — Nigeria's trusted electronics store. Shop TVs, ACs, Solar panels, Inverters, Phones, Laptops and more with fast delivery and secure payments." />

        {/* Google Analytics 4 */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-C9Y1JZ52ML"
        />

        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Uptora" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Uptora Electronics" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-C9Y1JZ52ML');
            `,
          }}
        />
      </body>
    </Html>
  );
}
