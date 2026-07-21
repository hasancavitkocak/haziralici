import React from 'react';
import Link from 'next/link';
import { Lock, ShieldCheck, Mail, ArrowRight } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-200/80 bg-white pt-12 pb-16 text-xs text-slate-600">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="inline-block">
              <img
                src="/logo.png"
                alt="haziralici.com"
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-slate-500 leading-relaxed">
              Türkiye’nin lider tersine pazaryeri. Alıcılar ne aradıklarını ve bütçelerini ilan eder, satıcılar gizli teklifler verir.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>%100 Gizli Satıcı Teklifleri</span>
            </div>
          </div>

          {/* Col 2: Hızlı Erişim */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Hızlı Erişim
            </h4>
            <ul className="space-y-2 font-medium text-slate-600">
              <li>
                <Link href="/" className="hover:text-[#312E81] transition-colors flex items-center gap-1">
                  <span>Anasayfa Akışı</span>
                </Link>
              </li>
              <li>
                <Link href="/ilan-ver" className="hover:text-[#312E81] transition-colors flex items-center gap-1">
                  <span>İlan Oluştur</span>
                </Link>
              </li>
              <li>
                <Link href="/profil" className="hover:text-[#312E81] transition-colors flex items-center gap-1">
                  <span>Profilim & İlanlarım</span>
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#312E81] transition-colors flex items-center gap-1">
                  <span>Giriş Yap / Kayıt Ol</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Yasal & Kurumsal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Yasal & Kurumsal
            </h4>
            <ul className="space-y-2 font-medium text-slate-600">
              <li>
                <Link href="/kullanim-kosullari" className="hover:text-[#312E81] transition-colors">
                  Kullanım Koşulları
                </Link>
              </li>
              <li>
                <Link href="/gizlilik-politikasi" className="hover:text-[#312E81] transition-colors">
                  Gizlilik & Çerez Politikası
                </Link>
              </li>
              <li>
                <Link href="/kvkk" className="hover:text-[#312E81] transition-colors">
                  KVKK Aydınlatma Metni
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Kategoriler & İletişim */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Popüler Kategoriler
            </h4>
            <ul className="space-y-2 font-medium text-slate-600">
              <li>Gayrimenkul & Kiralık / Satılık</li>
              <li>Vasıta & Otomobil</li>
              <li>Elektronik & İkinci El</li>
              <li>Hizmet & İş Fırsatları</li>
            </ul>
            <div className="pt-2 flex items-center gap-1.5 text-slate-500 font-semibold">
              <Mail className="w-3.5 h-3.5 text-[#312E81]" />
              <span>destek@haziralici.com</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-[11px]">
          <p>© 2026 haziralici.com — Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-4">
            <Link href="/kullanim-kosullari" className="hover:underline">Kullanım Koşulları</Link>
            <span>•</span>
            <Link href="/gizlilik-politikasi" className="hover:underline">Gizlilik</Link>
            <span>•</span>
            <Link href="/kvkk" className="hover:underline">KVKK</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
