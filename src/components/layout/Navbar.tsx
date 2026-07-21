'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { notificationService } from '@/services/notificationService';
import { chatService } from '@/services/chatService';
import { UserNotification } from '@/types';
import { Button } from '@/components/ui/Button';
import {
  PlusCircle,
  LogIn,
  UserPlus,
  LogOut,
  Shield,
  Bell,
  CheckCircle2,
  XCircle,
  Info,
  Check,
  User,
  ChevronDown,
  Tag,
  MessageSquare,
} from 'lucide-react';
import { formatDisplayName, formatDate } from '@/lib/utils';

export const Navbar = () => {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const displayName = formatDisplayName(profile?.full_name, user?.email);
  const initial = displayName.charAt(0).toUpperCase();

  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = async () => {
    if (user?.id) {
      const data = await notificationService.getNotifications(user.id);
      setNotifications(data);

      const msgCount = await chatService.getUnreadCountTotal(user.id);
      setUnreadMessages(msgCount);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllAsRead = async () => {
    if (user?.id) {
      await notificationService.markAllAsRead(user.id);
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    }
  };

  const handleNotificationClick = async (notif: UserNotification) => {
    if (user?.id && !notif.is_read) {
      await notificationService.markAsRead(user.id, notif.id);
      setNotifications(notifications.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n)));
    }
    setIsNotifOpen(false);
    if (notif.post_id) {
      router.push(`/ilan/${notif.post_id}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-24 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center group py-1">
          <img
            src="/logo.png"
            alt="haziralici.com"
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Action Buttons & Auth */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/ilan-ver">
            {/* Mobile: icon-only pill */}
            <Button variant="emerald" size="sm" className="sm:hidden flex items-center justify-center w-9 h-9 p-0 rounded-full">
              <PlusCircle className="w-5 h-5" />
            </Button>
            {/* sm+: icon + text */}
            <Button variant="emerald" size="sm" className="hidden sm:inline-flex items-center gap-1.5 text-sm whitespace-nowrap px-4 py-2">
              <PlusCircle className="w-4 h-4" />
              <span>İlan Ver</span>
            </Button>
          </Link>



          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Messages Link */}
              <Link
                href="/mesajlar"
                className="relative p-2 rounded-2xl bg-slate-100/80 hover:bg-indigo-50 hover:text-[#312E81] text-slate-600 transition-colors cursor-pointer"
                title="Mesajlar"
              >
                <MessageSquare className="w-5 h-5" />
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center border-2 border-white shadow-sm">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </Link>

              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
                  className="relative p-2 rounded-2xl bg-slate-100/80 hover:bg-indigo-50 hover:text-[#312E81] text-slate-600 transition-colors cursor-pointer"
                  title="Bildirimler"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center border-2 border-white shadow-sm">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {isNotifOpen && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl bg-white border border-slate-200 shadow-2xl z-50 py-3 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[#312E81]" />
                        <h4 className="text-xs font-black text-slate-900">Bildirimler</h4>
                        {unreadCount > 0 && (
                          <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">
                            {unreadCount} Yeni
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-[11px] text-[#312E81] hover:underline font-semibold flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Tümünü Okundu Say</span>
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                              !notif.is_read ? 'bg-indigo-50/40 font-semibold' : ''
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {notif.type === 'post_approved' && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              )}
                              {notif.type === 'post_rejected' && (
                                <XCircle className="w-4 h-4 text-rose-600" />
                              )}
                              {(notif.type === 'new_offer' || notif.type === 'offer_received') && (
                                <Tag className="w-4 h-4 text-emerald-600" />
                              )}
                              {notif.type !== 'post_approved' && notif.type !== 'post_rejected' && notif.type !== 'new_offer' && notif.type !== 'offer_received' && (
                                <Info className="w-4 h-4 text-[#312E81]" />
                              )}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <h5 className="text-xs font-bold text-slate-900">{notif.title}</h5>
                                <span className="text-[10px] text-slate-400">
                                  {formatDate(notif.created_at)}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 leading-snug font-normal">
                                {notif.message}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center text-slate-400 text-xs font-medium">
                          Henüz bir bildiriminiz bulunmuyor.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Button */}
              {isAdmin && (
                <Link href="/admin" className="hidden sm:inline-block">
                  <Button variant="secondary" size="sm" className="bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100">
                    <Shield className="w-4 h-4 mr-1 text-amber-600" />
                    <span className="font-bold">Admin</span>
                  </Button>
                </Link>
              )}

              {/* User Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-slate-100 border border-slate-200 hover:bg-slate-200/80 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-[#312E81] text-white flex items-center justify-center text-xs font-bold">
                    {initial}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 max-w-[120px] truncate hidden sm:inline">
                    {displayName}
                  </span>
                  {isAdmin && (
                    <span className="hidden sm:inline-block text-[10px] bg-amber-500 text-white font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                      Admin
                    </span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#312E81] text-white flex items-center justify-center text-sm font-bold shrink-0">
                          {initial}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                          <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <Link
                      href="/profil"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#312E81] transition-colors"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Profilim & İlanlarım</span>
                    </Link>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => { setIsProfileOpen(false); signOut(); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors rounded-b-2xl"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Çıkış Yap</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link href="/login">
              <button
                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 border border-slate-200 hover:bg-slate-200/80 text-slate-600 hover:text-[#312E81] transition-colors"
                title="Giriş Yap / Kayıt Ol"
              >
                <User className="w-4 h-4" />
              </button>
            </Link>



          )}
        </div>
      </div>
    </header>
  );
};
