'use client';

import React from 'react';
import { Flame, Sparkles, Clock, Layers } from 'lucide-react';

export type QuickFilterType = 'all' | 'urgent' | 'showcase' | 'newest';

interface QuickFiltersProps {
  activeFilter: QuickFilterType;
  onFilterChange: (filter: QuickFilterType) => void;
}

export const QuickFilters: React.FC<QuickFiltersProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  const filters: { id: QuickFilterType; label: string; icon: React.ReactNode }[] = [
    {
      id: 'all',
      label: 'Tüm İlanlar',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: 'urgent',
      label: 'Acil İlanlar',
      icon: <Flame className="w-4 h-4 text-rose-500" />,
    },
    {
      id: 'showcase',
      label: 'Vitrin & Öne Çıkanlar',
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
    },
    {
      id: 'newest',
      label: 'En Yeni İlanlar',
      icon: <Clock className="w-4 h-4 text-indigo-500" />,
    },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      {filters.map((filter) => {
        const isSelected = activeFilter === filter.id;
        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
              isSelected
                ? 'bg-[#312E81] text-white border-[#312E81] shadow-md shadow-indigo-900/20'
                : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <span className={isSelected ? 'text-white' : ''}>{filter.icon}</span>
            <span>{filter.label}</span>
          </button>
        );
      })}
    </div>
  );
};
