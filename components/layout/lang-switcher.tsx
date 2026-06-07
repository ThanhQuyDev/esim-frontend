'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { resolveLangSwitchPath } from '@/i18n/lang-switch';

export default function LangSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
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
