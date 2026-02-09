import React, { useState } from 'react';
import useAuth from './hooks/useAuth';
import usePasswordManager from './hooks/usePasswordManager';
import LoginScreen from './components/LoginScreen';
import RecoveryScreen from './components/RecoveryScreen';
import RecoveryKeyDisplay from './components/RecoveryKeyDisplay';
import NewMasterPasswordScreen from './components/NewMasterPasswordScreen';
import Header from './components/Header';
import AddPasswordForm from './components/AddPasswordForm';
import PasswordList from './components/PasswordList';

const App = () => {
  const { 
    isUnlocked, 
    masterPassword, 
    error, 
    isLoading: authLoading,
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
  } = useAuth();
  
  const { passwords, isLoading: vaultLoading, addPassword, deletePassword } = usePasswordManager(masterPassword);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [recoveryState, setRecoveryState] = useState(null); // For storing recovered hash

  const handleAddPassword = async (entry) => {
    setFormLoading(true);
    setFormError('');
    
    const result = await addPassword(entry);
    
    if (result.success) {
      setShowForm(false);
      setFormError('');
    } else {
      setFormError(result.error);
    }
    
    setFormLoading(false);
  };

  const handleLock = () => {
    lock();
    setShowForm(false);
    setFormError('');
  };

  const handleRecover = async (userRecoveryKey) => {
    const result = await recoverAccount(userRecoveryKey);
    if (result && result.success) {
      setRecoveryState(result.recoveredHash);
    }
  };

  const handleSetNewPassword = async (newPassword) => {
    const success = await setNewMasterPassword(newPassword, recoveryState);
    if (success) {
      setRecoveryState(null);
    }
  };

  // Show recovery key setup modal
  if (showRecoverySetup && recoveryKey) {
    return <RecoveryKeyDisplay recoveryKey={recoveryKey} onConfirm={confirmRecoverySetup} />;
  }

  // Show new password setup after recovery
  if (recoveryState) {
    return (
      <NewMasterPasswordScreen
        onSetPassword={handleSetNewPassword}
        error={error}
        isLoading={authLoading}
      />
    );
  }

  // Show recovery screen
  if (showRecovery) {
    return (
      <RecoveryScreen
        onRecover={handleRecover}
        onCancel={cancelRecovery}
        error={error}
        isLoading={authLoading}
      />
    );
  }

  // Show login screen
  if (!isUnlocked) {
    return (
      <LoginScreen
        onUnlock={unlock}
        error={error}
        isLoading={authLoading}
        onShowRecovery={initiateRecovery}
      />
    );
  }

  // Show main app
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-800 rounded-lg shadow-2xl border border-slate-700">
          <Header
            passwordCount={passwords.length}
            onLock={handleLock}
            onAddNew={() => setShowForm(!showForm)}
          />

          {showForm && (
            <AddPasswordForm
              onAdd={handleAddPassword}
              onCancel={() => {
                setShowForm(false);
                setFormError('');
              }}
              error={formError}
              isLoading={formLoading}
            />
          )}

          <div className="p-6">
            <PasswordList 
              passwords={passwords} 
              onDelete={deletePassword}
              isLoading={vaultLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;