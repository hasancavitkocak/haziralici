'use client';

import React, { useEffect, useState } from 'react';
import { categoryService } from '@/services/categoryService';
import { CategoryOption } from '@/types';
import {
  Layers,
  Building2,
  Car,
  Laptop,
  Armchair,
  Briefcase,
  MoreHorizontal,
  ChevronRight,
} from 'lucide-react';

interface SidebarCategoriesProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const getCategoryIcon = (id: string) => {
  switch (id) {
    case 'gayrimenkul':
      return <Building2 className="w-4 h-4" />;
    case 'vasita':
      return <Car className="w-4 h-4" />;
    case 'elektronik':
      return <Laptop className="w-4 h-4" />;
    case 'ev-esya':
      return <Armchair className="w-4 h-4" />;
    case 'hizmet':
      return <Briefcase className="w-4 h-4" />;
    default:
      return <MoreHorizontal className="w-4 h-4" />;
  }
};

export const SidebarCategories: React.FC<SidebarCategoriesProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  useEffect(() => {
    setCategories(categoryService.getCategories());
  }, []);

  const allCategories = [{ id: 'all', name: 'Tüm Kategoriler' }, ...categories];

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xl shadow-slate-200/30 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#312E81]" />
          <span>Kategoriler</span>
        </h3>
        <span className="text-[11px] font-bold text-slate-400">
          {categories.length + 1}
        </span>
      </div>

      <nav className="space-y-1.5">
        {allCategories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer group ${
                isSelected
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200/50'
                  : 'text-slate-700 hover:bg-emerald-50/80 hover:text-emerald-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`p-1.5 rounded-xl transition-colors ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-700'
                  }`}
                >
                  {cat.id === 'all' ? <Layers className="w-4 h-4" /> : getCategoryIcon(cat.id)}
                </span>
                <span>{cat.name}</span>
              </div>

              <ChevronRight
                className={`w-3.5 h-3.5 transition-transform ${
                  isSelected
                    ? 'text-white translate-x-0.5'
                    : 'text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-0.5'
                }`}
              />
            </button>
          );
        })}
      </nav>
    </div>
  );
};
