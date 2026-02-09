import React, {useState} from 'react';
import {Key,AlertCircle,Loader2} from 'lucide-react';

const RecoveryScreen=({onRecover,onCancel,error,isLoading})=>
{
    const [recoveryKey,setRecoveryKey]=useState('');


    const handleSubmit=async()=>
    {
        await onRecover(recoveryKey);
    };

    const handleKeyPress=(e)=>
    {
        if(e.key==='Enter'&&!isLoading)
        {
            handleSubmit();
        }
    };

    return( <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-lg shadow-2xl p-8 w-full max-w-md border border-slate-700">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-600 rounded-full mb-4">
              <Key className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Account Recovery</h1>
            <p className="text-slate-400">Enter your recovery key to regain access</p>
          </div>
  
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Recovery Key
              </label>
              <textarea
                value={recoveryKey}
                onChange={(e) => setRecoveryKey(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                rows={4}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 font-mono text-sm"
                placeholder="Paste your recovery key here..."
                autoFocus
              />
            </div>
  
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
  
            <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3 text-xs text-yellow-200">
              <p className="font-semibold mb-1">⚠️ Important:</p>
              <p>Your recovery key was shown to you when you first created your account. If you don't have it, your data cannot be recovered.</p>
            </div>
  
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={isLoading || !recoveryKey.trim()}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Recovering...
                  </>
                ) : (
                  <>
                    <Key className="w-5 h-5" />
                    Recover Account
                  </>
                )}
              </button>
              
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="px-6 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
  
            <div className="pt-4 border-t border-slate-700">
              <p className="text-slate-400 text-xs text-center">
                Don't have your recovery key? Unfortunately, your data cannot be recovered. 
                This is by design to ensure maximum security.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
};

export default RecoveryScreen;
