export const ANALYTICS_CONSENT_STORAGE_KEY = 'alana-cookie-consent';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function hasAnalyticsConsent(): boolean {
  try {
    return localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY) === 'accepted';
  } catch {
    return false;
  }
}

export function sendAnalyticsPageView(): void {
  window.gtag?.('event', 'page_view', {
    page_location: window.location.href,
    page_path: `${window.location.pathname}${window.location.search}`,
    page_title: document.title,
  });
}
