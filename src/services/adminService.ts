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

  public async getCategoryStats(): Promise<{ category: string; count: number }[]> {
    try {
      const { data, error } = await supabase
        .from('buyer_posts')
        .select('category');

      if (error || !data) return [];
      
      const counts: Record<string, number> = {};
      data.forEach((p) => {
        const cat = p.category || 'diger';
        counts[cat] = (counts[cat] || 0) + 1;
      });

      return Object.entries(counts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);
    } catch (err) {
      console.error('AdminService getCategoryStats error:', err);
      return [];
    }
  }

  public async getWeeklyTrend(): Promise<{ day: string; posts: number; offers: number }[]> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const [postsRes, offersRes] = await Promise.all([
        supabase
          .from('buyer_posts')
          .select('created_at')
          .gte('created_at', sevenDaysAgo.toISOString()),
        supabase
          .from('seller_offers')
          .select('created_at')
          .gte('created_at', sevenDaysAgo.toISOString()),
      ]);

      const daysOfWeek = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
      const trendMap: Record<string, { posts: number; offers: number }> = {};

      // Initialize last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayLabel = daysOfWeek[d.getDay()];
        trendMap[dayLabel] = { posts: 0, offers: 0 };
      }

      if (postsRes.data) {
        postsRes.data.forEach((p) => {
          const dayLabel = daysOfWeek[new Date(p.created_at).getDay()];
          if (trendMap[dayLabel]) {
            trendMap[dayLabel].posts += 1;
          }
        });
      }

      if (offersRes.data) {
        offersRes.data.forEach((o) => {
          const dayLabel = daysOfWeek[new Date(o.created_at).getDay()];
          if (trendMap[dayLabel]) {
            trendMap[dayLabel].offers += 1;
          }
        });
      }

      return Object.entries(trendMap).map(([day, values]) => ({
        day,
        posts: values.posts,
        offers: values.offers,
      }));
    } catch (err) {
      console.error('AdminService getWeeklyTrend error:', err);
      return [];
    }
  }
}

export const adminService = new AdminService();
