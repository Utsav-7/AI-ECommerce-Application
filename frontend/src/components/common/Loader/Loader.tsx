import styles from './Loader.module.css';

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  message?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 'medium', 
  fullScreen = false,
  message 
}) => {
  const sizeClass = styles[`loader${size.charAt(0).toUpperCase() + size.slice(1)}`];

  if (fullScreen) {
    return (
      <div className={styles.fullScreenLoader}>
        <div className={`${styles.spinner} ${sizeClass}`}></div>
        {message && <p className={styles.loaderMessage}>{message}</p>}
      </div>
    );
  }

  return (
    <div className={styles.loaderContainer}>
      <div className={`${styles.spinner} ${sizeClass}`}></div>
      {message && <p className={styles.loaderMessage}>{message}</p>}
    </div>
  );
};

export default Loader;
