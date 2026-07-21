'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminService } from '@/services/adminService';
import { categoryService } from '@/services/categoryService';
import { BuyerPost, SellerOffer, AdminStats } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Users,
  FileText,
  Tag,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalPosts: 0,
    activePosts: 0,
    totalOffers: 0,
  });
  const [recentPosts, setRecentPosts] = useState<BuyerPost[]>([]);
  const [recentOffers, setRecentOffers] = useState<SellerOffer[]>([]);
  const [categoryStats, setCategoryStats] = useState<{ category: string; count: number }[]>([]);
  const [weeklyTrend, setWeeklyTrend] = useState<{ day: string; posts: number; offers: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, postsData, offersData, catStatsData, trendData] = await Promise.all([
        adminService.getAdminStats(),
        adminService.getRecentPosts(5),
        adminService.getRecentOffers(5),
        adminService.getCategoryStats(),
        adminService.getWeeklyTrend(),
      ]);

      setStats(statsData);
      setRecentPosts(postsData);
      setRecentOffers(offersData);
      setCategoryStats(catStatsData);
      setWeeklyTrend(trendData);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#312E81]" />
        <span className="text-sm font-medium">Dashboard verileri yükleniyor...</span>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Toplam Kullanıcı',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      title: 'Aktif Alıcı İlanı',
      value: stats.activePosts,
      icon: FileText,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Toplam Satıcı Teklifi',
      value: stats.totalOffers,
      icon: Tag,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      title: 'Toplam Açılan İlan',
      value: stats.totalPosts,
      icon: CheckCircle2,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
  ];

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Admin Yönetim Paneli</h1>
          <p className="text-xs text-slate-500 mt-1">
            haziralici.com genel istatistikleri ve canlı veri akışı.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
        >
          Verileri Yenile
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`rounded-2xl p-5 border ${card.color} bg-white shadow-sm flex items-center justify-between`}
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {card.title}
                </span>
                <div className="text-3xl font-black text-slate-900 mt-1">
                  {card.value}
                </div>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Line Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-[#312E81]"></span>
              İlan & Teklif Trendi (Son 7 Gün)
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">Platformun son bir haftalık günlük ilan ve teklif dağılım grafiği.</p>
          </div>

          <div className="h-56 w-full relative pt-2">
            {weeklyTrend.length > 0 ? (
              <>
                {/* SVG Line Chart */}
                <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                  {/* Grid Lines */}
                  <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeWidth="1" />

                  {/* Day Labels */}
                  {weeklyTrend.map((d, i) => (
                    <text key={i} x={30 + i * 72} y="180" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">
                      {d.day}
                    </text>
                  ))}

                  {/* Dynamic Blue Line (Posts) */}
                  {(() => {
                    const trendMax = Math.max(...weeklyTrend.map((d) => Math.max(d.posts, d.offers)), 5);
                    const postsPoints = weeklyTrend.map((d, i) => `${30 + i * 72},${150 - (d.posts / trendMax) * 110}`).join(' ');
                    const offersPoints = weeklyTrend.map((d, i) => `${30 + i * 72},${150 - (d.offers / trendMax) * 110}`).join(' ');
                    return (
                      <>
                        <path
                          d={`M ${postsPoints}`}
                          fill="none"
                          stroke="#312E81"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d={`M ${offersPoints}`}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeDasharray="4 4"
                        />

                        {/* Node Dots */}
                        {weeklyTrend.map((d, i) => {
                          const px = 30 + i * 72;
                          const pyPosts = 150 - (d.posts / trendMax) * 110;
                          const pyOffers = 150 - (d.offers / trendMax) * 110;
                          return (
                            <g key={i}>
                              <circle cx={px} cy={pyPosts} r="4" fill="#312E81" className="cursor-pointer" />
                              <circle cx={px} cy={pyOffers} r="4" fill="#10b981" className="cursor-pointer" />
                            </g>
                          );
                        })}
                      </>
                    );
                  })()}
                </svg>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-400 font-semibold">
                Grafik verisi yüklenemedi.
              </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-1 right-2 flex items-center gap-4 text-[10px] font-black text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-[#312E81] rounded"></span>
                İlanlar
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-[#10b981] rounded-dashed border border-t border-emerald-500"></span>
                Teklifler
              </span>
            </div>
          </div>
        </div>

        {/* Categories Bar Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-emerald-600"></span>
              En Popüler Kategoriler
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">Platform genelinde en fazla alıcı ilanı açılan kategoriler.</p>
          </div>

          <div className="space-y-4 pt-2">
            {categoryStats.length > 0 ? (
              categoryStats.slice(0, 5).map((cat, idx) => {
                const maxCount = Math.max(...categoryStats.map(c => c.count), 1);
                const percent = `${Math.max((cat.count / maxCount) * 100, 8)}%`;
                const sysCategories = categoryService.getCategories();
                const catName = sysCategories.find((c) => c.id === cat.category)?.name ?? cat.category;
                const colors = ['bg-indigo-600', 'bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-rose-500'];
                const catColor = colors[idx % colors.length];

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">{catName}</span>
                      <span className="text-slate-400">{cat.count} İlan</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${catColor} rounded-full transition-all duration-500`} style={{ width: percent }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-xs text-slate-400 py-16 font-semibold">
                Henüz kategori istatistiği bulunmuyor.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#312E81]" />
              Son İlanlar
            </h3>
            <Link
              href="/admin/posts"
              className="text-xs font-bold text-[#312E81] hover:underline inline-flex items-center"
            >
              Tümünü Gör <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/ilan/${post.id}`}
                      className="text-xs font-bold text-slate-900 hover:text-[#312E81] truncate block"
                    >
                      {post.title}
                    </Link>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{post.profiles?.full_name || 'Alıcı'}</span>
                      <span>•</span>
                      <span>{post.location_city}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-bold text-emerald-600 block">
                      {formatCurrency(post.max_budget)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatDate(post.created_at)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">Henüz ilan bulunmuyor.</p>
            )}
          </div>
        </div>

        {/* Recent Offers */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#312E81]" />
              Son Teklifler
            </h3>
            <Link
              href="/admin/offers"
              className="text-xs font-bold text-[#312E81] hover:underline inline-flex items-center"
            >
              Tümünü Gör <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentOffers.length > 0 ? (
              recentOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {offer.buyer_posts?.title || 'İlan'}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{offer.profiles?.full_name || offer.profiles?.email}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-bold text-purple-700 block">
                      {formatCurrency(offer.price)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatDate(offer.created_at)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">Henüz teklif bulunmuyor.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
