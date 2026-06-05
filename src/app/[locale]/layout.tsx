import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/routing';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MenuBar from '@/components/MenuBar';
import Footer from '@/components/Footer';
import { AuthProvider, GoogleAuthProviderWrapper } from '@/components/AuthProvider';
import Script from 'next/script';
import Analytics from '@/components/Analytics';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Language Exercises",
  description: "Create and share interactive grammar exercises.",
  metadataBase: new URL("https://language-exercises.com"),
  openGraph: {
    title: "Language Exercises",
    description: "Create and share interactive grammar exercises.",
    url: "https://language-exercises.com",
    siteName: "Language Exercises",
    images: [
      {
        url: "https://language-exercises.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Language Exercises",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Language Exercises",
    description: "Create and share interactive grammar exercises.",
    images: ["https://language-exercises.com/og-image.png"],
  },
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Google Analytics (GA4) */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? (
          <>
            <Script
              id="ga4-src"
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                (function() {
                  var gtagFn = '${process.env.NEXT_PUBLIC_GTAG_FUNCTION_NAME || 'gtag'}';
                  window.dataLayer = window.dataLayer || [];
                  window[gtagFn] = function(){ window.dataLayer.push(arguments); };
                  window[gtagFn]('js', new Date());
                  window[gtagFn]('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', { anonymize_ip: true });
                })();
              `}
            </Script>
          </>
        ) : null}
        <NextIntlClientProvider messages={messages}>
          <GoogleAuthProviderWrapper>
            <AuthProvider>
              {/* Tracks route changes in the App Router */}
              <Analytics />
              <MenuBar />
              {children}
              <Footer />
            </AuthProvider>
          </GoogleAuthProviderWrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
