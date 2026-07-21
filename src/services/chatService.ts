import { supabase } from '@/lib/supabase/client';

export interface ChatRoom {
  id: string;
  post_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  buyer_posts?: {
    title: string;
  };
  buyer_profile?: {
    id: string;
    full_name: string | null;
    email: string;
  };
  seller_profile?: {
    id: string;
    full_name: string | null;
    email: string;
  };
  unread_count?: number;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  profiles?: {
    id: string;
    full_name: string | null;
    email: string;
  };
}

class ChatService {
  private ROOMS_KEY = 'local_chat_rooms';
  private MESSAGES_KEY = 'local_chat_messages';
  private useLocalStorageFallback = false;

  private isTableError(err: any): boolean {
    if (!err) return false;
    const msg = typeof err === 'string' ? err : err.message || '';
    return (
      msg.includes('chat_rooms') ||
      msg.includes('chat_messages') ||
      msg.includes('42P01') ||
      msg.includes('schema cache')
    );
  }

  // Helper to fetch details for local rooms
  private async enrichLocalRoom(room: ChatRoom): Promise<ChatRoom> {
    try {
      const [postRes, buyerRes, sellerRes] = await Promise.all([
        supabase.from('buyer_posts').select('title').eq('id', room.post_id).maybeSingle(),
        supabase.from('profiles').select('id, full_name, email').eq('id', room.buyer_id).maybeSingle(),
        supabase.from('profiles').select('id, full_name, email').eq('id', room.seller_id).maybeSingle(),
      ]);

      return {
        ...room,
        buyer_posts: postRes.data ? { title: postRes.data.title } : undefined,
        buyer_profile: buyerRes.data ? (buyerRes.data as any) : undefined,
        seller_profile: sellerRes.data ? (sellerRes.data as any) : undefined,
      };
    } catch {
      return room;
    }
  }

