'use client';

import React, { useEffect, useState } from 'react';
import { profileService } from '@/services/profileService';
import { Profile, UserRole } from '@/types';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  Users,
  Search,
  Shield,
  Trash2,
  Loader2,
  AlertCircle,
  UserCheck,
} from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await profileService.getAllUsersForAdmin();
      setUsers(data);
    } catch (err) {
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = async (userId: string, currentRole: UserRole = 'user') => {
    const newRole: UserRole = currentRole === 'admin' ? 'user' : 'admin';
    setUpdatingId(userId);
    try {
      const { success, error } = await profileService.updateUserRole(userId, newRole);

      if (success) {
        setUsers(
          users.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        alert('Rol güncellenirken hata oluştu: ' + error);
      }
    } catch (err: any) {
      alert('Hata: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bu kullanıcı profilini silmek istediğinize emin misiniz?')) {
      return;
    }

    setUpdatingId(userId);
    try {
      const { success, error } = await profileService.deleteUser(userId);
      if (success) {
        setUsers(users.filter((u) => u.id !== userId));
      } else {
        alert('Kullanıcı silinemedi: ' + error);
      }
    } catch (err: any) {
      alert('Hata: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (user.full_name && user.full_name.toLowerCase().includes(q)) ||
      (user.email && user.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#312E81]" />
            Kullanıcı Yönetimi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Platformdaki tüm kullanıcıları inceleyin, admin yetkisi verin veya düzenleyin.
          </p>
        </div>
        <span className="text-xs font-bold bg-indigo-50 text-[#312E81] px-3.5 py-1.5 rounded-full border border-indigo-100">
          {filteredUsers.length} Kullanıcı
        </span>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="İsim veya e-posta adresi ile ara..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/15 text-sm outline-none shadow-sm"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#312E81]" />
            <span className="text-sm font-medium">Kullanıcılar yükleniyor...</span>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 uppercase text-[10px] font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Kullanıcı</th>
                  <th className="px-6 py-4">E-posta</th>
                  <th className="px-6 py-4">Telefon</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4">Kayıt Tarihi</th>
                  <th className="px-6 py-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredUsers.map((u) => {
                  const isAdmin = u.role === 'admin';
                  const isUpdating = updatingId === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#312E81] text-white flex items-center justify-center font-bold text-xs">
                          {(u.full_name || u.email || 'K').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900">
                          {u.full_name || 'İsimsiz Kullanıcı'}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-mono text-slate-700">{u.email}</td>

                      <td className="px-6 py-4 font-mono text-slate-700 font-bold">
                        {u.phone ? (
                          <a href={`tel:${u.phone}`} className="text-emerald-700 hover:underline">
                            {u.phone}
                          </a>
                        ) : (
                          <span className="text-slate-400 font-normal italic">-</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full text-[10px] font-extrabold">
                            <Shield className="w-3 h-3 text-amber-600" />
                            ADMIN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-[10px] font-bold">
                            <UserCheck className="w-3 h-3 text-slate-400" />
                            KULLANICI
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        {formatDate(u.created_at)}
                      </td>

                      <td className="px-6 py-4 text-right space-x-2">
                        <Button
                          size="sm"
                          variant={isAdmin ? 'outline' : 'secondary'}
                          disabled={isUpdating}
                          onClick={() => handleToggleRole(u.id, u.role)}
                          className="text-[11px] py-1 px-2.5"
                        >
                          {isAdmin ? 'Kullanıcı Yap' : 'Admin Yap'}
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={isUpdating}
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-red-600 hover:bg-red-50 py-1 px-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm font-semibold">Kullanıcı bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
}
