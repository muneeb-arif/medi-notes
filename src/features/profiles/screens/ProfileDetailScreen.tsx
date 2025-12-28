import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useProfileDetail } from '../hooks/useProfileDetail';
import { useUpdateProfileSettings } from '../hooks/useUpdateProfileSettings';

export const ProfileDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const profileId = (route.params as { profileId: string })?.profileId;
  const { data: profile, isLoading, error } = useProfileDetail(profileId);
  const updateSettings = useUpdateProfileSettings(profileId);

  const handleToggleEmergencyAccess = (value: boolean) => {
    if (profile) {
      updateSettings.mutate({
        emergencyAccessEnabled: value,
        doctorSharingEnabled: profile.doctorSharingEnabled,
      });
    }
  };

  const handleToggleDoctorSharing = (value: boolean) => {
    if (profile) {
      updateSettings.mutate({
        emergencyAccessEnabled: profile.emergencyAccessEnabled,
        doctorSharingEnabled: value,
      });
    }
  };

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
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Name:</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.value} numberOfLines={2} ellipsizeMode="tail">
              {profile.fullName}
            </Text>
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date of Birth:</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>{profile.dateOfBirth}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Gender:</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>{profile.gender}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Relation:</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>{profile.relationToAccount}</Text>
          </View>
        </View>
        {profile.bloodType && (
          <View style={styles.row}>
            <Text style={styles.label}>Blood Type:</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{profile.bloodType}</Text>
            </View>
          </View>
        )}
        {profile.heightCm && (
          <View style={styles.row}>
            <Text style={styles.label}>Height:</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{profile.heightCm} cm</Text>
            </View>
          </View>
        )}
        {profile.weightKg && (
          <View style={styles.row}>
            <Text style={styles.label}>Weight:</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{profile.weightKg} kg</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        {profile.emergencyContacts.map((contact, index) => (
          <View key={index} style={styles.contactCard}>
            <Text style={styles.contactName}>{contact.name}</Text>
            <Text style={styles.contactRelation}>{contact.relation}</Text>
            <Text style={styles.contactPhone}>{contact.phone}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy Settings</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Emergency Access</Text>
            <Text style={styles.settingDescription}>
              Allow emergency access without login
            </Text>
          </View>
          <Switch
            value={profile.emergencyAccessEnabled}
            onValueChange={handleToggleEmergencyAccess}
            disabled={updateSettings.isPending}
          />
        </View>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Doctor Sharing</Text>
            <Text style={styles.settingDescription}>
              Allow doctors to view this profile
            </Text>
          </View>
          <Switch
            value={profile.doctorSharingEnabled}
            onValueChange={handleToggleDoctorSharing}
            disabled={updateSettings.isPending}
          />
        </View>
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
  contactCard: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactRelation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
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

