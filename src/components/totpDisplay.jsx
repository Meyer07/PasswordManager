import React, { useState, useEffect } from 'react';
import { Copy, Clock, Check } from 'lucide-react';
import totpUtils from '../utils/totp.js'; // Fixed: proper import path

const TOTPDisplay = ({ secret }) => {
    const [totp, setTOTP] = useState({ code: '------', timeRemaining: 30 });
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!secret) {
            return;
        }

        const updateTOTP = async () => {
            const result = await totpUtils.generateTOTP(secret);
            setTOTP(result);
        };

        updateTOTP();

        const interval = setInterval(updateTOTP, 1000);

        return () => clearInterval(interval);
    }, [secret]);

    const copyCode = () => {
        navigator.clipboard.writeText(totp.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const progressPercent = (totp.timeRemaining / 30) * 100;
    const isExpiring = totp.timeRemaining <= 5; // Fixed: consistent naming

    return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 mt-2">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-400">2FA Code</span>
                </div>
                <div className={`text-xs font-mono ${isExpiring ? 'text-yellow-400' : 'text-slate-400'}`}>
                    {totp.timeRemaining}s
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-700 rounded px-3 py-2">
                    <code className={`text-2xl font-bold tracking-wider ${isExpiring ? 'text-yellow-400' : 'text-white'}`}>
                        {totp.code}
                    </code>
                </div>
                <button
                    onClick={copyCode}
                    className={`p-2 ${copied ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg transition-colors`}
                    title={copied ? 'Copied!' : 'Copy code'}
                >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
            </div>

            {/* Progress bar */}
            <div className="mt-2 bg-slate-700 rounded-full h-1 overflow-hidden">
                <div
                    className={`h-full transition-all duration-1000 ${isExpiring ? 'bg-yellow-500' : 'bg-blue-500'}`}
                    style={{ width: `${progressPercent}%` }}
                />
            </div>
        </div>
    );
};

export default TOTPDisplay;