import React, { useState } from 'react';
import { Lock, Shield, AlertCircle, Loader2 } from 'lucide-react';

const LoginScreen = ({ onUnlock, error, isLoading }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    await onUnlock(password);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg shadow-2xl p-8 w-full max-w-md border border-slate-700">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Password Manager</h1>
          <p className="text-slate-400">Secure vault with AES-256-GCM encryption</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Master Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="Enter master password"
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Unlocking...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Unlock Vault
              </>
            )}
          </button>

          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-xs text-slate-300">
            <p className="font-semibold mb-1">🔒 Security Features:</p>
            <ul className="space-y-1 ml-4">
              <li>• AES-256-GCM encryption</li>
              <li>• PBKDF2 key derivation (100k iterations)</li>
              <li>• Minimum 12 character master password</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;