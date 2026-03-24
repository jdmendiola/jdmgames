import catalogGames from '../../data/games.json';
import {
  COLLECTION_STATUS,
  isValidRating,
  isValidStatus,
  normalizeCollectionEntry
} from '../models';

export const COLLECTION_STORAGE_KEY = 'hatch.collection.v1';
export const COLLECTION_UPDATED_EVENT = 'hatch:collection-updated';

const STORAGE_KEY = COLLECTION_STORAGE_KEY;
const REPOSITORY_DELAY_MS = 300;

const delay = () => new Promise((resolve) => setTimeout(resolve, REPOSITORY_DELAY_MS));

function readEntries() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(normalizeCollectionEntry).filter(Boolean);
  } catch {
    return [];
  }
}

function writeEntries(entries) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    window.dispatchEvent(new Event(COLLECTION_UPDATED_EVENT));
  } catch {
    return;
  }
}

function findCatalogGame(gameId) {
  return catalogGames.find((game) => game.id === gameId);
}

function findEntry(entries, gameId) {
  return entries.find((entry) => entry.gameId === gameId);
}

export const gameRepository = {
  async listCatalogGames() {
    await delay();
    return catalogGames;
  },

  async listCollection() {
    await delay();
    return readEntries().filter((entry) => !entry.removedAt);
  },

  async addToCollection(gameId) {
    await delay();

    if (!findCatalogGame(gameId)) {
      throw new Error('Game not found in catalog');
    }

    const entries = readEntries();
    const existing = findEntry(entries, gameId);

    if (existing) {
      existing.removedAt = null;
      writeEntries(entries);
      return existing;
    }

    const entry = {
      gameId,
      status: COLLECTION_STATUS.NOT_STARTED,
      rating: null,
      removedAt: null
    };

    entries.push(entry);
    writeEntries(entries);
    return entry;
  },

  async updateStatus(gameId, status) {
    await delay();

    if (!isValidStatus(status)) {
      throw new Error('Invalid status');
    }

    const entries = readEntries();
    const entry = findEntry(entries, gameId);

    if (!entry || entry.removedAt) {
      throw new Error('Game is not in collection');
    }

    entry.status = status;
    if (status !== COLLECTION_STATUS.COMPLETED) {
      entry.rating = null;
    }

    writeEntries(entries);
    return entry;
  },

  async updateRating(gameId, rating) {
    await delay();

    if (!isValidRating(rating)) {
      throw new Error('Rating must be an integer from 1 to 5');
    }

    const entries = readEntries();
    const entry = findEntry(entries, gameId);

    if (!entry || entry.removedAt) {
      throw new Error('Game is not in collection');
    }

    if (entry.status !== COLLECTION_STATUS.COMPLETED) {
      throw new Error('Cannot set rating unless status is Completed');
    }

    entry.rating = rating;
    writeEntries(entries);
    return entry;
  },

  async removeFromCollection(gameId) {
    await delay();

    const entries = readEntries();
    const entry = findEntry(entries, gameId);

    if (!entry || entry.removedAt) {
      throw new Error('Game is not in collection');
    }

    entry.removedAt = new Date().toISOString();
    writeEntries(entries);
    return entry;
  },

  async getCollectionEntry(gameId) {
    await delay();
    return findEntry(readEntries(), gameId) || null;
  }
};
