'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { offerService } from '@/services/offerService';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Lock, Banknote, AlertCircle, CheckCircle2 } from 'lucide-react';
import { maskPhoneNumbers, formatNumberInput, parseNumberInput, formatCurrency } from '@/lib/utils';

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  onSuccess: () => void;
}

export const OfferModal = ({
  isOpen,
  onClose,
  postId,
  onSuccess,
}: OfferModalProps) => {
  const { user } = useAuth();
  const [displayPrice, setDisplayPrice] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedPrice, setSubmittedPrice] = useState(0);

  const numericPrice = parseNumberInput(displayPrice);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumberInput(e.target.value);
    setDisplayPrice(formatted);
  };

  const handleClose = () => {
    setDisplayPrice('');
    setDescription('');
    setSubmitted(false);
    setSubmittedPrice(0);
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!numericPrice || numericPrice <= 0) {
      setError('Lütfen geçerli bir teklif tutarı giriniz.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const sanitizedDescription = maskPhoneNumbers(description);

      const { error: serviceError } = await offerService.createOffer(user.id, {
        post_id: postId,
        price: numericPrice,
        description: sanitizedDescription,
      });

      if (serviceError) {
        setError(serviceError);
        return;
      }

      setSubmittedPrice(numericPrice);
      setSubmitted(true);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Teklif sunulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Teklif Gönderildi">
        <div className="py-6 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-9 h-9 text-emerald-600 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900">
              Teklifiniz Başarıyla Gönderildi!
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto font-medium">
              Gizli teklifiniz ve iletişim bilgileriniz güvenle alıcıya iletildi. Alıcı teklifinizi değerlendirdiğinde tarafınıza bildirim gönderilecektir.
            </p>
          </div>

          {submittedPrice > 0 && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 inline-block px-6">
              <span className="text-xs text-emerald-800 font-semibold block mb-0.5">Teklif Edilen Tutar</span>
              <span className="text-lg font-black text-emerald-700">{formatCurrency(submittedPrice)}</span>
            </div>
          )}

          <div className="pt-2">
            <Button
              variant="primary"
              className="bg-emerald-600 hover:bg-emerald-700 text-white w-full py-3 shadow-md font-bold text-sm"
              onClick={handleClose}
            >
              Tamam, Teşekkürler
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Gizli Teklif Ver">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Privacy Notice Banner */}
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-900">
          <Lock className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="leading-snug">
            Verdiğiniz bu teklif ve iletişim bilgileriniz <strong>SADECE bu ilanın sahibi alıcı</strong> tarafından görülecektir. Üçüncü şahıslar göremez.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formatted Price Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Teklif Edilen Fiyat (TL) *
            </label>
            {numericPrice > 0 && (
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                {formatCurrency(numericPrice)}
              </span>
            )}
          </div>
          <div className="relative">
            <Banknote className="w-5 h-5 text-[#312E81] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              inputMode="numeric"
              required
              value={displayPrice}
              onChange={handlePriceChange}
              placeholder="Örn: 35.000"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/15 text-slate-900 font-extrabold text-base outline-none tracking-wide"
            />
          </div>
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
            Teklif Detayı & Ürün/Hizmet Açıklaması *
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Alıcıya sunacağınız teklifin detaylarını, teslimat süresini veya ürün durumunu yazın..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/15 text-slate-900 text-sm outline-none resize-y"
          />
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={handleClose}>
            İptal
          </Button>
          <Button type="submit" isLoading={loading} className="px-6 bg-emerald-600 hover:bg-emerald-700 text-white">
            Teklifi Gönder
          </Button>
        </div>
      </form>
    </Modal>
  );
};
