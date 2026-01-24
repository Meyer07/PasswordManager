import { useState } from 'react';
import encryptionUtils from '../utils/encryption';
import validation from '../utils/validation';
import storageService from '../services/storage';

const useAuth = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
        storageService.saveMasterHash(currentHash);
        setMasterPassword(password);
        setIsUnlocked(true);
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

  const lock = () => {
    setIsUnlocked(false);
    setMasterPassword('');
    setError('');
  };

  return { isUnlocked, masterPassword, error, isLoading, unlock, lock };
};

export default useAuth;