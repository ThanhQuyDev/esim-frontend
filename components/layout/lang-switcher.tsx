'use client';

import { useLocale } from 'next-intl';
import { usePathname as useNextPathname } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import {
  resolveDynamicLangSwitchPath,
  resolveLangSwitchPath,
  resolveLegalLangSwitchPath,
} from '@/i18n/lang-switch';

export default function LangSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const publicPathname = useNextPathname();

  const switchLocale = (newLocale: string) => {
    if (pathname === '/[slug]' || pathname === '/legal/[slug]') {
      // Persist the target locale in the NEXT_LOCALE cookie before the hard
      // navigation. Otherwise next-intl's middleware reads the stale cookie and
      // redirects the prefix-less default-locale path (e.g. /thailand) back to
      // the previous locale (e.g. /en/thailand), so the switch never happens.
      document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
      window.location.href =
        pathname === '/legal/[slug]'
          ? resolveLegalLangSwitchPath(publicPathname, newLocale)
          : resolveDynamicLangSwitchPath(publicPathname, locale, newLocale);
      return;
    }

    const target = resolveLangSwitchPath(pathname);
    router.replace(target as any, { locale: newLocale });
  };

  return (
    <div className="flex gap-2">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          disabled={locale === loc}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            locale === loc
              ? 'bg-primary text-primary-on-color'
              : 'bg-transparent hover:bg-secondary text-text-primary'
          }`}
        >
          {loc === 'vi' ? 'Tiếng Việt' : 'English'}
        </button>
      ))}
    </div>
  );
}
