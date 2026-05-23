import { useEffect, useRef } from 'react';

export const useAutoLock = (isUnlocked, onLock, timeoutMinutes = 5) => {
  const timerRef = useRef(null);
  const timeoutMs = timeoutMinutes * 60 * 1000;

  useEffect(() => {
    // 1. Define the lockout utility directly inside the effect to prevent dependency loops
    const handleLockout = () => {
      console.log("Vault automatically locking due to inactivity.");
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      onLock();
    };

    // 2. Define the reset utility within the same isolated scope
    const resetTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (isUnlocked) {
        timerRef.current = setTimeout(handleLockout, timeoutMs);
      }
    };

    const activityEvents = [
      'mousemove',
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'click'
    ];

    if (isUnlocked) {
      // Start the inactivity countdown immediately when unlocked
      resetTimer();

      // Monitor global activity events on the page
      activityEvents.forEach((event) => {
        window.addEventListener(event, resetTimer);
      });
    }

    // 3. Tab visibility tracker: locks vault immediately if user switches tabs/minimizes app
    const handleVisibilityChange = () => {
      if (document.hidden && isUnlocked) {
        handleLockout();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 4. Safe structural cleanup on lock or unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isUnlocked, onLock, timeoutMs]);
};