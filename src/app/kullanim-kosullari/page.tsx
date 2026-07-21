import React from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft, FileText } from 'lucide-react';

export const metadata = {
  title: 'Kullanım Koşulları — haziralici.com',
  description: 'haziralici.com platformu kullanım koşulları, alıcı ve satıcı hakları ile kuralları.',
};

export default function KullanimKosullariPage() {
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
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#312E81] flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Kullanım Koşulları</h1>
            <p className="text-xs text-slate-400">Son Güncelleme: 21 Temmuz 2026</p>
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">1. Taraflar ve Amaç</h2>
          <p>
            Bu Kullanım Koşulları, <strong>haziralici.com</strong> ("Platform") üzerinden hizmet alan alıcılar ve satıcılar ("Kullanıcılar") arasındaki hak ve yükümlülükleri düzenler. Platforma üye olan veya ilan açan/teklif veren herkes bu koşulları kabul etmiş sayılır.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">2. Hizmet Modeli (Tersine Pazar Yeri)</h2>
          <p>
            haziralici.com, alıcıların aradıkları ürün veya hizmetleri bütçeleriyle ilan ettikleri, satıcıların ise bu taleplere **kapalı (gizli) teklif** verdikleri bir pazaryeri platformudur.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs">
            <li>Satıcılar tarafından verilen teklifler yalnızca ilan sahibi alıcı tarafından görüntülenebilir.</li>
            <li>Alıcı ve satıcı arasındaki nihai anlaşma tarafların kendi özgür iradesiyle gerçekleşir.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">3. Gizlilik ve İletişim Kuralları</h2>
          <p>
            Platform güvenliği ve gizliliği açısından:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs">
            <li>İlan açıklamalarında veya halka açık teklif alanlarında telefon numarası, e-posta veya kişisel iletişim bilgisi paylaşılması yasaktır. Sistem bu tür verileri otomatik maskeleme hakkına sahiptir.</li>
            <li>Satıcının iletişim bilgileri sadece alıcı ilgili teklifi kabul ettiğinde açılır.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">4. Kullanıcı Sorumlulukları</h2>
          <p>
            Kullanıcılar platform üzerinde yasalara ve genel ahlak kurallarına uygun hareket etmekle yükümlüdür. Yanıltıcı ilan açılması, sahte teklif verilmesi veya ticari itibar zedeleyici davranışlar tespiti durumunda hesaplar süresiz askıya alınır.
          </p>
        </section>

        <section className="space-y-3 border-t border-slate-100 pt-4">
          <h2 className="text-base font-bold text-slate-900">5. İletişim</h2>
          <p className="text-xs text-slate-500">
            Kullanım koşulları hakkındaki tüm soru ve bildirimleriniz için <strong className="text-[#312E81]">destek@haziralici.com</strong> adresi üzerinden bizimle iletişime geçebilirsiniz.
          </p>
        </section>
      </div>
    </div>
  );
}
