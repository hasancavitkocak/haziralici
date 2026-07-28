'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { reportService } from '@/services/reportService';
import { ContentReport, ReportStatus } from '@/types';
import {
  AlertTriangle,
  Trash2,
  Clock,
  ShieldAlert,
  User,
  ArrowUpRight,
  FileText,
  Tag,
  CheckCircle2,
  Search,
  Eye,
  Loader2,
  XCircle,
  MessageSquare,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [targetTypeFilter, setTargetTypeFilter] = useState<'all' | 'post' | 'offer'>('all');

  // Inspection & Action Modal state
  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await reportService.getAllReports();
      setReports(data);
    } catch (err) {
      console.error('Fetch reports error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleOpenDetailModal = (report: ContentReport) => {
    setSelectedReport(report);
    setAdminNotes(report.admin_notes || '');
  };

  const handleUpdateStatus = async (newStatus: ReportStatus) => {
    if (!selectedReport) return;
    setUpdating(true);
    try {
      const result = await reportService.updateReportStatus(selectedReport.id, newStatus, adminNotes);
      if (result.success) {
        setReports((prev) =>
          prev.map((r) =>
            r.id === selectedReport.id ? { ...r, status: newStatus, admin_notes: adminNotes } : r
          )
        );
        setSelectedReport(null);
      } else {
        alert('Hata: ' + result.error);
      }
    } catch (err: any) {
      alert('Hata: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Bu şikayet kaydını silmek istediğinize emin misiniz?')) return;
    try {
      const result = await reportService.deleteReport(reportId);
      if (result.success) {
        setReports((prev) => prev.filter((r) => r.id !== reportId));
        if (selectedReport?.id === reportId) {
          setSelectedReport(null);
        }
      }
    } catch (err: any) {
      alert('Silme hatası: ' + err.message);
    }
  };

  const pendingCount = reports.filter((r) => r.status === 'pending').length;
  const postReportCount = reports.filter((r) => r.target_type === 'post').length;
  const offerReportCount = reports.filter((r) => r.target_type === 'offer').length;

  const filteredReports = reports.filter((report) => {
    const matchesTarget = targetTypeFilter === 'all' || report.target_type === targetTypeFilter;
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'pending'
        ? report.status === 'pending' || report.status === 'reviewed'
        : report.status === statusFilter;

    const matchesSearch =
      !searchQuery.trim() ||
      report.target_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reporter_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report.details && report.details.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTarget && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 w-full">
      {/* REPORT DETAIL INSPECTION MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl animate-in fade-in zoom-in-95 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Şikayet Detayı & Aksiyon</h3>
                  <span className="text-xs text-slate-500 font-medium">Şikayet ID: {selectedReport.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Target Type & Status */}
            <div className="flex items-center justify-between gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2">
                {selectedReport.target_type === 'post' ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200 uppercase">
                    <FileText className="w-4 h-4" />
                    İlan Bildirimi
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200 uppercase">
                    <Tag className="w-4 h-4" />
                    Teklif Bildirimi
                  </span>
                )}
              </div>

              {selectedReport.status === 'pending' && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  <Clock className="w-3.5 h-3.5" />
                  İnceleme Bekliyor
                </span>
              )}
              {selectedReport.status === 'resolved' && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Çözümlendi (İşlem Yapıldı)
                </span>
              )}
              {selectedReport.status === 'dismissed' && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  Gözardı Edildi
                </span>
              )}
            </div>

            {/* Target Title & Details */}
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Şikayet Edilen İçerik Başlığı
                </span>
                <h4 className="text-base font-black text-slate-900 leading-snug">
                  {selectedReport.target_title}
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block font-medium">Şikayet Eden:</span>
                  <span className="font-bold text-slate-800">{selectedReport.reporter_email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Tarih:</span>
                  <span className="font-bold text-slate-800">
                    {new Date(selectedReport.created_at).toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Şikayet Sebebi & Açıklama
                </span>
                <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-100 text-xs text-rose-950 font-bold space-y-1">
                  <p className="text-rose-900 font-extrabold">{selectedReport.reason}</p>
                  {selectedReport.details && (
                    <p className="text-slate-700 font-normal leading-relaxed pt-1 border-t border-rose-100/60">
                      {selectedReport.details}
                    </p>
                  )}
                </div>
              </div>

              {/* Admin Note Textarea */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Yönetici Moderasyon Notu (Opsiyonel)
                </label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Yönetici notu ekleyebilirsiniz..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 outline-none focus:border-[#312E81]"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                {selectedReport.target_type === 'post' ? (
                  <Link
                    href="/admin/posts"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#312E81] hover:bg-[#252261] px-3.5 py-2 rounded-xl shadow-xs"
                  >
                    <span>İlan Paneline Git</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <Link
                    href="/admin/offers"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 px-3.5 py-2 rounded-xl shadow-xs"
                  >
                    <span>Teklif Paneline Git</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-2">
                {selectedReport.status !== 'resolved' && (
                  <Button
                    size="sm"
                    disabled={updating}
                    onClick={() => handleUpdateStatus('resolved')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Çözümlendi İşaretle
                  </Button>
                )}

                {selectedReport.status !== 'dismissed' && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updating}
                    onClick={() => handleUpdateStatus('dismissed')}
                    className="text-slate-600 text-xs font-bold"
                  >
                    Gözardı Et
                  </Button>
                )}

                <button
                  type="button"
                  onClick={() => handleDeleteReport(selectedReport.id)}
                  className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Şikayeti Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
            Şikayet Yönetimi & Moderasyon Paneli
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Supabase veritabanındaki tüm içerik şikayetlerini anlık inceleyin, durumunu güncelleyin ve moderasyon aksiyonları alın.
          </p>
        </div>

        {pendingCount > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-2 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 shrink-0 shadow-xs">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{pendingCount} Bekleyen Şikayet</span>
          </span>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Toplam Şikayet Kaydı
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {reports.length}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              İlan Şikayetleri
            </span>
            <span className="text-2xl font-black text-[#312E81] mt-1 block">
              {postReportCount}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#312E81] flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Teklif Şikayetleri
            </span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">
              {offerReportCount}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Tag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Status Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {[
            { id: 'pending', label: 'Bekleyen Şikayetler', count: pendingCount },
            { id: 'resolved', label: 'Çözümlenenler', count: reports.filter((r) => r.status === 'resolved').length },
            { id: 'dismissed', label: 'Gözardı Edilenler', count: reports.filter((r) => r.status === 'dismissed').length },
            { id: 'all', label: 'Tüm Kayıtlar', count: reports.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer border shrink-0 ${
                statusFilter === tab.id
                  ? 'bg-[#312E81] text-white border-[#312E81] shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Target Type Filter & Search */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setTargetTypeFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                targetTypeFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setTargetTypeFilter('post')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                targetTypeFilter === 'post' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500'
              }`}
            >
              İlanlar
            </button>
            <button
              onClick={() => setTargetTypeFilter('offer')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                targetTypeFilter === 'offer' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-500'
              }`}
            >
              Teklifler
            </button>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Şikayetlerde ara..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/15 outline-none shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#312E81]" />
            <span className="text-sm font-medium">Şikayet verileri yükleniyor...</span>
          </div>
        ) : filteredReports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 uppercase text-[10px] font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Tarih / Saat</th>
                  <th className="px-6 py-4">İçerik Türü</th>
                  <th className="px-6 py-4">Şikayet Edilen İçerik & Nedeni</th>
                  <th className="px-6 py-4">Bildiren Kullanıcı</th>
                  <th className="px-6 py-4">Durum</th>
                  <th className="px-6 py-4 text-right">Detay / İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-mono">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(report.created_at).toLocaleString('tr-TR')}
                      </span>
                    </td>

                    {/* Target Type */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {report.target_type === 'post' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-lg">
                          <FileText className="w-3 h-3" />
                          İlan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg">
                          <Tag className="w-3 h-3" />
                          Teklif
                        </span>
                      )}
                    </td>

                    {/* Title & Reason */}
                    <td className="px-6 py-4 max-w-sm">
                      <h4 className="font-bold text-slate-900 truncate block">
                        {report.target_title}
                      </h4>
                      <span className="inline-block text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 mt-1">
                        {report.reason}
                      </span>
                    </td>

                    {/* User */}
                    <td className="px-6 py-4 whitespace-nowrap text-slate-800 font-bold">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {report.reporter_email}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {report.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          <Clock className="w-3 h-3" />
                          <span>Bekliyor</span>
                        </span>
                      )}
                      {report.status === 'resolved' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Çözümlendi</span>
                        </span>
                      )}
                      {report.status === 'dismissed' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                          <span>Gözardı Edildi</span>
                        </span>
                      )}
                    </td>

                    {/* Inspect Button */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button
                        size="sm"
                        onClick={() => handleOpenDetailModal(report)}
                        className="bg-[#312E81] hover:bg-[#252261] text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Detay & İncele
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />
            <div className="space-y-1">
              <p className="text-sm font-extrabold text-slate-800">Şikayet Kaydı Bulunamadı</p>
              <p className="text-xs text-slate-400">Seçilen filtre kriterlerine uygun şikayet kaydı bulunmuyor.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
