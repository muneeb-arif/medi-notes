import { useMutation, useQueryClient } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { reportsApi } from '../api/reports.api';
import type { CreateReportInput, UploadUrlRequest } from '../types';

export const useCreateReport = (profileId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { input: CreateReportInput; fileUri?: string; fileType?: string }) => {
      const { input, fileUri, fileType } = data;

      try {
        let fileKey: string | undefined;

        // Only upload file if provided
        if (fileUri && fileType) {
          const uploadRequest: UploadUrlRequest = {
            fileName: `report.${fileType.split('/')[1] || 'pdf'}`,
            fileType,
          };

          const { uploadUrl, fileKey: generatedFileKey } = await reportsApi.getUploadUrl(profileId, uploadRequest);

          // Replace localhost with the actual API base URL if needed
          // Backend may return localhost URLs which don't work on physical devices
          const apiBaseURL = Constants.expoConfig?.extra?.apiBaseURL || process.env.EXPO_PUBLIC_API_BASE_URL || '';
          const baseUrlWithoutPath = apiBaseURL.replace('/api/v1', '');
          
          let correctedUploadUrl = uploadUrl;
          if (uploadUrl.includes('localhost') && baseUrlWithoutPath) {
            correctedUploadUrl = uploadUrl.replace('http://localhost:3000', baseUrlWithoutPath);
          }

          await reportsApi.uploadFile(correctedUploadUrl, fileUri, fileType);
          fileKey = generatedFileKey;
        }

        const reportInput: CreateReportInput = {
          ...input,
          fileKey,
        };

        return reportsApi.create(profileId, reportInput);
      } catch (error) {
        // Re-throw with context about which step failed
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Failed to create report');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'list', profileId] });
    },
  });
};

