import { CategoryOption } from '@/types';

export const DEFAULT_CATEGORIES: CategoryOption[] = [
  { id: 'gayrimenkul', name: 'Gayrimenkul' },
  { id: 'vasita', name: 'Vasıta' },
  { id: 'elektronik', name: 'Elektronik' },
  { id: 'ev-esya', name: 'Ev & Mobilya' },
  { id: 'hizmet', name: 'Hizmet & İş' },
  { id: 'diger', name: 'Diğer' },
];

class CategoryService {
  private STORAGE_KEY = 'platform_categories_v1';

  public getCategories(): CategoryOption[] {
    if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_CATEGORIES;
  }

  public saveCategories(categories: CategoryOption[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(categories));
  }

  public addCategory(name: string, customId?: string): CategoryOption[] {
    const categories = this.getCategories();
    const slug = customId || name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const newCategory: CategoryOption = { id: slug, name };
    const updated = [...categories, newCategory];
    this.saveCategories(updated);
    return updated;
  }

  public updateCategory(id: string, newName: string): CategoryOption[] {
    const categories = this.getCategories();
    const updated = categories.map((c) => (c.id === id ? { ...c, name: newName } : c));
    this.saveCategories(updated);
    return updated;
  }

  public deleteCategory(id: string): CategoryOption[] {
    const categories = this.getCategories();
    const updated = categories.filter((c) => c.id !== id);
    this.saveCategories(updated);
    return updated;
  }

  public resetToDefault(): CategoryOption[] {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    return DEFAULT_CATEGORIES;
  }
}

export const categoryService = new CategoryService();
