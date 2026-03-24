'use client';

import Image from 'next/image';
import {useEffect, useMemo, useState} from 'react';
import {useTranslations} from 'next-intl';
import {COLLECTION_STATUSES, COLLECTION_STATUS} from '../../lib/models';
import {
  COLLECTION_STORAGE_KEY,
  COLLECTION_UPDATED_EVENT,
  gameRepository
} from '../../lib/repositories/gameRepository';
import styles from './CollectionClient.module.css';

const STATUS_TRANSLATION_KEYS = {
  [COLLECTION_STATUS.NOT_STARTED]: 'notStarted',
  [COLLECTION_STATUS.IN_PROGRESS]: 'inProgress',
  [COLLECTION_STATUS.COMPLETED]: 'completed'
};

function toGameMap(games) {
  return games.reduce((acc, game) => {
    acc[game.id] = game;
    return acc;
  }, {});
}

export default function CollectionClient() {
  const t = useTranslations('pages.collection');
  const tStatus = useTranslations('statuses');

  const [gamesById, setGamesById] = useState({});
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingGameId, setPendingGameId] = useState('');

  useEffect(() => {
    let isActive = true;

    async function loadAll() {
      try {
        setLoading(true);
        setError('');

        const [games, collection] = await Promise.all([
          gameRepository.listCatalogGames(),
          gameRepository.listCollection()
        ]);

        if (!isActive) {
          return;
        }

        setGamesById(toGameMap(games));
        setEntries(collection);
      } catch {
        if (!isActive) {
          return;
        }

        setError(t('errorLoad'));
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadAll();

    async function refreshFromSyncEvent() {
      try {
        const collection = await gameRepository.listCollection();
        if (isActive) {
          setEntries(collection);
        }
      } catch {
        if (isActive) {
          setError(t('errorLoad'));
        }
      }
    }

    function handleCollectionUpdated() {
      refreshFromSyncEvent();
    }

    function handleStorage(event) {
      if (event.key === COLLECTION_STORAGE_KEY) {
        refreshFromSyncEvent();
      }
    }

    window.addEventListener(COLLECTION_UPDATED_EVENT, handleCollectionUpdated);
    window.addEventListener('storage', handleStorage);

    return () => {
      isActive = false;
      window.removeEventListener(COLLECTION_UPDATED_EVENT, handleCollectionUpdated);
      window.removeEventListener('storage', handleStorage);
    };
  }, [t]);

  const collectionCountLabel = useMemo(
    () => t('gameCount', {count: entries.length}),
    [entries.length, t]
  );

  function getStatusLabel(status) {
    const key = STATUS_TRANSLATION_KEYS[status];
    return key ? tStatus(key) : status;
  }

  async function refreshCollection() {
    const collection = await gameRepository.listCollection();
    setEntries(collection);
  }

  async function handleStatusChange(gameId, status) {
    try {
      setPendingGameId(gameId);
      setError('');
      await gameRepository.updateStatus(gameId, status);
      await refreshCollection();
    } catch {
      setError(t('errorUpdate'));
    } finally {
      setPendingGameId('');
    }
  }

  async function handleRatingChange(gameId, ratingValue) {
    try {
      setPendingGameId(gameId);
      setError('');
      await gameRepository.updateRating(gameId, Number(ratingValue));
      await refreshCollection();
    } catch {
      setError(t('errorUpdate'));
    } finally {
      setPendingGameId('');
    }
  }

  async function handleRemove(entry) {
    const shouldConfirm = entry.status === COLLECTION_STATUS.IN_PROGRESS;
    if (shouldConfirm && !window.confirm(t('confirmRemoveInProgress'))) {
      return;
    }

    try {
      setPendingGameId(entry.gameId);
      setError('');
      await gameRepository.removeFromCollection(entry.gameId);
      await refreshCollection();
    } catch {
      setError(t('errorUpdate'));
    } finally {
      setPendingGameId('');
    }
  }

  if (loading) {
    return <p className={styles.loading}>{t('loading')}</p>;
  }

  if (error && entries.length === 0) {
    return (
      <section className={styles.errorBox}>
        <p>{error}</p>
        <button
          type="button"
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          {t('retry')}
        </button>
      </section>
    );
  }

  if (entries.length === 0) {
    return (
      <section>
        <h2 className={styles.title}>{t('title')}</h2>
        <p className={styles.subtitle}>{t('description')}</p>
        <p className={styles.empty}>{t('empty')}</p>
      </section>
    );
  }

  return (
    <section>
      <header className={styles.header}>
        <h2 className={styles.title}>{t('title')}</h2>
        <p className={styles.subtitle}>{t('description')}</p>
        <p className={styles.count}>{collectionCountLabel}</p>
        {error ? <p className={styles.inlineError}>{error}</p> : null}
      </header>

      <ul className={styles.grid}>
        {entries.map((entry) => {
          const game = gamesById[entry.gameId];
          if (!game) {
            return null;
          }

          const isPending = pendingGameId === entry.gameId;
          const canRate = entry.status === COLLECTION_STATUS.COMPLETED;

          return (
            <li key={entry.gameId} className={styles.card}>
              <Image
                src={game.coverUrl}
                alt={game.title}
                className={styles.cover}
                width={320}
                height={400}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
              />
              <div className={styles.content}>
                <h3 className={styles.gameTitle}>{game.title}</h3>
                <p className={styles.meta}>
                  {game.genre} · {game.releaseYear}
                </p>

                <label className={styles.controlLabel}>
                  {t('statusLabel')}
                  <select
                    className={styles.select}
                    value={entry.status}
                    onChange={(event) => handleStatusChange(entry.gameId, event.target.value)}
                    disabled={isPending}
                  >
                    {COLLECTION_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {getStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </label>

                {canRate ? (
                  <label className={styles.controlLabel}>
                    {t('ratingLabel')}
                    <select
                      className={styles.select}
                      value={entry.rating ?? ''}
                      onChange={(event) => handleRatingChange(entry.gameId, event.target.value)}
                      disabled={isPending}
                    >
                      <option value="">{t('ratingPlaceholder')}</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  </label>
                ) : null}

                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => handleRemove(entry)}
                  disabled={isPending}
                >
                  {isPending ? t('saving') : t('removeButton')}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
