'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  FileText,
  Tag,
  Shield,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Settings,
  Layers,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isHasancavit = user?.email?.toLowerCase() === 'hasancavitkocak@gmail.com';
  const isAdmin = profile?.role === 'admin' || isHasancavit;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  // Show smooth spinner while loading auth or profile
  if (loading || (user && !profile && isHasancavit)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center flex-col gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#312E81]" />
        <span className="text-sm font-medium">Admin yetkileri doğrulanıyor...</span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Erişim Engellendi</h2>
        <p className="text-sm text-slate-600">
          Bu sayfaya sadece <strong>Admin</strong> yetkisine sahip kullanıcılar erişebilir.
        </p>
        <div className="p-4 rounded-xl bg-slate-100 text-xs text-slate-500 text-left font-mono">
          E-posta: {user.email}<br />
          Mevcut Rol: {profile?.role || 'user'}
        </div>
        <div className="pt-2">
          <Link href="/">
            <Button variant="primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anasayfaya Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      name: 'Genel Bakış',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      name: 'Kullanıcı Yönetimi',
      href: '/admin/users',
      icon: Users,
    },
    {
      name: 'İlan Yönetimi & Moderasyon',
      href: '/admin/posts',
      icon: FileText,
    },
    {
      name: 'Teklif Yönetimi',
      href: '/admin/offers',
      icon: Tag,
    },
    {
      name: 'Kategori Yönetimi',
      href: '/admin/categories',
      icon: Layers,
    },
    {
      name: 'Şikayet Yönetimi',
      href: '/admin/reports',
      icon: AlertTriangle,
    },
    {
      name: 'Yönetici Günlüğü',
      href: '/admin/logs',
      icon: Activity,
    },
    {
      name: 'Sistem Ayarları',
      href: '/admin/settings',
      icon: Settings,
    },
  ];

  return (
    <div className="max-w-[1536px] w-full mx-auto min-h-[80vh] flex flex-col md:flex-row gap-6">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-lg shadow-slate-200/40 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Admin Header */}
          <div className="flex items-center gap-3 px-2 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Admin Paneli</h2>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                Yönetici Yetkisi
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-150',
                    isActive
                      ? 'bg-[#312E81] text-white shadow-md shadow-indigo-100'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Back to Site Link */}
        <div className="pt-6 border-t border-slate-100">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ana Siteye Dön</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 w-full">{children}</main>
    </div>
  );
}
