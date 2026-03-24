'use client';

import {useLocale, useTranslations} from 'next-intl';
import {usePathname, useRouter} from '../i18n/navigation';
import {routing} from '../i18n/routing';
import styles from './LocaleSwitcher.module.css';

export default function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('shell');

  function onLocaleChange(event) {
    const nextLocale = event.target.value;
    router.replace(pathname, {locale: nextLocale});
  }

  return (
    <label className={styles.wrapper}>
      <span className={styles.label}>{t('localeLabel')}</span>
      <select
        value={locale}
        onChange={onLocaleChange}
        className={styles.select}
        aria-label={t('localeLabel')}
      >
        {routing.locales.map((optionLocale) => (
          <option key={optionLocale} value={optionLocale}>
            {t(`locales.${optionLocale}`)}
          </option>
        ))}
      </select>
    </label>
  );
}