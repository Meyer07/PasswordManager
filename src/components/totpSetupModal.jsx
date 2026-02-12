import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Smartphone, AlertCircle } from 'lucide-react';
import totpUtils from '../utils/totp';
import QRCode from 'qrcode';

const TOTPSetupModal = ({ accountName, onSave, onCancel }) => {
  const [secret, setSecret] = useState('');
  const [qrCodeURL, setQRCodeURL] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Generate secret on mount
    const newSecret = totpUtils.generateSecret();
    setSecret(newSecret);

    // Generate QR code
    const otpauthURL = totpUtils.generateQRCodeURL(newSecret, accountName);
    QRCode.toDataURL(otpauthURL, { width: 300 })
      .then(url => setQRCodeURL(url))
      .catch(err => console.error('QR code generation failed:', err));
  }, [accountName]);

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    const isValid = await totpUtils.verifyTOTP(secret, verificationCode);
    
    if (isValid) {
      onSave(secret);
    } else {
      setError('Invalid code. Please try again.');
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg shadow-2xl p-6 max-w-md w-full border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Set Up 2FA</h2>
              <p className="text-slate-400 text-sm">{accountName}</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
            <p className="text-blue-200 text-sm">
              <strong>Step 1:</strong> Scan this QR code with your authenticator app 
              (Google Authenticator, Authy, 1Password, etc.)
            </p>
          </div>

          {/* QR Code */}
          {qrCodeURL && (
            <div className="flex justify-center bg-white p-4 rounded-lg">
              <img src={qrCodeURL} alt="TOTP QR Code" className="w-64 h-64" />
            </div>
          )}

          {/* Manual Entry */}
          <div className="bg-slate-900 border border-slate-600 rounded-lg p-4">
            <p className="text-slate-300 text-sm mb-2">
              <strong>Can't scan?</strong> Enter this code manually:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm font-mono break-all">
                {secret}
              </code>
              <button
                onClick={copySecret}
                className={`p-2 ${copied ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg transition-colors`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Verification */}
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
            <p className="text-blue-200 text-sm mb-3">
              <strong>Step 2:</strong> Enter the 6-digit code from your authenticator app
            </p>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => {
                setError('');
                setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
              }}
              placeholder="000000"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={6}
            />
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleVerify}
              disabled={verificationCode.length !== 6}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-colors font-semibold"
            >
              Verify & Save
            </button>
            <button
              onClick={onCancel}
              className="px-6 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TOTPSetupModal;