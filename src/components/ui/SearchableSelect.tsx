'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
  required?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Seçiniz...',
  searchPlaceholder = 'Ara...',
  label,
  icon,
  className = '',
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) =>
    option.toLocaleLowerCase('tr-TR').includes(searchQuery.toLocaleLowerCase('tr-TR'))
  );

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-medium focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/15 outline-none transition-all shadow-sm cursor-pointer text-left"
      >
        <div className="flex items-center gap-2 overflow-hidden pr-2">
          {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
          <span className={value ? 'text-slate-900 font-semibold truncate' : 'text-slate-400 truncate'}>
            {value || placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in duration-150">
          {/* Search Box Header */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-xs py-2 px-1 text-slate-900 outline-none placeholder:text-slate-400 font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 hover:bg-slate-200 rounded-md text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-slate-200">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = option === value;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-[#312E81] text-white'
                        : 'text-slate-700 hover:bg-indigo-50 hover:text-[#312E81]'
                    }`}
                  >
                    <span className="truncate">{option}</span>
                    {isSelected && <Check className="w-4 h-4 shrink-0 text-emerald-400 ml-2" />}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-6 text-center text-xs text-slate-400">
                Aramanızla eşleşen sonuç bulunamadı.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
