import React, { useRef, useState } from 'react';
import { Plus, Lock, Shield, Search, Upload, Download, Settings } from 'lucide-react';
import backupUtils from '../utils/backup';

const Header = ({ passwordCount, onLock, onAddNew, onAudit, passwords, masterPassword, onImport, onToast, onToggleSettings, settingsOpen }) => {
  const fileInputRef = useRef(null);
  const [importError, setImportError] = useState('');

  const handleExport = async () => {
    if (!masterPassword) {
      onToast('Export failed: vault is not unlocked.', 'error');
      return;
    }
    try {
      const data = await backupUtils.export_vault(passwords, masterPassword);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const filename = `vault-backup-${new Date().toISOString().slice(0, 10)}.json`;
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      onToast('Vault exported successfully', 'success');
    } catch (err) {
      console.error('[Export error]', err);
      onToast('Export failed. Check the console for details.', 'error');
    }
  };

  const handleImportClick = () => {
    setImportError('');
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    setImportError('');
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';

    try {
      const parsed = await backupUtils.parse_backup_file(file);
      const imported = await backupUtils.import_vault(parsed, masterPassword);

      if (!imported) {
        setImportError('Could not decrypt backup. Make sure this file was exported from this vault.');
        return;
      }

      const { added, skipped } = await onImport(imported);
      const msg = skipped > 0
        ? `${added} passwords imported, ${skipped} duplicate${skipped !== 1 ? 's' : ''} skipped`
        : `${added} password${added !== 1 ? 's' : ''} imported`;
      onToast(msg, 'success');
    } catch (err) {
      setImportError(err.message);
    }
  };

  return (
    <div className="border-b border-slate-700">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Password Vault</h1>
            <p className="text-sm text-slate-400">
              {passwordCount} credentials • AES-256 encrypted
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onAudit}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            title="Security Audit"
          >
            <Search className="w-5 h-5" />
            <span className="hidden sm:inline">Audit</span>
          </button>

          <button
            onClick={handleExport}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            title="Export vault"
          >
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={handleImportClick}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            title="Import backup"
          >
            <Upload className="w-5 h-5" />
            <span className="hidden sm:inline">Import</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            onClick={onAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Password</span>
          </button>

          <button
            onClick={onLock}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Lock className="w-5 h-5" />
            <span className="hidden sm:inline">Lock</span>
          </button>

          <button
            onClick={onToggleSettings}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              settingsOpen
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
            title="Settings"
            aria-pressed={settingsOpen}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {importError && (
        <div className="mx-6 mb-4 flex items-center gap-2 text-sm text-red-400 bg-red-950/40 border border-red-800/50 rounded-lg px-4 py-2">
          <span className="shrink-0">⚠</span>
          <span>{importError}</span>
          <button
            onClick={() => setImportError('')}
            className="ml-auto text-red-400 hover:text-red-300 transition-colors"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default Header;