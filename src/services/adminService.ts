import { supabase } from '@/lib/supabase/client';
import { AdminStats, BuyerPost, SellerOffer } from '@/types';

class AdminService {
  public async getAdminStats(): Promise<AdminStats> {
    try {
      const [usersRes, postsRes, activeRes, offersRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('buyer_posts').select('id', { count: 'exact', head: true }),
        supabase.from('buyer_posts').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('seller_offers').select('id', { count: 'exact', head: true }),
      ]);

      return {
        totalUsers: usersRes.count || 0,
        totalPosts: postsRes.count || 0,
        activePosts: activeRes.count || 0,
        totalOffers: offersRes.count || 0,
      };
    } catch (err) {
      console.error('AdminService getAdminStats error:', err);
      return { totalUsers: 0, totalPosts: 0, activePosts: 0, totalOffers: 0 };
    }
  }

  public async getRecentPosts(limit: number = 5): Promise<BuyerPost[]> {
    try {
      const { data, error } = await supabase
        .from('buyer_posts')
        .select(`
          *,
          profiles:user_id (id, full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !data) return [];
      return data as BuyerPost[];
    } catch (err) {
      console.error('AdminService getRecentPosts error:', err);
      return [];
    }
  }

  public async getRecentOffers(limit: number = 5): Promise<SellerOffer[]> {
    try {
      const { data, error } = await supabase
        .from('seller_offers')
        .select(`
          *,
          profiles:user_id (id, full_name, email),
          buyer_posts:post_id (id, title)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !data) return [];
      return data as SellerOffer[];
    } catch (err) {
      console.error('AdminService getRecentOffers error:', err);
      return [];
    }
  }
}

export const adminService = new AdminService();
