'use client';

import React, { useEffect, useState } from 'react';
import { BuyerPost, PostStatus, SellerOffer } from '@/types';
import { postService } from '@/services/postService';
import { offerService } from '@/services/offerService';
import { notificationService } from '@/services/notificationService';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  FileText,
  Search,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Lock,
  Layers,
  MapPin,
  Tag,
  User,
  MessageSquare,
  Banknote,
  Sparkles,
} from 'lucide-react';

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<BuyerPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Rejection modal state
  const [rejectingPost, setRejectingPost] = useState<BuyerPost | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Admin detail inspection modal state
  const [inspectingPost, setInspectingPost] = useState<BuyerPost | null>(null);
  const [inspectingOffers, setInspectingOffers] = useState<SellerOffer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await postService.getAllPostsForAdmin();
      setPosts(data);
    } catch (err) {
      console.error('Fetch posts error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleOpenInspectModal = async (post: BuyerPost) => {
    setInspectingPost(post);
    setLoadingOffers(true);
    try {
      const offers = await offerService.getOffersByPostId(post.id);
      setInspectingOffers(offers);
    } catch (err) {
      console.error('Error fetching offers for inspect modal:', err);
    } finally {
      setLoadingOffers(false);
    }
  };

  const handleApprovePost = async (post: BuyerPost) => {
    if (!confirm('İlan yayına alınacaktır. Emin misiniz?')) return;

    setUpdatingId(post.id);
    try {
      const { success, error } = await postService.updatePostStatus(post.id, 'active', '');

      if (success) {
        setPosts(posts.map((p) => (p.id === post.id ? { ...p, status: 'active', rejection_reason: null } : p)));
        setInspectingPost(null);

        // Send notification to author
        await notificationService.addNotification(
          post.user_id,
          'İlanınız Yayına Alındı',
          `"${post.title}" başlıklı ilanınız yöneticiler tarafından onaylandı ve yayına alındı.`,
          'post_approved',
          post.id
        );
      } else {
        alert('İlan onaylanamadı: ' + error);
      }
    } catch (err: any) {
      alert('Hata: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingPost) return;
    if (!rejectionReason.trim()) {
      alert('Lütfen reddetme nedenini giriniz.');
      return;
    }

    const post = rejectingPost;
    setUpdatingId(post.id);
    try {
      const { success, error } = await postService.updatePostStatus(post.id, 'rejected', rejectionReason.trim());

      if (success) {
        setPosts(
          posts.map((p) =>
            p.id === post.id ? { ...p, status: 'rejected', rejection_reason: rejectionReason.trim() } : p
          )
        );

        setInspectingPost(null);

        // Send notification to author with rejection reason
        await notificationService.addNotification(
          post.user_id,
          'İlanınız Reddedildi',
          `"${post.title}" başlıklı ilanınız onaylanmadı. Nedeni: ${rejectionReason.trim()}`,
          'post_rejected',
          post.id
        );

        setRejectingPost(null);
        setRejectionReason('');
      } else {
        alert('İlan reddedilemedi: ' + error);
      }
    } catch (err: any) {
      alert('Hata: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Bu ilanı tamamen silmek istediğinize emin misiniz?')) {
      return;
    }

    setUpdatingId(postId);
    try {
      const { success, error } = await postService.deletePost(postId);
      if (success) {
        setPosts(posts.filter((p) => p.id !== postId));
        if (inspectingPost?.id === postId) {
          setInspectingPost(null);
        }
      } else {
        alert('İlan silinemedi: ' + error);
      }
    } catch (err: any) {
      alert('Hata: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingCount = posts.filter((p) => p.status === 'pending' || p.status === 'inactive').length;

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      !searchQuery.trim() ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.profiles?.full_name && post.profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'pending'
        ? post.status === 'pending' || post.status === 'inactive'
        : post.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 w-full">
      {/* ADMIN POST DETAIL INSPECTION MODAL */}
      {inspectingPost && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl animate-in fade-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#312E81] flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">İlan İnceleme Detayı</h3>
                  <span className="text-xs text-slate-500 font-medium">İlan ID: {inspectingPost.id}</span>
                </div>
              </div>
              <button
                onClick={() => setInspectingPost(null)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Post Metadata Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#312E81] bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100 uppercase">
                <Tag className="w-3.5 h-3.5" />
                {inspectingPost.category}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl">
                <MapPin className="w-3.5 h-3.5 text-[#312E81]" />
                {inspectingPost.location_city} / {inspectingPost.location_district}
              </span>
              <Badge variant="emerald" className="text-xs font-bold py-1 px-3">
                Bütçe: {formatCurrency(inspectingPost.min_budget)} - {formatCurrency(inspectingPost.max_budget)}
              </Badge>

              {(inspectingPost.status === 'pending' || inspectingPost.status === 'inactive') && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Onay Bekliyor
                </span>
              )}
              {inspectingPost.status === 'active' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Yayında (Aktif)
                </span>
              )}
              {inspectingPost.status === 'rejected' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  Reddedildi
                </span>
              )}
            </div>

            {/* Title & Author */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <h2 className="text-lg font-black text-slate-900 leading-snug">{inspectingPost.title}</h2>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <User className="w-4 h-4 text-[#312E81]" />
                  {inspectingPost.profiles?.full_name || inspectingPost.profiles?.email || 'Alıcı'}
                </span>
                <span>{formatDate(inspectingPost.created_at)}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                İlan Açıklaması
              </label>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                {inspectingPost.description}
              </div>
            </div>

            {/* Rejection Reason Alert if rejected */}
            {inspectingPost.status === 'rejected' && inspectingPost.rejection_reason && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                <span className="font-bold text-rose-900 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Reddedilme Nedeni
                </span>
                <p className="text-[11px] font-normal">{inspectingPost.rejection_reason}</p>
              </div>
            )}

            {/* Submitted Offers for this post */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#312E81]" />
                Verilen Gelen Teklifler ({inspectingOffers.length})
              </label>

              {loadingOffers ? (
                <div className="py-6 text-center text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#312E81]" />
                  <span className="text-xs">Teklifler yükleniyor...</span>
                </div>
              ) : inspectingOffers.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {inspectingOffers.map((off) => (
                    <div key={off.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">
                          {off.profiles?.full_name || off.profiles?.email || 'Satıcı'}
                        </span>
                        <span className="text-[11px] text-slate-600 line-clamp-1">{off.description}</span>
                      </div>
                      <span className="font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
                        {formatCurrency(off.price)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl">Henüz teklif verilmemiş.</p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-100">
              {inspectingPost.status !== 'active' && (
                <Button
                  size="sm"
                  disabled={updatingId === inspectingPost.id}
                  onClick={() => handleApprovePost(inspectingPost)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Yayına Al (Onayla)
                </Button>
              )}

              {inspectingPost.status !== 'rejected' && (
                <Button
                  size="sm"
                  disabled={updatingId === inspectingPost.id}
                  onClick={() => {
                    setRejectingPost(inspectingPost);
                  }}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold"
                >
                  <XCircle className="w-4 h-4 mr-1.5" />
                  Gerekçe İle Reddet
                </Button>
              )}

              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeletePost(inspectingPost.id)}
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                İlanı Sil
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setInspectingPost(null)}
              >
                Kapat
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingPost && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">İlanı Reddet</h3>
                <p className="text-xs text-slate-500 line-clamp-1">{rejectingPost.title}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Reddetme Gerekçesi (Kullanıcıya Gönderilecek) *
              </label>
              <textarea
                rows={4}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Örn: İlan başlığı veya içeriği topluluk kurallarına aykırı / eksik bilgi içermektedir."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-xs text-slate-900 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRejectingPost(null);
                  setRejectionReason('');
                }}
              >
                Vazgeç
              </Button>
              <Button
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white shadow-md"
                onClick={handleConfirmReject}
                isLoading={updatingId === rejectingPost.id}
              >
                İlanı Reddet ve Bildir
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#312E81]" />
            İlan Yönetimi & Moderasyon
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gelen ilan taleplerini inceleyin, detaylarını görün, onaylayarak yayına alın veya reddedin.
          </p>
        </div>
        <span className="text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>{pendingCount} Onay Bekleyen İlan</span>
        </span>
      </div>

      {/* Moderation Status Tabs (Lucide SVG Icons - Zero Emojis!) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto w-full">
        {[
          { id: 'pending', label: 'Onay Bekleyenler', icon: <Clock className="w-4 h-4 text-amber-500" />, count: pendingCount },
          { id: 'active', label: 'Yayındakiler', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, count: posts.filter((p) => p.status === 'active').length },
          { id: 'rejected', label: 'Reddedilenler', icon: <XCircle className="w-4 h-4 text-rose-500" />, count: posts.filter((p) => p.status === 'rejected').length },
          { id: 'resolved', label: 'Çözümlenenler', icon: <Lock className="w-4 h-4 text-slate-500" />, count: posts.filter((p) => p.status === 'resolved').length },
          { id: 'all', label: 'Tüm İlanlar', icon: <Layers className="w-4 h-4 text-indigo-500" />, count: posts.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer border shrink-0 ${
              statusFilter === tab.id
                ? 'bg-[#312E81] text-white border-[#312E81] shadow-md'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className={statusFilter === tab.id ? 'text-white' : ''}>{tab.icon}</span>
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative w-full">
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="İlan başlığı, açıklama veya alıcı adı ile ara..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/15 text-sm outline-none shadow-sm"
        />
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden w-full">
        {loading ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#312E81]" />
            <span className="text-sm font-medium">İlanlar yükleniyor...</span>
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 uppercase text-[10px] font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-4">İlan Başlığı</th>
                  <th className="px-6 py-4">Alıcı</th>
                  <th className="px-6 py-4">Bütçe</th>
                  <th className="px-6 py-4">Şehir / Semt</th>
                  <th className="px-6 py-4">Durum / Not</th>
                  <th className="px-6 py-4 text-right">Moderasyon İşlemleri</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredPosts.map((post) => {
                  const isUpdating = updatingId === post.id;
                  const authorName = post.profiles?.full_name || 'Alıcı';

                  return (
                    <tr key={post.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 max-w-xs">
                        <button
                          onClick={() => handleOpenInspectModal(post)}
                          className="font-bold text-slate-900 hover:text-[#312E81] flex items-center gap-1.5 group text-left"
                        >
                          <span className="line-clamp-1">{post.title}</span>
                          <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#312E81] flex-shrink-0" />
                        </button>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {formatDate(post.created_at)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-800 font-semibold">{authorName}</td>

                      <td className="px-6 py-4">
                        <Badge variant="emerald" className="text-[11px] font-bold py-0.5">
                          {formatCurrency(post.min_budget)} - {formatCurrency(post.max_budget)}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {post.location_city} / {post.location_district}
                      </td>

                      <td className="px-6 py-4">
                        {(post.status === 'pending' || post.status === 'inactive') && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Onay Bekliyor</span>
                          </span>
                        )}
                        {post.status === 'active' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Yayında (Aktif)</span>
                          </span>
                        )}
                        {post.status === 'rejected' && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>Reddedildi</span>
                            </span>
                            {post.rejection_reason && (
                              <p className="text-[10px] text-slate-500 italic line-clamp-2 max-w-xs">
                                Neden: {post.rejection_reason}
                              </p>
                            )}
                          </div>
                        )}
                        {post.status === 'resolved' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                            <span>Çözümlendi</span>
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleOpenInspectModal(post)}
                            className="bg-indigo-50 text-[#312E81] border border-indigo-100 font-bold text-xs py-1.5 px-2.5 rounded-xl"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            İncele
                          </Button>

                          {post.status !== 'active' && (
                            <Button
                              size="sm"
                              disabled={isUpdating}
                              onClick={() => handleApprovePost(post)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-3 rounded-xl shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Yayına Al
                            </Button>
                          )}

                          {post.status !== 'rejected' && (
                            <Button
                              size="sm"
                              disabled={isUpdating}
                              onClick={() => setRejectingPost(post)}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs py-1.5 px-3 rounded-xl"
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" />
                              Reddet
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={isUpdating}
                            onClick={() => handleDeletePost(post.id)}
                            className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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
            <p className="text-sm font-semibold">Bu kategoride ilan bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
}
