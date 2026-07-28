import { supabase } from '@/lib/supabase/client';
import { ContentReport, ReportStatus } from '@/types';
import { auditLogService } from '@/services/auditLogService';

export interface CreateReportPayload {
  reporter_id?: string | null;
  reporter_email: string;
  target_type: 'post' | 'offer';
  target_id: string;
  target_title: string;
  reason: string;
  details?: string;
}

class ReportService {
  private LOCAL_STORAGE_KEY = 'teklifet_content_reports';

  private getLocalReports(): ContentReport[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveLocalReports(reports: ContentReport[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(reports));
    } catch (err) {
      console.warn('Failed to save reports to localStorage:', err);
    }
  }

  public async createReport(payload: CreateReportPayload): Promise<{ success: boolean; data?: ContentReport; error?: string }> {
    try {
      // Try inserting into Supabase
      const { data, error } = await supabase
        .from('content_reports')
        .insert({
          reporter_id: payload.reporter_id || null,
          reporter_email: payload.reporter_email,
          target_type: payload.target_type,
          target_id: payload.target_id,
          target_title: payload.target_title,
          reason: payload.reason,
          details: payload.details || null,
          status: 'pending',
        })
        .select()
        .single();

      if (!error && data) {
        // Also log in audit logs
        auditLogService.logReport(
          payload.reason,
          `${payload.target_type === 'post' ? 'İlan' : 'Teklif'} ID: ${payload.target_id} | Başlık: "${payload.target_title}"`,
          payload.reporter_email
        );
        return { success: true, data: data as ContentReport };
      }

      console.warn('Supabase content_reports insert fallback to local storage:', error?.message);

      // Fallback to local storage
      const newReport: ContentReport = {
        id: 'rep_' + Math.random().toString(36).substring(2, 9),
        reporter_id: payload.reporter_id || null,
        reporter_email: payload.reporter_email,
        target_type: payload.target_type,
        target_id: payload.target_id,
        target_title: payload.target_title,
        reason: payload.reason,
        details: payload.details || null,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      const localReports = this.getLocalReports();
      this.saveLocalReports([newReport, ...localReports]);

      // Audit Log fallback
      auditLogService.logReport(
        payload.reason,
        `${payload.target_type === 'post' ? 'İlan' : 'Teklif'} ID: ${payload.target_id} | Başlık: "${payload.target_title}"`,
        payload.reporter_email
      );

      return { success: true, data: newReport };
    } catch (err: any) {
      console.error('ReportService createReport error:', err);
      return { success: false, error: err.message || 'Şikayet kaydedilirken hata oluştu.' };
    }
  }

  public async getAllReports(): Promise<ContentReport[]> {
    try {
      const { data, error } = await supabase
        .from('content_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as ContentReport[];
      }

      // If Supabase table is empty or not yet created, merge with local storage
      const localReports = this.getLocalReports();
      if (data && data.length === 0 && localReports.length === 0) {
        return [];
      }

      // Merge local and Supabase reports removing duplicates by id
      const combined = [...(data || []), ...localReports];
      const uniqueMap = new Map<string, ContentReport>();
      combined.forEach((item) => uniqueMap.set(item.id, item as ContentReport));

      return Array.from(uniqueMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (err) {
      console.error('ReportService getAllReports error:', err);
      return this.getLocalReports();
    }
  }

  public async updateReportStatus(
    reportId: string,
    status: ReportStatus,
    adminNotes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('content_reports')
        .update({
          status,
          admin_notes: adminNotes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      // Also update in local storage if present
      const localReports = this.getLocalReports();
      const updatedLocal = localReports.map((r) =>
        r.id === reportId ? { ...r, status, admin_notes: adminNotes || r.admin_notes, updated_at: new Date().toISOString() } : r
      );
      this.saveLocalReports(updatedLocal);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Şikayet durumu güncellenemedi.' };
    }
  }

  public async deleteReport(reportId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await supabase.from('content_reports').delete().eq('id', reportId);

      const localReports = this.getLocalReports();
      const filtered = localReports.filter((r) => r.id !== reportId);
      this.saveLocalReports(filtered);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Şikayet silinemedi.' };
    }
  }
}

export const reportService = new ReportService();
