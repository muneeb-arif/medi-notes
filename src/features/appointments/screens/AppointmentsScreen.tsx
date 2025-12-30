import { EmptyState } from '@components/EmptyState';
import { Screen } from '@components/Screen';
import { useNavigation } from '@react-navigation/native';
import { useActiveProfileStore } from '@store/activeProfile.store';
import { typography } from '@theme';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAppointmentsList } from '../hooks/useAppointmentsList';
import { useDeleteAppointment } from '../hooks/useDeleteAppointment';
import type { Appointment } from '../types';

type FilterType = 'upcoming' | 'past' | 'all';

export const AppointmentsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { activeProfileId } = useActiveProfileStore();
  const [filter, setFilter] = useState<FilterType>('upcoming');
  const { data, isLoading, error } = useAppointmentsList(activeProfileId);
  const deleteAppointment = useDeleteAppointment();

  const { upcoming, past } = useMemo(() => {
    if (!data?.items) return { upcoming: [], past: [] };

    const now = new Date();
    const upcomingList: Appointment[] = [];
    const pastList: Appointment[] = [];

    data.items.forEach((apt) => {
      const startDate = new Date(apt.startAt);
      if (startDate >= now && apt.status === 'scheduled') {
        upcomingList.push(apt);
      } else {
        pastList.push(apt);
      }
    });

    // Sort upcoming: soonest first
    upcomingList.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

    // Sort past: newest first
    pastList.sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());

    return { upcoming: upcomingList, past: pastList };
  }, [data]);

  const filteredAppointments = useMemo(() => {
    if (filter === 'upcoming') return upcoming;
    if (filter === 'past') return past;
    return [...upcoming, ...past];
  }, [filter, upcoming, past]);

  const handleDelete = (appointment: Appointment) => {
    Alert.alert(
      'Delete Appointment',
      `Are you sure you want to delete "${appointment.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAppointment.mutate(appointment.id),
        },
      ]
    );
  };

  const handleSelectAppointment = (appointment: Appointment) => {
    navigation.navigate('AppointmentEditor' as never, {
      appointmentId: appointment.id,
      mode: 'edit',
    } as never);
  };

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
        </View>
      </Screen>
    );
  }

  if (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message: string }).message)
          : 'Failed to load appointments';
    return (
      <Screen>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Failed to load appointments</Text>
          {__DEV__ && (
            <Text style={[styles.errorText, { fontSize: 12, marginTop: 8, textAlign: 'center' }]}>
              {errorMessage}
            </Text>
          )}
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'upcoming' && styles.filterButtonActive]}
          onPress={() => setFilter('upcoming')}
        >
          <Text
            style={[styles.filterText, filter === 'upcoming' && styles.filterTextActive]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'past' && styles.filterButtonActive]}
          onPress={() => setFilter('past')}
        >
          <Text style={[styles.filterText, filter === 'past' && styles.filterTextActive]}>
            Past
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
      </View>

      {filteredAppointments.length === 0 ? (
        <EmptyState
          icon="📅"
          title="No appointments yet"
          description="Track upcoming visits and past consultations."
          actionLabel="Add Appointment"
          onAction={() =>
            navigation.navigate('AppointmentEditor' as never, {
              mode: 'create',
            } as never)
          }
        />
      ) : (
        <>
          <FlatList
            data={filteredAppointments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.appointmentItem}
                onPress={() => handleSelectAppointment(item)}
                onLongPress={() => handleDelete(item)}
              >
                <View style={styles.appointmentHeader}>
                  <Text style={styles.appointmentTitle}>{item.title}</Text>
                  <Text style={styles.appointmentStatus}>{item.status}</Text>
                </View>
                <Text style={styles.appointmentDate}>
                  {new Date(item.startAt).toLocaleString()}
                </Text>
                {item.doctorName && (
                  <Text style={styles.appointmentDetail}>Dr. {item.doctorName}</Text>
                )}
                {item.facility && (
                  <Text style={styles.appointmentDetail}>{item.facility}</Text>
                )}
                {item.location && (
                  <Text style={styles.appointmentDetail}>{item.location}</Text>
                )}
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContent}
          />
          <TouchableOpacity
            style={styles.fab}
            onPress={() =>
              navigation.navigate('AppointmentEditor' as never, {
                mode: 'create',
              } as never)
            }
          >
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#E5E5EA',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#000000',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  appointmentItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  appointmentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  appointmentStatus: {
    fontSize: 12,
    color: '#8E8E93',
    textTransform: 'capitalize',
  },
  appointmentDate: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  appointmentDetail: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  errorText: {
    ...typography.body,
    color: '#FF3B30',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