  public async createOrGetRoom(postId: string, buyerId: string, sellerId: string): Promise<{ data: ChatRoom | null; error: string | null }> {
    if (this.useLocalStorageFallback) {
      return this.localCreateOrGetRoom(postId, buyerId, sellerId);
    }

    try {
      const { data: existing, error: findError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('post_id', postId)
        .eq('buyer_id', buyerId)
        .eq('seller_id', sellerId)
        .maybeSingle();

      if (findError) {
        if (this.isTableError(findError)) {
          this.useLocalStorageFallback = true;
          return this.localCreateOrGetRoom(postId, buyerId, sellerId);
        }
        return { data: null, error: findError.message };
      }

      if (existing) {
        return { data: existing as ChatRoom, error: null };
      }

      const { data: newRoom, error: insertError } = await supabase
        .from('chat_rooms')
        .insert({
          post_id: postId,
          buyer_id: buyerId,
          seller_id: sellerId,
        })
        .select()
        .single();

      if (insertError) {
        return { data: null, error: insertError.message };
      }

      return { data: newRoom as ChatRoom, error: null };
    } catch (err: any) {
      if (this.isTableError(err)) {
        this.useLocalStorageFallback = true;
        return this.localCreateOrGetRoom(postId, buyerId, sellerId);
      }
      return { data: null, error: err.message || 'Sohbet odası oluşturulamadı.' };
    }
  }

  public async getRooms(userId: string): Promise<ChatRoom[]> {
    if (this.useLocalStorageFallback) {
      return this.localGetRooms(userId);
    }

    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          buyer_posts:post_id (title),
          buyer_profile:buyer_id (id, full_name, email),
          seller_profile:seller_id (id, full_name, email)
        `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        if (this.isTableError(error)) {
          this.useLocalStorageFallback = true;
          return this.localGetRooms(userId);
        }
        console.error('Error getting chat rooms:', error);
        return [];
      }

      const rooms = data as any[];
      const roomsWithUnread = await Promise.all(
        rooms.map(async (room) => {
          const { count, error: countErr } = await supabase
            .from('chat_messages')
            .select('id', { count: 'exact', head: true })
            .eq('room_id', room.id)
            .eq('is_read', false)
            .not('sender_id', 'eq', userId);

          return {
            ...room,
            unread_count: countErr ? 0 : (count || 0),
          };
        })
      );

      return roomsWithUnread as ChatRoom[];
    } catch (err) {
      if (this.isTableError(err)) {
        this.useLocalStorageFallback = true;
        return this.localGetRooms(userId);
      }
      console.error('getRooms error:', err);
      return [];
    }
  }

  public async getMessages(roomId: string): Promise<ChatMessage[]> {
    if (this.useLocalStorageFallback) {
      return this.localGetMessages(roomId);
    }

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profiles:sender_id (id, full_name, email)
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) {
        if (this.isTableError(error)) {
          this.useLocalStorageFallback = true;
          return this.localGetMessages(roomId);
        }
        console.error('Error getting messages:', error);
        return [];
      }

      return data as ChatMessage[];
    } catch (err) {
      if (this.isTableError(err)) {
        this.useLocalStorageFallback = true;
        return this.localGetMessages(roomId);
      }
      console.error('getMessages error:', err);
      return [];
    }
  }

  public async sendMessage(roomId: string, senderId: string, message: string): Promise<{ success: boolean; error?: string }> {
    if (this.useLocalStorageFallback) {
      return this.localSendMessage(roomId, senderId, message);
    }

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          sender_id: senderId,
          message,
          is_read: false,
        });

      if (error) {
        if (this.isTableError(error)) {
          this.useLocalStorageFallback = true;
          return this.localSendMessage(roomId, senderId, message);
        }
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      if (this.isTableError(err)) {
        this.useLocalStorageFallback = true;
        return this.localSendMessage(roomId, senderId, message);
      }
      return { success: false, error: err.message };
    }
  }

  public async markAsRead(roomId: string, userId: string): Promise<void> {
    if (this.useLocalStorageFallback) {
      this.localMarkAsRead(roomId, userId);
      return;
    }

    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('room_id', roomId)
        .not('sender_id', 'eq', userId)
        .eq('is_read', false);

      if (error && this.isTableError(error)) {
        this.useLocalStorageFallback = true;
        this.localMarkAsRead(roomId, userId);
      }
    } catch (err) {
      if (this.isTableError(err)) {
        this.useLocalStorageFallback = true;
        this.localMarkAsRead(roomId, userId);
      }
    }
  }

  public async getUnreadCountTotal(userId: string): Promise<number> {
    if (this.useLocalStorageFallback) {
      return this.localGetUnreadCountTotal(userId);
    }

    try {
      const { data: rooms, error: roomsErr } = await supabase
        .from('chat_rooms')
        .select('id')
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

      if (roomsErr) {
        if (this.isTableError(roomsErr)) {
          this.useLocalStorageFallback = true;
          return this.localGetUnreadCountTotal(userId);
        }
        return 0;
      }

      if (!rooms || rooms.length === 0) return 0;
      const roomIds = rooms.map(r => r.id);

      const { count, error } = await supabase
        .from('chat_messages')
        .select('id', { count: 'exact', head: true })
        .in('room_id', roomIds)
        .eq('is_read', false)
        .not('sender_id', 'eq', userId);

      if (error) return 0;
      return count || 0;
    } catch (err) {
      if (this.isTableError(err)) {
        this.useLocalStorageFallback = true;
        return this.localGetUnreadCountTotal(userId);
      }
      return 0;
    }
  }

  /* ---------------- Local Storage Fallbacks ---------------- */

  private localGetRawRooms(): ChatRoom[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(this.ROOMS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private localGetRawMessages(): ChatMessage[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(this.MESSAGES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private async localCreateOrGetRoom(postId: string, buyerId: string, sellerId: string): Promise<{ data: ChatRoom | null; error: string | null }> {
    const rooms = this.localGetRawRooms();
    const existing = rooms.find(
      (r) => r.post_id === postId && r.buyer_id === buyerId && r.seller_id === sellerId
    );

    if (existing) {
      const enriched = await this.enrichLocalRoom(existing);
      return { data: enriched, error: null };
    }

    const newRoom: ChatRoom = {
      id: `local_room_${Math.random().toString(36).substring(2, 9)}`,
      post_id: postId,
      buyer_id: buyerId,
      seller_id: sellerId,
      created_at: new Date().toISOString(),
    };

    localStorage.setItem(this.ROOMS_KEY, JSON.stringify([newRoom, ...rooms]));
    const enriched = await this.enrichLocalRoom(newRoom);
    return { data: enriched, error: null };
  }

  private async localGetRooms(userId: string): Promise<ChatRoom[]> {
    const rooms = this.localGetRawRooms();
    const myRooms = rooms.filter((r) => r.buyer_id === userId || r.seller_id === userId);

    const enriched = await Promise.all(
      myRooms.map(async (room) => {
        const full = await this.enrichLocalRoom(room);
        const msgs = this.localGetRawMessages().filter(
          (m) => m.room_id === room.id && !m.is_read && m.sender_id !== userId
        );
        return {
          ...full,
          unread_count: msgs.length,
        };
      })
    );

    return enriched;
  }

  private async localGetMessages(roomId: string): Promise<ChatMessage[]> {
    const messages = this.localGetRawMessages().filter((m) => m.room_id === roomId);
    // Enrich with profiles using Supabase select
    const enriched = await Promise.all(
      messages.map(async (msg) => {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('id', msg.sender_id)
            .maybeSingle();

          return {
            ...msg,
            profiles: data ? (data as any) : undefined,
          };
        } catch {
          return msg;
        }
      })
    );
    return enriched;
  }

  private async localSendMessage(roomId: string, senderId: string, message: string): Promise<{ success: boolean; error?: string }> {
    const messages = this.localGetRawMessages();
    const newMsg: ChatMessage = {
      id: `local_msg_${Math.random().toString(36).substring(2, 9)}`,
      room_id: roomId,
      sender_id: senderId,
      message,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    localStorage.setItem(this.MESSAGES_KEY, JSON.stringify([...messages, newMsg]));
    return { success: true };
  }

  private localMarkAsRead(roomId: string, userId: string): void {
    const messages = this.localGetRawMessages();
    const updated = messages.map((m) => {
      if (m.room_id === roomId && m.sender_id !== userId) {
        return { ...m, is_read: true };
      }
      return m;
    });
    localStorage.setItem(this.MESSAGES_KEY, JSON.stringify(updated));
  }

  private localGetUnreadCountTotal(userId: string): number {
    const rooms = this.localGetRawRooms().filter((r) => r.buyer_id === userId || r.seller_id === userId);
    const roomIds = rooms.map((r) => r.id);
    const messages = this.localGetRawMessages();
    return messages.filter(
      (m) => roomIds.includes(m.room_id) && !m.is_read && m.sender_id !== userId
    ).length;
  }
}

export const chatService = new ChatService();
