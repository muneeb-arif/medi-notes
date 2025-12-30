import { ListRow } from '@components/ListRow';
import { SectionCard } from '@components/SectionCard';
import { useProfilesList } from '@features/profiles/hooks/useProfilesList';
import type { PersonProfile } from '@features/profiles/types';
import { useActiveProfileStore } from '@store/activeProfile.store';
import { spacing, typography } from '@theme';
import React from 'react';
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface ProfileSwitchSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const ProfileSwitchSheet: React.FC<ProfileSwitchSheetProps> = ({
  visible,
  onClose,
}) => {
  const { data: profilesData, isLoading } = useProfilesList();
  const { activeProfileId, setActiveProfileId } = useActiveProfileStore();

  const profiles = profilesData?.items || [];

  const handleSelectProfile = async (profile: PersonProfile) => {
    await setActiveProfileId(profile.id);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <View style={styles.handle} />
            <Text style={styles.title}>Switch Profile</Text>
            
            {isLoading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" />
              </View>
            ) : profiles.length === 0 ? (
              <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>No profiles available</Text>
              </View>
            ) : (
              <SectionCard style={styles.profilesList}>
                {profiles.map((profile, index) => (
                  <ListRow
                    key={profile.id}
                    title={profile.name}
                    subtitle={profile.notes}
                    rightAccessory={
                      activeProfileId === profile.id ? (
                        <Text style={styles.activeBadge}>Current</Text>
                      ) : null
                    }
                    onPress={() => handleSelectProfile(profile)}
                    showDivider={index < profiles.length - 1}
                  />
                ))}
              </SectionCard>
            )}
          </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#C7C7CC',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    fontSize: 20,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  centerContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...typography.body,
    color: '#8E8E93',
  },
  profilesList: {
    marginHorizontal: spacing.md,
  },
  activeBadge: {
    ...typography.caption,
    color: '#007AFF',
    fontWeight: '600',
    width: 55,
  },
});

