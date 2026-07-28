import { TurkeyCities } from '@/data/turkeyCities';

export type PostStatus = 'pending' | 'inactive' | 'active' | 'rejected' | 'resolved';
export type UserRole = 'user' | 'admin';
export type PostUrgency = 'today' | 'this_week' | 'research';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  phone?: string | null;
  city?: string | null;
  district?: string | null;
  avatar_url?: string | null;
  role?: UserRole;
  created_at: string;
}

export interface BuyerPost {
  id: string;
  user_id: string;
  category: string;
  title: string;
  description: string;
  min_budget: number;
  max_budget: number;
  location_city: string;
  location_district: string;
  urgency?: PostUrgency;
  accepted_offer_id?: string | null;
  post_number?: string;
  status: PostStatus;
  rejection_reason?: string | null;
  created_at: string;
  profiles?: Profile;
  offers_count?: number;
}

export interface SellerOffer {
  id: string;
  post_id: string;
  user_id: string;
  price: number;
  description: string;
  is_read: boolean;
  is_accepted?: boolean;
  created_at: string;
  profiles?: Profile;
  buyer_posts?: BuyerPost;
}

export interface UserNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'post_approved' | 'post_rejected' | 'offer_received' | 'new_offer' | 'info';
  is_read: boolean;
  post_id?: string;
  created_at: string;
}

export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export interface ContentReport {
  id: string;
  reporter_id?: string | null;
  reporter_email: string;
  target_type: 'post' | 'offer';
  target_id: string;
  target_title: string;
  reason: string;
  details?: string | null;
  status: ReportStatus;
  admin_notes?: string | null;
  created_at: string;
  updated_at?: string | null;
}


export interface CreatePostPayload {
  category: string;
  title: string;
  description: string;
  min_budget: number;
  max_budget: number;
  location_city: string;
  location_district: string;
  urgency?: PostUrgency;
}

export interface CreateOfferPayload {
  post_id: string;
  price: number;
  description: string;
}

export interface CategoryOption {
  id: string;
  name: string;
  icon?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  activePosts: number;
  totalOffers: number;
}

export const CATEGORIES: CategoryOption[] = [
  { id: 'gayrimenkul', name: 'Gayrimenkul' },
  { id: 'vasita', name: 'Vasıta' },
  { id: 'elektronik', name: 'Elektronik' },
  { id: 'ev-esya', name: 'Ev & Mobilya' },
  { id: 'hizmet', name: 'Hizmet & İş' },
  { id: 'diger', name: 'Diğer' },
];

export const CITIES = ['Tüm Şehirler', ...TurkeyCities.getCityNames()];
