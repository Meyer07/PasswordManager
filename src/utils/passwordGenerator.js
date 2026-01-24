const passwordGenerator = {
    generate: (length = 16, options = {}) => {
      const {
        lowercase = true,
        uppercase = true,
        numbers = true,
        symbols = true
      } = options;
  
      let charset = '';
      if (lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
      if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (numbers) charset += '0123456789';
      if (symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
      let password = '';
      const randomValues = new Uint32Array(length);
      crypto.getRandomValues(randomValues);
      
      for (let i = 0; i < length; i++) {
        password += charset.charAt(randomValues[i] % charset.length);
      }
      return password;
    },
  
    calculateStrength: (password) => {
      let strength = 0;
      if (password.length >= 8) strength++;
      if (password.length >= 12) strength++;
      if (/[a-z]/.test(password)) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[^a-zA-Z0-9]/.test(password)) strength++;
      return Math.min(strength, 5);
    }
  };
  
  export default passwordGenerator;