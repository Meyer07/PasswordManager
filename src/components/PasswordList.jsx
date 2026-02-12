import React, { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import PasswordItem from './PasswordItem';

const PasswordList = ({ passwords, onDelete, onUpdate, isLoading }) => {
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const toggleVisibility = (id) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-16 h-16 text-slate-600 mx-auto mb-4 animate-spin" />
        <p className="text-slate-400 text-lg">Decrypting vault...</p>
      </div>
    );
  }

  if (passwords.length === 0) {
    return (
      <div className="text-center py-12">
        <Lock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400 text-lg">No passwords stored yet</p>
        <p className="text-slate-500 text-sm mt-2">Click "Add Password" to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {passwords.map((entry) => (
        <PasswordItem
          key={entry.id}
          entry={entry}
          onDelete={onDelete}
          onUpdate={onUpdate}
          isVisible={visiblePasswords[entry.id]}
          onToggleVisibility={() => toggleVisibility(entry.id)}
        />
      ))}
    </div>
  );
};

export default PasswordList;