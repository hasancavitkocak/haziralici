'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PostStatus } from '@/types';
import { CheckCircle2, ChevronDown, Check, Circle } from 'lucide-react';

interface StatusSelectProps {
  value: PostStatus;
  onChange: (status: PostStatus) => void;
  disabled?: boolean;
}

const STATUS_OPTIONS: {
  id: PostStatus;
  label: string;
  badgeClass: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'active',
    label: 'Aktif İlan',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: <Circle className="w-3 h-3 fill-emerald-500 text-emerald-500" />,
  },
  {
    id: 'resolved',
    label: 'Yayından Kaldırıldı / Anlaşıldı',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />,
  },
];

export const StatusSelect = ({ value, onChange, disabled }: StatusSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentOption = STATUS_OPTIONS.find((o) => o.id === value) || STATUS_OPTIONS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
          currentOption.badgeClass
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] cursor-pointer'}`}
      >
        {currentOption.icon}
        <span>{currentOption.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-100">
          {STATUS_OPTIONS.map((option) => {
            const isSelected = option.id === value;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors ${
                  isSelected ? 'text-[#312E81] font-bold bg-indigo-50/50' : 'text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  {option.icon}
                  <span>{option.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#312E81]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
