import React, { useState } from 'react';
import { Download, Copy, AlertTriangle, Check } from 'lucide-react';

const RecoveryKeyDisplay = ({ recoveryKey, onConfirm }) => {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(recoveryKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const downloadRecoveryKey = () => {
    const blob = new Blob([recoveryKey], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `password-manager-recovery-key-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
  };

  const handleContinue = () => {
    if (confirmed) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg shadow-2xl p-8 max-w-2xl w-full border border-yellow-600">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Save Your Recovery Key</h2>
            <p className="text-yellow-400 text-sm">This is your ONLY way to recover access if you forget your master password</p>
          </div>
        </div>

        <div className="bg-yellow-900/30 border-2 border-yellow-600 rounded-lg p-4 mb-6">
          <p className="text-yellow-200 font-semibold mb-3">⚠️ CRITICAL - READ CAREFULLY:</p>
          <ul className="text-yellow-100 text-sm space-y-2 list-disc list-inside">
            <li>This recovery key will be shown ONLY ONCE</li>
            <li>If you lose both your master password AND this key, your data is PERMANENTLY LOST</li>
            <li>Store it somewhere safe (password manager, safe deposit box, encrypted USB drive)</li>
            <li>NEVER share this key with anyone</li>
          </ul>
        </div>

        <div className="bg-slate-900 border border-slate-600 rounded-lg p-4 mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Your Recovery Key:
          </label>
          <div className="bg-slate-800 border border-slate-700 rounded p-3 mb-3">
            <code className="text-white text-sm break-all font-mono">{recoveryKey}</code>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className={`flex-1 ${copied ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'} text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy to Clipboard
                </>
              )}
            </button>
            
            <button
              onClick={downloadRecoveryKey}
              className={`flex-1 ${downloaded ? 'bg-green-600' : 'bg-slate-700 hover:bg-slate-600'} text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2`}
            >
              {downloaded ? (
                <>
                  <Check className="w-4 h-4" />
                  Downloaded!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download as File
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-600 rounded-lg p-4 mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 w-5 h-5 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
            />
            <span className="text-slate-300 text-sm">
              I understand that this is my only recovery option. I have saved this recovery key in a secure location, 
              and I understand that losing both my master password and this key means permanent data loss.
            </span>
          </label>
        </div>

        <button
          onClick={handleContinue}
          disabled={!confirmed}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-colors font-semibold"
        >
          I Have Saved My Recovery Key - Continue
        </button>
      </div>
    </div>
  );
};

export default RecoveryKeyDisplay;