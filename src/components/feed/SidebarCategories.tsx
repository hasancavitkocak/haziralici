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
  ChevronDown,
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
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  useEffect(() => {
    setCategories(categoryService.getCategories());
  }, []);

  const allCategories = [{ id: 'all', name: 'Tüm Kategoriler' }, ...categories];
  const selectedCatObj = allCategories.find((c) => c.id === selectedCategory) || allCategories[0];

  const handleSelect = (id: string) => {
    onSelectCategory(id);
    setIsOpenMobile(false);
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xl shadow-slate-200/30">
      {/* Mobile Toggle Button / Desktop Header */}
      <button
        type="button"
        onClick={() => setIsOpenMobile(!isOpenMobile)}
        className="w-full flex items-center justify-between lg:cursor-default lg:border-b lg:border-slate-100 lg:pb-3 cursor-pointer select-none"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Layers className="w-4 h-4 text-[#312E81] shrink-0" />
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider shrink-0">
            Kategoriler
          </h3>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full truncate max-w-[140px] sm:max-w-[200px] lg:hidden">
            {selectedCatObj.name}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden lg:inline-block text-[11px] font-bold text-slate-400">
            {categories.length + 1}
          </span>
          <div className="lg:hidden p-1 rounded-lg bg-slate-100 text-slate-600">
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpenMobile ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>
      </button>

      {/* Nav list: Collapsible on mobile (<lg), always open on desktop (>=lg) */}
      <nav className={`space-y-1.5 mt-3 lg:mt-3 ${isOpenMobile ? 'block' : 'hidden lg:block'}`}>
        {allCategories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleSelect(cat.id)}
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
