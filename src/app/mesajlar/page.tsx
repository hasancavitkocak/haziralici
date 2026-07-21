'use client';

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { chatService, ChatRoom, ChatMessage } from '@/services/chatService';
import { formatDisplayName } from '@/lib/utils';
import Link from 'next/link';
import {
  MessageSquare,
  Send,
  Loader2,
  Lock,
  ArrowLeft,
  Tag,
  Clock,
  Search,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';

export default function MessagesPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  // Ref to track active room to prevent transition flashing
  const prevRoomIdRef = useRef<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const fetchRooms = async (silent = false) => {
    if (!user) return;
    if (!silent) setLoadingRooms(true);
    const data = await chatService.getRooms(user.id);
    setRooms(data);
    setLoadingRooms(false);
  };

  const fetchMessages = async (roomId: string, silent = false) => {
    const isDifferentRoom = prevRoomIdRef.current !== roomId;
    const showSpinner = !silent && (messages.length === 0 || isDifferentRoom);
    
    if (showSpinner) {
      setLoadingMessages(true);
      setMessages([]); // Clear old messages instantly to prevent content flash
    }
    
    prevRoomIdRef.current = roomId;
    const data = await chatService.getMessages(roomId);
    setMessages(data);
    if (showSpinner) setLoadingMessages(false);
    
    if (user) {
      await chatService.markAsRead(roomId, user.id);
      fetchRooms(true);
    }
  };

  const handleBackToList = () => {
    setSelectedRoom(null);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', window.location.pathname);
    }
  };

  const handleSelectRoom = (room: ChatRoom) => {
    setSelectedRoom(room);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('room_id', room.id);
      window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
    }
  };

  // Initial load
  useEffect(() => {
    if (user) {
      fetchRooms();
      const interval = setInterval(() => fetchRooms(true), 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Read URL query parameter for active room_id and auto-select
  useEffect(() => {
    if (typeof window !== 'undefined' && rooms.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const urlRoomId = params.get('room_id');
      if (urlRoomId) {
        const room = rooms.find((r) => r.id === urlRoomId);
        if (room && selectedRoom?.id !== room.id) {
          setSelectedRoom(room);
        }
      }
    }
  }, [rooms, selectedRoom]);

  // Internal scrolling helper (does not scroll the outer window scrollbar!)
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Realtime messages subscription
  useEffect(() => {
    if (!selectedRoom || !user) return;

    fetchMessages(selectedRoom.id);

    // Subscribe to INSERT events for chat_messages table (when table exists)
    const channel = supabase
      .channel(`room_messages_${selectedRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${selectedRoom.id}`,
        },
        () => {
          fetchMessages(selectedRoom.id, true);
        }
      )
      .subscribe();

    // Fallback poll for localStorage compatibility
    const localPoll = setInterval(() => {
      fetchMessages(selectedRoom.id, true);
    }, 2000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(localPoll);
    };
  }, [selectedRoom, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !user || !newMessage.trim()) return;

    setSending(true);
    const { success, error } = await chatService.sendMessage(
      selectedRoom.id,
      user.id,
      newMessage.trim()
    );

    if (success) {
      setNewMessage('');
      fetchMessages(selectedRoom.id, true);
    } else {
      alert('Mesaj gönderilemedi: ' + error);
    }
    setSending(false);
  };

  // Helpers
  const getRecipientName = (room: ChatRoom) => {
    if (!user) return '';
    const isBuyer = room.buyer_id === user.id;
    const profile = isBuyer ? room.seller_profile : room.buyer_profile;
    return formatDisplayName(profile?.full_name, profile?.email);
  };

  const getRecipientInitial = (room: ChatRoom) => {
    const name = getRecipientName(room);
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const filteredRooms = rooms.filter((room) => {
    const recName = getRecipientName(room).toLowerCase();
    const postTitle = (room.buyer_posts?.title || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return recName.includes(q) || postTitle.includes(q);
  });

  if (!user) {
    return (
      <div className="max-w-[1536px] w-full mx-auto px-4 py-12 text-center text-slate-500 font-semibold">
        Lütfen mesajlarınızı görmek için giriş yapın.
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* Page Title & Description */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-[#312E81] tracking-tight">Mesajlarım</h1>
        <p className="text-xs text-slate-500">Alıcı ve satıcılarla olan sohbetlerinizi buradan takip edebilirsiniz.</p>
      </div>

      {/* Embedded Light-Indigo Corporate Theme Container (Stretches fully to screen edges) */}
      <div className="bg-white flex border-y border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 h-[580px] md:h-[660px] overflow-hidden">
        
        {/* LEFT SIDEBAR: Soft warm gray sidebar background */}
        <div className={`w-full md:w-80 lg:w-[350px] bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 ${
          selectedRoom ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Header */}
          <div className="p-4 border-b border-slate-250/60 bg-white/50 space-y-3">
            <div className="flex items-center justify-between">
              <h1 className="text-base font-black text-[#312E81] flex items-center gap-1.5 font-sans">
                <MessageSquare className="w-5 h-5 text-[#312E81]" />
                Sohbetler
              </h1>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Kişi veya ilan ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/15 transition-all"
              />
            </div>
          </div>

          {/* Rooms List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-200/50">
            {loadingRooms ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-5 h-5 animate-spin text-[#312E81]" />
              </div>
            ) : filteredRooms.length > 0 ? (
              filteredRooms.map((room) => {
                const isActive = selectedRoom?.id === room.id;
                const recName = getRecipientName(room);
                const init = getRecipientInitial(room);
                const isUnread = room.unread_count && room.unread_count > 0;

                return (
                  <button
                    key={room.id}
                    onClick={() => handleSelectRoom(room)}
                    className={`w-full text-left p-4 flex gap-3 transition-colors border-l-4 ${
                      isActive
                        ? 'bg-white border-[#312E81] text-[#312E81] shadow-sm'
                        : 'border-transparent hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {/* Initial Circle */}
                    <div className="w-10 h-10 rounded-full bg-[#312E81] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                      {init}
                    </div>

                    {/* Room Meta */}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 truncate">
                          {recName}
                        </span>
                        {isUnread && (
                          <span className="w-4.5 h-4.5 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-pulse shrink-0">
                            {room.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-bold text-[#312E81] truncate">
                        {room.buyer_posts?.title || 'İlan Detayı'}
                      </p>
                      <div className="flex items-center gap-1 text-[9px] text-slate-400">
                        <Clock className="w-2.5 h-2.5 text-slate-300" />
                        <span>Sohbet aktif</span>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="py-24 text-center text-slate-400 px-6 space-y-3">
                <MessageSquare className="w-9 h-9 mx-auto text-slate-350" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-700">Aktif Sohbet Yok</p>
                  <p className="text-[10px] text-slate-400">İlan detayından bir sohbet başlattığınızda burada listelenecektir.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT CHAT WINDOW AREA (Light Content Pane) */}
        <div className={`flex-1 flex flex-col min-w-0 bg-[#f8fafc] ${!selectedRoom ? 'hidden md:flex' : 'flex'}`}>
          {selectedRoom ? (
            <>
              {/* Header Info */}
              <div className="px-5 py-4 bg-white border-b border-slate-200 flex items-center gap-3 justify-between z-10 shrink-0 shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Back button (Mobile only) */}
                  <button
                    onClick={handleBackToList}
                    className="md:hidden p-1.5 rounded-xl hover:bg-slate-100 text-slate-500"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="w-9 h-9 rounded-full bg-[#312E81] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {getRecipientInitial(selectedRoom)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-black text-slate-900 truncate">
                      {getRecipientName(selectedRoom)}
                    </h3>
                    <Link
                      href={`/ilan/${selectedRoom.post_id}`}
                      className="text-[11px] font-bold text-[#312E81] hover:underline flex items-center gap-0.5 truncate"
                    >
                      <Tag className="w-3 h-3 text-[#312E81]" />
                      <span className="truncate">{selectedRoom.buyer_posts?.title || 'İlana Git'}</span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg shrink-0">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>Güvenli Sohbet</span>
                </div>
              </div>

              {/* Message History list */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 scroll-py-4"
              >
                {loadingMessages ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-[#312E81]" />
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((msg, index) => {
                    const isMe = msg.sender_id === user.id;
                    return (
                      <div
                        key={msg.id || index}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        {/* Bubble */}
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-xs font-semibold leading-relaxed shadow-sm ${
                            isMe
                              ? 'bg-[#312E81] text-white rounded-tr-none'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                        </div>
                        {/* Timestamp */}
                        <span className="text-[9px] text-slate-400 mt-1 px-1 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-slate-300" />
                          {new Date(msg.created_at).toLocaleTimeString('tr-TR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                    <MessageCircle className="w-10 h-10 text-slate-300 animate-pulse" />
                    <div className="text-center space-y-1">
                      <p className="text-xs font-bold text-slate-700">Sohbet Başladı</p>
                      <p className="text-[10px] text-slate-400 max-w-xs">Karşı tarafla anlaşma detaylarını konuşabilirsiniz.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Entry Box */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 bg-white border-t border-slate-200 flex gap-3 items-center shrink-0"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Bir mesaj yazın..."
                  disabled={sending}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#312E81] text-xs font-semibold text-slate-700 placeholder-slate-400 focus:ring-1 focus:ring-[#312E81]/25 transition-all"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="p-3 rounded-xl bg-[#312E81] hover:bg-[#252261] text-white transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center shadow-sm shrink-0"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-3">
              <MessageSquare className="w-12 h-12 text-[#312E81]/20 animate-pulse" />
              <div className="space-y-1">
                <p className="text-sm font-extrabold text-slate-800">Sohbet Seçilmedi</p>
                <p className="text-xs text-slate-500 max-w-sm">Mesajlaşmak için sol menüden bir sohbet odası seçin.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
