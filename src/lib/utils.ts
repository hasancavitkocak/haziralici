import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDisplayName(fullName?: string | null, email?: string): string {
  if (fullName && fullName.trim()) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    const firstName = parts.slice(0, -1).join(' ');
    const lastName = parts[parts.length - 1];
    return `${firstName} ${lastName.charAt(0).toUpperCase()}.`;
  }
  if (email && email.includes('@')) {
    const username = email.split('@')[0];
    return username.charAt(0).toUpperCase() + username.slice(1);
  }
  return 'Kullanıcı';
}

export function formatUrgency(urgency?: string | null): { label: string; colorClass: string; dotColor: string } {
  switch (urgency) {
    case 'today':
      return { label: 'Bugün Alacağım (Acil)', colorClass: 'bg-rose-50 text-rose-700 border-rose-200', dotColor: 'bg-rose-500' };
    case 'this_week':
      return { label: 'Bu Hafta İçinde', colorClass: 'bg-amber-50 text-amber-800 border-amber-200', dotColor: 'bg-amber-500' };
    case 'research':
      return { label: 'Fiyat Araştırması', colorClass: 'bg-indigo-50 text-indigo-700 border-indigo-200', dotColor: 'bg-indigo-500' };
    default:
      return { label: 'Bugün Alacağım (Acil)', colorClass: 'bg-rose-50 text-rose-700 border-rose-200', dotColor: 'bg-rose-500' };
  }
}

export function maskPhoneNumbers(text: string): string {
  if (!text) return '';
  const phoneRegex = /(\+?90|0)?\s*([5][0-9]{2})[\s\.\-]*([0-9]{3})[\s\.\-]*([0-9]{2})[\s\.\-]*([0-9]{2})/gi;
  const genericDigitRegex = /(?:\+?90|0)?(?:\s*[\.\-]?\s*\d){10,11}/g;

  return text
    .replace(phoneRegex, '🔒 [TELEFON GİZLENDİ]')
    .replace(genericDigitRegex, (match) => {
      const digitCount = match.replace(/\D/g, '').length;
      if (digitCount >= 10 && digitCount <= 12) {
        return '🔒 [İLETİŞİM BİLGİSİ GİZLENDİ]';
      }
      return match;
    });
}

export function formatNumberInput(value: string | number): string {
  const digitsOnly = String(value).replace(/\D/g, '');
  if (!digitsOnly) return '';
  return new Intl.NumberFormat('tr-TR').format(Number(digitsOnly));
}

export function parseNumberInput(value: string | number): number {
  const digitsOnly = String(value).replace(/\D/g, '');
  return digitsOnly ? Number(digitsOnly) : 0;
}

export function getPostNumber(postOrId: { id: string; post_number?: number | string } | string): string {
  if (typeof postOrId === 'object' && postOrId?.post_number) {
    return `#${postOrId.post_number}`;
  }
  const idStr = typeof postOrId === 'string' ? postOrId : postOrId?.id || '1234567';
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash << 5) - hash + idStr.charCodeAt(i);
    hash |= 0;
  }
  const sevenDigit = 1000000 + (Math.abs(hash) % 9000000);
  return `#${sevenDigit}`;
}


