'use client';

import React, { useEffect, useState } from 'react';
import { categoryService } from '@/services/categoryService';
import { CategoryOption } from '@/types';
import { Button } from '@/components/ui/Button';
import {
  Layers,
  PlusCircle,
  Edit2,
  Trash2,
  Check,
  X,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setCategories(categoryService.getCategories());
  }, []);

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const updated = categoryService.addCategory(newCatName.trim());
    setCategories(updated);
    setNewCatName('');
    showNotification('Yeni kategori başarıyla eklendi.');
  };

  const handleStartEdit = (cat: CategoryOption) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    const updated = categoryService.updateCategory(id, editName.trim());
    setCategories(updated);
    setEditingId(null);
    showNotification('Kategori adı güncellendi.');
  };

  const handleDelete = (id: string) => {
    if (categories.length <= 1) {
      alert('Sistemde en az 1 kategori bulunmalıdır.');
      return;
    }
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
    const updated = categoryService.deleteCategory(id);
    setCategories(updated);
    showNotification('Kategori silindi.');
  };

  const handleReset = () => {
    if (!confirm('Tüm kategorileri varsayılan fabrika ayarlarına sıfırlamak istiyor musunuz?')) return;
    const updated = categoryService.resetToDefault();
    setCategories(updated);
    showNotification('Kategoriler varsayılana sıfırlandı.');
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#312E81]" />
            Kategori Yönetimi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Platform genelindeki ilan kategorilerini ekleyin, düzenleyin veya sırasını yönetin.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Varsayılana Sıfırla
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-150">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Add New Category Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-emerald-600" />
          Yeni Kategori Ekle
        </h3>
        <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Örn: Anne & Bebek, Spor & Outdoor..."
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/15 text-sm outline-none font-medium"
          />
          <Button type="submit" className="bg-[#312E81] hover:bg-[#252262] text-white px-6 py-3 shadow-md whitespace-nowrap">
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Kategori Ekle
          </Button>
        </form>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
            Mevcut Kategoriler ({categories.length})
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {categories.map((cat, idx) => {
            const isEditing = editingId === cat.id;

            return (
              <div
                key={cat.id}
                className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0">
                    {idx + 1}
                  </span>

                  {isEditing ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-indigo-300 focus:ring-2 focus:ring-indigo-200 text-xs font-bold text-slate-900 outline-none w-full max-w-xs"
                      autoFocus
                    />
                  ) : (
                    <div>
                      <span className="text-sm font-extrabold text-slate-900 block">
                        {cat.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        ID: {cat.id}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(cat.id)}
                        className="p-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors"
                        title="Kaydet"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                        title="İptal"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStartEdit(cat)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="Kategori Adını Düzenle"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                        title="Kategoriyi Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
