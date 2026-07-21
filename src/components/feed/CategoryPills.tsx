'use client';

import React, { useEffect, useState } from 'react';
import { categoryService } from '@/services/categoryService';
import { CategoryOption } from '@/types';
import { cn } from '@/lib/utils';
import { LayoutGrid, Home, Car, Smartphone, Sofa, Briefcase, MoreHorizontal } from 'lucide-react';

interface CategoryPillsProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  gayrimenkul: <Home className="w-4 h-4" />,
  vasita: <Car className="w-4 h-4" />,
  elektronik: <Smartphone className="w-4 h-4" />,
  'ev-esya': <Sofa className="w-4 h-4" />,
  hizmet: <Briefcase className="w-4 h-4" />,
  diger: <MoreHorizontal className="w-4 h-4" />,
};

export const CategoryPills = ({
  selectedCategory,
  onSelectCategory,
}: CategoryPillsProps) => {
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  useEffect(() => {
    setCategories(categoryService.getCategories());
  }, []);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      <button
        onClick={() => onSelectCategory('all')}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border',
          selectedCategory === 'all'
            ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-100'
            : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700'
        )}
      >
        <LayoutGrid className="w-4 h-4" />
        Tüm İlanlar
      </button>

      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border',
              isSelected
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-100'
                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700'
            )}
          >
            {CATEGORY_ICONS[cat.id] || <MoreHorizontal className="w-4 h-4" />}
            {cat.name}
          </button>
        );
      })}
    </div>
  );
};
