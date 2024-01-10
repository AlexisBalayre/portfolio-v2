import React from "react";
import Head from "next/head";

export const MetaHeader = () => {
  return (
    <Head>
      <title>Alexis Balayre - Data Engineer | Blockchain Developer</title>
      <meta charSet="utf-8" />
      <meta
        name="description"
        content="Data engineer and full stack Web and Blockchain developer specialised in Web3 (Smart Contracts, DApp)"
      />
      <meta name="format-detection" content="telephone=no" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Alexis Balayre - Data Engineer | Blockchain Developer" />
      <meta property="og:title" content="Alexis Balayre - Data Engineer | Blockchain Developer" />
      <meta
        property="og:description"
        content="Data engineer and full stack Web and Blockchain developer specialised in Web3 (Smart Contracts, DApp)"
      />
      <meta property="og:image" content="https://alexis.balayre.com/preview.png" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta
        name="twitter:description"
        content="TData engineer and full stack Web and Blockchain developer specialised in Web3 (Smart Contracts, DApp)"
      />
      <meta name="twitter:image" content="https://alexis.balayre.com/preview.png" />
      <meta
        name="keywords"
        content="Alexis Balayre, Blockchain, Solidity, Web3, Developer, Full Stack, Ethereum, DApp, Smart Contracts, Data, Data Engineer"
      />
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
    </Head>
  );
};
