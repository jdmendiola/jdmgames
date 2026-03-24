import {getTranslations} from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('pages.home');

  return (
    <section>
      <h2>{t('title')}</h2>
      <p>{t('description')}</p>
    </section>
  );
}