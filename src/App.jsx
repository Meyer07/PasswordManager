import React, { useState, useCallback } from 'react';
import useAuth from './hooks/useAuth';
import usePasswordManager from './hooks/usePasswordManager';
import { useAutoLock } from './hooks/useAutoLock';
import useSettings from './hooks/useSettings';
import LoginScreen from './components/LoginScreen';
import PrivacyPolicy from './components/PrivacyPolicy';
import RecoveryScreen from './components/RecoveryScreen';
import RecoveryKeyDisplay from './components/RecoveryKeyDisplay';
import NewMasterPasswordScreen from './components/NewMasterPasswordScreen';
import Header from './components/Header';
import AddPasswordForm from './components/AddPasswordForm';
import PasswordList from './components/PasswordList';
import VaultAudit from './components/VaultAudit';
import SettingsPanel from './components/SettingsPanel';
import Toast from './components/Toast';
import backupUtils from './utils/backup';

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
  
  const { 
    passwords, 
    isLoading: vaultLoading, 
    addPassword, 
    deletePassword, 
    updatePassword,
    importPasswords,
    savePasswords,
  } = usePasswordManager(masterPassword);

  const { settings, updateSetting } = useSettings();

  useAutoLock(isUnlocked, lock, settings.autoLockEnabled ? settings.autoLockTimeout : null);

  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [recoveryState, setRecoveryState] = useState(null);
  const [showAudit, setShowAudit] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPrivacyPolicy,setShowPrivacyPolicy]=useState(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

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
    setShowAudit(false);
    setShowSettings(false);
    setFormError('');
    setToast(null);
  };

  const handleRecover = async (userRecoveryKey) => {
    const result = await recoverAccount(userRecoveryKey);
    if (result && result.success) {
      setRecoveryState(result.recoveredHash);
    }
  };

  const handleSetNewPassword = async (newPassword) => {
    const success = await setNewMasterPassword(newPassword, recoveryState);
    if (success) setRecoveryState(null);
  };

  // Restore from a localStorage snapshot — replaces the live vault after confirmation
  const handleRestoreSnapshot = async (restoredPasswords) => {
    await savePasswords(restoredPasswords);
  };

  if(showPrivacyPolicy)
  {
    return <PrivacyPolicy onBack={()=>setShowPrivacyPolicy(false)}/>;
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
        onShowPrivacyPolicy={()=>setShowPrivacyPolicy(true)}
      />
    );
  }

  const snapshots = backupUtils.get_auto_backups();

  // Show main app
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-800 rounded-lg shadow-2xl border border-slate-700">
          <Header
            passwordCount={passwords.length}
            onLock={handleLock}
            onAddNew={() => setShowForm(!showForm)}
            onAudit={() => setShowAudit(true)}
            passwords={passwords}
            masterPassword={masterPassword}
            onImport={importPasswords}
            onToast={showToast}
            onToggleSettings={() => setShowSettings(prev => !prev)}
            settingsOpen={showSettings}
          />

          {showSettings && (
            <SettingsPanel
              settings={settings}
              onUpdate={updateSetting}
              snapshots={snapshots}
              masterPassword={masterPassword}
              onRestoreSnapshot={handleRestoreSnapshot}
              onToast={showToast}
              onClose={() => setShowSettings(false)}
            />
          )}

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
              onUpdate={updatePassword}
              isLoading={vaultLoading}
            />
          </div>
        </div>
      </div>

      {showAudit && (
        <VaultAudit
          passwords={passwords}
          onClose={() => setShowAudit(false)}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default App;