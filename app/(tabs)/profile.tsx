import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

import { supabase } from '@/lib/supabase';
import ElevatedContainer from '@/components/ElevatedContainer';
import { useAuthContext } from '@/hooks/use-auth-context';
import { useTranslation } from 'react-i18next';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
const AVATAR_BUCKET = 'images';

function formatDate(date: Date | null) {
  if (!date) return null;

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function toISODate(date: Date | null) {
  if (!date) return null;
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseStoredDate(dateString?: string | null) {
  if (!dateString) return null;
  const parsed = new Date(dateString);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export default function ProfileEditScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [fullName, setFullName] = useState('');
  const [picture, setPicture] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [lastDonated, setLastDonated] = useState<Date | null>(null);

  const { user } = useAuthContext();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!user) {
          setLoading(true);
          return;
        }

        const metadata = user.user.user_metadata ?? {};

        setFullName(metadata.full_name ?? metadata.name ?? '');
        setPicture(metadata.picture ?? '');
        setSelectedBloodGroup(metadata.blood_group ?? '');
        setLastDonated(parseStoredDate(metadata.last_blood_donated));
      } catch (error: any) {
        Alert.alert(
          t('profile.errors.title'),
          error?.message ?? t('profile.errors.loadFailed'),
        );
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [router, user]);

  const formattedDate = useMemo(() => formatDate(lastDonated), [lastDonated]);

  const onChangeDate = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS !== 'ios') {
      setShowDatePicker(false);
    }

    if (event.type === 'set' && date) {
      setLastDonated(date);
    }
  };

  const uploadAvatar = async (localUri: string) => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('User not found. Please log in again.');
    }

    const manipulated = await ImageManipulator.manipulateAsync(
      localUri,
      [{ resize: { width: 512 } }],
      {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
      },
    );

    const response = await fetch(manipulated.uri);
    const arrayBuffer = await response.arrayBuffer();

    const filePath = `${user.id}/avatar.jpg`;

    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error('Could not generate avatar URL.');
    }

    setPicture(data.publicUrl);

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        picture: data.publicUrl,
      },
    });

    if (updateError) {
      throw updateError;
    }

    return data.publicUrl;
  };

  const pickFromLibrary = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          t('profile.permissions.neededTitle'),
          t('profile.permissions.libraryMessage'),
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]?.uri) return;

      setUploadingImage(true);
      await uploadAvatar(result.assets[0].uri);
    } catch (error: any) {
      Alert.alert(
        t('profile.errors.uploadFailedTitle'),
        error?.message ?? t('profile.errors.uploadFailed'),
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          t('profile.permissions.neededTitle'),
          t('profile.permissions.cameraMessage'),
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]?.uri) return;

      setUploadingImage(true);
      await uploadAvatar(result.assets[0].uri);
    } catch (error: any) {
      Alert.alert(
        t('profile.errors.uploadFailedTitle'),
        error?.message ?? t('profile.errors.uploadFailed'),
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert(
        t('profile.errors.missingNameTitle'),
        t('profile.errors.missingNameMessage'),
      );
      return;
    }

    if (!selectedBloodGroup) {
      Alert.alert(
        t('profile.errors.missingBloodGroupTitle'),
        t('profile.errors.missingBloodGroupMessage'),
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        full_name: fullName.trim(),
        picture: picture || null,
        blood_group: selectedBloodGroup,
        last_blood_donated: toISODate(lastDonated),
      };

      const { data, error } = await supabase.auth.updateUser({
        data: payload,
      });

      if (error) throw error;
      if (!data.user) {
        throw new Error('Profile updated but no user was returned.');
      }

      Alert.alert(t('profile.success.title'), t('profile.success.updated'));
      router.back();
    } catch (error: any) {
      Alert.alert(
        t('profile.errors.saveFailedTitle'),
        error?.message ?? t('profile.errors.saveFailed'),
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-3 text-gray-500">{t('profile.loading')}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="mt-12 px-6">
        <Text className="text-3xl font-bold text-black">{t('profile.title')}</Text>
        <Text className="mt-2 text-base text-gray-500">{t('profile.subtitle')}</Text>
      </View>

      <ElevatedContainer className="mx-6 mt-6 px-5 py-6">
        <Text className="text-xl font-bold text-black">{t('profile.pictureTitle')}</Text>

        <View className="mt-5 items-center">
          <Image
            source={picture ? { uri: picture } : require('@/assets/images/profile.jpg')}
            className="h-28 w-28 rounded-full border-4 border-white"
            resizeMode="cover"
          />

          {uploadingImage && (
            <View className="mt-3 flex-row items-center">
              <ActivityIndicator size="small" color="#2563EB" />
              <Text className="ml-2 text-sm text-gray-500">
                {t('profile.uploadingImage')}
              </Text>
            </View>
          )}
        </View>

        <View className="mt-6 flex-row gap-3">
          <Pressable
            onPress={pickFromLibrary}
            disabled={uploadingImage}
            className={`flex-1 flex-row items-center justify-center rounded-xl px-4 py-4 ${
              uploadingImage ? 'bg-blue-300' : 'bg-blue-600'
            }`}
          >
            <FontAwesome5 name="images" size={16} color="white" />
            <Text className="ml-2 text-base font-semibold text-white">
              {t('profile.selectFromDevice')}
            </Text>
          </Pressable>

          <Pressable
            onPress={takePhoto}
            disabled={uploadingImage}
            className="flex-1 flex-row items-center justify-center rounded-xl border border-blue-600 bg-white px-4 py-4"
          >
            <FontAwesome5 name="camera" size={16} color="#2563EB" />
            <Text className="ml-2 text-base font-semibold text-blue-600">
              {t('profile.takePicture')}
            </Text>
          </Pressable>
        </View>
      </ElevatedContainer>

      <ElevatedContainer className="mx-6 mt-6 px-5 py-6">
        <Text className="text-xl font-bold text-black">{t('profile.personalInfo')}</Text>

        <Text className="mt-5 text-sm font-medium text-gray-500">
          {t('profile.fullName')}
        </Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder={t('profile.fullNamePlaceholder')}
          placeholderTextColor="#9CA3AF"
          className="mt-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-base text-gray-900"
        />
      </ElevatedContainer>

      <ElevatedContainer className="mx-6 mt-6 px-5 py-6">
        <Text className="text-xl font-bold text-black">
          {t('profile.bloodGroupTitle')}
        </Text>
        <Text className="mt-1 text-sm text-gray-500">
          {t('profile.bloodGroupSubtitle')}
        </Text>

        <View className="mt-5 flex-row flex-wrap gap-3">
          {bloodGroups.map((group) => {
            const active = selectedBloodGroup === group;

            return (
              <Pressable
                key={group}
                onPress={() => setSelectedBloodGroup(group)}
                className={`min-w-[72px] items-center justify-center rounded-xl border px-5 py-3 ${
                  active ? 'border-blue-600 bg-blue-600' : 'border-gray-200 bg-white'
                }`}
              >
                <Text
                  className={`text-base font-bold ${
                    active ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  {group}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ElevatedContainer>

      <ElevatedContainer className="mx-6 mt-6 px-5 py-6">
        <Text className="text-xl font-bold text-black">{t('profile.lastDonation')}</Text>

        <Pressable
          onPress={() => setShowDatePicker(true)}
          className="mt-5 w-full flex-row items-center justify-between rounded-xl border-2 border-blue-400 bg-gray-100 px-4 py-4"
        >
          <Text className="text-base font-semibold text-gray-800">
            {lastDonated ? formattedDate : t('profile.selectDate')}
          </Text>
          <FontAwesome5 name="calendar-alt" size={18} color="#6B7280" />
        </Pressable>

        <Text className="mt-4 text-base font-semibold text-gray-500">
          {t('profile.lastDonationPrompt')}
        </Text>

        <Text className="mt-1 text-sm text-gray-400">
          {t('profile.lastDonationHint')}
        </Text>
      </ElevatedContainer>

      {showDatePicker && (
        <DateTimePicker
          value={lastDonated ?? new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeDate}
          maximumDate={new Date()}
        />
      )}

      <View className="mx-6 mt-6 gap-4">
        <Pressable
          onPress={handleSave}
          disabled={saving || uploadingImage}
          className={`items-center rounded-md py-4 ${
            saving || uploadingImage ? 'bg-blue-300' : 'bg-blue-600'
          }`}
        >
          <Text className="text-base font-semibold text-white">
            {saving ? t('profile.saving') : t('profile.saveChanges')}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          disabled={saving || uploadingImage}
          className="items-center rounded-md border border-gray-200 py-4"
        >
          <Text className="text-base font-semibold text-gray-700">
            {t('common.actions.cancel')}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
