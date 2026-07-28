export interface AuditLog {
  id: string;
  action: string;
  details: string;
  adminEmail: string;
  timestamp: string;
}

class AuditLogService {
  private STORAGE_KEY = 'admin_platform_audit_logs';

  public getLogs(): AuditLog[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return [];
  }

  public logAction(action: string, details: string, adminEmail: string = 'Sistem'): void {
    if (typeof window === 'undefined') return;
    const logs = this.getLogs();
    const newLog: AuditLog = {
      id: Math.random().toString(36).substring(2, 9),
      action,
      details,
      adminEmail,
      timestamp: new Date().toISOString(),
    };
    const updated = [newLog, ...logs].slice(0, 100); // Keep last 100 entries
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }

  public logReport(reason: string, details: string, reporterEmail: string = 'Kullanıcı Bildirimi'): void {
    this.logAction('🚨 İçerik Şikayeti', `Sebep: ${reason} | ${details}`, reporterEmail);
  }

  public clearLogs(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }
}

export const auditLogService = new AuditLogService();

