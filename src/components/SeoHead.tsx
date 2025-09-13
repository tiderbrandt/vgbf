'use client';

import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  
  // Build full title
  const siteTitle = 'Västra Götalands Bågskytteförbund';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  
  // Build canonical URL
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vgbf.se';
  const canonicalUrl = canonical || `${baseUrl}${pathname}`;
  
  // Build image URL
  const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;
  
  useEffect(() => {
    // Update document title
    document.title = fullTitle;
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);
    
    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);
    
    // Load Umami Analytics
    if (process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && process.env.NEXT_PUBLIC_UMAMI_URL) {
      const existingScript = document.querySelector('script[data-website-id]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.async = true;
        script.src = process.env.NEXT_PUBLIC_UMAMI_URL;
        script.setAttribute('data-website-id', process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID);
        script.setAttribute('data-domains', process.env.NEXT_PUBLIC_SITE_URL?.replace(/https?:\/\//, '') || 'vgbf.se');
        script.setAttribute('data-auto-track', 'false'); // Disable auto-tracking to use manual tracking
        script.setAttribute('data-do-not-track', 'true');
        script.setAttribute('data-cache', 'true');
        
        // Track page view after script loads
        script.onload = () => {
          console.log('Umami script loaded successfully');
          // Wait a bit for the umami object to be available
          setTimeout(() => {
            trackPageView(canonicalUrl, fullTitle);
          }, 100);
        };
        
        script.onerror = () => {
          console.error('Failed to load Umami script');
        };
        
        document.head.appendChild(script);
        
        console.log('Umami script added to page:', {
          url: process.env.NEXT_PUBLIC_UMAMI_URL,
          websiteId: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
          domain: process.env.NEXT_PUBLIC_SITE_URL?.replace(/https?:\/\//, '') || 'vgbf.se'
        });
      } else {
        // Script already exists, just track page view
        trackPageView(canonicalUrl, fullTitle);
      }
        });
      }
    } else {
      console.warn('Umami Analytics not configured. Missing environment variables:', {
        websiteId: !!process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
        url: !!process.env.NEXT_PUBLIC_UMAMI_URL
      });
    }
    
    // Load Google Analytics
    if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      const existingGtag = document.querySelector('script[src*="googletagmanager"]');
      if (!existingGtag) {
        const gtagScript = document.createElement('script');
        gtagScript.async = true;
        gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`;
        document.head.appendChild(gtagScript);
        
        const gtagConfig = document.createElement('script');
        gtagConfig.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
            page_title: document.title,
            page_location: window.location.href,
          });
        `;
        document.head.appendChild(gtagConfig);
      }
    }
    
    // Track page view
    trackPageView(canonicalUrl, fullTitle);
  }, [canonicalUrl, fullTitle, description]);

  // This component doesn't render anything visible
  return null;
}

