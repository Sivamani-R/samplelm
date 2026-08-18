import React from 'react';
import { Search, X } from 'lucide-react';

/**
 * Reusable Search Bar Component with Clear button
 */
export const SearchBar = ({
  value = '',
  onChange,
  onClear = null,
  placeholder = 'Search records...',
  className = ''
}) => {
  return (
    <div className={`search-bar ${className}`.trim()}>
      <Search size={15} className="search-icon" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-input"
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          style={{
            position: 'absolute',
            right: '8px',
            color: 'var(--text-tertiary)',
            padding: '2px',
            display: 'flex',
            alignItems: 'center'
          }}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
