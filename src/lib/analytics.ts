'use client';

// Analytics utility functions for Umami tracking
declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, any>) => void;
      identify: (userData: Record<string, any>) => void;
      enable: () => void;
      disable: () => void;
    };
  }
}

export interface UmamiEventData {
  [key: string]: string | number | boolean;
}

/**
 * Track a custom event with Umami
 * @param eventName - Name of the event (e.g., 'button_click', 'form_submit')
 * @param eventData - Optional data to track with the event
 */
export const trackEvent = (eventName: string, eventData?: UmamiEventData) => {
  // Skip tracking if not in browser
  if (typeof window === 'undefined') return;
  
  // Check if analytics is enabled
  const analyticsEnabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';
  if (!analyticsEnabled) return;
  
  const consent = localStorage.getItem('vgbf_cookie_consent');
  
  // If consent is required and not accepted, don't track
  const consentRequired = process.env.NEXT_PUBLIC_COOKIES_CONSENT_REQUIRED === 'true';
  if (consentRequired && consent !== 'accepted') return;

  // Track with Umami if available
  if (typeof window !== 'undefined' && window.umami) {
    try {
      window.umami.track(eventName, eventData);
    } catch (error) {
      console.warn('Umami tracking failed:', error);
    }
  }
};

/**
 * Track page view (called automatically by SeoHead component)
 * @param url - Page URL
 * @param title - Page title
 */
export const trackPageView = (url: string, title: string) => {
  trackEvent('pageview', {
    url,
    title,
    referrer: typeof window !== 'undefined' ? document.referrer : '',
  });
};

/**
 * Track form submissions
 * @param formName - Name of the form
 * @param formData - Optional form data to track
 */
export const trackFormSubmit = (formName: string, formData?: UmamiEventData) => {
  trackEvent('form_submit', {
    form_name: formName,
    ...formData,
  });
};

/**
 * Track button clicks
 * @param buttonName - Name/label of the button
 * @param location - Where the button was clicked (e.g., 'header', 'footer')
 */
export const trackButtonClick = (buttonName: string, location?: string) => {
  trackEvent('button_click', {
    button_name: buttonName,
    location: location || 'unknown',
  });
};

/**
 * Track external link clicks
 * @param url - External URL that was clicked
 * @param linkText - Text of the link
 */
export const trackExternalLink = (url: string, linkText?: string) => {
  trackEvent('external_link_click', {
    url,
    link_text: linkText || 'unknown',
  });
};

/**
 * Track file downloads
 * @param fileName - Name of the downloaded file
 * @param fileType - Type of file (pdf, jpg, etc.)
 */
export const trackFileDownload = (fileName: string, fileType?: string) => {
  trackEvent('file_download', {
    file_name: fileName,
    file_type: fileType || fileName.split('.').pop() || 'unknown',
  });
};

/**
 * Track search queries
 * @param query - Search query
 * @param resultsCount - Number of results returned
 */
export const trackSearch = (query: string, resultsCount?: number) => {
  trackEvent('search', {
    query,
    results_count: resultsCount || 0,
  });
};

/**
 * Track competition/event interactions
 * @param action - Action taken (view, register, share)
 * @param competitionName - Name of the competition
 */
export const trackCompetition = (action: string, competitionName: string) => {
  trackEvent('competition_interaction', {
    action,
    competition_name: competitionName,
  });
};

/**
 * Track news article interactions
 * @param action - Action taken (view, share)
 * @param articleTitle - Title of the news article
 */
export const trackNewsArticle = (action: string, articleTitle: string) => {
  trackEvent('news_interaction', {
    action,
    article_title: articleTitle,
  });
};

/**
 * Check if analytics tracking is enabled
 * @returns true if user has consented to analytics
 */
export const isAnalyticsEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const consent = localStorage.getItem('vgbf_cookie_consent');
  const analyticsEnabled = localStorage.getItem('vgbf_analytics_enabled');
  
  // If consent required but not given, disable analytics
  const needsConsent = process.env.NEXT_PUBLIC_COOKIES_CONSENT_REQUIRED === 'true';
  if (needsConsent && consent !== 'accepted') {
    return false;
  }
  
  return analyticsEnabled !== 'false';
};

/**
 * Initialize Umami tracking based on user consent
 */
export const initializeAnalytics = () => {
  if (typeof window === 'undefined') return;
  
  const consent = localStorage.getItem('vgbf_cookie_consent');
  
  if (consent === 'accepted' && window.umami) {
    window.umami.enable();
  } else if (consent === 'declined' && window.umami) {
    window.umami.disable();
  }
};

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  // Wait for Umami to load
  setTimeout(initializeAnalytics, 1000);
}