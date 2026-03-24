import {hasLocale, NextIntlClientProvider} from 'next-intl';
import {getMessages, getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import LocaleSwitcher from '../../components/LocaleSwitcher';
import {Link} from '../../i18n/navigation';
import {routing} from '../../i18n/routing';
import styles from '../../components/AppShell.module.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({children, params}) {
  const {locale} = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations('shell');

  return (
    <NextIntlClientProvider messages={messages}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>{t('title')}</h1>
          </div>
          <LocaleSwitcher />
        </header>
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>
            {t('home')}
          </Link>
          <Link href="/catalog" className={styles.navLink}>
            {t('catalog')}
          </Link>
          <Link href="/collection" className={styles.navLink}>
            {t('collection')}
          </Link>
        </nav>
        <main className={styles.main}>{children}</main>
      </div>
    </NextIntlClientProvider>
  );
}