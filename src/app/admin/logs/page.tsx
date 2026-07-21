'use client';

import React, { useEffect, useState } from 'react';
import { auditLogService, AuditLog } from '@/services/auditLogService';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  Activity,
  Trash2,
  AlertCircle,
  Clock,
  ShieldAlert,
  User,
} from 'lucide-react';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  const fetchLogs = () => {
    setLogs(auditLogService.getLogs());
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleClearLogs = () => {
    if (!confirm('Tüm işlem geçmişini kalıcı olarak temizlemek istediğinize emin misiniz?')) {
      return;
    }
    auditLogService.clearLogs();
    fetchLogs();
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#312E81]" />
            Yönetici İşlem Günlüğü
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Yöneticiler tarafından yapılan ilan onaylama, silme ve yetki değiştirme gibi tüm işlemlerin günlüğü.
          </p>
        </div>

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

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 uppercase text-[10px] font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Tarih / Saat</th>
                  <th className="px-6 py-4">İşlem Türü</th>
                  <th className="px-6 py-4">Açıklama / Detay</th>
                  <th className="px-6 py-4">Yönetici</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {logs.map((log) => {
                  let badgeColor = 'bg-slate-50 text-slate-800 border-slate-200';
                  if (log.action.includes('Onay')) badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-100';
                  if (log.action.includes('Red') || log.action.includes('Sil')) badgeColor = 'bg-rose-50 text-rose-800 border-rose-100';
                  if (log.action.includes('Yetki') || log.action.includes('Rol')) badgeColor = 'bg-amber-50 text-amber-800 border-amber-100';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-mono">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(log.timestamp).toLocaleString('tr-TR')}
                        </span>
                      </td>

                      {/* Action Type */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center border px-2.5 py-0.5 rounded text-[10px] font-bold ${badgeColor}`}>
                          {log.action}
                        </span>
                      </td>

                      {/* Details */}
                      <td className="px-6 py-4 text-slate-700">
                        {log.details}
                      </td>

                      {/* Admin User */}
                      <td className="px-6 py-4 whitespace-nowrap text-slate-900 font-bold">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {log.adminEmail}
                        </span>
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
              <p className="text-sm font-extrabold text-slate-800">Henüz Kayıt Yok</p>
              <p className="text-xs text-slate-400">Yöneticiler tarafından yapılan işlemler burada kronolojik olarak listelenecektir.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
