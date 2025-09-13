'use client';

import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { trackPageView } from '@/lib/analytics';

// Google Analytics type declaration
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

const gtag = (...args: any[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args);
  }
};

interface SeoHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  canonical?: string;
  type?: 'website' | 'article' | 'event';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  locale?: string;
  noindex?: boolean;
}

export default function SeoHead({
  title,
  description = 'Västra Götalands Bågskytteförbund - Information om bågskytte, tävlingar, klubbar och rekord i Västra Götaland.',
  keywords = 'bågskytte, archery, Västra Götaland, tävling, klubb, rekord, VGBF',
  image = '/vgbf-logo.png',
  canonical,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  locale = 'sv_SE',
  noindex = false,
}: SeoHeadProps) {
  const router = useRouter();
  
  // Build full title
  const siteTitle = 'Västra Götalands Bågskytteförbund';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  
  // Build canonical URL
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vgbf.se';
  const canonicalUrl = canonical || `${baseUrl}${router.asPath.split('?')[0]}`;
  
  // Build image URL
  const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;
  
  useEffect(() => {
    // Use the new analytics utility for tracking
    trackPageView(canonicalUrl, fullTitle);
  }, [canonicalUrl, fullTitle]);

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author || siteTitle} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#1f2937" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Language and Locale */}
      <meta httpEquiv="content-language" content="sv" />
      <meta property="og:locale" content={locale} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteTitle} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      
      {/* Article specific tags */}
      {type === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
        </>
      )}
      
      {/* Event specific tags */}
      {type === 'event' && (
        <>
          <meta property="og:type" content="event" />
          {publishedTime && <meta property="event:start_time" content={publishedTime} />}
        </>
      )}
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Google Analytics */}
      {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                  page_title: document.title,
                  page_location: window.location.href,
                });
              `,
            }}
          />
        </>
      )}

      {/* Umami Analytics */}
      {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && process.env.NEXT_PUBLIC_UMAMI_URL && (
        <script
          async
          src={process.env.NEXT_PUBLIC_UMAMI_URL}
          data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          data-domains={process.env.NEXT_PUBLIC_SITE_URL?.replace(/https?:\/\//, '') || 'vgbf.se'}
          data-auto-track="true"
          data-do-not-track="true"
          data-cache="true"
        />
      )}
      
      {/* Structured Data for Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SportsOrganization',
            name: siteTitle,
            url: baseUrl,
            logo: imageUrl,
            description: description,
            sport: 'Archery',
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'SE',
              addressRegion: 'Västra Götaland',
            },
            sameAs: [
              // Add social media URLs when available
            ],
          }),
        }}
      />
    </Head>
  );
}

