import { v4 as uuidv4 } from 'uuid';
import { config } from '../../config/env';
import type {
  CreateReportInput,
  Report,
  ReportsListParams,
  UpdateReportInput,
} from './reports.types';

// In-memory storage: profileId -> reports[]
const reportsByProfile = new Map<string, Report[]>();
const uploadedFiles = new Map<string, Buffer>(); // fileKey -> file data (fake storage)

export const getFile = (fileKey: string): Buffer | undefined => {
  return uploadedFiles.get(fileKey);
};

export const reportsService = {
  getUploadUrl: (profileId: string, fileName: string, fileType: string) => {
    const fileKey = `reports/${profileId}/${uuidv4()}.${fileName.split('.').pop() || 'pdf'}`;
    const uploadUrl = `${config.apiBaseUrl}/fake-upload/${fileKey}`;

    return {
      uploadUrl,
      fileKey,
    };
  },

  storeUploadedFile: (fileKey: string, data: Buffer): void => {
    uploadedFiles.set(fileKey, data);
  },

  create: (profileId: string, data: CreateReportInput): Report => {
    const reports = reportsByProfile.get(profileId) || [];
    const now = new Date().toISOString();

    const report: Report = {
      id: `rep_${uuidv4().replace(/-/g, '')}`,
      personProfileId: profileId,
      conditionProfileId: data.conditionProfileId,
      title: data.title,
      reportDate: data.reportDate,
      type: data.type,
      doctorName: data.doctorName,
      facility: data.facility,
      tags: data.tags,
      fileUrl: data.fileKey ? `${config.apiBaseUrl}/fake-view/${data.fileKey}` : undefined,
      fileType: data.fileKey 
        ? (data.fileKey.split('.').pop() === 'pdf' ? 'application/pdf' : 'image/jpeg')
        : undefined,
      includeInEmergency: data.includeInEmergency || false,
      createdAt: now,
      updatedAt: now,
    };

    reports.push(report);
    reportsByProfile.set(profileId, reports);

    return report;
  },

  list: (profileId: string, params?: ReportsListParams): { items: Report[]; meta: { page: number; limit: number; total: number } } => {
    let reports = reportsByProfile.get(profileId) || [];

    // Filter by type
    if (params?.type) {
      reports = reports.filter((r) => r.type === params.type);
    }

    // Filter by conditionProfileId
    if (params?.conditionProfileId) {
      reports = reports.filter((r) => r.conditionProfileId === params.conditionProfileId);
    }

    const total = reports.length;
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;

    const paginated = reports.slice(start, end);

    return {
      items: paginated,
      meta: {
        page,
        limit,
        total,
      },
    };
  },

  getById: (profileId: string, reportId: string): Report | undefined => {
    const reports = reportsByProfile.get(profileId) || [];
    return reports.find((r) => r.id === reportId);
  },

  update: (profileId: string, reportId: string, data: UpdateReportInput): Report => {
    const reports = reportsByProfile.get(profileId) || [];
    const index = reports.findIndex((r) => r.id === reportId);

    if (index === -1) {
      throw new Error('REPORT_NOT_FOUND');
    }

    const existing = reports[index];
    const updated: Report = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    reports[index] = updated;
    reportsByProfile.set(profileId, reports);

    return updated;
  },

  delete: (profileId: string, reportId: string): void => {
    const reports = reportsByProfile.get(profileId) || [];
    const filtered = reports.filter((r) => r.id !== reportId);

    if (filtered.length === reports.length) {
      throw new Error('REPORT_NOT_FOUND');
    }

    reportsByProfile.set(profileId, filtered);
  },
};

