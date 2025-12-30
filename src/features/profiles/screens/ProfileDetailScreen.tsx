import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useProfileDetail } from '../hooks/useProfileDetail';

export const ProfileDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const profileId = (route.params as { profileId: string })?.profileId;
  const { data: profile, isLoading, error } = useProfileDetail(profileId);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load profile</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Name:</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.value} numberOfLines={2} ellipsizeMode="tail">
              {profile.name}
            </Text>
          </View>
        </View>
        {profile.notes && (
          <View style={styles.row}>
            <Text style={styles.label}>Notes:</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{profile.notes}</Text>
            </View>
          </View>
        )}
        {profile.tags && profile.tags.length > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Tags:</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{profile.tags.join(', ')}</Text>
            </View>
          </View>
        )}
        {profile.isDefault || profile.is_default ? (
          <View style={styles.row}>
            <Text style={styles.label}>Type:</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>Default Profile</Text>
            </View>
          </View>
        ) : null}
      </View>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => {
          (navigation as any).navigate('ProfileEditor', {
            mode: 'edit',
            profileId: profile.id,
          });
        }}
      >
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    color: '#666',
    flexShrink: 0,
    marginRight: 16,
  },
  valueContainer: {
    flex: 1,
    flexShrink: 1,
    alignItems: 'flex-end',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
    flexShrink: 1,
    flex: 1,
  },
  editButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});
