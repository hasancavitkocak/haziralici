import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Building } from 'lucide-react';

export const metadata = {
  title: 'KVKK Aydınlatma Metni — haziralici.com',
  description: '6698 Sayılı Kişisel Verilerin Korunması Kanunu uyarınca KVKK Aydınlatma Metni.',
};

export default function KvkkPage() {
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
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">KVKK Aydınlatma Metni</h1>
            <p className="text-xs text-slate-400">6698 Sayılı Kişisel Verilerin Korunması Kanunu</p>
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">1. Veri Sorumlusu</h2>
          <p>
            6698 Sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz veri sorumlusu olarak <strong>haziralici.com</strong> tarafından aşağıda açıklanan kapsamda işlenmektedir.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">2. İşlenen Kişisel Verileriniz ve İşleme Amaçları</h2>
          <p>
            Platforma üye olurken veya işlem yaparken paylaştığınız Ad Soyad, E-posta adresi, Telefon Numarası, İl/İlçe ve İşlem Güvenliği verileri;
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs">
            <li>Üyelik akdinin ifası ve hizmet sunumu,</li>
            <li>Alıcı ve satıcı arasındaki iletişim ve teklif süreçlerinin yürütülmesi,</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi amaçlarıyla KVKK'nın 5. ve 6. maddelerine uygun işlenir.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">3. Kişisel Verilerin Aktarılması</h2>
          <p>
            Kişisel verileriniz, kanunen yetkili kamu kurum ve kuruluşları dışında hiçbir üçüncü taraf veya şirkete satılmaz, pazarlama amacıyla aktarılmaz. İletişim bilgileriniz yalnızca alıcı ve satıcı teklifi onayladığında ilgili tarafa iletilir.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">4. KVKK Kapsamındaki Haklarınız</h2>
          <p>
            KVKK'nın 11. maddesi uyarınca veri sahipleri; kişisel verilerinin işlenip işlenmediğini öğrenme, silinmesini veya düzeltilmesini talep etme ve işlenmesine itiraz etme hakkına sahiptir. Başvurularınızı <strong className="text-[#312E81]">kvkk@haziralici.com</strong> adresi üzerinden iletebilirsiniz.
          </p>
        </section>
      </div>
    </div>
  );
}
