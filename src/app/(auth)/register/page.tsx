'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, User, Phone, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError('Şifreler eşleşmiyor. Lütfen kontrol edin.');
      return;
    }

    setLoading(true);
    try {
      // 1) Telefon numarası daha önce kullanılmış mı?
      const { data: phoneCheck, error: phoneErr } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', phone.trim())
        .maybeSingle();

      if (phoneErr) {
        console.warn('Phone check error:', phoneErr.message);
      }
      if (phoneCheck) {
        setError('Bu telefon numarası zaten kayıtlı. Lütfen farklı bir numara girin veya giriş yapın.');
        setLoading(false);
        return;
      }

      // 2) E-posta daha önce kullanılmış mı?
      const { data: emailCheck, error: emailErr } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (emailErr) {
        console.warn('Email check error:', emailErr.message);
      }
      if (emailCheck) {
        setError('Bu e-posta adresi zaten kayıtlı. Lütfen giriş yapın veya farklı bir e-posta kullanın.');
        setLoading(false);
        return;
      }

      // 3) Supabase Auth kaydı
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { full_name: fullName, phone: phone.trim() },
        },
      });

      if (signUpError) {
        if (signUpError.message.toLowerCase().includes('already registered')) {
          throw new Error('Bu e-posta adresi zaten kayıtlı. Lütfen giriş yapın.');
        }
        throw signUpError;
      }

      // 4) profiles tablosuna telefon bilgisini yaz (trigger row oluşturduktan sonra güncelle)
      if (signUpData?.user?.id) {
        await supabase.from('profiles').upsert({
          id: signUpData.user.id,
          email: email.trim().toLowerCase(),
          full_name: fullName,
          phone: phone.trim(),
        }, { onConflict: 'id' });
      }

      setSuccess(true);
      setTimeout(() => router.push('/login'), 2500);

    } catch (err: any) {
      setError(err.message || 'Kayıt olunurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };


  const passwordStrength = () => {
    if (password.length === 0) return null;
    if (password.length < 6) return { level: 1, label: 'Çok Kısa', color: 'bg-red-400' };
    if (password.length < 8) return { level: 2, label: 'Zayıf', color: 'bg-orange-400' };
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) return { level: 3, label: 'Orta', color: 'bg-amber-400' };
    return { level: 4, label: 'Güçlü', color: 'bg-emerald-500' };
  };
  const strength = passwordStrength();

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-2xl shadow-slate-200/60">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-5">
              <img src="/logo.png" alt="haziralici.com" className="h-10 w-auto mx-auto object-contain" />
            </Link>
            <h1 className="text-2xl font-black text-slate-900">Yeni Hesap Oluşturun</h1>
            <p className="text-sm text-slate-500 mt-1.5">
              Alıcı veya Satıcı olarak topluluğumuza katılın.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="py-10 text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
              <h3 className="text-xl font-bold text-slate-900">Hesabınız Oluşturuldu!</h3>
              <p className="text-sm text-slate-500">
                Giriş sayfasına yönlendiriliyorsunuz...
              </p>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Ad Soyad
                </label>
                <div className="relative">
                  <User className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" />
                  <input
                    id="fullName"
                    type="text"
                    required
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ahmet Yılmaz"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/15 outline-none text-slate-900 text-sm transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Telefon Numarası
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05XX XXX XX XX"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/15 outline-none text-slate-900 text-sm transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* Email */}
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

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Şifre
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="En az 6 karakter"
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/15 outline-none text-slate-900 text-sm transition-all placeholder:text-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Password strength bar */}
                {strength && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((lvl) => (
                        <div
                          key={lvl}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            lvl <= strength.level ? strength.color : 'bg-slate-100'
                          }`}
                        />
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
                  Şifre Tekrar
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="passwordConfirm"
                    type={showPasswordConfirm ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete="new-password"
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
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPasswordConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {passwordConfirm && password === passwordConfirm && (
                    <CheckCircle2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  )}
                </div>
              </div>

              <Button type="submit" isLoading={loading} className="w-full py-3 mt-2">
                Hesap Oluştur
              </Button>

              <p className="text-[11px] text-center text-slate-400 leading-relaxed">
                Kayıt olarak{' '}
                <Link href="/kullanim-kosullari" className="underline hover:text-slate-600">Kullanım Koşulları</Link>
                {' '}ve{' '}
                <Link href="/gizlilik-politikasi" className="underline hover:text-slate-600">Gizlilik Politikası</Link>
                {' '}kabul etmiş olursunuz.
              </p>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-slate-500 border-t border-slate-100 pt-6">
            Zaten hesabınız var mı?{' '}
            <Link href="/login" className="font-bold text-[#312E81] hover:underline">
              Giriş Yapın
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
