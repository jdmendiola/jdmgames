import Image from 'next/image';
import StatusBadge from '../ui/StatusBadge';
import styles from './GameCard.module.css';

export default function GameCard({
  title,
  genre,
  releaseYear,
  platform,
  coverUrl,
  status,
  rating
}) {
  return (
    <article className={styles.card}>
      <Image
        src={coverUrl}
        alt={title}
        className={styles.cover}
        width={320}
        height={400}
      />
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.meta}>
          {genre} · {releaseYear}
        </p>
        <p className={styles.platform}>{platform.join(', ')}</p>
        <div className={styles.footer}>
          <StatusBadge status={status} />
          <span className={styles.rating}>{rating ? `${rating}/5` : 'No rating'}</span>
        </div>
      </div>
    </article>
  );
}
