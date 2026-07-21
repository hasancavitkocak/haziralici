import React from 'react';
import { SellerOffer } from '@/types';
import { formatCurrency, formatDate, formatDisplayName } from '@/lib/utils';
import { Lock, Clock, ShieldCheck, Phone, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface OfferCardProps {
  offer: SellerOffer;
  isPostOwner?: boolean;
  onStartChat?: () => void;
  chatLoading?: boolean;
}

export const OfferCard = ({
  offer,
  isPostOwner = false,
  onStartChat,
  chatLoading = false,
}: OfferCardProps) => {
  const sellerName = formatDisplayName(offer.profiles?.full_name, offer.profiles?.email);
  const initial = sellerName.charAt(0).toUpperCase();

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 relative overflow-hidden transition-all">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#312E81] text-white flex items-center justify-center font-bold text-xs">
            {initial}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>{sellerName}</span>
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Doğrulanmış Satıcı
              </span>
            </h4>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
              <Clock className="w-3 h-3" />
              <span>{formatDate(offer.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Private Offer Badge */}
        <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <Lock className="w-3 h-3" />
          <span>Gizli Teklif</span>
        </div>
      </div>

      {/* Offer Price & Description */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Teklif Edilen Fiyat
          </span>
          <span className="text-lg font-black text-emerald-600">
            {formatCurrency(offer.price)}
          </span>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
          {offer.description}
        </p>
      </div>

      {/* Actions and Info Footer */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
        {isPostOwner ? (
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Satıcı İletişim Numarası:
            </span>
            <div>
              {offer.profiles?.phone ? (
                <a
                  href={`tel:${offer.profiles.phone}`}
                  className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-extrabold"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs">{offer.profiles.phone}</span>
                </a>
              ) : (
                <span className="text-slate-400 text-xs italic">Telefon numarası belirtilmemiş</span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500 font-medium">
            Bu ilan için verdiğiniz teklif alıcı tarafından incelenmektedir.
          </div>
        )}

        <div className="flex items-center gap-2">
          {onStartChat && (
            <Button
              size="sm"
              disabled={chatLoading}
              onClick={onStartChat}
              className="bg-[#312E81] hover:bg-[#252261] text-white text-xs font-bold py-1.5 px-3.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              {chatLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <MessageSquare className="w-3.5 h-3.5" />
              )}
              <span>{isPostOwner ? 'Satıcıyla Mesajlaş' : 'Alıcıyla Mesajlaş'}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
