'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { BuyerPost, SellerOffer } from '@/types';
import { formatCurrency, formatDate, formatDisplayName, formatUrgency } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { OfferCard } from '@/components/post/OfferCard';
import { OfferModal } from '@/components/post/OfferModal';
import {
  ArrowLeft,
  MapPin,
  Clock,
  PlusCircle,
  Lock,
  Share2,
  ShieldCheck,
  MessageSquareCheck,
  Loader2,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { postService } from '@/services/postService';
import { offerService } from '@/services/offerService';
import { chatService } from '@/services/chatService';

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const postId = resolvedParams.id;
  const router = useRouter();
  const { user } = useAuth();

  const [post, setPost] = useState<BuyerPost | null>(null);
  const [offers, setOffers] = useState<SellerOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offersPage, setOffersPage] = useState(1);

  const fetchPostDetails = async (isBackground = false) => {
    if (!isBackground && !post) {
      setLoading(true);
    }
    try {
      const [fetchedPost, fetchedOffers] = await Promise.all([
        postService.getPostById(postId),
        postService.getOffersForPost(postId),
      ]);

      if (fetchedPost) {
        setPost(fetchedPost);
      }
      setOffers(fetchedOffers);
    } catch (err) {
      console.error('Fetch error in PostDetailPage:', err);
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (postId) {
      fetchPostDetails();
    }
  }, [postId, user?.id]);

  const [acceptedOfferId, setAcceptedOfferId] = useState<string | null>(null);

  const handleWhatsAppShare = () => {
    if (!post) return;
    const url = window.location.href;
    const text = `Merhaba, ${formatCurrency(post.min_budget)} - ${formatCurrency(post.max_budget)} bütçe ile "${post.title}" arıyorum. Bana haziralici.com üzerinden gizli teklif verebilirsiniz:\n${url}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleAcceptOffer = async (offerId: string) => {
    if (!user || !post || user.id !== post.user_id) return;
    try {
      await offerService.acceptOffer(offerId, post.id);
      setAcceptedOfferId(offerId);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`accepted_offer_${post.id}`, offerId);
      }

      setPost((prev) => (prev ? { ...prev, status: 'resolved', accepted_offer_id: offerId } : null));
    } catch (err: any) {
      console.error('Accept offer error:', err);
      alert('Hata: ' + (err.message || 'Teklif kabul edilemedi.'));
    }
  };

  const [chatLoadingId, setChatLoadingId] = useState<string | null>(null);

  const handleStartChat = async (sellerId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!post) return;
    setChatLoadingId(sellerId);
    try {
      const buyerId = post.user_id;
      const { data, error } = await chatService.createOrGetRoom(post.id, buyerId, sellerId);
      if (data) {
        router.push(`/mesajlar?room_id=${data.id}`);
      } else {
        alert('Sohbet odası açılamadı: ' + error);
      }
    } catch (err: any) {
      alert('Hata: ' + err.message);
    } finally {
      setChatLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3 min-h-[50vh] justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#312E81]" />
        <span className="text-sm font-medium">İlan detayları yükleniyor...</span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-slate-800">İlan bulunamadı</h2>
        <p className="text-xs text-slate-500">Bu ilan kaldırılmış veya erişilemiyor olabilir.</p>
        <Link href="/">
          <Button variant="primary" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Anasayfaya Dön
          </Button>
        </Link>
      </div>
    );
  }

  const isPostOwner = user?.id === post.user_id;
  const userOffer = offers.find((o) => o.user_id === user?.id);
  const authorName = formatDisplayName(post.profiles?.full_name, post.profiles?.email);
  const urgencyInfo = formatUrgency(post.urgency);
  const isResolved = post.status === 'resolved';
  const savedAcceptedOfferId = typeof window !== 'undefined' ? localStorage.getItem(`accepted_offer_${post.id}`) : null;
  const effectiveAcceptedOfferId = post.accepted_offer_id || acceptedOfferId || savedAcceptedOfferId;

  const OFFERS_PER_PAGE = 10;
  const totalOfferPages = Math.ceil(offers.length / OFFERS_PER_PAGE);
  const currentOffers = offers.slice((offersPage - 1) * OFFERS_PER_PAGE, offersPage * OFFERS_PER_PAGE);

  return (
    <div className="w-full space-y-6">
      {/* Top Back & Navigation Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <Link
          href="/"
          className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-[#312E81] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Anasayfa Akışına Dön
        </Link>

        {/* WhatsApp Share Button */}
        <button
          onClick={handleWhatsAppShare}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>WhatsApp'ta Paylaş</span>
        </button>
      </div>

      {/* 2-Column Responsive Widescreen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT MAIN COLUMN (Post Details & Offers) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Post Content Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl shadow-slate-200/40 space-y-6">
            
            {/* Resolved Banner */}
            {isResolved && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-900 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>Bu ilan için bir teklif kabul edilmiş ve anlaşma sağlanmıştır!</span>
              </div>
            )}

            {/* Post Author Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#312E81] text-white flex items-center justify-center font-black text-base shadow-md shadow-indigo-100">
                  {authorName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>{authorName}</span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${urgencyInfo.colorClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${urgencyInfo.dotColor}`} />
                      {urgencyInfo.label}
                    </span>
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span className="capitalize bg-indigo-50 text-[#312E81] px-2.5 py-0.5 rounded-lg font-bold">
                      {post.category}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(post.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100/80 border border-slate-200 px-3.5 py-2 rounded-xl">
                <MapPin className="w-4 h-4 text-[#312E81]" />
                <span>
                  {post.location_city} / {post.location_district}
                </span>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-3">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                {post.title}
              </h1>

              {/* Mobile Budget Badge (Visible on mobile) */}
              <div className="lg:hidden inline-block">
                <Badge variant="emerald" className="text-sm py-2 px-4 font-extrabold shadow-sm">
                  Bütçe Aralığı: {formatCurrency(post.min_budget)} — {formatCurrency(post.max_budget)}
                </Badge>
              </div>
            </div>

            {/* Description */}
            <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200/60 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Alıcının İlan Açıklaması
              </h4>
              <p className="text-sm sm:text-base text-slate-800 leading-relaxed whitespace-pre-line font-normal">
                {post.description}
              </p>
            </div>
          </div>

          {/* OFFERS SECTION */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>{isPostOwner ? 'Gelen Gizli Teklifler' : 'Teklifiniz'}</span>
                <span className="text-xs bg-[#312E81] text-white px-3 py-1 rounded-full font-bold">
                  {isPostOwner ? offers.length : (userOffer ? 1 : 0)}
                </span>
              </h3>
            </div>

            {isPostOwner ? (
              offers.length > 0 ? (
                <div className="space-y-4">
                  <div className="space-y-4">
                    {currentOffers.map((offer) => (
                      <OfferCard
                        key={offer.id}
                        offer={offer}
                        isPostOwner={true}
                        onStartChat={() => handleStartChat(offer.user_id)}
                        chatLoading={chatLoadingId === offer.user_id}
                      />
                    ))}
                  </div>

                  {/* 10-per-page Pagination Controls */}
                  {totalOfferPages > 1 && (
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-2">
                      <span className="text-xs text-slate-500 font-medium">
                        Sayfa {offersPage} / {totalOfferPages} — Toplam {offers.length} teklif
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setOffersPage((p) => Math.max(1, p - 1))}
                          disabled={offersPage === 1}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        {Array.from({ length: totalOfferPages }, (_, i) => i + 1).map((p) => (
                          <button
                            key={p}
                            onClick={() => setOffersPage(p)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              offersPage === p
                                ? 'bg-[#312E81] text-white shadow-sm'
                                : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                        <button
                          onClick={() => setOffersPage((p) => Math.min(totalOfferPages, p + 1))}
                          disabled={offersPage === totalOfferPages}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-3 shadow-sm">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-[#312E81] flex items-center justify-center mx-auto">
                    <Lock className="w-7 h-7" />
                  </div>
                  <div className="max-w-sm mx-auto">
                    <h4 className="text-base font-bold text-slate-800">Henüz teklif bulunmuyor</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Satıcılar teklif verdiğinde tekliflerini ve iletişim bilgilerini burada görebilirsiniz.
                    </p>
                  </div>
                </div>
              )
            ) : (
              userOffer ? (
                <OfferCard
                  offer={userOffer}
                  isPostOwner={false}
                  onStartChat={() => handleStartChat(userOffer.user_id)}
                  chatLoading={chatLoadingId === userOffer.user_id}
                />
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-8 text-center text-xs text-slate-500 space-y-3">
                  <p className="font-semibold text-slate-700">Henüz bu ilana teklif vermediniz.</p>
                  <Button
                    onClick={() => setIsOfferModalOpen(true)}
                    className="bg-[#312E81] hover:bg-[#252262] text-white shadow-md mx-auto"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Hemen Gizli Teklif Ver
                  </Button>
                </div>
              )
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR (Sticky Budget & Primary Action Card) */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-28">
          
          {/* Budget & Offer CTA Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xl shadow-slate-200/40 space-y-6">
            
            <div className="space-y-2 border-b border-slate-100 pb-5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Alıcının Bütçe Aralığı
              </span>
              <div className="text-2xl font-black text-emerald-600">
                {formatCurrency(post.min_budget)} — {formatCurrency(post.max_budget)}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                <span>Gelen Teklif Sayısı:</span>
                <span className="font-bold text-[#312E81] bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                  {offers.length} Teklif
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                <span>İlan Durumu:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Aktif Alıcı İlanı
                </span>
              </div>
            </div>

            {/* CTA Action */}
            <div>
              {isPostOwner ? (
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-2 text-center">
                  <ShieldCheck className="w-6 h-6 text-[#312E81] mx-auto" />
                  <h4 className="text-xs font-bold text-indigo-950">Kendi İlanınızdasınız</h4>
                  <p className="text-[11px] text-indigo-800">
                    Gelen teklifleri sol taraftaki panelden inceleyip kabul edebilirsiniz.
                  </p>
                </div>
              ) : (
                userOffer ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                    <MessageSquareCheck className="w-6 h-6 text-emerald-600 mx-auto" />
                    <h4 className="text-xs font-bold text-emerald-950">Teklifiniz İletilmiştir</h4>
                    <p className="text-[11px] text-emerald-800">
                      Alıcı teklifinizi incelediğinde tarafınıza ulaşacaktır.
                    </p>
                  </div>
                ) : user ? (
                  <Button
                    onClick={() => setIsOfferModalOpen(true)}
                    size="lg"
                    className="w-full bg-[#312E81] hover:bg-[#252262] text-white shadow-lg shadow-indigo-900/20 py-3 text-sm font-extrabold"
                  >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Gizli Teklif Ver
                  </Button>
                ) : (
                  <Link href="/login" className="block">
                    <Button variant="primary" size="lg" className="w-full text-sm font-extrabold">
                      Teklif Vermek İçin Giriş Yap
                    </Button>
                  </Link>
                )
              )}
            </div>

            {/* Privacy Guarantee Box */}
            <div className="pt-2 border-t border-slate-100 flex items-start gap-2.5 text-[11px] text-slate-500">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>%100 Gizli Satıcı Teklifi:</strong> Verdiğiniz teklif sadece ilan sahibi alıcı tarafından görüntülenebilir.
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Offer Modal */}
      <OfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        postId={post.id}
        onSuccess={() => {
          postService.invalidateCache();
          fetchPostDetails(true);
        }}
      />
    </div>
  );
}
