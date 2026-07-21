'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CreatePostForm } from '@/components/post/CreatePostForm';
import { ArrowLeft, Tag, ShieldCheck } from 'lucide-react';

export default function CreatePostPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#312E81]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-[1536px] w-full mx-auto py-6 space-y-6">
      {/* Back Button */}
      <Link href="/" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-[#312E81] transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Anasayfaya Dön
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl shadow-slate-200/50">
        <div className="mb-6 border-b border-slate-100 pb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-[#312E81] text-xs font-bold mb-3">
            <Tag className="w-3.5 h-3.5" />
            Alıcı İlanı Oluştur
          </div>
          <h1 className="text-2xl font-black text-slate-900">Ne aradığınızı ve bütçenizi girin</h1>
          <p className="text-xs text-slate-500 mt-1">
            İlanınız yayınlandıktan sonra satıcılar sadece sizin görebileceğiniz gizli teklifler iletecektir.
          </p>
        </div>

        <CreatePostForm />
      </div>
    </div>
  );
}
