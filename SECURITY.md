# Security Policy

## Overview

This password manager implements industry-standard encryption practices to protect your credentials. All passwords are encrypted locally in your browser using the Web Crypto API before being stored.

## Encryption Implementation

### Algorithms Used

- **Symmetric Encryption**: AES-256-GCM (Advanced Encryption Standard, 256-bit key, Galois/Counter Mode)
- **Key Derivation**: PBKDF2 (Password-Based Key Derivation Function 2) with SHA-256
- **Password Hashing**: SHA-256 (Secure Hash Algorithm 256-bit)
- **Random Generation**: `crypto.getRandomValues()` for cryptographically secure randomness

### Encryption Process
```
User Password → PBKDF2 (100,000 iterations) → AES-256 Key
                    ↓
Plaintext Data → AES-256-GCM Encryption → Encrypted Data
                    ↓
          localStorage (encrypted)
```

### Technical Details

1. **Master Password Verification**
   - Hashed using SHA-256
   - Hash stored in localStorage for authentication
   - Original password never stored

2. **Password Storage**
   - Each encryption uses a unique 16-byte salt
   - Each encryption uses a unique 12-byte initialization vector (IV)
   - PBKDF2 uses 100,000 iterations (OWASP recommended minimum)
   - AES-256-GCM provides authenticated encryption (prevents tampering)

3. **Data Format**
```
   [16 bytes: Salt][12 bytes: IV][Variable: Encrypted Data]
```

4. **Storage**
   - All data stored in browser's localStorage
   - Data remains encrypted at rest
   - Only decrypted in memory when vault is unlocked

## Security Features

### ✅ What This Protects Against

- **Data theft from localStorage**: All passwords are encrypted with AES-256
- **Brute force attacks**: PBKDF2 with 100,000 iterations significantly slows down password guessing
- **Rainbow table attacks**: Unique random salt for each encryption operation
- **Replay attacks**: Unique IV for each encryption prevents pattern analysis
- **Data tampering**: AES-GCM authenticated encryption detects modifications

### ❌ What This Does NOT Protect Against

- **Keyloggers**: Malware that captures keystrokes can intercept the master password
- **Screen capture malware**: Visible passwords can be captured
- **XSS attacks**: Malicious scripts injected into the page can access decrypted data in memory
- **Compromised browser**: Browser extensions or malware with browser access
- **Physical access**: Someone with access to your unlocked device
- **Memory dumps**: Passwords exist in plaintext in memory while vault is unlocked
- **Phishing**: Users entering master password on fake sites
- **Master password loss**: No recovery mechanism exists (by design - zero-knowledge architecture)

## Threat Model

### In-Scope Threats

1. **Attacker gains access to localStorage**
   - Mitigation: All data encrypted with strong encryption

2. **Attacker steals encrypted database**
   - Mitigation: Strong master password + PBKDF2 makes cracking impractical

3. **Attacker attempts to modify stored data**
   - Mitigation: AES-GCM authentication detects tampering

### Out-of-Scope Threats

1. **Compromised runtime environment** (malware, malicious extensions)
2. **Physical access to unlocked application**
3. **Social engineering attacks**
4. **Network-based attacks** (not applicable - no network communication)

## Best Practices for Users

### Master Password Requirements

- **Minimum length**: 12 characters (enforced)
- **Recommended**: 16+ characters with mixed case, numbers, and symbols
- **Do NOT use**: Dictionary words, personal information, or reused passwords
- **Consider using**: A passphrase (e.g., "correct-horse-battery-staple")

### Security Recommendations

1. **Lock your vault** when stepping away from your device
2. **Use a strong, unique master password** that you haven't used elsewhere
3. **Keep your browser updated** to receive security patches
4. **Avoid using on public/shared computers**
5. **Review browser extensions** - malicious extensions can access page data
6. **Enable auto-lock** (future feature) after inactivity
7. **Regular backups** - Export encrypted vault periodically

### What to Do If Compromised

If you suspect your master password has been compromised:

1. **Immediately change all passwords** stored in the vault
2. **Create a new vault** with a new master password
3. **Check for unauthorized access** to your accounts
4. **Review recent browser extension installations**

## Known Limitations

