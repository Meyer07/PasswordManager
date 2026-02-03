import { useState } from 'react';
import encryptionUtils from '../utils/encryption';
import validation from '../utils/validation';
import storageService from '../services/storage';
import recoveryUtils from '../utils/recovery';

const useAuth = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRecoverySetup, setShowRecoverySetup] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);

  const unlock = async (password) => {
    setIsLoading(true);
    setError('');

    try {
      const validationResult = validation.validateMasterPassword(password);
      if (!validationResult.valid) {
        setError(validationResult.error);
        setIsLoading(false);
        return false;
      }

      const storedHash = storageService.getMasterHash();
      const currentHash = await encryptionUtils.hashPassword(password);

      if (!storedHash) {
        // First time setup - generate recovery key
        storageService.saveMasterHash(currentHash);
        
        // Generate and save recovery key
        const key = recoveryUtils.generateRecoveryKey();
        const encryptedHash = await recoveryUtils.encryptMasterHash(currentHash, key);
        storageService.saveRecoveryHash(encryptedHash);
        
        setRecoveryKey(key);
        setShowRecoverySetup(true);
        setMasterPassword(password);
        setIsLoading(false);
        return true;
      } else if (storedHash === currentHash) {
        setMasterPassword(password);
        setIsUnlocked(true);
        setIsLoading(false);
        return true;
      } else {
        setError('Incorrect master password');
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
      setIsLoading(false);
      return false;
    }
  };

  const confirmRecoverySetup = () => {
    setShowRecoverySetup(false);
    setIsUnlocked(true);
    setRecoveryKey(''); // Clear from memory
  };

  const recoverAccount = async (userRecoveryKey) => {
    setIsLoading(true);
    setError('');

    try {
      const validationResult = recoveryUtils.validateRecoveryKey(userRecoveryKey);
      if (!validationResult.valid) {
        setError(validationResult.error);
        setIsLoading(false);
        return false;
      }

      const encryptedHash = storageService.getRecoveryHash();
      if (!encryptedHash) {
        setError('No recovery data found for this account');
        setIsLoading(false);
        return false;
      }

      const masterHash = await recoveryUtils.decryptMasterHash(encryptedHash, userRecoveryKey);
      if (!masterHash) {
        setError('Invalid recovery key');
        setIsLoading(false);
        return false;
      }

      // Recovery successful - prompt for new master password
      setError('');
      setIsLoading(false);
      return { success: true, recoveredHash: masterHash };
    } catch (err) {
      setError('Recovery failed. Please check your recovery key.');
      setIsLoading(false);
      return false;
    }
  };

  const setNewMasterPassword = async (newPassword, recoveredHash) => {
    setIsLoading(true);
    try {
      const validationResult = validation.validateMasterPassword(newPassword);
      if (!validationResult.valid) {
        setError(validationResult.error);
        setIsLoading(false);
        return false;
      }

      const newHash = await encryptionUtils.hashPassword(newPassword);
      storageService.saveMasterHash(newHash);

      // Generate new recovery key
      const key = recoveryUtils.generateRecoveryKey();
      const encryptedHash = await recoveryUtils.encryptMasterHash(newHash, key);
      storageService.saveRecoveryHash(encryptedHash);

      setRecoveryKey(key);
      setShowRecoverySetup(true);
      setMasterPassword(newPassword);
      setShowRecovery(false);
      setIsLoading(false);
      return true;
    } catch (err) {
      setError('Failed to set new master password');
      setIsLoading(false);
      return false;
    }
  };

  const lock = () => {
    setIsUnlocked(false);
    setMasterPassword('');
    setError('');
    setShowRecovery(false);
  };

  const initiateRecovery = () => {
    setShowRecovery(true);
    setError('');
  };

  const cancelRecovery = () => {
    setShowRecovery(false);
    setError('');
  };

  return { 
    isUnlocked, 
    masterPassword, 
    error, 
    isLoading, 
    showRecoverySetup,
    recoveryKey,
    showRecovery,
    unlock, 
    lock,
    confirmRecoverySetup,
    recoverAccount,
    setNewMasterPassword,
    initiateRecovery,
    cancelRecovery
  };
};

export default useAuth;