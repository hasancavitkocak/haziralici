import { supabase } from '@/lib/supabase/client';
import { UserNotification } from '@/types';

class NotificationService {
  private getLocalKey(userId: string) {
    return `user_notifications_${userId}`;
  }

  public async getNotifications(userId: string): Promise<UserNotification[]> {
    try {
      // 1. Try Supabase
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as UserNotification[];
      }
    } catch (e) {
      // Fallthrough to localStorage
    }

    // 2. Fallback to localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.getLocalKey(userId));
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return [];
        }
      }
    }
    return [];
  }

  public async addNotification(
    userId: string,
    title: string,
    message: string,
    type: UserNotification['type'] = 'info',
    postId?: string
  ): Promise<UserNotification> {
    const newNotif: UserNotification = {
      id: 'notif_' + Math.random().toString(36).substring(2, 9),
      user_id: userId,
      title,
      message,
      type,
      is_read: false,
      post_id: postId,
      created_at: new Date().toISOString(),
    };

    try {
      await supabase.from('user_notifications').insert(newNotif);
    } catch (e) {
      // Fallthrough
    }

    // Sync to LocalStorage
    if (typeof window !== 'undefined') {
      const existing = await this.getNotifications(userId);
      const updated = [newNotif, ...existing];
      localStorage.setItem(this.getLocalKey(userId), JSON.stringify(updated));
    }

    return newNotif;
  }

  public async markAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
    } catch (e) {
      // Fallthrough
    }

    if (typeof window !== 'undefined') {
      const existing = await this.getNotifications(userId);
      const updated = existing.map((n) =>
        n.id === notificationId ? { ...n, is_read: true } : n
      );
      localStorage.setItem(this.getLocalKey(userId), JSON.stringify(updated));
    }
  }

  public async markAllAsRead(userId: string): Promise<void> {
    try {
      await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('user_id', userId);
    } catch (e) {
      // Fallthrough
    }

    if (typeof window !== 'undefined') {
      const existing = await this.getNotifications(userId);
      const updated = existing.map((n) => ({ ...n, is_read: true }));
      localStorage.setItem(this.getLocalKey(userId), JSON.stringify(updated));
    }
  }
}

export const notificationService = new NotificationService();
