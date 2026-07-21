import { supabase } from '@/lib/supabase/client';
import { SellerOffer, CreateOfferPayload } from '@/types';
import { postService } from '@/services/postService';
import { notificationService } from '@/services/notificationService';

class OfferService {
  public async createOffer(userId: string, payload: CreateOfferPayload): Promise<{ data: SellerOffer | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('seller_offers')
        .insert({
          post_id: payload.post_id,
          user_id: userId,
          price: Number(payload.price),
          description: payload.description,
          is_read: false,
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      // İlan sahibine "Yeni Teklif" bildirimi gönder
      try {
        const { data: postData } = await supabase
          .from('buyer_posts')
          .select('user_id, title')
          .eq('id', payload.post_id)
          .single();

        if (postData?.user_id) {
          await notificationService.addNotification(
            postData.user_id,
            '💰 Yeni Teklif Geldi!',
            `"${postData.title}" ilanınıza yeni bir teklif sunuldu.`,
            'new_offer',
            payload.post_id
          );
        }
      } catch (notifErr) {
        console.warn('Notification send error:', notifErr);
      }

      postService.invalidateCache();
      return { data: data as SellerOffer, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Teklif sunulurken bir hata oluştu.' };
    }
  }

  public async getOffersByPostId(postId: string): Promise<SellerOffer[]> {
    try {
      const { data, error } = await supabase
        .from('seller_offers')
        .select(`
          *,
          profiles:user_id (id, full_name, email, phone)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });


      if (error || !data) {
        return [];
      }

      return data as SellerOffer[];
    } catch (err) {
      console.error('OfferService getOffersByPostId error:', err);
      return [];
    }
  }

  public async acceptOffer(offerId: string, postId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: offerData } = await supabase
        .from('seller_offers')
        .select('user_id, price')
        .eq('id', offerId)
        .single();

      const { error: offerError } = await supabase
        .from('seller_offers')
        .update({ is_accepted: true })
        .eq('id', offerId);

      if (offerError) {
        return { success: false, error: offerError.message };
      }

      const { error: postError } = await supabase
        .from('buyer_posts')
        .update({ status: 'resolved', accepted_offer_id: offerId })
        .eq('id', postId);

      if (postError) {
        return { success: false, error: postError.message };
      }

      if (offerData?.user_id) {
        try {
          await notificationService.addNotification(
            offerData.user_id,
            '🎉 Teklifiniz Kabul Edildi!',
            'Sunmuş olduğunuz teklif alıcı tarafından kabul edildi.',
            'post_approved',
            postId
          );
        } catch (nErr) {
          console.warn('Accept offer notification error:', nErr);
        }
      }

      postService.invalidateCache();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async deleteOffer(offerId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('seller_offers')
        .delete()
        .eq('id', offerId);

      if (error) {
        return { success: false, error: error.message };
      }

      postService.invalidateCache();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async getAllOffersForAdmin(): Promise<SellerOffer[]> {
    try {
      const { data, error } = await supabase
        .from('seller_offers')
        .select(`
          *,
          profiles:user_id (id, full_name, email, phone),
          buyer_posts:post_id (id, title)
        `)
        .order('created_at', { ascending: false });

      if (error || !data) {
        return [];
      }

      return data as SellerOffer[];
    } catch (err) {
      console.error('OfferService getAllOffersForAdmin error:', err);
      return [];
    }
  }
}

export const offerService = new OfferService();
