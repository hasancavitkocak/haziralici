import React from 'react';
import Link from 'next/link';
import { Lock, ArrowLeft, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Gizlilik ve Çerez Politikası — haziralici.com',
  description: 'haziralici.com kişisel verilerin korunması, gizlilik ilkesi ve çerez politikası detayları.',
};

export default function GizlilikPolitikasiPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-[#312E81] transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Anasayfaya Dön
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xl space-y-6 text-slate-700 text-sm leading-relaxed">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Gizlilik ve Çerez Politikası</h1>
            <p className="text-xs text-slate-400">Son Güncelleme: 21 Temmuz 2026</p>
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">1. Gizlilik Taahhüdümüz</h2>
          <p>
            <strong>haziralici.com</strong> olarak, kullanıcılarımızın gizliliğine son derece önem veriyoruz. Gizli teklif mekanizmamız gereği, satıcıların sunduğu fiyatlar ve teklif detayları <strong>yalnızca ilan sahibi alıcı</strong> tarafından görüntülenebilir. Rakipler veya üçüncü şahıslar bu tekliflere kesinlikle erişemez.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">2. Toplanan Veriler ve Kullanım Amacı</h2>
          <p>
            Platformumuzda toplanan kişisel veriler (Ad Soyad, E-posta, Telefon Numarası, Konum):
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs">
            <li>Kullanıcı hesabının doğrulanması ve güvenli giriş sağlanması,</li>
            <li>Alıcı ve satıcı arasındaki teklif onay süreçlerinin yürütülmesi,</li>
            <li>İletişim bilgilerinin yalnızca teklif kabul edildiğinde ilgili tarafa açılması amaçlarıyla kullanılır.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">3. Çerez (Cookie) Kullanımı</h2>
          <p>
            Platformumuz, kullanıcı oturumlarının aktif tutulması, tercihlerin hatırlanması ve sistem performansının artırılması amacıyla teknik zorunlu çerezler kullanmaktadır. Çerezler hiçbir şekilde üçüncü taraf reklam ağlarıyla izniniz olmadan paylaşılmaz.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">4. Veri Güvenliği</h2>
          <p>
            Tüm verileriniz endüstri standardı şifreleme protokolleri (SSL/TLS) ve Supabase güvenli veritabanı altyapısıyla korunmaktadır.
          </p>
        </section>
      </div>
    </div>
  );
}
