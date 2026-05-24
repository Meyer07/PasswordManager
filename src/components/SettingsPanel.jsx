import React from 'react';
import { X, Database } from 'lucide-react';
import backupUtils from '../utils/backup';

const TIMEOUT_OPTIONS = [1, 5, 10, 15, 30];
const FREQUENCY_OPTIONS = [
  { value: 'onlock', label: 'On lock' },
  { value: 'daily',  label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
];

// Toggle switch component
const Toggle = ({ checked, onChange, id }) => (
  <button
    id={id}
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
      checked ? 'bg-blue-600' : 'bg-slate-600'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

// Section divider with label
const Section = ({ label, children }) => (
  <div className="py-4 border-t border-slate-700 first:border-t-0 first:pt-0">
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{label}</p>
    <div className="space-y-4">{children}</div>
  </div>
);

// A single settings row
const Row = ({ label, description, control }) => (
  <div className="flex items-center justify-between gap-4">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-slate-200">{label}</p>
      {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
    </div>
    <div className="shrink-0">{control}</div>
  </div>
);

const SettingsPanel = ({ settings, onUpdate, snapshots, masterPassword, onRestoreSnapshot, onToast, onClose }) => {
  const handleRestoreSnapshot = async (snapshot, index) => {
    const passwords = await backupUtils.restoreAutoBackup(snapshot, masterPassword);
    if (!passwords) {
      onToast('Could not restore snapshot. It may be corrupted or from a different vault.', 'error');
      return;
    }
    onRestoreSnapshot(passwords);
    onToast('Snapshot restored successfully', 'success');
  };

  const formatSnapshotTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = date.toDateString() === new Date(now - 86400000).toDateString();

    const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    if (isToday) return `Today, ${time}`;
    if (isYesterday) return `Yesterday, ${time}`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + `, ${time}`;
  };

  return (
    <div className="border-b border-slate-700 bg-slate-800">
      {/* Panel header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
        <div>
          <h2 className="text-base font-semibold text-white">Settings</h2>
          <p className="text-xs text-slate-400">Manage your vault preferences</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors p-1 rounded"
          aria-label="Close settings"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-6 py-4">

        {/* Security */}
        <Section label="Security">
          <Row
            label="Auto-lock"
            description="Lock vault automatically after inactivity"
            control={
              <Toggle
                checked={settings.autoLockEnabled}
                onChange={(val) => onUpdate('autoLockEnabled', val)}
              />
            }
          />
          {settings.autoLockEnabled && (
            <Row
              label="Lock after"
              description="Inactivity timeout before locking"
              control={
                <select
                  value={settings.autoLockTimeout}
                  onChange={(e) => onUpdate('autoLockTimeout', Number(e.target.value))}
                  className="bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TIMEOUT_OPTIONS.map(t => (
                    <option key={t} value={t}>{t} {t === 1 ? 'minute' : 'minutes'}</option>
                  ))}
                </select>
              }
            />
          )}
        </Section>

        {/* Backups */}
        <Section label="Backups">
          <Row
            label="Auto-backup"
            description="Save encrypted snapshots and prompt to download"
            control={
              <Toggle
                checked={settings.autoBackup}
                onChange={(val) => onUpdate('autoBackup', val)}
              />
            }
          />
          {settings.autoBackup && (
            <Row
              label="Backup frequency"
              control={
                <select
                  value={settings.backupFrequency}
                  onChange={(e) => onUpdate('backupFrequency', e.target.value)}
                  className="bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {FREQUENCY_OPTIONS.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              }
            />
          )}

          {/* Saved snapshots */}
          {snapshots.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-px bg-slate-700" />
                <span className="text-xs text-slate-500 whitespace-nowrap">Saved snapshots</span>
                <div className="flex-1 h-px bg-slate-700" />
              </div>
              <div className="space-y-2">
                {snapshots.map((snapshot, index) => (
                  <div
                    key={snapshot.timestamp}
                    className="flex items-center justify-between bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <Database className="w-4 h-4 text-blue-400 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-slate-200">
                          {formatSnapshotTime(snapshot.timestamp)}
                        </p>
                        <p className="text-xs text-slate-400">
                          {snapshot.passwordCount} password{snapshot.passwordCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {index === 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-300 border border-blue-700/50">
                          Latest
                        </span>
                      )}
                      <button
                        onClick={() => handleRestoreSnapshot(snapshot, index)}
                        className="text-xs px-2.5 py-1 rounded-md bg-slate-600 hover:bg-slate-500 text-slate-200 transition-colors"
                      >
                        Restore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {snapshots.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-2">
              No snapshots yet — enable auto-backup to start saving them.
            </p>
          )}
        </Section>
      </div>
    </div>
  );
};

export default SettingsPanel;