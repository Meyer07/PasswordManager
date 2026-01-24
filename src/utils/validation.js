const validation = {
    validateMasterPassword: (password) => {
      if (!password || password.length < 8) {
        return { valid: false, error: 'Master password must be at least 8 characters' };
      }
      if (password.length < 12) {
        return { valid: false, error: 'For security, use at least 12 characters' };
      }
      return { valid: true };
    },
  
    validatePasswordEntry: (entry) => {
      if (!entry.site || !entry.site.trim()) {
        return { valid: false, error: 'Website/Service is required' };
      }
      if (!entry.username || !entry.username.trim()) {
        return { valid: false, error: 'Username/Email is required' };
      }
      if (!entry.password || !entry.password.trim()) {
        return { valid: false, error: 'Password is required' };
      }
      return { valid: true };
    }
  };
  
  export default validation;