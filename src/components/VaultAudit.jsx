import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Loader2, X } from 'lucide-react';
import breachCheckUtils from '../utils/breachCheck';

const VaultAudit = ({ passwords, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState(null);

  const runAudit = async () => {
    setIsScanning(true);
    const auditResults = await breachCheckUtils.checkMultiplePasswords(passwords);
    setResults(auditResults);
    setIsScanning(false);
  };

  const breachedCount = results?.filter(r => r.breached).length || 0;
  const safeCount = results?.filter(r => !r.breached && !r.error).length || 0;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg shadow-2xl p-6 max-w-2xl w-full border border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Security Audit</h2>
              <p className="text-slate-400 text-sm">Check passwords against breach database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!results && !isScanning && (
          <div className="text-center py-8">
            <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-300 mb-6">
              Scan your {passwords.length} passwords against the HaveIBeenPwned database
            </p>
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-6 text-left">
              <p className="text-blue-200 text-sm mb-2">
                <strong>How it works:</strong>
              </p>
              <ul className="text-blue-200 text-sm space-y-1 list-disc list-inside">
                <li>Uses k-anonymity - your passwords are never sent to the API</li>
                <li>Checks against 600+ million breached passwords</li>
                <li>Takes ~{Math.ceil(passwords.length / 10)} seconds for {passwords.length} passwords</li>
              </ul>
            </div>
            <button
              onClick={runAudit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
            >
              Start Security Audit
            </button>
          </div>
        )}

        {isScanning && (
          <div className="text-center py-12">
            <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <p className="text-slate-300 text-lg">Scanning passwords...</p>
            <p className="text-slate-500 text-sm mt-2">
              This may take a moment. Please wait.
            </p>
          </div>
        )}

        {results && (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-red-200 font-semibold">Compromised</span>
                </div>
                <p className="text-3xl font-bold text-red-400">{breachedCount}</p>
              </div>
              <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-200 font-semibold">Safe</span>
                </div>
                <p className="text-3xl font-bold text-green-400">{safeCount}</p>
              </div>
            </div>

            {breachedCount > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-3">⚠️ Compromised Passwords</h3>
                <div className="space-y-2">
                  {results.filter(r => r.breached).map(result => (
                    <div key={result.id} className="bg-red-900/30 border border-red-700 rounded-lg p-3">
                      <p className="text-white font-semibold">{result.site}</p>
                      <p className="text-slate-300 text-sm">{result.username}</p>
                      <p className="text-red-300 text-xs mt-1">
                        Found in {result.count.toLocaleString()} data breaches
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {safeCount > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">✓ Safe Passwords</h3>
                <div className="space-y-2">
                  {results.filter(r => !r.breached && !r.error).map(result => (
                    <div key={result.id} className="bg-slate-700 rounded-lg p-3">
                      <p className="text-white font-semibold">{result.site}</p>
                      <p className="text-slate-300 text-sm">{result.username}</p>
                      <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        No known breaches
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-700">
              <button
                onClick={onClose}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg transition-colors"
              >
                Close Audit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VaultAudit;