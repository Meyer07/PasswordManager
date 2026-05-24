import { useEffect, useRef } from 'react';

export const useAutoLock = (isUnlocked, onLock, timeoutMinutes = 5) => 
{
  const timerRef = useRef(null);

  useEffect(() => 
  {
    // If timeoutMinutes is null, 0, or falsy, auto-lock is disabled — clear any
    // existing timer and do nothing.
    if (!timeoutMinutes) 
    {
      if (timerRef.current) 
      {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const timeoutMs = timeoutMinutes * 60 * 1000;

    const handleLockout = () => 
    {
      console.log('Vault automatically locking due to inactivity.');
      if (timerRef.current) 
      {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      onLock();
    };

    const resetTimer = () => 
    {
      if (timerRef.current) 
      {
        clearTimeout(timerRef.current);
      }
      if (isUnlocked) 
      {
        timerRef.current = setTimeout(handleLockout, timeoutMs);
      }
    };

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    if (isUnlocked) 
    {
      resetTimer();
      activityEvents.forEach(event => window.addEventListener(event, resetTimer));
    }

    const handleVisibilityChange = () => 
    {
      if (document.hidden && isUnlocked)
      {
        handleLockout();
      } 
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => 
    {
      if (timerRef.current) 
      {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      activityEvents.forEach(event => window.removeEventListener(event, resetTimer));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isUnlocked, onLock, timeoutMinutes]);
};