### 1. Browser Storage
- localStorage is not the most secure storage option
- Consider this a convenience tool, not a bank-grade vault
- For highly sensitive credentials, consider dedicated password managers

### 2. No Sync/Backup
- Data is local only
- Lost master password = lost data (no recovery possible)
- No automatic cloud backup

### 3. In-Memory Plaintext
- Passwords exist in plaintext while vault is unlocked
- Memory dumps or malware could potentially access this

### 4. No Two-Factor Authentication
- Master password is the only authentication factor
- Future enhancement to consider

### 5. No Auto-Lock
- Vault remains unlocked until manually locked
- Future enhancement to consider

## Comparison to Production Password Managers

### How This Compares

| Feature | This Project | 1Password/Bitwarden |
|---------|--------------|---------------------|
| Encryption | AES-256-GCM | AES-256-GCM |
| Key Derivation | PBKDF2 (100k) | PBKDF2 (100k-650k) |
| Zero-Knowledge | ✅ Yes | ✅ Yes |
| 2FA | ❌ No | ✅ Yes |
| Biometric | ❌ No | ✅ Yes |
| Cloud Sync | ❌ No | ✅ Yes (encrypted) |
| Browser Integration | ❌ Limited | ✅ Full |
| Security Audits | ❌ No | ✅ Regular |
| Recovery Options | ✅ Recovery Key | ✅ Multiple |

### Educational Purpose

This project demonstrates:
- ✅ Proper use of Web Crypto API
- ✅ Understanding of encryption best practices
- ✅ Zero-knowledge architecture principles
- ✅ Secure key derivation
- ✅ Authenticated encryption

**This is an educational project to demonstrate security concepts. For production use, consider established password managers that have undergone professional security audits.**

## Cryptographic Implementation Details

### Why These Choices?

#### AES-256-GCM
- Industry standard for symmetric encryption
- GCM mode provides both confidentiality and authenticity
- Hardware-accelerated on most modern CPUs
- NIST approved

#### PBKDF2 with 100,000 Iterations
- OWASP recommended minimum (as of 2024)
- Makes each password guess computationally expensive
- Supported natively by Web Crypto API
- Trade-off between security and user experience (~100-500ms)

#### SHA-256 for Master Password Hash
- One-way function prevents password recovery from hash
- Fast verification for legitimate users
- Collision-resistant

#### Cryptographically Secure Random
- `crypto.getRandomValues()` uses OS entropy
- Critical for salt and IV generation
- Never use `Math.random()` for security

### Code Example
```javascript
// Key derivation
const salt = crypto.getRandomValues(new Uint8Array(16));
const key = await crypto.subtle.deriveKey(
  {
    name: 'PBKDF2',
    salt: salt,
    iterations: 100000,
    hash: 'SHA-256'
  },
  keyMaterial,
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt', 'decrypt']
);

// Encryption
const iv = crypto.getRandomValues(new Uint8Array(12));
const encrypted = await crypto.subtle.encrypt(
  { name: 'AES-GCM', iv: iv },
  key,
  data
);
```

## Reporting Security Issues

If you discover a security vulnerability in this project:

1. **DO NOT** open a public GitHub issue
2. Email security concerns to: [smeyer1@new.rr.com]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

I will respond within 48 hours and work on a fix.

## Security Changelog

### Version 1.0.0 (Current)
- Initial implementation with AES-256-GCM
- PBKDF2 key derivation (100,000 iterations)
- SHA-256 master password hashing
- Zero-knowledge architecture

## Future Security Enhancements

Planned improvements:
- [ ] Auto-lock after inactivity
- [ ] Biometric authentication (WebAuthn)
- [ ] Encrypted export/import
- [ ] Password breach checking (HaveIBeenPwned API)
- [ ] Session timeout
- [ ] Clipboard auto-clear
- [ ] Password history
- [ ] Two-factor authentication

## References

- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Web Crypto API Specification](https://www.w3.org/TR/WebCryptoAPI/)
- [NIST SP 800-132: PBKDF](https://csrc.nist.gov/publications/detail/sp/800-132/final)
- [NIST SP 800-38D: GCM](https://csrc.nist.gov/publications/detail/sp/800-38d/final)

## License

This security documentation is part of the Password Manager project and is provided as-is for educational purposes.

---

**Last Updated**: January 2025  
**Version**: 1.0.0