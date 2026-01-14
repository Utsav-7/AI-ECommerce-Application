import { useEffect, useState } from 'react';
import { toastService } from '../../../services/toast/toastService';
import type { Toast } from '../../../services/toast/toastService';
import styles from './ToastItem.module.css';

interface ToastItemProps {
  toast: Toast;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      toastService.remove(toast.id);
    }, 300);
  };

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.duration, toast.id]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  };

  return (
    <div
      className={`${styles.toast} ${styles[toast.type]} ${isExiting ? styles.exiting : ''}`}
      onClick={handleClose}
    >
      <div className={styles.toastIcon}>{getIcon()}</div>
      <div className={styles.toastMessage}>{toast.message}</div>
      <button className={styles.toastClose} onClick={handleClose} aria-label="Close toast">
        ×
      </button>
    </div>
  );
};

export default ToastItem;
