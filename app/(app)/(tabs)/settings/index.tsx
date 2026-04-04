import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useAuthContext } from '@/hooks/use-auth-context';
import { supabase } from '@/lib/supabase';

type SettingsRowProps = {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
};

type PreferencesState = {
  emergency_alerts: boolean;
  nearby_alerts: boolean;
  donation_reminders: boolean;
  eligibility_reminders: boolean;
  share_location: boolean;
  hospital_contact: boolean;
  preferred_centers?: string[];
  default_view: 'map' | 'list';
  kyc_status?: 'pending' | 'verified' | 'rejected' | null;
};

function SettingsRow({
  icon,
  title,
  subtitle,
  right,
  onPress,
  danger = false,
}: SettingsRowProps) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center px-4 py-4">
      <View className="mr-4 h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
        {icon}
      </View>

      <View className="flex-1">
        <Text
          className={`text-base font-semibold ${
            danger ? 'text-red-600' : 'text-gray-900'
          }`}
        >
          {title}
        </Text>
        {subtitle ? <Text className="mt-1 text-sm text-gray-500">{subtitle}</Text> : null}
      </View>

      {right ?? <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mt-6">
      <Text className="mb-2 px-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
        {title}
      </Text>
      <View className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        {children}
      </View>
    </View>
  );
}

