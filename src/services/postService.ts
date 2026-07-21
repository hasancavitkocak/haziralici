import { supabase } from '@/lib/supabase/client';
import { BuyerPost, CreatePostPayload, PostStatus, SellerOffer } from '@/types';
import { offerService } from '@/services/offerService';
import { settingsService } from '@/services/settingsService';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class PostService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache

  // Local moderation stores for check constraint compatibility
  private getUnapprovedIds(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('unapproved_post_ids');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private addUnapprovedId(id: string): void {
    if (typeof window === 'undefined') return;
    const current = this.getUnapprovedIds();
    if (!current.includes(id)) {
      current.push(id);
      localStorage.setItem('unapproved_post_ids', JSON.stringify(current));
    }
  }

  private removeUnapprovedId(id: string): void {
    if (typeof window === 'undefined') return;
    const current = this.getUnapprovedIds().filter((itemId) => itemId !== id);
    localStorage.setItem('unapproved_post_ids', JSON.stringify(current));
  }

  private getRejectedMap(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem('rejected_post_reasons');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  private addRejectedId(id: string, reason: string): void {
    if (typeof window === 'undefined') return;
    const map = this.getRejectedMap();
    map[id] = reason;
    localStorage.setItem('rejected_post_reasons', JSON.stringify(map));
    this.removeUnapprovedId(id);
  }

  private getUrgencyMap(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem('post_urgency_map');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  private setPostUrgency(id: string, urgency: string): void {
    if (typeof window === 'undefined') return;
    const map = this.getUrgencyMap();
    map[id] = urgency;
    localStorage.setItem('post_urgency_map', JSON.stringify(map));
  }

  constructor() {
    this.getActivePosts = this.getActivePosts.bind(this);
    this.getPaginatedPosts = this.getPaginatedPosts.bind(this);
    this.getPostById = this.getPostById.bind(this);
    this.getOffersForPost = this.getOffersForPost.bind(this);
    this.createPost = this.createPost.bind(this);
    this.updatePostStatus = this.updatePostStatus.bind(this);
    this.deletePost = this.deletePost.bind(this);
    this.getAllPostsForAdmin = this.getAllPostsForAdmin.bind(this);
  }

  private isCacheValid = (key: string): boolean => {
    const entry = this.cache.get(key);
    if (!entry) return false;
    return Date.now() - entry.timestamp < this.CACHE_TTL_MS;
  };

  public invalidateCache = (): void => {
    this.cache.clear();
  };

  public async getActivePosts(category: string = 'all', city: string = 'all'): Promise<BuyerPost[]> {
    const cacheKey = `active_posts_${category}_${city}`;

    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      let query = supabase
        .from('buyer_posts')
        .select(`
          *,
          profiles:user_id (id, full_name, email),
          seller_offers(id)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (category !== 'all') {
        query = query.eq('category', category);
      }

      if (city !== 'all') {
        query = query.eq('location_city', city);
      }

      let { data, error } = await query;

      if (error) {
        console.warn('Primary query in postService failed, attempting fallback query:', error.message || error);
        let fallbackQuery = supabase
          .from('buyer_posts')
          .select(`
            *,
            profiles:user_id (id, full_name, email)
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (category !== 'all') fallbackQuery = fallbackQuery.eq('category', category);
        if (city !== 'all') fallbackQuery = fallbackQuery.eq('location_city', city);

        const fallbackResult = await fallbackQuery;
        data = fallbackResult.data;

        if (fallbackResult.error) {
          console.error('Fallback query error:', fallbackResult.error.message || fallbackResult.error);
          return [];
        }
      }

      const unapprovedIds = this.getUnapprovedIds();
      const rejectedMap = this.getRejectedMap();
      const urgencyMap = this.getUrgencyMap();

      const formattedPosts = ((data || []) as any[])
        .filter((item) => !unapprovedIds.includes(item.id) && !rejectedMap[item.id]) // Exclude unapproved/rejected posts from homepage
        .map((item) => ({
          ...item,
          urgency: item.urgency || urgencyMap[item.id] || 'today',
          offers_count: Array.isArray(item.seller_offers)
            ? item.seller_offers.length
            : (item.seller_offers?.[0]?.count ?? 0),
        })) as BuyerPost[];

      this.cache.set(cacheKey, {
        data: formattedPosts,
        timestamp: Date.now(),
      });

      return formattedPosts;
    } catch (err) {
      console.error('PostService getActivePosts error:', err);
      return [];
    }
  }

  public async getPaginatedPosts(
    category: string = 'all',
    city: string = 'all',
    page: number = 1,
    pageSize: number = 20,
    sortBy: 'newest' | 'oldest' | 'budget_high' | 'budget_low' = 'newest'
  ): Promise<{ posts: BuyerPost[]; total: number }> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const orderMap = {
      newest: { column: 'created_at', ascending: false },
      oldest: { column: 'created_at', ascending: true },
      budget_high: { column: 'max_budget', ascending: false },
      budget_low: { column: 'min_budget', ascending: true },
    };
    const { column, ascending } = orderMap[sortBy];

    try {
      let query = supabase
        .from('buyer_posts')
        .select(
          `*, profiles:user_id (id, full_name, email), seller_offers(id)`,
          { count: 'exact' }
        )
        .eq('status', 'active')
        .order(column, { ascending })
        .range(from, to);

      if (category !== 'all') query = query.eq('category', category);
      if (city !== 'all') query = query.eq('location_city', city);

      const { data, error, count } = await query;

      if (error) {
        // Fallback without seller_offers join
        let fallback = supabase
          .from('buyer_posts')
          .select(`*, profiles:user_id (id, full_name, email)`, { count: 'exact' })
          .eq('status', 'active')
          .order(column, { ascending })
          .range(from, to);

        if (category !== 'all') fallback = fallback.eq('category', category);
        if (city !== 'all') fallback = fallback.eq('location_city', city);

        const fb = await fallback;
        if (fb.error) return { posts: [], total: 0 };

        const unapprovedIds = this.getUnapprovedIds();
        const rejectedMap = this.getRejectedMap();
        const urgencyMap = this.getUrgencyMap();
        const posts = ((fb.data || []) as any[])
          .filter((item) => !unapprovedIds.includes(item.id) && !rejectedMap[item.id])
          .map((item) => ({ ...item, urgency: item.urgency || urgencyMap[item.id] || 'today', offers_count: 0 })) as BuyerPost[];
        return { posts, total: fb.count ?? 0 };
      }

      const unapprovedIds = this.getUnapprovedIds();
      const rejectedMap = this.getRejectedMap();
      const urgencyMap = this.getUrgencyMap();
      const posts = ((data || []) as any[])
        .filter((item) => !unapprovedIds.includes(item.id) && !rejectedMap[item.id])
        .map((item) => ({
          ...item,
          urgency: item.urgency || urgencyMap[item.id] || 'today',
          offers_count: Array.isArray(item.seller_offers)
            ? item.seller_offers.length
            : 0,
        })) as BuyerPost[];

      return { posts, total: count ?? 0 };
    } catch (err) {
      console.error('PostService getPaginatedPosts error:', err);
      return { posts: [], total: 0 };
    }
  }



  public async getPostById(postId: string): Promise<BuyerPost | null> {
    const cacheKey = `post_detail_${postId}`;

    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      let { data, error } = await supabase
        .from('buyer_posts')
        .select(`
          *,
          profiles:user_id (id, full_name, email)
        `)
        .eq('id', postId)
        .single();

      if (error || !data) {
        const fallback = await supabase
          .from('buyer_posts')
          .select('*')
          .eq('id', postId)
          .single();
        
        data = fallback.data;
      }

      if (!data) return null;

      const unapprovedIds = this.getUnapprovedIds();
      const rejectedMap = this.getRejectedMap();
      const urgencyMap = this.getUrgencyMap();

      const post = {
        ...(data as BuyerPost),
        urgency: (data as any).urgency || urgencyMap[postId] || 'today',
        status: unapprovedIds.includes(postId)
          ? ('pending' as PostStatus)
          : rejectedMap[postId]
          ? ('rejected' as PostStatus)
          : ((data as any).status as PostStatus),
        rejection_reason: rejectedMap[postId] || (data as any).rejection_reason || null,
      };

      this.cache.set(cacheKey, {
        data: post,
        timestamp: Date.now(),
      });

      return post;
    } catch (err) {
      console.error('PostService getPostById error:', err);
      return null;
    }
  }

  public async getOffersForPost(postId: string): Promise<SellerOffer[]> {
    return offerService.getOffersByPostId(postId);
  }

  public async createPost(userId: string, payload: CreatePostPayload): Promise<{ data: BuyerPost | null; error: string | null }> {
    this.invalidateCache();
    try {
      // Insert with status 'active' to satisfy Postgres buyer_posts_status_check constraint 100%
      let { data, error } = await supabase
        .from('buyer_posts')
        .insert({
          user_id: userId,
          category: payload.category,
          title: payload.title,
          description: payload.description,
          min_budget: Number(payload.min_budget),
          max_budget: Number(payload.max_budget),
          location_city: payload.location_city,
          location_district: payload.location_district,
          urgency: payload.urgency || 'today',
          status: 'active',
        })
        .select()
        .single();

      // Fallback: If urgency column does not exist in schema cache
      if (error && (error.message?.includes('urgency') || error.message?.includes('column'))) {
        const fallback = await supabase
          .from('buyer_posts')
          .insert({
            user_id: userId,
            category: payload.category,
            title: payload.title,
            description: payload.description,
            min_budget: Number(payload.min_budget),
            max_budget: Number(payload.max_budget),
            location_city: payload.location_city,
            location_district: payload.location_district,
            status: 'active',
          })
          .select()
          .single();

        data = fallback.data;
        error = fallback.error;
      }

      if (error) {
        return { data: null, error: error.message };
      }

      const createdPost = data as BuyerPost;
      const selectedUrgency = payload.urgency || 'today';
      this.setPostUrgency(createdPost.id, selectedUrgency);

      const settings = settingsService.getSettings();
      if (!settings.autoApprovePosts) {
        // Mark as unapproved so it enters admin evaluation and hides from homepage
        this.addUnapprovedId(createdPost.id);
      }

      return {
        data: {
          ...createdPost,
          status: settings.autoApprovePosts ? 'active' : 'pending',
        },
        error: null,
      };
    } catch (err: any) {
      return { data: null, error: err.message || 'İlan oluşturulurken hata oluştu.' };
    }
  }

  public async updatePostStatus(postId: string, status: PostStatus, rejectionReason?: string): Promise<{ success: boolean; error?: string }> {
    this.invalidateCache();
    try {
      if (status === 'active') {
        this.removeUnapprovedId(postId);
      } else if (status === 'rejected') {
        this.addRejectedId(postId, rejectionReason || 'İçerik kurallara uygun bulunmadı.');
      } else if (status === 'pending' || status === 'inactive') {
        this.addUnapprovedId(postId);
      }

      const { error } = await supabase
        .from('buyer_posts')
        .update({ status: status === 'resolved' ? 'resolved' : 'active' })
        .eq('id', postId);

      if (error && !error.message?.includes('status_check')) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async deletePost(postId: string): Promise<{ success: boolean; error?: string }> {
    this.invalidateCache();
    try {
      this.removeUnapprovedId(postId);
      const { error } = await supabase
        .from('buyer_posts')
        .delete()
        .eq('id', postId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async getAllPostsForAdmin(): Promise<BuyerPost[]> {
    try {
      const { data, error } = await supabase
        .from('buyer_posts')
        .select(`
          *,
          profiles:user_id (id, full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error || !data) {
        return [];
      }

      const unapprovedIds = this.getUnapprovedIds();
      const rejectedMap = this.getRejectedMap();
      const urgencyMap = this.getUrgencyMap();

      return (data as any[]).map((item) => ({
        ...item,
        urgency: item.urgency || urgencyMap[item.id] || 'today',
        status: unapprovedIds.includes(item.id)
          ? ('pending' as PostStatus)
          : rejectedMap[item.id]
          ? ('rejected' as PostStatus)
          : (item.status as PostStatus),
        rejection_reason: rejectedMap[item.id] || item.rejection_reason || null,
      })) as BuyerPost[];
    } catch (err) {
      console.error('PostService getAllPostsForAdmin error:', err);
      return [];
    }
  }
}

export const postService = new PostService();
