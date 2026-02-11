const breachCheckUtils = {
    // SHA-1 hash a password
    sha1Hash: async (password) => {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    },
  
    // Check if password has been breached
    checkPassword: async (password) => {
      try {
        // Hash the password
        const hash = await breachCheckUtils.sha1Hash(password);
        
        // Get first 5 characters (k-anonymity)
        const prefix = hash.substring(0, 5);
        const suffix = hash.substring(5);
  
        // Query HaveIBeenPwned API
        const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
        
        if (!response.ok) {
          throw new Error('Failed to check password');
        }
  
        const text = await response.text();
        
        // Parse response (format: "SUFFIX:COUNT\r\n")
        const hashes = text.split(/\r?\n/);  // ← FIXED: Handle both \r\n and \n
        
        for (const line of hashes) {
          if (!line.trim()) continue;  // ← FIXED: Skip empty lines
          
          const [hashSuffix, count] = line.split(':');
          
          // ← FIXED: Trim and compare (case-insensitive already since both uppercase)
          if (hashSuffix.trim() === suffix) {
            return {
              breached: true,
              count: parseInt(count.trim(), 10),
              message: `This password has been seen ${parseInt(count.trim(), 10).toLocaleString()} times in data breaches`
            };
          }
        }
  
        return {
          breached: false,
          count: 0,
          message: 'This password has not been found in any known data breaches'
        };
      } catch (error) {
        console.error('Breach check failed:', error);
        return {
          breached: null,
          count: null,
          message: 'Unable to check password against breach database',
          error: true
        };
      }
    },
  
    // Check multiple passwords (for existing vault)
    checkMultiplePasswords: async (passwords) => {
      const results = [];
      
      for (const entry of passwords) {
        const result = await breachCheckUtils.checkPassword(entry.password);
        results.push({
          id: entry.id,
          site: entry.site,
          username: entry.username,
          ...result
        });
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));  // ← INCREASED to 200ms
      }
      
      return results;
    }
  };
export default breachCheckUtils;