import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Plaarket - Your trusted marketplace for organic products. Connect with verified organic farmers, suppliers, and brands." />
        <meta name="keywords" content="organic, marketplace, farmers, sustainable, food, b2b, b2c, organic products" />
        <meta name="author" content="Plaarket Team" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Plaarket - Organic Products Marketplace" />
        <meta property="og:description" content="Your trusted marketplace for organic products. Connect with verified organic farmers, suppliers, and brands." />
        <meta property="og:image" content="/images/og-image.jpg" />
        <meta property="og:url" content="https://plaarket.com" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Plaarket - Organic Products Marketplace" />
        <meta name="twitter:description" content="Your trusted marketplace for organic products. Connect with verified organic farmers, suppliers, and brands." />
        <meta name="twitter:image" content="/images/og-image.jpg" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#94b444" />
        <meta name="msapplication-TileColor" content="#94b444" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
