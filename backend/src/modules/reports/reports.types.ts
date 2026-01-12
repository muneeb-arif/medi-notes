export type ReportType = 'lab' | 'radiology' | 'prescription' | 'visit_note' | 'discharge' | 'other';

export interface Report {
  id: string;
  personProfileId: string;
  conditionProfileId?: string;
  title: string;
  reportDate: string;
  type: ReportType;
  doctorName?: string;
  facility?: string;
  tags?: string[];
  fileUrl?: string;
  fileType?: string;
  includeInEmergency?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateReportInput {
  title: string;
  reportDate: string;
  type: ReportType;
  doctorName?: string;
  facility?: string;
  tags?: string[];
  conditionProfileId?: string;
  fileKey?: string;
  includeInEmergency?: boolean;
}

export interface UpdateReportInput {
  title?: string;
  reportDate?: string;
  type?: ReportType;
  doctorName?: string;
  facility?: string;
  tags?: string[];
  includeInEmergency?: boolean;
}

export interface UploadUrlRequest {
  fileName: string;
  fileType: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  fileKey: string;
}

export interface ReportsListParams {
  type?: ReportType;
  conditionProfileId?: string;
  page?: number;
  limit?: number;
}

