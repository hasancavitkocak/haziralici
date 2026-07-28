'use client';

import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { reportService } from '@/services/reportService';
import { useAuth } from '@/context/AuthContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTitle: string; // e.g. "İlan: iPhone 13 Satın Almak İstiyorum" or "Teklif: 15.000 TL"
  targetType: 'post' | 'offer';
  targetId: string;
  onReportSubmit?: (reason: string, details: string) => void;
}

const REPORT_REASONS = [
  'Spam veya Yanıltıcı İçerik',
  'Sahte Fiyat veya Dolandırıcılık Şüphesi',
  'Uygunsuz Dil / Hakaret / Taciz',
  'Telif Hakkı veya Yasa Dışı İletim',
  'Kategori veya Konum Hatalı',
  'Diğer',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetTitle,
  targetType,
  targetId,
  onReportSubmit,
}) => {
  const { user } = useAuth();
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [additionalDetails, setAdditionalDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      setError('Lütfen bir şikayet nedeni seçin.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await reportService.createReport({
        reporter_id: user?.id || null,
        reporter_email: user?.email || 'Anonim Kullanıcı',
        target_type: targetType,
        target_id: targetId,
        target_title: targetTitle,
        reason: selectedReason,
        details: additionalDetails.trim() || undefined,
      });

      if (result.success) {
        if (onReportSubmit) {
          onReportSubmit(selectedReason, additionalDetails);
        }
        setIsSubmitted(true);
        setTimeout(() => {
          setIsSubmitted(false);
          setSelectedReason('');
          setAdditionalDetails('');
          setError('');
          onClose();
        }, 1500);
      } else {
        setError(result.error || 'Şikayet iletilemedi.');
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Şikayetiniz Alındı</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Bildiriminiz yöneticilerimize iletilmiştir. İnceleme en kısa sürede yapılacaktır.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Kötüye Kullanım Bildir</h3>
                <p className="text-xs text-slate-500 line-clamp-1 truncate max-w-[260px]">
                  {targetTitle}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Şikayet Sebebiniz <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-1.5">
                  {REPORT_REASONS.map((reason) => (
                    <label
                      key={reason}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                        selectedReason === reason
                          ? 'border-rose-500 bg-rose-50/50 text-rose-950 font-bold shadow-xs'
                          : 'border-slate-200/80 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="report_reason"
                        value={reason}
                        checked={selectedReason === reason}
                        onChange={() => {
                          setSelectedReason(reason);
                          setError('');
                        }}
                        className="text-rose-600 focus:ring-rose-500 h-3.5 w-3.5 cursor-pointer"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Ek Açıklama (Opsiyonel)
                </label>
                <textarea
                  rows={3}
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                  placeholder="Şikayetinizle ilgili detay ekleyebilirsiniz..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none text-slate-800 resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="text-xs font-bold"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmitting ? 'Gönderiliyor...' : 'Şikayeti Gönder'}</span>
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
