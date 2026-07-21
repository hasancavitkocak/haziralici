'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CreatePostPayload, PostUrgency, CategoryOption } from '@/types';
import { postService } from '@/services/postService';
import { categoryService } from '@/services/categoryService';
import { TurkeyCities } from '@/data/turkeyCities';
import { formatNumberInput, parseNumberInput, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { PlusCircle, MapPin, Tag, Banknote, AlertCircle, Clock } from 'lucide-react';

export const CreatePostForm = () => {
  const router = useRouter();
  const { user } = useAuth();

  const [categories, setCategories] = useState<CategoryOption[]>([]);

  const [formData, setFormData] = useState<CreatePostPayload>({
    category: 'gayrimenkul',
    title: '',
    description: '',
    min_budget: 0,
    max_budget: 0,
    location_city: '',
    location_district: '',
    urgency: 'today',
  });

  React.useEffect(() => {
    const cats = categoryService.getCategories();
    setCategories(cats);
    if (cats.length > 0) {
      setFormData((prev) => ({ ...prev, category: cats[0].id }));
    }
  }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    if (!formData.location_city) {
      setError('Lütfen bir şehir seçiniz.');
      return;
    }

    if (!formData.location_district) {
      setError('Lütfen bir ilçe / semt seçiniz.');
      return;
    }

    if (!formData.min_budget || Number(formData.min_budget) <= 0) {
      setError('Lütfen geçerli bir minimum bütçe giriniz.');
      return;
    }

    if (!formData.max_budget || Number(formData.max_budget) <= 0) {
      setError('Lütfen geçerli bir maksimum bütçe giriniz.');
      return;
    }

    if (Number(formData.min_budget) > Number(formData.max_budget)) {
      setError('Minimum bütçe, maksimum bütçeden büyük olamaz.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: serviceError } = await postService.createPost(user.id, formData);

      if (serviceError) {
        setError(serviceError);
        return;
      }

      setShowSuccessModal(true);
    } catch (err: any) {
      console.error('Error creating post:', err);
      setError(err.message || 'İlan oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Moderation Pending Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
              <Clock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">
                İlanınız Değerlendirmeye Alındı!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                İlanınız sistem yöneticileri tarafından incelendikten sonra yayına alınacaktır.
                Onay durumunu profilinizden ve sağ üstteki <strong>Bildirimler</strong> alanından takip edebilirsiniz.
              </p>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                className="w-full py-3 shadow-md"
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push('/profil');
                }}
              >
                Anlaşıldı, Profillime Git
              </Button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          İlan Başlığı *
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Örn: Kadıköy Moda'da 30.000 TL'ye 2+1 kiralık daire arıyorum"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/15 outline-none text-slate-900 text-sm font-medium transition-all"
        />
      </div>

      {/* Category Row */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Kategori *
        </label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/15 outline-none text-slate-900 text-sm bg-white cursor-pointer font-medium"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* City & District Row (Perfectly Paired!) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* City */}
        <div>
          <SearchableSelect
            label="Şehir"
            required
            placeholder="Şehir Seçiniz..."
            searchPlaceholder="81 İl İçinde Ara..."
            options={TurkeyCities.getCityNames()}
            value={formData.location_city}
            onChange={(newCity) => {
              setFormData({
                ...formData,
                location_city: newCity,
                location_district: '',
              });
            }}
          />
        </div>

        {/* District */}
        <div>
          <SearchableSelect
            label="İlçe / Semt"
            required
            icon={<MapPin className="w-4 h-4 text-slate-400" />}
            placeholder={formData.location_city ? 'İlçe Seçiniz...' : 'Önce Şehir Seçiniz...'}
            searchPlaceholder="İlçe İçinde Ara..."
            options={formData.location_city ? TurkeyCities.getDistricts(formData.location_city) : []}
            value={formData.location_district}
            onChange={(newDistrict) =>
              setFormData({ ...formData, location_district: newDistrict })
            }
          />
        </div>
      </div>

      {/* Budget Min / Max Box */}
      <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200/80 space-y-3">
        <label className="block text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
          <Banknote className="w-4 h-4 text-emerald-600" />
          Bütçe Aralığınız (TL) *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="block text-xs text-emerald-800 font-semibold">Minimum Bütçe</span>
              {formData.min_budget > 0 && (
                <span className="text-[11px] font-black text-emerald-800">{formatCurrency(formData.min_budget)}</span>
              )}
            </div>
            <input
              type="text"
              inputMode="numeric"
              required
              value={formatNumberInput(formData.min_budget || '')}
              onChange={(e) => setFormData({ ...formData, min_budget: parseNumberInput(e.target.value) })}
              placeholder="Örn: 10.000"
              className="w-full px-4 py-2.5 rounded-xl border border-emerald-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-900 font-bold text-sm bg-white"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="block text-xs text-emerald-800 font-semibold">Maksimum Bütçe</span>
              {formData.max_budget > 0 && (
                <span className="text-[11px] font-black text-emerald-800">{formatCurrency(formData.max_budget)}</span>
              )}
            </div>
            <input
              type="text"
              inputMode="numeric"
              required
              value={formatNumberInput(formData.max_budget || '')}
              onChange={(e) => setFormData({ ...formData, max_budget: parseNumberInput(e.target.value) })}
              placeholder="Örn: 25.000"
              className="w-full px-4 py-2.5 rounded-xl border border-emerald-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-900 font-bold text-sm bg-white"
            />
          </div>
        </div>
      </div>

      {/* Single Clean Urgency Selector (3-Card Interactive) */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-[#312E81]" />
          Satın Alma Aciliyetiniz *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'today', title: 'Bugün Alacağım (Acil)', desc: 'Acil teklif bekliyorum', badge: 'bg-rose-500' },
            { id: 'this_week', title: 'Bu Hafta İçinde', desc: 'Birkaç gün vaktim var', badge: 'bg-amber-500' },
            { id: 'research', title: 'Fiyat Araştırması', desc: 'Piyasa fiyatı bakıyorum', badge: 'bg-indigo-500' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFormData({ ...formData, urgency: item.id as PostUrgency })}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                formData.urgency === item.id
                  ? 'border-[#312E81] bg-indigo-50/80 ring-2 ring-[#312E81]/20 font-bold shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2.5 h-2.5 rounded-full ${item.badge}`} />
                <span className="text-xs font-extrabold text-slate-900">{item.title}</span>
              </div>
              <p className="text-[11px] text-slate-500 font-normal pl-4.5">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Detaylı Açıklama & İstekleriniz *
        </label>
        <textarea
          required
          rows={5}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Aradığınız özellikler, kabul edebileceğiniz koşullar veya detaylar hakkında satıcılara bilgi verin..."
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/15 outline-none text-slate-900 text-sm transition-all resize-y"
        />
      </div>

      <Button type="submit" isLoading={loading} size="lg" className="w-full shadow-lg">
        <PlusCircle className="w-5 h-5 mr-2" />
        İlanı Yayınla
      </Button>
    </form>
    </>
  );
};
