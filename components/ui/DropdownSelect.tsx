'use client';
import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { ChevronDown, Search } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  subLabel?: string;
  icon?: string;
}

export interface DropdownSelectProps {
  options: DropdownOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  searchable?: boolean;
  className?: string;
}

export function DropdownSelect({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  searchable = true,
  className,
}: DropdownSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = options.filter(
    (o) =>
      o.label.toLowerCase().includes(search.toLowerCase()) ||
      o.value.toLowerCase().includes(search.toLowerCase()) ||
      (o.subLabel && o.subLabel.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={clsx('relative w-full', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#00140a]/90 border border-[rgba(80,200,120,0.2)] hover:border-[#50C878] text-xs font-mono text-[var(--text-primary)] transition-all cursor-pointer shadow-sm"
      >
        <div className="flex items-center gap-2 truncate">
          {selected?.icon && <span>{selected.icon}</span>}
          <span className="font-bold text-[#00ff87]">{selected?.label || placeholder}</span>
          {selected?.subLabel && (
            <span className="text-[var(--text-muted)] truncate hidden sm:inline">
              ({selected.subLabel})
            </span>
          )}
        </div>
        <ChevronDown className={clsx('w-4 h-4 text-[var(--text-secondary)] transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="search-dropdown absolute top-[calc(100%+6px)] left-0 right-0 z-50 bg-[#001208]/98 border border-[rgba(80,200,120,0.3)] rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.9)] p-2 backdrop-blur-2xl max-h-64 overflow-y-auto">
          {searchable && (
            <div className="relative mb-2 px-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#001f11] border border-[rgba(80,200,120,0.2)] text-xs font-mono text-white focus:outline-none focus:border-[#50C878]"
                autoFocus
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            {filtered.length > 0 ? (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={clsx(
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono text-left transition-colors cursor-pointer',
                    opt.value === value
                      ? 'bg-[#50C878]/20 text-[#00ff87] font-bold border border-[#50C878]/30'
                      : 'text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(80,200,120,0.1)]'
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    {opt.icon && <span>{opt.icon}</span>}
                    <span className="font-bold">{opt.label}</span>
                    {opt.subLabel && <span className="text-[var(--text-muted)] text-[10px]">({opt.subLabel})</span>}
                  </div>
                  {opt.value === value && <span className="text-[#00ff87] text-xs">✓</span>}
                </button>
              ))
            ) : (
              <div className="p-3 text-center text-xs font-mono text-[var(--text-muted)]">
                No matching options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
