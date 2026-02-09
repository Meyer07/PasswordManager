# Production Password Manager

A secure password manager built with React and Web Crypto API.

## Security Features

- **AES-256-GCM Encryption**: Industry-standard authenticated encryption
- **PBKDF2 Key Derivation**: 100,000 iterations with random salts
- **SHA-256 Hashing**: Secure master password verification
- **Zero-Knowledge Architecture**: Passwords never leave the browser unencrypted

## Architecture

### Security Layer (`src/utils/encryption.js`)
- Web Crypto API implementation
- Key derivation with PBKDF2
- AES-256-GCM encryption/decryption

### State Management (`src/hooks/`)
- `useAuth`: Handles authentication and master password
- `usePasswordManager`: Manages encrypted password storage

### Components (`src/components/`)
- Modular, reusable React components
- Separation of concerns
- Loading and error states

## Threat Model

**What This Protects Against:**
- ✅ Local storage theft (data is encrypted)
- ✅ Memory dumps (minimal plaintext exposure)
- ✅ Brute force attacks (PBKDF2 slows attempts)

**What This Does NOT Protect Against:**
- ❌ Keyloggers (can capture master password)
- ❌ XSS attacks (if injected into the page)
- ❌ Compromised browser environment

## Future Enhancements

- [ ] Browser extension version
- [ ] Biometric authentication (WebAuthn)
- [ ] Password breach checking (HaveIBeenPwned API)
- [ ] Auto-logout after inactivity
- ✅ Encrypted backup/export
- [ ] Two-factor authentication