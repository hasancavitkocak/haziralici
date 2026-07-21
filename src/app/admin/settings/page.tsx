'use client';

import React, { useState, useEffect } from 'react';
import { settingsService, SystemSettings } from '@/services/settingsService';
import { Button } from '@/components/ui/Button';
import {
  Settings,
  ShieldCheck,
  Megaphone,
  CheckCircle2,
  Phone,
  Mail,
  Save,
  SlidersHorizontal,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    autoApprovePosts: false,
    announcementBanner: {
      enabled: true,
      text: '',
      type: 'emerald',
    },
    contactEmail: '',
    supportPhone: '',
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const current = settingsService.getSettings();
    setSettings(current);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      settingsService.updateSettings(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert('Ayarlar kaydedilemedi: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#312E81]" />
            Sistem & Platform Ayarları
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            İlan onay mekanizmasını, anasayfa duyuru bandını ve sistem parametrelerini yönetin.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-150">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Sistem ayarları başarıyla kaydedildi ve tüm platforma uygulandı!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. İlan Moderasyon Ayarları */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#312E81] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">İlan Moderasyon Modu</h3>
              <p className="text-xs text-slate-500">
                Yeni açılan alıcı ilanlarının onay mekanizmasını kontrol edin.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Manuel Moderasyon */}
            <div
              onClick={() => setSettings({ ...settings, autoApprovePosts: false })}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                !settings.autoApprovePosts
                  ? 'border-[#312E81] bg-indigo-50/50 ring-2 ring-[#312E81]/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-slate-900">🛡️ Manuel Moderasyon (Önerilen)</span>
                {!settings.autoApprovePosts && (
                  <span className="text-[10px] bg-[#312E81] text-white px-2 py-0.5 rounded-full font-bold">Aktif</span>
                )}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Açılan yeni ilanlar yöneticiler tarafından incelenip onaylanana kadar "Değerlendirmede" durumunda bekletilir.
              </p>
            </div>

            {/* Otomatik Onay */}
            <div
              onClick={() => setSettings({ ...settings, autoApprovePosts: true })}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                settings.autoApprovePosts
                  ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-slate-900">⚡ Otomatik Onay (Anında Yayın)</span>
                {settings.autoApprovePosts && (
                  <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">Aktif</span>
                )}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Kullanıcı ilan açtığı anda herhangi bir inceleme olmadan ilan doğrudan anasayfada yayına alınır.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Duyuru Bandı Yönetimi */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Anasayfa Duyuru Bandı</h3>
                <p className="text-xs text-slate-500">
                  Anasayfanın en üstünde yayınlanacak duyuru veya kampanya metni.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.announcementBanner.enabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    announcementBanner: {
                      ...settings.announcementBanner,
                      enabled: e.target.checked,
                    },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {settings.announcementBanner.enabled && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Duyuru Metni
                </label>
                <input
                  type="text"
                  value={settings.announcementBanner.text}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      announcementBanner: {
                        ...settings.announcementBanner,
                        text: e.target.value,
                      },
                    })
                  }
                  placeholder="Örn: 🎉 haziralici.com yayında! İlk ilanınıza özel sıfır komisyon."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/15 text-sm font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Duyuru Rengi / Türü
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'emerald', name: 'Yeşil (Promosyon)', class: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                    { id: 'info', name: 'Mavi (Bilgilendirme)', class: 'bg-blue-50 text-blue-800 border-blue-200' },
                    { id: 'warning', name: 'Sarı (Uyarı)', class: 'bg-amber-50 text-amber-800 border-amber-200' },
                  ].map((typeItem) => (
                    <button
                      key={typeItem.id}
                      type="button"
                      onClick={() =>
                        setSettings({
                          ...settings,
                          announcementBanner: {
                            ...settings.announcementBanner,
                            type: typeItem.id as any,
                          },
                        })
                      }
                      className={`p-3 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${typeItem.class} ${
                        settings.announcementBanner.type === typeItem.id ? 'ring-2 ring-slate-900/30 font-black' : 'opacity-70'
                      }`}
                    >
                      {typeItem.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. İletişim Bilgileri */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Destek & İletişim Bilgileri</h3>
              <p className="text-xs text-slate-500">
                Site altbilgisinde (footer) görünecek kurumsal iletişim bilgileri.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Destek E-postası
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/15 text-sm font-medium outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Müşteri Destek Telefonu
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={settings.supportPhone}
                  onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/15 text-sm font-medium outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" isLoading={saving} className="px-8 py-3 bg-[#312E81] hover:bg-[#252262] text-white shadow-lg">
            <Save className="w-4 h-4 mr-2" />
            Tüm Ayarları Kaydet
          </Button>
        </div>
      </form>
    </div>
  );
}
