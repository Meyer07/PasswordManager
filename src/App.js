import React, { useState } from 'react';
import useAuth from './hooks/useAuth';
import usePasswordManager from './hooks/usePasswordManager';
import LoginScreen from './components/LoginScreen';
import Header from './components/Header';
import AddPasswordForm from './components/AddPasswordForm';
import PasswordList from './components/PasswordList';

const App = () => {
  const { isUnlocked, masterPassword, error, isLoading: authLoading, unlock, lock } = useAuth();
  const { passwords, isLoading: vaultLoading, addPassword, deletePassword } = usePasswordManager(masterPassword);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

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

  if (!isUnlocked) {
    return <LoginScreen onUnlock={unlock} error={error} isLoading={authLoading} />;
  }

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