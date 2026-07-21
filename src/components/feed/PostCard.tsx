import React from 'react';
import Link from 'next/link';
import { BuyerPost } from '@/types';
import { categoryService } from '@/services/categoryService';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, formatDisplayName, formatUrgency } from '@/lib/utils';
import { MapPin, Clock, ArrowRight, Lock, Sparkles, Tag } from 'lucide-react';

interface PostCardProps {
  post: BuyerPost;
  viewMode?: 'grid' | 'list';
}

export const PostCard = ({ post, viewMode = 'grid' }: PostCardProps) => {
  const authorName = formatDisplayName(post.profiles?.full_name, post.profiles?.email);
  const initial = authorName.charAt(0).toUpperCase();
  const offersCount = post.offers_count || 0;
  const urgencyInfo = formatUrgency(post.urgency);

  const categories = categoryService.getCategories();
  const categoryName = categories.find((c) => c.id === post.category)?.name ?? post.category;

  if (viewMode === 'list') {
    return (
      <Link href={`/ilan/${post.id}`} className="block group">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-[#312E81]/40 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Main Info */}
          <div className="space-y-2.5 flex-1 min-w-0">
            {/* Top Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#312E81] bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100 uppercase tracking-wider">
                <Tag className="w-3 h-3" />
                {categoryName}
              </span>
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${urgencyInfo.colorClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${urgencyInfo.dotColor}`} />
                {urgencyInfo.label}
              </span>
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 ml-auto md:ml-0">
                <Clock className="w-3 h-3" />
                {formatDate(post.created_at)}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-base font-black text-slate-900 group-hover:text-[#312E81] transition-colors leading-snug break-words">
              {post.title}
            </h3>

            {/* Description */}
            <p className="text-xs text-slate-600 font-normal leading-relaxed break-words">
              {post.description}
            </p>

            {/* Author & Location */}
            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium pt-0.5">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#312E81] text-white inline-flex items-center justify-center font-bold text-[10px]">
                  {initial}
                </span>
                {authorName}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-slate-600 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-[#312E81]" />
                {post.location_city} / {post.location_district}
              </span>
            </div>
          </div>

          {/* Right Action Side */}
          <div className="flex sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between sm:justify-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
            {/* Budget */}
            <Badge variant="emerald" className="text-xs py-1.5 px-3 font-extrabold shadow-sm whitespace-nowrap shrink-0">
              {formatCurrency(post.min_budget)} — {formatCurrency(post.max_budget)}
            </Badge>

            <div className="flex items-center gap-2">
              {offersCount > 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#312E81] bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                  <Lock className="w-3 h-3 text-[#312E81]" />
                  <span>{offersCount} Teklif</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>İlk Teklif</span>
                </span>
              )}

              <div className="px-3 py-1.5 rounded-xl bg-indigo-50/80 group-hover:bg-[#312E81] text-[#312E81] group-hover:text-white font-bold text-xs transition-all flex items-center gap-1">
                <span>Teklif Ver</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid Mode (Strict equal height)
  return (
    <Link href={`/ilan/${post.id}`} className="block group h-full">
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-md hover:shadow-2xl hover:border-[#312E81]/40 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
        <div className="space-y-3.5">
          {/* Category & Urgency Bar */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#312E81] bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-100 uppercase tracking-wider">
              <Tag className="w-3 h-3" />
              {categoryName}
            </span>

            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${urgencyInfo.colorClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${urgencyInfo.dotColor}`} />
              {urgencyInfo.label}
            </span>
          </div>

          {/* Author Info & Location */}
          <div className="flex items-center justify-between gap-2 pt-0.5 min-h-[40px]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#312E81] text-white flex items-center justify-center font-bold text-xs shadow-md shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">
                  {authorName}
                </h4>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(post.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100/80 px-2 py-0.5 rounded-lg border border-slate-200/60 shrink-0 max-w-[120px] truncate">
              <MapPin className="w-3 h-3 text-[#312E81] shrink-0" />
              <span className="truncate">{post.location_city}</span>
            </div>
          </div>

          {/* Title & Description with Fixed Minimum Heights */}
          <div className="space-y-1.5">
            <h3 className="text-base font-black text-slate-900 group-hover:text-[#312E81] transition-colors leading-snug line-clamp-2 min-h-[2.6rem]">
              {post.title}
            </h3>
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal min-h-[2.25rem]">
              {post.description}
            </p>
          </div>
        </div>

        {/* Bottom Budget & Action Footer */}
        <div className="space-y-3 pt-3 mt-4 border-t border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="emerald" className="text-[11px] sm:text-xs py-1 px-2.5 font-extrabold shadow-sm whitespace-nowrap shrink-0">
              {formatCurrency(post.min_budget)} — {formatCurrency(post.max_budget)}
            </Badge>

            {offersCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#312E81] bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 whitespace-nowrap shrink-0">
                <Lock className="w-3 h-3 text-[#312E81]" />
                <span>{offersCount} Teklif</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap shrink-0">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>İlk Teklif</span>
              </span>
            )}
          </div>

          <div className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-50/70 group-hover:bg-[#312E81] text-[#312E81] group-hover:text-white font-extrabold text-xs transition-all duration-200 shadow-sm">
            <span>Teklif Ver / Detaylar</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
};
