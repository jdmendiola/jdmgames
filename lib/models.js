export const COLLECTION_STATUS = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed'
};

export const COLLECTION_STATUSES = Object.values(COLLECTION_STATUS);

export function isValidStatus(status) {
  return COLLECTION_STATUSES.includes(status);
}

export function isValidRating(rating) {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

export function normalizeCollectionEntry(entry) {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  if (typeof entry.gameId !== 'string' || !entry.gameId) {
    return null;
  }

  const status = isValidStatus(entry.status)
    ? entry.status
    : COLLECTION_STATUS.NOT_STARTED;

  const rating = isValidRating(entry.rating) ? entry.rating : null;
  const removedAt = typeof entry.removedAt === 'string' ? entry.removedAt : null;

  return {
    gameId: entry.gameId,
    status,
    rating: status === COLLECTION_STATUS.COMPLETED ? rating : null,
    removedAt
  };
}
