'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminService } from '@/services/adminService';
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
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, postsData, offersData] = await Promise.all([
        adminService.getAdminStats(),
        adminService.getRecentPosts(5),
        adminService.getRecentOffers(5),
      ]);

      setStats(statsData);
      setRecentPosts(postsData);
      setRecentOffers(offersData);
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
