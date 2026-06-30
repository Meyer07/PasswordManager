import React, { useState } from 'react';
import { Lock, Loader2, Search, X } from 'lucide-react';
import PasswordItem from './PasswordItem';

const PasswordList = ({ passwords, onDelete, onUpdate, isLoading }) => {
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const toggleVisibility = (id) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = searchQuery.trim()
    ? passwords.filter(p => p.site.toLowerCase().includes(searchQuery.toLowerCase()))
    : passwords;

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-16 h-16 text-slate-600 mx-auto mb-4 animate-spin" />
        <p className="text-slate-400 text-lg">Decrypting vault...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Search bar — always visible once vault is unlocked */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by site name…"
          className="w-full bg-slate-700 border border-slate-600 text-slate-200 placeholder-slate-400 rounded-lg pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Result count — only shown while searching */}
      {searchQuery.trim() && (
        <p className="text-xs text-slate-500 mb-3">
          {filtered.length === 0
            ? 'No results'
            : `${filtered.length} of ${passwords.length} ${passwords.length === 1 ? 'entry' : 'entries'}`}
        </p>
      )}

      {/* Empty vault */}
      {passwords.length === 0 && (
        <div className="text-center py-12">
          <Lock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No passwords stored yet</p>
          <p className="text-slate-500 text-sm mt-2">Click "Add Password" to get started</p>
        </div>
      )}

      {/* No search results */}
      {passwords.length > 0 && filtered.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No results for "{searchQuery}"</p>
          <p className="text-slate-500 text-sm mt-2">Try a different site name</p>
        </div>
      )}

      {/* Password list */}
      {filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((entry) => (
            <PasswordItem
              key={entry.id}
              entry={entry}
              onDelete={onDelete}
              onUpdate={onUpdate}
              isVisible={visiblePasswords[entry.id]}
              onToggleVisibility={() => toggleVisibility(entry.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordList;