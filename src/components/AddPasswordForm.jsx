import React, { useState, useEffect } from 'react';
import { Key, AlertCircle, Loader2, Smartphone } from 'lucide-react';
import passwordGenerator from '../utils/passwordGenerator';
import breachCheckUtils from '../utils/breachCheck';
import BreachIndicator from './BreachIndicator';
import TOTPSetupModal from './totpSetupModal';

const AddPasswordForm = ({ onAdd, onCancel, error, isLoading }) => {
  const [entry, setEntry] = useState({ site: '', username: '', password: '', totpSecret: '' });
  const [strength, setStrength] = useState(0);
  const [breachStatus, setBreachStatus] = useState(null);
  const [checkingBreach, setCheckingBreach] = useState(false);
  const [showTOTPSetup, setShowTOTPSetup] = useState(false);

  // Check for breaches when password changes (debounced)
  useEffect(() => {
    if (!entry.password || entry.password.length < 4) {
      setBreachStatus(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingBreach(true);
      const result = await breachCheckUtils.checkPassword(entry.password);
      setBreachStatus(result);
      setCheckingBreach(false);
    }, 500); // Debounce 500ms

    return () => clearTimeout(timer);
  }, [entry.password]);

  const handlePasswordChange = (password) => {
    setEntry({ ...entry, password });
    setStrength(passwordGenerator.calculateStrength(password));
  };

  const handleGenerate = () => {
    const generated = passwordGenerator.generate(16);
    handlePasswordChange(generated);
  };

  const handleSubmit = async () => {
    await onAdd(entry);
  };

  const handleTOTPSave = (secret) => {
    setEntry({ ...entry, totpSecret: secret });
    setShowTOTPSetup(false);
  };

  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="p-6 bg-slate-750 border-b border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4">Add New Credential</h3>
      <div className="grid gap-4">
        <input
          type="text"
          placeholder="Website/Service (e.g., github.com)"
          value={entry.site}
          onChange={(e) => setEntry({ ...entry, site: e.target.value })}
          disabled={isLoading}
          className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <input
          type="text"
          placeholder="Username/Email"
          value={entry.username}
          onChange={(e) => setEntry({ ...entry, username: e.target.value })}
          disabled={isLoading}
          className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Password"
              value={entry.password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Key className="w-5 h-5" />
              Generate
            </button>
          </div>
          {entry.password && (
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${strengthColors[strength - 1]}`}
                    style={{ width: `${(strength / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-20">{strengthLabels[strength - 1]}</span>
              </div>
              {checkingBreach && (
                <p className="text-xs text-slate-400 mt-1">Checking breach database...</p>
              )}
              <BreachIndicator breachStatus={breachStatus} />
            </div>
          )}
        </div>

        {/* 2FA Setup */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Two-Factor Authentication (Optional)
          </label>
          {entry.totpSecret ? (
            <div className="bg-green-900/30 border border-green-700 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-green-400" />
                <span className="text-green-200 text-sm">2FA Enabled</span>
              </div>
              <button
                onClick={() => setEntry({ ...entry, totpSecret: '' })}
                className="text-red-400 hover:text-red-300 text-sm transition-colors"
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowTOTPSetup(true)}
              disabled={isLoading || !entry.site}
              className="w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              Set Up 2FA
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Password'
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPasswordForm;