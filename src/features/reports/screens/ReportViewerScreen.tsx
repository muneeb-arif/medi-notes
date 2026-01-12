import { useRoute } from '@react-navigation/native';
import React from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useReportDetail } from '../hooks/useReportDetail';

export const ReportViewerScreen: React.FC = () => {
  const route = useRoute();
  const profileId = (route.params as { profileId: string })?.profileId;
  const reportId = (route.params as { reportId: string })?.reportId;
  const { data: report, isLoading, error } = useReportDetail(profileId, reportId);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !report) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load report</Text>
      </View>
    );
  }

  const hasFile = !!report.fileUrl;
  const isImage = hasFile && (report.fileType?.startsWith('image/') || report.fileUrl.match(/\.(jpg|jpeg|png)$/i));
  const isPdf = hasFile && (report.fileType === 'application/pdf' || report.fileUrl.match(/\.pdf$/i));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.metadata}>
        <Text style={styles.title}>{report.title}</Text>
        <Text style={styles.metaText}>Date: {report.reportDate}</Text>
        <Text style={styles.metaText}>Type: {report.type}</Text>
        {report.doctorName && <Text style={styles.metaText}>Doctor: {report.doctorName}</Text>}
        {report.facility && <Text style={styles.metaText}>Facility: {report.facility}</Text>}
        {report.tags && report.tags.length > 0 && (
          <Text style={styles.metaText}>Tags: {report.tags.join(', ')}</Text>
        )}
      </View>

      <View style={styles.viewerContainer}>
        {!hasFile ? (
          <View style={styles.unsupportedContainer}>
            <Text style={styles.unsupportedText}>
              No file attached to this report.
            </Text>
          </View>
        ) : isImage ? (
          <Image source={{ uri: report.fileUrl }} style={styles.image} resizeMode="contain" />
        ) : isPdf ? (
          <WebView
            source={{ uri: report.fileUrl }}
            style={styles.webView}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
              </View>
            )}
          />
        ) : (
          <View style={styles.unsupportedContainer}>
            <Text style={styles.unsupportedText}>
              Unsupported file type. Please download to view.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metadata: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  viewerContainer: {
    flex: 1,
    minHeight: 600,
  },
  image: {
    width: '100%',
    height: 600,
  },
  webView: {
    flex: 1,
    minHeight: 600,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unsupportedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 600,
  },
  unsupportedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});

