'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Tag, Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('invalid login') || msg.toLowerCase().includes('invalid credentials')) {
        setError('E-posta veya şifre hatalı. Lütfen tekrar deneyin.');
      } else {
        setError(msg || 'Giriş yapılırken bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xl shadow-slate-200/50">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-10 h-10 rounded-xl bg-[#312E81] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Tag className="w-5 h-5" />
            </div>
          </Link>
          <h1 className="text-2xl font-black text-slate-900">Hesabınıza Giriş Yapın</h1>
          <p className="text-sm text-slate-500 mt-1">
            İlan açmak ve gizli teklifleri yönetmek için giriş yapın.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              E-posta Adresi
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/20 outline-none text-slate-900 text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Şifre
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/20 outline-none text-slate-900 text-sm transition-all"
              />
            </div>
          </div>

          {/* Şifremi Unuttum */}
          <div className="text-right">
            <Link href="/sifremi-unuttum" className="text-xs font-semibold text-[#312E81] hover:underline">
              Şifremi Unuttum
            </Link>
          </div>

          <Button type="submit" isLoading={loading} className="w-full py-3">
            Giriş Yap
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500 border-t border-slate-100 pt-6">
          Hesabınız yok mu?{' '}
          <Link href="/register" className="font-semibold text-[#312E81] hover:underline">
            Hemen Kayıt Olun
          </Link>
        </div>
      </div>
    </div>
  );
}