const DEFAULT_PREFS: PreferencesState = {
  emergency_alerts: true,
  nearby_alerts: true,
  donation_reminders: true,
  eligibility_reminders: true,
  share_location: true,
  hospital_contact: true,
  preferred_centers: [],
  default_view: 'map',
  kyc_status: 'pending',
};

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuthContext();

  const [loading, setLoading] = useState(true);
  const [syncingKey, setSyncingKey] = useState<keyof PreferencesState | null>(null);
  const [prefs, setPrefs] = useState<PreferencesState>(DEFAULT_PREFS);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) throw error;

        const metadata = user?.user_metadata ?? {};

        setPrefs({
          emergency_alerts:
            metadata.settings_emergency_alerts ?? DEFAULT_PREFS.emergency_alerts,
          nearby_alerts: metadata.settings_nearby_alerts ?? DEFAULT_PREFS.nearby_alerts,
          donation_reminders:
            metadata.settings_donation_reminders ?? DEFAULT_PREFS.donation_reminders,
          eligibility_reminders:
            metadata.settings_eligibility_reminders ??
            DEFAULT_PREFS.eligibility_reminders,
          share_location:
            metadata.settings_share_location ?? DEFAULT_PREFS.share_location,
          hospital_contact:
            metadata.settings_hospital_contact ?? DEFAULT_PREFS.hospital_contact,
          preferred_centers:
            metadata.settings_preferred_centers ?? DEFAULT_PREFS.preferred_centers,
          default_view: metadata.settings_default_view ?? DEFAULT_PREFS.default_view,
          kyc_status: metadata.kyc_status ?? DEFAULT_PREFS.kyc_status,
        });
      } catch (error: any) {
        console.error('Failed to load settings:', error);
        Alert.alert('Error', error?.message ?? 'Could not load settings.');
      } finally {
        setLoading(false);
      }
    };

    void loadSettings();
  }, []);

  const updatePreference = async <K extends keyof PreferencesState>(
    key: K,
    value: PreferencesState[K],
  ) => {
    const previous = prefs;

    const next = {
      ...prefs,
      [key]: value,
    };

    setPrefs(next);
    setSyncingKey(key);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          settings_emergency_alerts: next.emergency_alerts,
          settings_nearby_alerts: next.nearby_alerts,
          settings_donation_reminders: next.donation_reminders,
          settings_eligibility_reminders: next.eligibility_reminders,
          settings_share_location: next.share_location,
          settings_hospital_contact: next.hospital_contact,
          settings_preferred_centers: next.preferred_centers,
          settings_default_view: next.default_view,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      setPrefs(previous);
      Alert.alert('Update failed', error?.message ?? 'Could not save setting.');
    } finally {
      setSyncingKey(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error: any) {
      Alert.alert('Logout failed', error?.message ?? 'Could not log out.');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This should call a secure backend or admin flow. Do not delete accounts directly from the client with elevated privileges.',
    );
  };

  const kycStatusLabel =
    prefs.kyc_status === 'verified'
      ? 'Verified'
      : prefs.kyc_status === 'rejected'
        ? 'Rejected'
        : 'Pending';

  const kycStatusColor =
    prefs.kyc_status === 'verified'
      ? 'text-green-600'
      : prefs.kyc_status === 'rejected'
        ? 'text-red-600'
        : 'text-amber-600';

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-3 text-gray-500">Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50 pb-10"
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="mb-2">
        <Text className="text-3xl font-bold text-gray-900">Settings</Text>
        <Text className="mt-2 text-base text-gray-500">
          Manage preferences, privacy, verification, and support.
        </Text>
      </View>

      {syncingKey ? (
        <View className="mb-2 mt-2 flex-row items-center px-1">
          <ActivityIndicator size="small" color="#2563EB" />
          <Text className="ml-2 text-sm text-gray-500">Saving changes…</Text>
        </View>
      ) : null}

      <Section title="Verification">
        <SettingsRow
          icon={<FontAwesome5 name="id-card" size={18} color="#2563EB" />}
          title="Fill Up KYC"
          subtitle="Verify your identity and unlock more trust features"
          onPress={() => router.push('/settings/kyc')}
          right={
            <View className="flex-row items-center gap-2">
              <Text className={`text-sm font-semibold ${kycStatusColor}`}>
                {kycStatusLabel}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          }
        />
      </Section>

      <Section title="Notifications">
        <SettingsRow
          icon={<Ionicons name="notifications-outline" size={20} color="#2563EB" />}
          title="Emergency Blood Requests"
          subtitle="Get alerts for urgent blood needs"
          right={
            <Switch
              value={prefs.emergency_alerts}
              onValueChange={(value) => updatePreference('emergency_alerts', value)}
            />
          }
        />
        <View className="h-px bg-gray-100" />
        <SettingsRow
          icon={<Ionicons name="location-outline" size={20} color="#2563EB" />}
          title="Nearby Requests"
          subtitle="Receive alerts near your location"
          right={
            <Switch
              value={prefs.nearby_alerts}
              onValueChange={(value) => updatePreference('nearby_alerts', value)}
            />
          }
        />
        <View className="h-px bg-gray-100" />
        <SettingsRow
          icon={<FontAwesome5 name="calendar-check" size={18} color="#2563EB" />}
          title="Donation Reminders"
          subtitle="Reminders to keep your donation schedule on track"
          right={
            <Switch
              value={prefs.donation_reminders}
              onValueChange={(value) => updatePreference('donation_reminders', value)}
            />
          }
        />
        <View className="h-px bg-gray-100" />
        <SettingsRow
          icon={<Ionicons name="time-outline" size={20} color="#2563EB" />}
          title="Eligibility Reminders"
          subtitle="Get notified when you can donate again"
          right={
            <Switch
              value={prefs.eligibility_reminders}
              onValueChange={(value) => updatePreference('eligibility_reminders', value)}
            />
          }
        />
      </Section>

      <Section title="Privacy & Safety">
        <SettingsRow
          icon={<Ionicons name="navigate-outline" size={20} color="#2563EB" />}
          title="Share Location"
          subtitle="Used for nearby requests and centers"
          right={
            <Switch
              value={prefs.share_location}
              onValueChange={(value) => updatePreference('share_location', value)}
            />
          }
        />
        <View className="h-px bg-gray-100" />
        <SettingsRow
          icon={<Ionicons name="call-outline" size={20} color="#2563EB" />}
          title="Allow Hospitals to Contact Me"
          subtitle="Let verified centers reach you for urgent needs"
          right={
            <Switch
              value={prefs.hospital_contact}
              onValueChange={(value) => updatePreference('hospital_contact', value)}
            />
          }
        />
      </Section>

      <Section title="Donation Preferences">
        <SettingsRow
          icon={<FontAwesome5 name="hospital" size={18} color="#2563EB" />}
          title="Preferred Donation Centers"
          subtitle="Choose centers you trust most"
          onPress={() => Alert.alert('Coming soon')}
        />
        <View className="h-px bg-gray-100" />
        <SettingsRow
          icon={<Ionicons name="map-outline" size={20} color="#2563EB" />}
          title="Default View"
          subtitle="Choose your preferred request browsing mode"
          onPress={() =>
            Alert.alert('Default View', 'Choose your preferred view.', [
              {
                text: 'Map',
                onPress: () => updatePreference('default_view', 'map'),
              },
              {
                text: 'List',
                onPress: () => updatePreference('default_view', 'list'),
              },
              {
                text: 'Cancel',
                style: 'cancel',
              },
            ])
          }
          right={
            <Text className="text-sm font-medium capitalize text-gray-500">
              {prefs.default_view}
            </Text>
          }
        />
      </Section>

      <Section title="Credits & Trust">
        <SettingsRow
          icon={<FontAwesome5 name="award" size={18} color="#2563EB" />}
          title="Credit Score Details"
          subtitle="See how trust and rewards work"
          onPress={() => Alert.alert('Coming soon')}
        />
      </Section>

      <Section title="Support & Legal">
        <SettingsRow
          icon={<Ionicons name="help-circle-outline" size={20} color="#2563EB" />}
          title="Help Center"
          onPress={() => Alert.alert('Coming soon')}
        />
        <View className="h-px bg-gray-100" />
        <SettingsRow
          icon={<Ionicons name="chatbox-ellipses-outline" size={20} color="#2563EB" />}
          title="Contact Support"
          onPress={() => Alert.alert('Coming soon')}
        />
        <View className="h-px bg-gray-100" />
        <SettingsRow
          icon={<Ionicons name="document-text-outline" size={20} color="#2563EB" />}
          title="Privacy Policy"
          onPress={() => Alert.alert('Coming soon')}
        />
        <View className="h-px bg-gray-100" />
        <SettingsRow
          icon={<Ionicons name="shield-checkmark-outline" size={20} color="#2563EB" />}
          title="Terms & Conditions"
          onPress={() => Alert.alert('Coming soon')}
        />
        <View className="h-px bg-gray-100" />
        <SettingsRow
          icon={<Ionicons name="information-circle-outline" size={20} color="#2563EB" />}
          title="About App"
          subtitle="Version 1.0.0"
          onPress={() => Alert.alert('Coming soon')}
        />
      </Section>

      <Section title="Account">
        <SettingsRow
          icon={<Ionicons name="log-out-outline" size={20} color="#DC2626" />}
          title="Logout"
          danger
          onPress={handleLogout}
          right={null}
        />
        <View className="h-px bg-gray-100" />
        <SettingsRow
          icon={<Ionicons name="trash-outline" size={20} color="#DC2626" />}
          title="Delete Account"
          subtitle="Permanently remove your account and data"
          danger
          onPress={handleDeleteAccount}
          right={null}
        />
      </Section>
    </ScrollView>
  );
}
