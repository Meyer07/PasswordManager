import React from 'react';

const PrivacyPolicy = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-slate-100">
      <div className="max-w-3xl mx-auto bg-slate-800 rounded-lg shadow-2xl border border-slate-700 p-8">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-700 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Privacy Policy
          </h1>
          <button 
            onClick={onBack}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm font-medium transition-colors"
          >
            ← Back to App
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">1. Zero-Knowledge Architecture</h2>
            <p>
              Our application is built on a <strong>Zero-Knowledge security model</strong>. Your master password, 
              decrypted vault credentials, and cryptographic keys live strictly within your local browser's memory 
              execution context. We never see, log, or store your unencrypted secrets.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">2. Data Localism & Encryption</h2>
            <p>
              All vault entries are encrypted locally on your machine using standard military-grade AES-256-GCM 
              encryption before any backup transmission occurs. Because encryption keys are generated directly 
              from your master password client-side, it is cryptographically impossible for us to recover your 
              data if you lose your master credentials.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">3. Third-Party Connections</h2>
            <p>
              To check if your passwords have been leaked in historical data breaches, this application contacts 
              the <em>HaveIBeenPwned</em> API securely via local, anonymized data queries (k-Anonymity model). 
              No plain text usernames or passwords are ever transmitted over the network.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">4. Technical Cookies</h2>
            <p>
              We do not track you using analytical cookies, cross-site tracking markers, or ad-targeting software. 
              Transient browser storage mechanisms (Session Storage) are used strictly to maintain app state 
              while your vault is active, and are automatically purged when your auto-lock timer fires or when 
              the session finishes.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-700 text-xs text-slate-500 text-center">
          Last Updated: May 2026 • Secure Client-Side Build
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;