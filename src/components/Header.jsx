import React from 'react';
import { Plus, Lock, Shield } from 'lucide-react';

const Header = ({ passwordCount, onLock, onAddNew }) => {
  return (
    <div className="p-6 border-b border-slate-700 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Password Vault</h1>
          <p className="text-sm text-slate-400">
            {passwordCount} credentials • AES-256 encrypted
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onAddNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Password
        </button>
        <button
          onClick={onLock}
          className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Lock className="w-5 h-5" />
          Lock
        </button>
      </div>
    </div>
  );
};

export default Header;