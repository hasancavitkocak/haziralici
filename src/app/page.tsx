'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { BuyerPost } from '@/types';
import { postService } from '@/services/postService';
import { settingsService } from '@/services/settingsService';
import { SidebarCategories } from '@/components/feed/SidebarCategories';
import { FeedFilter } from '@/components/feed/FeedFilter';
import { QuickFilters, QuickFilterType } from '@/components/feed/QuickFilters';
import { PostCard } from '@/components/feed/PostCard';
import { Button } from '@/components/ui/Button';
import {
  PlusCircle,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowDownUp,
  Clock,
  TrendingUp,
  Megaphone,
  LayoutGrid,
  List,
} from 'lucide-react';

type SortOption = 'newest' | 'oldest' | 'budget_high' | 'budget_low';

const PAGE_SIZE = 20;

const SORT_OPTIONS: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: 'newest', label: 'En Yeni', icon: <Clock className="w-3.5 h-3.5" /> },
  { value: 'oldest', label: 'En Eski', icon: <Clock className="w-3.5 h-3.5 opacity-50" /> },
  { value: 'budget_high', label: 'Bütçe: Yüksek', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { value: 'budget_low', label: 'Bütçe: Düşük', icon: <ArrowDownUp className="w-3.5 h-3.5" /> },
];

export default function HomePage() {
  const [posts, setPosts] = useState<BuyerPost[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [quickFilter, setQuickFilter] = useState<QuickFilterType>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [announcement, setAnnouncement] = useState(() => settingsService.getDefaultSettings().announcementBanner);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('feed_view_mode') as 'grid' | 'list';
      if (saved === 'grid' || saved === 'list') {
        setViewMode(saved);
      }
      setAnnouncement(settingsService.getSettings().announcementBanner);
    }
  }, []);

  const totalPages = Math.ceil(totalPosts / PAGE_SIZE);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { posts: data, total } = await postService.getPaginatedPosts(
        selectedCategory,
        selectedCity,
        currentPage,
        PAGE_SIZE,
        sortBy
      );
      setPosts(data);
      setTotalPosts(total);
    } catch (err) {
      console.error('Fetch posts error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedCity, currentPage, sortBy]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };
  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setCurrentPage(1);
  };
  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    setCurrentPage(1);
    setIsSortOpen(false);
  };

  const filteredPosts = posts.filter((post) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (
        !post.title.toLowerCase().includes(q) &&
        !post.description.toLowerCase().includes(q) &&
        !post.location_district.toLowerCase().includes(q)
      )
        return false;
    }
    if (quickFilter === 'urgent') return post.urgency === 'today';
    if (quickFilter === 'showcase') return post.max_budget >= 20000 || post.urgency === 'today';
    return true;
  });

  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? 'En Yeni';

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-6 pb-2">
      {/* Announcement Banner */}
      {announcement?.enabled && announcement?.text && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between gap-3 shadow-sm ${
          announcement.type === 'emerald'
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
            : announcement.type === 'warning'
            ? 'bg-amber-50 text-amber-900 border-amber-200'
            : 'bg-indigo-50 text-indigo-900 border-indigo-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <Megaphone className="w-4 h-4 shrink-0 text-[#312E81]" />
            <span suppressHydrationWarning>{announcement.text}</span>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <aside className="lg:col-span-3 xl:col-span-3 space-y-6 lg:sticky lg:top-28">
          <SidebarCategories
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategoryChange}
          />
        </aside>

        {/* MAIN FEED */}
        <main className="lg:col-span-9 xl:col-span-9 space-y-6">
          {/* Search & City */}
          <FeedFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCity={selectedCity}
            onCityChange={handleCityChange}
          />

          {/* Quick Filter Tabs */}
          <QuickFilters activeFilter={quickFilter} onFilterChange={setQuickFilter} />

          {/* Section Header + Sort */}
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 gap-3 flex-wrap">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>
                {quickFilter === 'urgent'
                  ? 'Acil Alıcı İlanları'
                  : quickFilter === 'showcase'
                  ? 'Vitrin & Öne Çıkan İlanlar'
                  : quickFilter === 'newest'
                  ? 'En Yeni İlanlar'
                  : 'Aktif Alıcı İlanları'}
              </span>
              <span className="text-xs bg-[#312E81] text-white px-3 py-0.5 rounded-full font-bold">
                {totalPosts}
              </span>
            </h2>

            <div className="flex items-center gap-2">
              {/* View Switcher Toggle */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
                <button
                  onClick={() => { setViewMode('grid'); localStorage.setItem('feed_view_mode', 'grid'); }}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white text-[#312E81] shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Izgara Görünümü"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setViewMode('list'); localStorage.setItem('feed_view_mode', 'list'); }}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white text-[#312E81] shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Liste Görünümü"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activeSortLabel}</span>
                </button>
                {isSortOpen && (
                  <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-2xl shadow-lg z-20 py-1 animate-in fade-in zoom-in-95 duration-100">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleSortChange(opt.value)}
                        className={`w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold transition-colors ${
                          sortBy === opt.value
                            ? 'text-emerald-600 bg-emerald-50'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {opt.icon}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Link href="/ilan-ver" className="hidden sm:inline-block">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm whitespace-nowrap">
                  <PlusCircle className="w-4 h-4 mr-1.5" />
                  İlan Oluştur
                </Button>
              </Link>
            </div>
          </div>

          {/* Posts Feed Grid / List */}
          {loading ? (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#312E81]" />
              <span className="text-sm font-medium">İlanlar yükleniyor...</span>
            </div>
          ) : filteredPosts.length > 0 ? (
            <>
              {viewMode === 'list' ? (
                <div className="space-y-3.5">
                  {filteredPosts.map((post) => (
                    <PostCard key={post.id} post={post} viewMode="list" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredPosts.map((post) => (
                    <PostCard key={post.id} post={post} viewMode="grid" />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  {/* Info */}
                  <p className="text-xs text-slate-500 font-medium">
                    Sayfa{' '}
                    <span className="font-bold text-slate-700">{currentPage}</span>/{totalPages} —{' '}
                    <span className="font-bold text-slate-700">{totalPosts}</span> ilan
                  </p>

                  {/* Page Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {getPageNumbers().map((p, i) =>
                      p === '...' ? (
                        <span key={`ellipsis-${i}`} className="px-1 text-slate-400 text-sm">
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => goToPage(p as number)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                            currentPage === p
                              ? 'bg-[#312E81] text-white shadow-sm'
                              : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-[#312E81] flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Aradığınız kriterlere uygun ilan bulunamadı
                </h3>
                <p className="text-xs text-slate-500">
                  Filtrelerinizi değiştirebilir veya aradığınız şeyi ilk siz ilan olarak ekleyebilirsiniz.
                </p>
              </div>
              <Link href="/ilan-ver" className="inline-block pt-2">
                <Button variant="primary">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  İlan Oluştur
                </Button>
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
