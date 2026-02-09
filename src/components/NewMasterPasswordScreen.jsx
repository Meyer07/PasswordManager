import React, { useState } from 'react';
import { Lock, Shield, AlertCircle, Loader2 } from 'lucide-react';

const NewMasterPasswordScreen = ({ onSetPassword, error, isLoading }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    setLocalError('');
    await onSetPassword(password);
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Set New Master Password</h1>
          <p className="text-slate-400">Recovery successful! Create a new master password</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              New Master Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              placeholder="Enter new master password"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Confirm Master Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              placeholder="Confirm new master password"
            />
          </div>

          {(error || localError) && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error || localError}
            </div>
          )}

          <div className="bg-green-900/30 border border-green-700 rounded-lg p-3 text-xs text-green-200">
            <p className="font-semibold mb-1">✓ Account Recovered</p>
            <p>You'll receive a new recovery key after setting your password. Make sure to save it!</p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading || !password || !confirmPassword}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Setting Password...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Set New Master Password
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewMasterPasswordScreen;