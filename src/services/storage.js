const storageService = {
  KEYS: {
    MASTER_HASH: 'pm_master_hash_v2',
    ENCRYPTED_DATA: 'pm_encrypted_passwords_v2',
    RECOVERY_HASH: 'pm_recovery_hash_v2'
  },

  saveMasterHash: (hash) => {
    localStorage.setItem(storageService.KEYS.MASTER_HASH, hash);
  },

  getMasterHash: () => {
    return localStorage.getItem(storageService.KEYS.MASTER_HASH);
  },

  saveEncryptedPasswords: (encryptedData) => {
    localStorage.setItem(storageService.KEYS.ENCRYPTED_DATA, encryptedData);
  },

  getEncryptedPasswords: () => {
    return localStorage.getItem(storageService.KEYS.ENCRYPTED_DATA);
  },

  clearAll: () => {
    localStorage.removeItem(storageService.KEYS.MASTER_HASH);
    localStorage.removeItem(storageService.KEYS.ENCRYPTED_DATA);
    localStorage.removeItem(storageService.KEYS.RECOVERY_HASH);
  },

  saveRecoveryHash: (encryptedHash) => {
    localStorage.setItem(storageService.KEYS.RECOVERY_HASH, encryptedHash);
  },

  getRecoveryHash: () => {
    return localStorage.getItem(storageService.KEYS.RECOVERY_HASH);
  }
};

export default storageService;