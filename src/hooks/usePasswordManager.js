import { useState, useEffect, useCallback } from 'react';
import encryptionUtils from '../utils/encryption';
import validation from '../utils/validation';
import storageService from '../services/storage';

const usePasswordManager = (masterPassword) => {
  const [passwords, setPasswords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadPasswords = useCallback(async () => {
    setIsLoading(true);
    try {
      const encrypted = storageService.getEncryptedPasswords();
      if (encrypted && masterPassword) {
        const decrypted = await encryptionUtils.decrypt(encrypted, masterPassword);
        if (decrypted) {
          try {
            setPasswords(JSON.parse(decrypted));
          } catch {
            setPasswords([]);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load passwords:', err);
      setPasswords([]);
    } finally {
      setIsLoading(false);
    }
  }, [masterPassword]);

  useEffect(() => {
    if (masterPassword) {
      loadPasswords();
    }
  }, [masterPassword, loadPasswords]);

  const savePasswords = async (updatedPasswords) => {
    try {
      const encrypted = await encryptionUtils.encrypt(
        JSON.stringify(updatedPasswords),
        masterPassword
      );
      storageService.saveEncryptedPasswords(encrypted);
      setPasswords(updatedPasswords);
      return true;
    } catch (err) {
      console.error('Failed to save passwords:', err);
      return false;
    }
  };

  const addPassword = async (entry) => {
    const validationResult = validation.validatePasswordEntry(entry);
    if (!validationResult.valid) {
      return { success: false, error: validationResult.error };
    }

    const newEntry = { 
      ...entry, 
      id: Date.now(), 
      createdAt: new Date().toISOString() 
    };
    
    const success = await savePasswords([...passwords, newEntry]);
    return { success };
  };

  const deletePassword = async (id) => {
    await savePasswords(passwords.filter(p => p.id !== id));
  };

  const updatePassword = async (id, updatedEntry) => {
    await savePasswords(
      passwords.map(p => p.id === id ? { ...p, ...updatedEntry } : p)
    );
  };

  return { passwords, isLoading, addPassword, deletePassword, updatePassword };
};

export default usePasswordManager;