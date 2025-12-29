import { EmptyState } from '@components/EmptyState';
import { PrimaryButton } from '@components/PrimaryButton';
import { Screen } from '@components/Screen';
import { SectionCard } from '@components/SectionCard';
import { useNavigation } from '@react-navigation/native';
import { useActiveProfileStore } from '@store/activeProfile.store';
import { spacing, typography } from '@theme';
import React, { useEffect } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDeleteProfile } from '../hooks/useDeleteProfile';
import { useProfilesList } from '../hooks/useProfilesList';
import type { PersonProfile } from '../types';

export const ProfilesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { data, isLoading, error } = useProfilesList();
  const deleteProfile = useDeleteProfile();
  const { activeProfileId, setActiveProfileId } = useActiveProfileStore();

  useEffect(() => {
    if (data?.items && data.items.length > 0 && !activeProfileId) {
      setActiveProfileId(data.items[0].id);
    }
  }, [data, activeProfileId, setActiveProfileId]);

  const handleDelete = (profile: PersonProfile) => {
    Alert.alert(
      'Delete Profile',
      `Are you sure you want to delete ${profile.fullName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteProfile.mutate(profile.id),
        },
      ]
    );
  };

  const handleSelectProfile = (profileId: string) => {
    setActiveProfileId(profileId);
    (navigation as any).navigate('ProfileDetail', { profileId });
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
    return (
      <Screen>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Failed to load profiles</Text>
        </View>
      </Screen>
    );
  }

  const renderProfileItem = ({ item }: { item: PersonProfile }) => (
    <SectionCard
      style={StyleSheet.flatten([
        styles.profileItem,
        activeProfileId === item.id && styles.activeProfileItem,
      ])}
    >
      <View style={styles.profileContent}>
        <TouchableOpacity
          style={styles.profileInfo}
          onPress={() => handleSelectProfile(item.id)}
        >
          <Text style={styles.profileName}>{item.fullName}</Text>
          <Text style={styles.profileRelation}>{item.relationToAccount}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </SectionCard>
  );

  return (
    <Screen>
      <FlatList
        data={data?.items || []}
        renderItem={renderProfileItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="👤"
            title="No profiles yet"
            description="Profiles help you keep health records separate for each family member."
            actionLabel="Add Profile"
            buttonStyle={styles.emptyStateButton}
            onAction={() => (navigation as any).navigate('ProfileEditor', { mode: 'create' })}
          />
        }
      />
      {data?.items && data.items.length > 0 && (
        <View style={styles.buttonContainer}>
          <PrimaryButton
            label="+ Add Profile"
            onPress={() => (navigation as any).navigate('ProfileEditor', { mode: 'create' })}
          />
        </View>
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
  listContent: {
    padding: spacing.md,
  },
  profileItem: {
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeProfileItem: {
    borderColor: '#007AFF',
  },
  profileContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.h2,
    fontSize: 18,
    marginBottom: spacing.xs,
  },
  profileRelation: {
    ...typography.caption,
  },
  deleteButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  buttonContainer: {
    padding: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: '#FF3B30',
  },
  emptyStateButton: {
    width: '100%',
  },
});
