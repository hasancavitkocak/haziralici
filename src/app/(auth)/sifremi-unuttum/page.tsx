'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/sifre-sifirla`,
        }
      );

      if (resetError) throw resetError;
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-2xl shadow-slate-200/60">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-5">
              <img src="/logo.png" alt="haziralici.com" className="h-10 w-auto mx-auto object-contain" />
            </Link>
            <h1 className="text-2xl font-black text-slate-900">Şifremi Unuttum</h1>
            <p className="text-sm text-slate-500 mt-1.5">
              E-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {sent ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">E-posta Gönderildi!</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                <span className="font-semibold text-slate-700">{email}</span> adresine şifre sıfırlama bağlantısı gönderildi. Lütfen gelen kutunuzu kontrol edin.
              </p>
              <p className="text-xs text-slate-400">
                E-posta gelmedi mi? Spam/junk klasörünü kontrol edin.
              </p>
              <Link href="/login">
                <Button variant="secondary" className="mt-2">
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Giriş Sayfasına Dön
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  E-posta Adresi
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@email.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/15 outline-none text-slate-900 text-sm transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              <Button type="submit" isLoading={loading} className="w-full py-3">
                Sıfırlama Bağlantısı Gönder
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-slate-500 border-t border-slate-100 pt-6">
            <Link href="/login" className="inline-flex items-center gap-1 font-semibold text-[#312E81] hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" />
              Giriş Sayfasına Dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
