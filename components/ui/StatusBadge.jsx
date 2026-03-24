import styles from './StatusBadge.module.css';

const STATUS_THEME = {
  'Not Started': 'notStarted',
  'In Progress': 'inProgress',
  Completed: 'completed'
};

export default function StatusBadge({status = 'Not Started'}) {
  const theme = STATUS_THEME[status] || 'notStarted';

  return (
    <span className={`${styles.badge} ${styles[theme]}`}>
      {status}
    </span>
  );
}
