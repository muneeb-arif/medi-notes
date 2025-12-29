import { AppHeader } from '@components/AppHeader';
import { EmptyState } from '@components/EmptyState';
import { ListRow } from '@components/ListRow';
import { Screen } from '@components/Screen';
import { SectionCard } from '@components/SectionCard';
import { useMedicationsList } from '@features/medications/hooks/useMedicationsList';
import type { Medication } from '@features/medications/types';
import { useProfileDetail } from '@features/profiles/hooks/useProfileDetail';
import { useReportsList } from '@features/reports/hooks/useReportsList';
import type { Report } from '@features/reports/types';
import { useVitalsList } from '@features/vitals/hooks/useVitalsList';
import type { VitalEntry } from '@features/vitals/types';
import { useNavigation } from '@react-navigation/native';
import { useActiveProfileStore } from '@store/activeProfile.store';
import { spacing, typography } from '@theme';
import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const calculateAge = (dateOfBirth: string): number => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const formatVitalValue = (entry: VitalEntry): string => {
  if (entry.type === 'blood_pressure' && typeof entry.value === 'object') {
    return `${entry.value.systolic}/${entry.value.diastolic} ${entry.unit}`;
  }
  return `${entry.value} ${entry.unit}`;
};

const VITAL_TYPE_LABELS: Record<string, string> = {
  blood_pressure: 'BP',
  blood_glucose: 'Glucose',
  heart_rate: 'HR',
  temperature: 'Temp',
  weight: 'Weight',
  spo2: 'SpO2',
};

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { activeProfileId } = useActiveProfileStore();

  const { data: profile, isLoading: isLoadingProfile } = useProfileDetail(activeProfileId);
  const { data: reportsData, isLoading: isLoadingReports } = useReportsList(activeProfileId, {
    limit: 3,
  });
  const { data: vitalsData, isLoading: isLoadingVitals } = useVitalsList(activeProfileId, {
    limit: 3,
  });
  const { data: medicationsData, isLoading: isLoadingMeds } = useMedicationsList(
    activeProfileId,
    { status: 'ongoing', limit: 50 }
  );

  const recentReports = useMemo(() => {
    if (!reportsData?.items) return [];
    return [...reportsData.items]
      .sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime())
      .slice(0, 3);
  }, [reportsData]);

  const recentVitals = useMemo(() => {
    if (!vitalsData?.items) return [];
    return [...vitalsData.items]
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
      .slice(0, 3);
  }, [vitalsData]);

  const ongoingMedications = useMemo(() => {
    if (!medicationsData?.items) return [];
    return medicationsData.items.filter((m) => m.status === 'ongoing');
  }, [medicationsData]);

  const isLoading =
    isLoadingProfile || isLoadingReports || isLoadingVitals || isLoadingMeds;

  if (!activeProfileId) {
    return (
      <Screen>
        <AppHeader title="Welcome to Medi Notes" />
        <EmptyState
          title="No active profile selected"
          description="Select or create a profile to view your health dashboard"
          actionLabel="Go to Profiles"
          onAction={() => navigation.navigate('Profiles' as never)}
        />
      </Screen>
    );
  }

  if (isLoading) {
    return (
      <Screen>
        <AppHeader title="Welcome to Medi Notes" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollable>
      <AppHeader title="Welcome to Medi Notes" />
      
      {/* Active Profile Card */}
      {profile ? (
        <SectionCard style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile.fullName}</Text>
              <View style={styles.profileDetails}>
                <Text style={styles.profileDetail}>
                  Age {calculateAge(profile.dateOfBirth)}
                </Text>
                {profile.relationToAccount && (
                  <Text style={styles.profileDetail}> • {profile.relationToAccount}</Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Profiles' as never)}
              style={styles.changeButton}
            >
              <Text style={styles.changeButtonText}>Change</Text>
            </TouchableOpacity>
          </View>
        </SectionCard>
      ) : (
        <SectionCard style={styles.profileCard}>
          <EmptyState
            title="No profile selected"
            description="Create or select a profile to get started"
            actionLabel="Go to Profiles"
            buttonStyle={styles.emptyStateButton}
            onAction={() => navigation.navigate('Profiles' as never)}
          />
        </SectionCard>
      )}

      {/* Appointments Section */}
      <SectionCard style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Appointments</Text>
          <TouchableOpacity
            onPress={() => {
              const appNavigator = navigation.getParent();
              if (appNavigator) {
                appNavigator.navigate('Appointments' as never);
              }
            }}
          >
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>
        <ListRow
          title="Manage Appointments"
          subtitle="View and schedule appointments"
          onPress={() => {
            const appNavigator = navigation.getParent();
            if (appNavigator) {
              appNavigator.navigate('Appointments' as never);
            }
          }}
          showDivider={false}
        />
      </SectionCard>

      {/* Reports Section */}
      <SectionCard style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Reports</Text>
          <TouchableOpacity
            onPress={() => navigation.getParent()?.navigate('Reports' as never)}
          >
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>
        {recentReports.length === 0 ? (
          <Text style={styles.emptySectionText}>No reports yet</Text>
        ) : (
          recentReports.map((report: Report, index: number) => (
            <ListRow
              key={report.id}
              title={report.title}
              subtitle={`${report.type} • ${new Date(report.reportDate).toLocaleDateString()}`}
              onPress={() => {
                const parent = navigation.getParent();
                if (parent) {
                  (parent as any).navigate('Reports', {
                    screen: 'ReportViewer',
                    params: {
                      profileId: activeProfileId,
                      reportId: report.id,
                    },
                  });
                }
              }}
              showDivider={index < recentReports.length - 1}
            />
          ))
        )}
      </SectionCard>

      {/* Vitals Section */}
      <SectionCard style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Vitals</Text>
          <TouchableOpacity
            onPress={() => navigation.getParent()?.navigate('Vitals' as never)}
          >
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>
        {recentVitals.length === 0 ? (
          <Text style={styles.emptySectionText}>No vitals recorded yet</Text>
        ) : (
          recentVitals.map((vital: VitalEntry, index: number) => (
            <ListRow
              key={vital.id}
              title={VITAL_TYPE_LABELS[vital.type] || vital.type}
              subtitle={`${formatVitalValue(vital)} • ${new Date(vital.recordedAt).toLocaleDateString()}`}
              onPress={() => navigation.getParent()?.navigate('Vitals' as never)}
              showDivider={index < recentVitals.length - 1}
            />
          ))
        )}
      </SectionCard>

      {/* Medications Section */}
      <SectionCard style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Medications</Text>
          <TouchableOpacity
            onPress={() => {
              const appNavigator = navigation.getParent();
              if (appNavigator) {
                appNavigator.navigate('Medications' as never);
              }
            }}
          >
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>
        {ongoingMedications.length === 0 ? (
          <Text style={styles.emptySectionText}>No ongoing medications</Text>
        ) : (
          <>
            <Text style={styles.medicationCount}>
              {ongoingMedications.length} ongoing medication
              {ongoingMedications.length !== 1 ? 's' : ''}
            </Text>
            {ongoingMedications.slice(0, 2).map((med: Medication, index: number) => (
              <ListRow
                key={med.id}
                title={med.name}
                subtitle={
                  med.dose && med.doseUnit
                    ? `${med.dose} ${med.doseUnit} • ${med.frequency.replace('_', ' ')}`
                    : med.frequency.replace('_', ' ')
                }
                showDivider={index < Math.min(ongoingMedications.length, 2) - 1}
              />
            ))}
          </>
        )}
      </SectionCard>
    </Screen>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    marginBottom: spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  profileDetails: {
    flexDirection: 'row',
  },
  profileDetail: {
    ...typography.caption,
  },
  changeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  changeButtonText: {
    ...typography.bodyBold,
    color: '#007AFF',
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h2,
    fontSize: 18,
    flexShrink: 1,
    flex: 1,
    marginRight: spacing.md,
  },
  viewAllText: {
    ...typography.body,
    color: '#007AFF',
  },
  emptySectionText: {
    ...typography.caption,
    fontStyle: 'italic',
    paddingVertical: spacing.sm,
  },
  medicationCount: {
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  emptyStateButton: {
    width: '100%',
  },
});
