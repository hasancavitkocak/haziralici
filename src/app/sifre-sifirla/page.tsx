'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Lock, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.includes('access_token') || hash.includes('type=recovery')) {
        setSessionReady(true);
      }
    }

    supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });
  }, []);

  const passwordStrength = () => {
    if (password.length === 0) return null;
    if (password.length < 6) return { level: 1, label: 'Çok Kısa', color: 'bg-red-400' };
    if (password.length < 8) return { level: 2, label: 'Zayıf', color: 'bg-orange-400' };
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) return { level: 3, label: 'Orta', color: 'bg-amber-400' };
    return { level: 4, label: 'Güçlü', color: 'bg-emerald-500' };
  };
  const strength = passwordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Şifre güncellenirken bir hata oluştu.');
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
            <h1 className="text-2xl font-black text-slate-900">Yeni Şifre Belirle</h1>
            <p className="text-sm text-slate-500 mt-1.5">
              Hesabınız için güçlü bir şifre oluşturun.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Şifreniz Güncellendi!</h3>
              <p className="text-sm text-slate-500">
                Yeni şifrenizle giriş yapabilirsiniz. Yönlendiriliyorsunuz...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password */}
              <div>
                <label htmlFor="password" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Yeni Şifre
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="En az 6 karakter"
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/15 outline-none text-slate-900 text-sm transition-all placeholder:text-slate-300"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" tabIndex={-1}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {strength && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((lvl) => (
                        <div key={lvl} className={`h-1 flex-1 rounded-full transition-all ${lvl <= strength.level ? strength.color : 'bg-slate-100'}`} />
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Şifre gücü: <span className="font-bold text-slate-600">{strength.label}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="passwordConfirm" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Yeni Şifre Tekrar
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="passwordConfirm"
                    type={showPasswordConfirm ? 'text' : 'password'}
                    required
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="Şifrenizi tekrar girin"
                    className={`w-full pl-10 pr-11 py-3 rounded-xl border outline-none text-slate-900 text-sm transition-all placeholder:text-slate-300 focus:ring-2 ${
                      passwordConfirm && password !== passwordConfirm
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                        : passwordConfirm && password === passwordConfirm
                        ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100'
                        : 'border-slate-200 focus:border-[#312E81] focus:ring-[#312E81]/15'
                    }`}
                  />
                  <button type="button" onClick={() => setShowPasswordConfirm(!showPasswordConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" tabIndex={-1}>
                    {showPasswordConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {passwordConfirm && password === passwordConfirm && (
                    <CheckCircle2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  )}
                </div>
              </div>

              <Button type="submit" isLoading={loading} className="w-full py-3">
                Şifremi Güncelle
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
