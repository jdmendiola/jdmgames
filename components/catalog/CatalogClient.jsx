'use client';

import Image from 'next/image';
import {useEffect, useMemo, useState} from 'react';
import {useTranslations} from 'next-intl';
import {
  COLLECTION_STORAGE_KEY,
  COLLECTION_UPDATED_EVENT,
  gameRepository
} from '../../lib/repositories/gameRepository';
import styles from './CatalogClient.module.css';

const STATUS_TRANSLATION_KEYS = {
  'Not Started': 'notStarted',
  'In Progress': 'inProgress',
  Completed: 'completed'
};

function toCollectionMap(collectionEntries) {
  return collectionEntries.reduce((acc, entry) => {
    acc[entry.gameId] = entry;
    return acc;
  }, {});
}

export default function CatalogClient() {
  const t = useTranslations('pages.catalog');
  const tStatus = useTranslations('statuses');

  const [games, setGames] = useState([]);
  const [collectionByGameId, setCollectionByGameId] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingGameId, setPendingGameId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedCollectionState, setSelectedCollectionState] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSort, setSelectedSort] = useState('titleAsc');

  useEffect(() => {
    let isActive = true;

    async function refreshCollectionOnly() {
      try {
        const collectionEntries = await gameRepository.listCollection();

        if (!isActive) {
          return;
        }

        setCollectionByGameId(toCollectionMap(collectionEntries));
      } catch {
        if (isActive) {
          setError(t('errorLoad'));
        }
      }
    }

    async function loadCatalogAndCollection() {
      try {
        setLoading(true);
        setError('');

        const [catalogGames, collectionEntries] = await Promise.all([
          gameRepository.listCatalogGames(),
          gameRepository.listCollection()
        ]);

        if (!isActive) {
          return;
        }

        setGames(catalogGames);
        setCollectionByGameId(toCollectionMap(collectionEntries));
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

    loadCatalogAndCollection();

    function handleCollectionUpdated() {
      refreshCollectionOnly();
    }

    function handleStorage(event) {
      if (event.key === COLLECTION_STORAGE_KEY) {
        refreshCollectionOnly();
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

  const genreOptions = useMemo(() => {
    return [...new Set(games.map((game) => game.genre))].sort((a, b) => a.localeCompare(b));
  }, [games]);

  const platformOptions = useMemo(() => {
    return [...new Set(games.flatMap((game) => game.platform))].sort((a, b) => a.localeCompare(b));
  }, [games]);

  const visibleGames = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filtered = games.filter((game) => {
      const entry = collectionByGameId[game.id] || null;
      const isInCollection = Boolean(entry);

      if (normalizedQuery && !game.title.toLowerCase().includes(normalizedQuery)) {
        return false;
      }

      if (selectedGenre !== 'all' && game.genre !== selectedGenre) {
        return false;
      }

      if (selectedPlatform !== 'all' && !game.platform.includes(selectedPlatform)) {
        return false;
      }

      if (selectedCollectionState === 'in' && !isInCollection) {
        return false;
      }

      if (selectedCollectionState === 'out' && isInCollection) {
        return false;
      }

      if (selectedStatus !== 'all' && (!entry || entry.status !== selectedStatus)) {
        return false;
      }

      return true;
    });

    filtered.sort((a, b) => {
      if (selectedSort === 'titleAsc') {
        return a.title.localeCompare(b.title);
      }

      if (selectedSort === 'titleDesc') {
        return b.title.localeCompare(a.title);
      }

      if (selectedSort === 'yearAsc') {
        return a.releaseYear - b.releaseYear;
      }

      if (selectedSort === 'yearDesc') {
        return b.releaseYear - a.releaseYear;
      }

      return 0;
    });

    return filtered;
  }, [
    games,
    collectionByGameId,
    searchQuery,
    selectedGenre,
    selectedPlatform,
    selectedCollectionState,
    selectedStatus,
    selectedSort
  ]);

  const gameCountLabel = useMemo(
    () => t('resultsCount', {visible: visibleGames.length, total: games.length}),
    [visibleGames.length, games.length, t]
  );

  function getStatusLabel(status) {
    const key = STATUS_TRANSLATION_KEYS[status];
    return key ? tStatus(key) : status;
  }

  function resetFilters() {
    setSearchQuery('');
    setSelectedGenre('all');
    setSelectedPlatform('all');
    setSelectedCollectionState('all');
    setSelectedStatus('all');
    setSelectedSort('titleAsc');
  }

  async function handleAddToCollection(gameId) {
    try {
      setPendingGameId(gameId);
      setError('');

      await gameRepository.addToCollection(gameId);
      const collectionEntries = await gameRepository.listCollection();
      setCollectionByGameId(toCollectionMap(collectionEntries));
    } catch {
      setError(t('errorAdd'));
    } finally {
      setPendingGameId('');
    }
  }

  if (loading) {
    return <p className={styles.loading}>{t('loading')}</p>;
  }

  if (error && games.length === 0) {
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

  return (
    <section>
      <header className={styles.header}>
        <h2 className={styles.title}>{t('title')}</h2>
        <p className={styles.subtitle}>{t('description')}</p>
        <p className={styles.count}>{gameCountLabel}</p>
        {error ? <p className={styles.inlineError}>{error}</p> : null}
      </header>

      <section className={styles.controls} aria-label={t('filtersTitle')}>
        <h3 className={styles.controlsTitle}>{t('filtersTitle')}</h3>
        <div className={styles.controlsGrid}>
          <label className={styles.controlField}>
            <span>{t('searchLabel')}</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t('searchPlaceholder')}
              className={styles.controlInput}
            />
          </label>

          <label className={styles.controlField}>
            <span>{t('genreLabel')}</span>
            <select
              className={styles.controlInput}
              value={selectedGenre}
              onChange={(event) => setSelectedGenre(event.target.value)}
            >
              <option value="all">{t('allGenres')}</option>
              {genreOptions.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.controlField}>
            <span>{t('platformLabel')}</span>
            <select
              className={styles.controlInput}
              value={selectedPlatform}
              onChange={(event) => setSelectedPlatform(event.target.value)}
            >
              <option value="all">{t('allPlatforms')}</option>
              {platformOptions.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.controlField}>
            <span>{t('collectionLabel')}</span>
            <select
              className={styles.controlInput}
              value={selectedCollectionState}
              onChange={(event) => setSelectedCollectionState(event.target.value)}
            >
              <option value="all">{t('allCollectionStates')}</option>
              <option value="in">{t('collectionIn')}</option>
              <option value="out">{t('collectionOut')}</option>
            </select>
          </label>

          <label className={styles.controlField}>
            <span>{t('statusFilterLabel')}</span>
            <select
              className={styles.controlInput}
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
            >
              <option value="all">{t('allStatuses')}</option>
              <option value="Not Started">{getStatusLabel('Not Started')}</option>
              <option value="In Progress">{getStatusLabel('In Progress')}</option>
              <option value="Completed">{getStatusLabel('Completed')}</option>
            </select>
          </label>

          <label className={styles.controlField}>
            <span>{t('sortLabel')}</span>
            <select
              className={styles.controlInput}
              value={selectedSort}
              onChange={(event) => setSelectedSort(event.target.value)}
            >
              <option value="titleAsc">{t('sortTitleAsc')}</option>
              <option value="titleDesc">{t('sortTitleDesc')}</option>
              <option value="yearDesc">{t('sortYearDesc')}</option>
              <option value="yearAsc">{t('sortYearAsc')}</option>
            </select>
          </label>
        </div>
        <button type="button" className={styles.clearFilters} onClick={resetFilters}>
          {t('clearFilters')}
        </button>
      </section>

      <ul className={styles.grid}>
        {visibleGames.map((game) => {
          const entry = collectionByGameId[game.id] || null;
          const isAdded = Boolean(entry);
          const isPending = pendingGameId === game.id;

          return (
            <li key={game.id} className={styles.card}>
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
                <p className={styles.platforms}>{game.platform.join(', ')}</p>

                {isAdded ? (
                  <div className={styles.addedState}>
                    <span className={styles.addedBadge}>{t('added')}</span>
                    <span>
                      {t('statusLabel')}: {getStatusLabel(entry.status)}
                    </span>
                    {entry.rating ? (
                      <span>
                        {t('ratingLabel')}: {entry.rating}/5
                      </span>
                    ) : null}
                  </div>
                ) : null}

                <button
                  type="button"
                  className={styles.addButton}
                  onClick={() => handleAddToCollection(game.id)}
                  disabled={isAdded || isPending}
                >
                  {isPending ? t('adding') : isAdded ? t('added') : t('addButton')}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
