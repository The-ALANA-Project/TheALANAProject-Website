import { useEffect } from 'react';
import { useLocation } from 'react-router';
import {
  hasAnalyticsConsent,
  sendAnalyticsPageView,
} from '../utils/analytics';

export function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    if (!hasAnalyticsConsent()) return;

    // Wait for page-level Helmet metadata to update before reading document.title.
    const frame = window.requestAnimationFrame(sendAnalyticsPageView);
    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, location.search]);

  return null;
}
