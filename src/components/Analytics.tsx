'use client';

import {useEffect} from 'react';
import {usePathname, useSearchParams} from 'next/navigation';

declare global {
  var dataLayer: (unknown[] | undefined);
  interface Window {
    // Support custom gtag function name via env var
    [key: string]: unknown;
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GTAG_FN = process.env.NEXT_PUBLIC_GTAG_FUNCTION_NAME || 'gtag';

export default function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_ID) return; // GA disabled when not configured
    if (typeof window === 'undefined') return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    try {
      const gtag = window[GTAG_FN] as ((...args: unknown[]) => void) | undefined;
      if (typeof gtag === 'function') {
        gtag('config', GA_ID, {
          page_path: url,
        });
      }
    } catch {
      // no-op: GA not initialized yet
    }
  }, [pathname, searchParams]);

  return null;
}
