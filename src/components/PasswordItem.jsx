import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Trash2, Shield, ShieldCheck } from 'lucide-react';
import TOTPDisplay from './totpDisplay';
import TOTPSetupModal from './totpSetupModal';

const PasswordItem = ({ entry, onDelete, onUpdate, isVisible, onToggleVisibility }) => {
  const [copied, setCopied] = useState(false);
  const [showTOTPSetup, setShowTOTPSetup] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveTOTP = (secret) => {
    // Update the entry with the TOTP secret
    if (onUpdate) {
      onUpdate(entry.id, { ...entry, totpSecret: secret });
    }
    setShowTOTPSetup(false);
  };

  const handleRemoveTOTP = () => {
    if (window.confirm('Remove 2FA from this account?')) {
      if (onUpdate) {
        onUpdate(entry.id, { ...entry, totpSecret: null });
      }
    }
  };

  return (
    <>
      <div className="bg-slate-700 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg mb-1">{entry.site}</h3>
            <p className="text-slate-300 text-sm mb-2">{entry.username}</p>
            <div className="flex items-center gap-2">
              <input
                type={isVisible ? 'text' : 'password'}
                value={entry.password}
                readOnly
                className="bg-slate-800 border border-slate-600 rounded px-3 py-1 text-white text-sm font-mono flex-1"
              />
            </div>

            {/* Show TOTP display if secret exists */}
            {entry.totpSecret && (
              <TOTPDisplay secret={entry.totpSecret} />
            )}
          </div>

          <div className="flex gap-2 ml-4">
            <button
              onClick={onToggleVisibility}
              className="p-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
              title={isVisible ? 'Hide' : 'Show'}
            >
              {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={() => copyToClipboard(entry.password)}
              className={`p-2 ${copied ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg transition-colors`}
              title={copied ? 'Copied!' : 'Copy password'}
            >
              <Copy className="w-4 h-4" />
            </button>
            
            {/* 2FA Button */}
            {entry.totpSecret ? (
              <button
                onClick={handleRemoveTOTP}
                className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                title="Remove 2FA"
              >
                <ShieldCheck className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowTOTPSetup(true)}
                className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                title="Set up 2FA"
              >
                <Shield className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onDelete(entry.id)}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* TOTP Setup Modal */}
      {showTOTPSetup && (
        <TOTPSetupModal
          accountName={`${entry.site} (${entry.username})`}
          onSave={handleSaveTOTP}
          onCancel={() => setShowTOTPSetup(false)}
        />
      )}
    </>
  );
};

export default PasswordItem;