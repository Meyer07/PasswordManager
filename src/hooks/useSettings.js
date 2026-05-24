import { useState, useEffect } from 'react';

const SETTINGS_KEY = 'pm_settings';

const DEFAULT_SETTINGS = {
  autoLockEnabled: true,    // whether auto-lock is active
  autoLockTimeout: 5,       // minutes
  autoBackup: false,
  backupFrequency: 'daily', // 'onlock' | 'daily' | 'weekly'
};

const useSettings = () => {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const updateSetting = (key, value) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      } catch {
        // localStorage full or unavailable — settings still work in memory
      }
      return updated;
    });
  };

  return { settings, updateSetting };
};

export default useSettings;