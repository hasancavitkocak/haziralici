'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { BuyerPost, SellerOffer, PostStatus } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatusSelect } from '@/components/ui/StatusSelect';
import { TurkeyCities } from '@/data/turkeyCities';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { profileService } from '@/services/profileService';
import { postService } from '@/services/postService';
import { offerService } from '@/services/offerService';
import {
  User,
  Mail,
  Calendar,
  FileText,
  Tag,
  Shield,
  Edit2,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Loader2,
  PlusCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Phone,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'posts' | 'offers'>('posts');
  const [myPosts, setMyPosts] = useState<BuyerPost[]>([]);
  const [myOffers, setMyOffers] = useState<SellerOffer[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [postOffers, setPostOffers] = useState<Record<string, SellerOffer[]>>({});
  const [loadingOffers, setLoadingOffers] = useState<Record<string, boolean>>({});
  const [myOffersPage, setMyOffersPage] = useState(1);

  // Edit Profile state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (profile) {
      setFullName(profile.full_name || '');
      
      const savedExt = typeof window !== 'undefined' ? localStorage.getItem(`profile_ext_${user?.id}`) : null;
      if (savedExt) {
        try {
          const parsed = JSON.parse(savedExt);
          setPhone(profile.phone || parsed.phone || '');
          setCity(profile.city || parsed.city || '');
          setDistrict(profile.district || parsed.district || '');
        } catch {
          setPhone(profile.phone || '');
          setCity(profile.city || '');
          setDistrict(profile.district || '');
        }
      } else {
        setPhone(profile.phone || '');
        setCity(profile.city || '');
        setDistrict(profile.district || '');
      }
    }
  }, [user, profile, authLoading, router]);

  const fetchUserData = async (forceSpinner = false) => {
    if (!user) return;
    if (forceSpinner || (myPosts.length === 0 && myOffers.length === 0)) {
      setLoadingData(true);
    }
    try {
      const [postsData, offersData] = await Promise.all([
        profileService.getUserPosts(user.id),
        profileService.getUserOffers(user.id),
      ]);

      setMyPosts(postsData);
      setMyOffers(offersData);
    } catch (err) {
      console.error('Error fetching user profile data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchUserData();
    }
  }, [user?.id]);

  const togglePostOffers = useCallback(async (postId: string) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
      return;
    }
    setExpandedPostId(postId);
    if (postOffers[postId]) return; // already fetched
    setLoadingOffers((prev) => ({ ...prev, [postId]: true }));
    try {
      const offers = await postService.getOffersForPost(postId);
      setPostOffers((prev) => ({ ...prev, [postId]: offers }));
    } catch (err) {
      console.error('Error fetching offers for post:', err);
    } finally {
      setLoadingOffers((prev) => ({ ...prev, [postId]: false }));
    }
  }, [expandedPostId, postOffers]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          `profile_ext_${user.id}`,
          JSON.stringify({ phone, city, district })
        );
      }

      let { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone || null,
          city: city || null,
          district: district || null,
        })
        .eq('id', user.id);

      if (error && error.message?.includes('column')) {
        const fallback = await supabase
          .from('profiles')
          .update({
            full_name: fullName,
          })
          .eq('id', user.id);

        error = fallback.error;
      }

      if (!error) {
        await refreshProfile();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert('Profil güncellenemedi: ' + error.message);
      }
    } catch (err: any) {
      alert('Hata: ' + (err.message || 'Profil güncellenemedi.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePostStatus = async (postId: string, newStatus: PostStatus) => {
    try {
      const { success } = await postService.updatePostStatus(postId, newStatus);
      if (success) {
        setMyPosts(
          myPosts.map((p) => (p.id === postId ? { ...p, status: newStatus } : p))
        );
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('İlanınızı silmek istediğinize emin misiniz?')) return;
    try {
      const { success, error } = await postService.deletePost(postId);
      if (success) {
        setMyPosts(myPosts.filter((p) => p.id !== postId));
      } else {
        alert('İlan silinemedi: ' + error);
      }
    } catch (err: any) {
      console.error('Error deleting post:', err);
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (!confirm('Verdiğiniz bu teklifi çekmek/silmek istediğinize emin misiniz?')) return;
    try {
      const { success, error } = await offerService.deleteOffer(offerId);
      if (success) {
        setMyOffers(myOffers.filter((o) => o.id !== offerId));
      } else {
        alert('Teklif silinemedi: ' + error);
      }
    } catch (err: any) {
      console.error('Error deleting offer:', err);
    }
  };

  if (authLoading || (!user && loadingData)) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#312E81]" />
      </div>
    );
  }

  if (!user) return null;

  const displayName = profile?.full_name || user.email || 'Kullanıcı';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="w-full space-y-6">
      {/* Profile Banner / Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl shadow-slate-200/40 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-[#312E81] text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-200">
              {initial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  {displayName}
                </h1>
                {profile?.role === 'admin' && (
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-200 uppercase">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.email}</span>
                <span>•</span>
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Üyelik: {formatDate(profile?.created_at || user.created_at)}</span>
              </p>
            </div>
          </div>

          <Link href="/ilan-ver">
            <Button size="sm" className="shadow-md whitespace-nowrap">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Yeni İlan Ver
            </Button>
          </Link>
        </div>

        {/* Full Profile Settings Form */}
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Hesap & İletişim Ayarları
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ad Soyad */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Ad Soyad
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Adınız Soyadınız"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/15 text-sm outline-none"
                />
              </div>
            </div>

            {/* Telefon Numarası */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Telefon Numarası
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  📱
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05xx xxx xx xx"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/15 text-sm outline-none font-medium"
                />
              </div>
            </div>

            {/* Şehir */}
            <div>
              <SearchableSelect
                label="Şehir"
                placeholder="Şehir Seçiniz..."
                searchPlaceholder="81 İl İçinde Ara..."
                options={TurkeyCities.getCityNames()}
                value={city}
                onChange={(newCity) => {
                  setCity(newCity);
                  setDistrict('');
                }}
              />
            </div>

            {/* İlçe */}
            <div>
              <SearchableSelect
                label="İlçe / Semt"
                placeholder={city ? 'İlçe Seçiniz...' : 'Önce Şehir Seçiniz...'}
                searchPlaceholder="İlçe İçinde Ara..."
                options={city ? TurkeyCities.getDistricts(city) : []}
                value={district}
                onChange={(newDistrict) => setDistrict(newDistrict)}
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end">
            <Button type="submit" variant="secondary" size="sm" isLoading={isSaving} className="py-2.5 px-6">
              <Edit2 className="w-4 h-4 mr-1.5" />
              Tüm Bilgileri Güncelle
            </Button>
          </div>
        </form>

        {saveSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profil ve iletişim bilgileriniz başarıyla güncellendi.</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'posts'
              ? 'bg-[#312E81] text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          Açtığım İlanlarım ({myPosts.length})
        </button>

        <button
          onClick={() => setActiveTab('offers')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'offers'
              ? 'bg-[#312E81] text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Tag className="w-4 h-4" />
          Verdiğim Tekliflerim ({myOffers.length})
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {loadingData ? (
          <div className="py-12 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#312E81]" />
            <span className="text-xs">İçerikler yükleniyor...</span>
          </div>
        ) : activeTab === 'posts' ? (
          myPosts.length > 0 ? (
            <div className="space-y-4">
              {myPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <Link
                      href={`/ilan/${post.id}`}
                      className="font-bold text-slate-900 hover:text-[#312E81] text-base flex items-center gap-1.5"
                    >
                      <span>{post.title}</span>
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                    </Link>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(post.created_at)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{post.description}</p>

                  {/* Rejection Reason Alert Box */}
                  {post.status === 'rejected' && post.rejection_reason && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                      <span className="font-extrabold flex items-center gap-1 text-rose-900">
                        ❌ İlanınız Onaylanmadı
                      </span>
                      <p className="font-medium text-[11px] leading-relaxed">
                        <strong>Reddedilme Nedeni:</strong> {post.rejection_reason}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="emerald" className="text-xs font-bold py-1">
                        Bütçe: {formatCurrency(post.min_budget)} - {formatCurrency(post.max_budget)}
                      </Badge>

                      {(post.status === 'pending' || post.status === 'inactive') && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Değerlendirmede (Onay Bekliyor)</span>
                        </span>
                      )}

                      {post.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                          <span>Reddedildi</span>
                        </span>
                      )}

                      {post.status === 'active' && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#312E81] bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                          <MessageSquare className="w-3.5 h-3.5 text-[#312E81]" />
                          <span>{post.offers_count || 0} Teklif Geldi</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {post.status === 'active' && (
                        <StatusSelect
                          value={post.status}
                          onChange={(newStatus) => handleUpdatePostStatus(post.id, newStatus)}
                        />
                      )}

                      {post.status === 'active' && (post.offers_count ?? 0) > 0 && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => togglePostOffers(post.id)}
                          className="py-1 px-3 text-xs"
                        >
                          {loadingOffers[post.id] ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                          ) : expandedPostId === post.id ? (
                            <ChevronUp className="w-3.5 h-3.5 mr-1" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 mr-1" />
                          )}
                          Teklifleri Gör ({post.offers_count})
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-600 hover:bg-red-50 py-1 px-2"
                        title="İlanı Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Inline Offers Panel */}
                  {expandedPostId === post.id && (
                    <div className="mt-4 border-t border-slate-100 pt-4 space-y-3">
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-[#312E81]" />
                        Gelen Teklifler
                      </h4>
                      {loadingOffers[post.id] ? (
                        <div className="py-6 text-center">
                          <Loader2 className="w-5 h-5 animate-spin text-[#312E81] mx-auto" />
                        </div>
                      ) : (postOffers[post.id] || []).length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">Henüz teklif gelmedi.</p>
                      ) : (
                        (postOffers[post.id] || []).map((offer, idx) => (
                          <div key={offer.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-500">Teklif #{idx + 1}</span>
                              <span className="text-base font-black text-emerald-600">{formatCurrency(offer.price)}</span>
                            </div>
                            {offer.description && (
                              <p className="text-xs text-slate-700 leading-relaxed">{offer.description}</p>
                            )}
                            {(offer as any).profiles && (
                              <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
                                <span className="text-[11px] text-slate-500 font-semibold">
                                  {(offer as any).profiles?.full_name || 'Anonim Satıcı'}
                                </span>
                                {(offer as any).profiles?.phone && (
                                  <a
                                    href={`tel:${(offer as any).profiles.phone}`}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
                                  >
                                    <Phone className="w-3 h-3" />
                                    {(offer as any).profiles.phone}
                                  </a>
                                )}
                              </div>
                            )}
                            <span className="text-[10px] text-slate-400">{formatDate(offer.created_at)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">Henüz ilan açmadınız</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Aradığınız ürün veya hizmeti bütçenizle ilan ederek satıcılardan teklif toplamaya hemen başlayın.
              </p>
              <Link href="/ilan-ver" className="inline-block pt-2">
                <Button size="sm">İlan Oluştur</Button>
              </Link>
            </div>
          )
        ) : myOffers.length > 0 ? (
          <div className="space-y-4">
            {(() => {
              const OFFERS_PER_PAGE = 10;
              const totalPages = Math.ceil(myOffers.length / OFFERS_PER_PAGE);
              const currentMyOffers = myOffers.slice((myOffersPage - 1) * OFFERS_PER_PAGE, myOffersPage * OFFERS_PER_PAGE);

              return (
                <>
                  <div className="space-y-4">
                    {currentMyOffers.map((offer) => (
                      <div
                        key={offer.id}
                        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          {offer.buyer_posts ? (
                            <Link
                              href={`/ilan/${offer.buyer_posts.id}`}
                              className="font-bold text-[#312E81] hover:underline text-sm flex items-center gap-1.5"
                            >
                              <span>İlan: {offer.buyer_posts.title}</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          ) : (
                            <span className="text-xs text-slate-400">Silinmiş İlan</span>
                          )}
                          <span className="text-[11px] text-slate-400">{formatDate(offer.created_at)}</span>
                        </div>

                        <div className="flex items-baseline justify-between">
                          <span className="text-xs font-semibold text-slate-500">Verdiğiniz Teklif Fiyatı:</span>
                          <span className="text-base font-black text-emerald-600">
                            {formatCurrency(offer.price)}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          {offer.description}
                        </p>

                        <div className="text-right pt-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteOffer(offer.id)}
                            className="text-red-600 hover:bg-red-50 text-xs py-1 px-3"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Teklifi Geri Çek / Sil
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200 flex-wrap gap-2">
                      <span className="text-xs text-slate-500 font-medium">
                        Sayfa {myOffersPage} / {totalPages} — Toplam {myOffers.length} teklif
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setMyOffersPage((p) => Math.max(1, p - 1))}
                          disabled={myOffersPage === 1}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                          <button
                            key={p}
                            onClick={() => setMyOffersPage(p)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              myOffersPage === p
                                ? 'bg-[#312E81] text-white shadow-sm'
                                : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                        <button
                          onClick={() => setMyOffersPage((p) => Math.min(totalPages, p + 1))}
                          disabled={myOffersPage === totalPages}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
            <Tag className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">Henüz teklif vermediniz</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Anasayfadaki alıcı ilanlarını inceleyerek elinizdeki ürün veya hizmet için gizli teklif verebilirsiniz.
            </p>
            <Link href="/" className="inline-block pt-2">
              <Button size="sm" variant="outline">İlanları İncele</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
