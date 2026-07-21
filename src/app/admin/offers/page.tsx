'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { offerService } from '@/services/offerService';
import { SellerOffer } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { auditLogService } from '@/services/auditLogService';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  Tag,
  Search,
  Trash2,
  ExternalLink,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function AdminOffersPage() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<SellerOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const data = await offerService.getAllOffersForAdmin();
      setOffers(data);
    } catch (err) {
      console.error('Fetch offers error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleDeleteOffer = async (offerId: string) => {
    if (!confirm('Bu teklifi silmek istediğinize emin misiniz?')) {
      return;
    }

    const offerObj = offers.find((o) => o.id === offerId);
    setDeletingId(offerId);
    try {
      const { success, error } = await offerService.deleteOffer(offerId);
      if (success) {
        // Log action
        auditLogService.logAction(
          'Teklif Silindi',
          `"${offerObj?.profiles?.full_name || 'Satıcı'}" tarafından "${offerObj?.buyer_posts?.title || 'İlan'}" ilanına verilen ₺${offerObj?.price || 0} tutarındaki teklif silindi.`,
          user?.email || 'Admin'
        );

        setOffers(offers.filter((o) => o.id !== offerId));
      } else {
        alert('Teklif silinemedi: ' + error);
      }
    } catch (err: any) {
      alert('Hata: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredOffers = offers.filter((offer) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      offer.description.toLowerCase().includes(q) ||
      (offer.profiles?.full_name && offer.profiles.full_name.toLowerCase().includes(q)) ||
      (offer.buyer_posts?.title && offer.buyer_posts.title.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Tag className="w-6 h-6 text-[#312E81]" />
            Teklif Yönetimi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Platformdaki tüm gizli teklifleri admin yetkisiyle denetleyin ve gerektiğinde silin.
          </p>
        </div>
        <span className="text-xs font-bold bg-[#312E81] text-white px-3.5 py-1.5 rounded-full">
          {filteredOffers.length} Teklif
        </span>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Teklif açıklaması, satıcı adı veya ilan başlığı ile ara..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/15 text-sm outline-none shadow-sm"
        />
      </div>

      {/* Offers Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#312E81]" />
            <span className="text-sm font-medium">Teklifler yükleniyor...</span>
          </div>
        ) : filteredOffers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 uppercase text-[10px] font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Satıcı</th>
                  <th className="px-6 py-4">Telefon</th>
                  <th className="px-6 py-4">İlan</th>
                  <th className="px-6 py-4">Fiyat</th>
                  <th className="px-6 py-4">Açıklama</th>
                  <th className="px-6 py-4">Tarih</th>
                  <th className="px-6 py-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOffers.map((offer) => {
                  const isDeleting = deletingId === offer.id;
                  const sellerName = offer.profiles?.full_name || offer.profiles?.email || 'Satıcı';

                  return (
                    <tr key={offer.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{sellerName}</td>

                      <td className="px-6 py-4 font-mono text-slate-700 font-bold">
                        {offer.profiles?.phone ? (
                          <a href={`tel:${offer.profiles.phone}`} className="text-emerald-700 hover:underline">
                            {offer.profiles.phone}
                          </a>
                        ) : (
                          <span className="text-slate-400 font-normal italic">-</span>
                        )}
                      </td>

                      <td className="px-6 py-4 max-w-xs">
                        {offer.buyer_posts ? (
                          <Link
                            href={`/ilan/${offer.buyer_posts.id}`}
                            className="font-bold text-[#312E81] hover:underline flex items-center gap-1 group"
                          >
                            <span className="line-clamp-1">{offer.buyer_posts.title}</span>
                            <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-70" />
                          </Link>
                        ) : (
                          <span className="text-slate-400">Silinmiş İlan</span>
                        )}
                      </td>

                      <td className="px-6 py-4 font-black text-emerald-600 text-sm">
                        {formatCurrency(offer.price)}
                      </td>

                      <td className="px-6 py-4 max-w-xs text-slate-700">
                        <p className="line-clamp-2">{offer.description}</p>
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        {formatDate(offer.created_at)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={isDeleting}
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="text-red-600 hover:bg-red-50 py-1 px-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm font-semibold">Teklif bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
}
