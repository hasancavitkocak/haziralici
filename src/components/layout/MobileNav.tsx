'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Home, PlusCircle, User, LogIn, Shield } from 'lucide-react';
import { formatDisplayName } from '@/lib/utils';

export const MobileNav = () => {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const displayName = formatDisplayName(profile?.full_name, user?.email);
  const initial = displayName.charAt(0).toUpperCase();

  const isActive = (path: string) => pathname === path;

  const navItemClass = (active: boolean) =>
    `flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
      active ? 'text-[#312E81] font-bold scale-105' : 'text-slate-500 font-medium'
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 sm:hidden px-2 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around max-w-md mx-auto">

        {/* Ana Sayfa */}
        <Link href="/" className={navItemClass(isActive('/'))}>
          <Home className={`w-5 h-5 ${isActive('/') ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[11px] leading-none">Ana Sayfa</span>
        </Link>



        {/* İlan Ver — merkez çıkıntılı buton */}
        <Link href="/ilan-ver" className="flex flex-col items-center -mt-5 group">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-400/40 group-hover:scale-110 active:scale-95 transition-all">
            <PlusCircle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-bold text-emerald-600 mt-1 leading-none">İlan Ver</span>
        </Link>

        {/* Profil veya Giriş Yap */}
        {user ? (
          <Link href="/profil" className={navItemClass(isActive('/profil'))}>
            <User className={`w-5 h-5 ${isActive('/profil') ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[11px] leading-none">Profilim</span>
          </Link>
        ) : (
          <Link href="/login" className={navItemClass(isActive('/login') || isActive('/register'))}>
            <User className={`w-5 h-5 ${isActive('/login') || isActive('/register') ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[11px] leading-none">Giriş</span>
          </Link>
        )}


      </div>
    </nav>
  );
};
