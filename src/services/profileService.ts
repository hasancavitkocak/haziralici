import { supabase } from '@/lib/supabase/client';
import { Profile, BuyerPost, SellerOffer, UserRole, PostStatus } from '@/types';

export interface UpdateProfilePayload {
  full_name?: string;
  phone?: string;
  city?: string;
  district?: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class ProfileService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private CACHE_TTL_MS = 60 * 1000; // 1 minute cache

  private isCacheValid = (key: string): boolean => {
    const entry = this.cache.get(key);
    if (!entry) return false;
    return Date.now() - entry.timestamp < this.CACHE_TTL_MS;
  };

  public invalidateCache = (): void => {
    this.cache.clear();
  };

  public async getProfile(userId: string): Promise<Profile | null> {
    const cacheKey = `profile_${userId}`;
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile in profileService:', error);
        return null;
      }

      const profile = data as Profile;
      this.cache.set(cacheKey, { data: profile, timestamp: Date.now() });
      return profile;
    } catch (err) {
      console.error('ProfileService getProfile error:', err);
      return null;
    }
  }

  public async getUserPosts(userId: string): Promise<BuyerPost[]> {
    const cacheKey = `user_posts_${userId}`;
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const { data, error } = await supabase
        .from('buyer_posts')
        .select(`
          *,
          seller_offers(count)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) {
        return [];
      }

      let unapprovedIds: string[] = [];
      let rejectedMap: Record<string, string> = {};
      let urgencyMap: Record<string, string> = {};
      if (typeof window !== 'undefined') {
        try {
          unapprovedIds = JSON.parse(localStorage.getItem('unapproved_post_ids') || '[]');
          rejectedMap = JSON.parse(localStorage.getItem('rejected_post_reasons') || '{}');
          urgencyMap = JSON.parse(localStorage.getItem('post_urgency_map') || '{}');
        } catch {}
      }

      const formatted = (data as any[]).map((item) => ({
        ...item,
        urgency: item.urgency || urgencyMap[item.id] || 'today',
        status: unapprovedIds.includes(item.id)
          ? ('pending' as PostStatus)
          : rejectedMap[item.id]
          ? ('rejected' as PostStatus)
          : (item.status as PostStatus),
        rejection_reason: rejectedMap[item.id] || item.rejection_reason || null,
        offers_count: item.seller_offers?.[0]?.count ?? 0,
      })) as BuyerPost[];

      this.cache.set(cacheKey, { data: formatted, timestamp: Date.now() });
      return formatted;
    } catch (err) {
      console.error('ProfileService getUserPosts error:', err);
      return [];
    }
  }

  public async getUserOffers(userId: string): Promise<SellerOffer[]> {
    const cacheKey = `user_offers_${userId}`;
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const { data, error } = await supabase
        .from('seller_offers')
        .select(`
          *,
          buyer_posts:post_id (id, title, user_id, location_city, min_budget, max_budget)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) {
        return [];
      }

      const offers = data as SellerOffer[];
      this.cache.set(cacheKey, { data: offers, timestamp: Date.now() });
      return offers;
    } catch (err) {
      console.error('ProfileService getUserOffers error:', err);
      return [];
    }
  }

  public async updateProfile(userId: string, payload: UpdateProfilePayload): Promise<{ success: boolean; error?: string }> {
    try {
      this.invalidateCache();
      if (typeof window !== 'undefined') {
        localStorage.setItem(`profile_ext_${userId}`, JSON.stringify(payload));
      }

      let { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', userId);

      if (error && error.message?.includes('column')) {
        const fallback = await supabase
          .from('profiles')
          .update({ full_name: payload.full_name })
          .eq('id', userId);

        error = fallback.error;
      }

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Profil güncellenirken bir hata oluştu.' };
    }
  }

  public async getAllUsersForAdmin(): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) {
        return [];
      }

      return data as Profile[];
    } catch (err) {
      console.error('ProfileService getAllUsersForAdmin error:', err);
      return [];
    }
  }

  public async updateUserRole(userId: string, newRole: UserRole): Promise<{ success: boolean; error?: string }> {
    try {
      this.invalidateCache();
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      this.invalidateCache();
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}

export const profileService = new ProfileService();
