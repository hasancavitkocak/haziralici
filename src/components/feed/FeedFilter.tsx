'use client';

import React from 'react';
import { CITIES } from '@/types';
import { Search, MapPin } from 'lucide-react';
import { SearchableSelect } from '@/components/ui/SearchableSelect';

interface FeedFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
}

export const FeedFilter = ({
  searchQuery,
  onSearchChange,
  selectedCity,
  onCityChange,
}: FeedFilterProps) => {
  const cityOptions = ['Tüm Şehirler', ...CITIES.filter((c) => c !== 'Tüm Şehirler')];

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="İlanlar arasında arayın (Örn: Kiralık ev, iPhone 14)..."
          className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/15 text-sm text-slate-900 outline-none transition-all shadow-sm font-medium"
        />
      </div>

      {/* Searchable City Select */}
      <div className="sm:w-64">
        <SearchableSelect
          icon={<MapPin className="w-4 h-4 text-slate-400" />}
          placeholder="Şehir Filtrele"
          searchPlaceholder="81 İl İçinde Ara..."
          options={cityOptions}
          value={selectedCity === 'all' ? 'Tüm Şehirler' : selectedCity}
          onChange={(val) => onCityChange(val === 'Tüm Şehirler' ? 'all' : val)}
        />
      </div>
    </div>
  );
};
