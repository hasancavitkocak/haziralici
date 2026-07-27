export interface SystemSettings {
  autoApprovePosts: boolean;
  announcementBanner: {
    enabled: boolean;
    text: string;
    type: 'info' | 'warning' | 'emerald';
  };
  contactEmail: string;
  supportPhone: string;
}

const DEFAULT_SETTINGS: SystemSettings = {
  autoApprovePosts: false,
  announcementBanner: {
    enabled: true,
    text: '🎉 haziralici.com yayında! Alıcı olarak bütçenizle ilan verin, satıcılardan teklif toplayın.',
    type: 'emerald',
  },
  contactEmail: 'destek@haziralici.com',
  supportPhone: '0850 000 00 00',
};

class SettingsService {
  private STORAGE_KEY = 'system_platform_settings';

  public getDefaultSettings(): SystemSettings {
    return DEFAULT_SETTINGS;
  }

  public getSettings(): SystemSettings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_SETTINGS;
  }

  public updateSettings(newSettings: Partial<SystemSettings>): SystemSettings {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    }
    return updated;
  }
}

export const settingsService = new SettingsService();
