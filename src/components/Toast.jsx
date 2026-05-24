import { useEffect } from 'react';

const Toast = ({ message, type = 'success', onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const bg = type === 'error' ? '#A32D2D' : '#0F6E56';

  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
      background: bg, color: '#fff', padding: '10px 20px',
      borderRadius: '8px', fontSize: '14px', fontWeight: '500',
      zIndex: 1000, pointerEvents: 'none',
    }}>
      {message}
    </div>
  );
};

export default Toast;