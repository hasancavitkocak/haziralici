'use client';

import React, { useEffect, useState } from 'react';
import { auditLogService, AuditLog } from '@/services/auditLogService';
import Link from 'next/link';
import {
  Activity,
  Trash2,
  AlertCircle,
  Clock,
  ShieldAlert,
  User,
  Filter,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filterMode, setFilterMode] = useState<'all' | 'reports' | 'admin'>('all');

  const fetchLogs = () => {
    setLogs(auditLogService.getLogs());
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleClearLogs = () => {
    if (!confirm('Tüm işlem geçmişini ve şikayet kayıtlarını kalıcı olarak temizlemek istediğinize emin misiniz?')) {
      return;
    }
    auditLogService.clearLogs();
    fetchLogs();
  };

  const reportCount = logs.filter((l) => l.action.includes('Şikayet')).length;

  const filteredLogs = logs.filter((log) => {
    if (filterMode === 'reports') return log.action.includes('Şikayet');
    if (filterMode === 'admin') return !log.action.includes('Şikayet');
    return true;
  });

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#312E81]" />
            Yönetici İşlem Günlüğü & Şikayetler
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Yöneticiler tarafından yapılan işlemler ve kullanıcılar tarafından bildirilen içerik şikayetlerinin günlüğü.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {reportCount > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>{reportCount} Şikayet Bildirimi</span>
            </span>
          )}

          {logs.length > 0 && (
            <button
              onClick={handleClearLogs}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 transition-colors cursor-pointer border border-red-100"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Günlüğü Temizle
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/70 w-fit">
        <button
          onClick={() => setFilterMode('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterMode === 'all'
              ? 'bg-white text-[#312E81] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Tüm Kayıtlar ({logs.length})
        </button>
        <button
          onClick={() => setFilterMode('reports')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterMode === 'reports'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-rose-700 hover:bg-rose-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Şikayetler ({reportCount})</span>
        </button>
        <button
          onClick={() => setFilterMode('admin')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterMode === 'admin'
              ? 'bg-white text-[#312E81] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Yönetici İşlemleri ({logs.length - reportCount})
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {filteredLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 uppercase text-[10px] font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Tarih / Saat</th>
                  <th className="px-6 py-4">İşlem / Bildirim Türü</th>
                  <th className="px-6 py-4">Açıklama / Detay</th>
                  <th className="px-6 py-4">Bildiren / Yönetici</th>
                  <th className="px-6 py-4 text-right">Yönetim Aksiyonu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredLogs.map((log) => {
                  const isReport = log.action.includes('Şikayet');
                  const isPostReport = log.details.includes('İlan ID:');
                  const isOfferReport = log.details.includes('Teklif ID:');

                  let badgeColor = 'bg-slate-50 text-slate-800 border-slate-200';

                  if (isReport) {
                    badgeColor = 'bg-rose-100 text-rose-800 border-rose-300 font-extrabold shadow-2xs';
                  } else if (log.action.includes('Onay')) {
                    badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-100';
                  } else if (log.action.includes('Red') || log.action.includes('Sil')) {
                    badgeColor = 'bg-rose-50 text-rose-800 border-rose-100';
                  } else if (log.action.includes('Yetki') || log.action.includes('Rol')) {
                    badgeColor = 'bg-amber-50 text-amber-800 border-amber-100';
                  }

                  return (
                    <tr key={log.id} className={`transition-colors ${isReport ? 'bg-rose-50/20 hover:bg-rose-50/40' : 'hover:bg-slate-50/60'}`}>
                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-mono">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(log.timestamp).toLocaleString('tr-TR')}
                        </span>
                      </td>

                      {/* Action Type */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 border px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${badgeColor}`}>
                          {isReport && <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />}
                          <span>{log.action}</span>
                        </span>
                      </td>

                      {/* Details */}
                      <td className="px-6 py-4 text-slate-800 leading-relaxed font-semibold">
                        {log.details}
                      </td>

                      {/* User */}
                      <td className="px-6 py-4 whitespace-nowrap text-slate-900 font-bold">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {log.adminEmail}
                        </span>
                      </td>

                      {/* Quick Admin Action Button */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {isPostReport ? (
                          <Link
                            href="/admin/posts"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#312E81] bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            <span>İlanı İncele</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        ) : isOfferReport ? (
                          <Link
                            href="/admin/offers"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            <span>Teklifi İncele</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        ) : (
                          <span className="text-slate-300 font-mono text-[10px]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <ShieldAlert className="w-10 h-10 mx-auto text-slate-300" />
            <div className="space-y-1">
              <p className="text-sm font-extrabold text-slate-800">Kayıt Bulunamadı</p>
              <p className="text-xs text-slate-400">Seçili filtre kriterine uyan herhangi bir işlem veya şikayet kaydı bulunmuyor.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

