import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';

import ElevatedContainer from '@/components/ElevatedContainer';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/hooks/use-auth-context';
import { useTranslation } from 'react-i18next';

const KYC_BUCKET = 'kyc';

function formatDisplayDate(date: Date | null) {
  if (!date) return null;

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatISODate(date: Date | null) {
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

function UploadBlock({
  title,
  imageUrl,
  uploading,
  onSelect,
  onCamera,
  circular = false,
}: {
  title: string;
  imageUrl: string;
  uploading: boolean;
  onSelect: () => void;
  onCamera: () => void;
  circular?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <View className="mt-5">
      <Text className="text-sm font-medium text-gray-500">{title}</Text>

      <View className="mt-2 items-center rounded-xl border border-gray-200 bg-gray-50 p-4">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className={circular ? 'h-40 w-40 rounded-full' : 'h-40 w-full rounded-lg'}
            resizeMode="cover"
          />
        ) : (
          <Text className="text-gray-400">{t('kyc.documents.none')}</Text>
        )}

        <View className="mt-4 flex-row gap-3">
          <Pressable
            onPress={onSelect}
            disabled={uploading}
            className={`rounded-xl px-4 py-3 ${uploading ? 'bg-blue-300' : 'bg-blue-600'}`}
          >
            <Text className="font-semibold text-white">{t('kyc.documents.select')}</Text>
          </Pressable>

          <Pressable
            onPress={onCamera}
            disabled={uploading}
            className="rounded-xl border border-blue-600 bg-white px-4 py-3"
          >
            <Text className="font-semibold text-blue-600">
              {t('kyc.documents.camera')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function KYCScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDobPicker, setShowDobPicker] = useState(false);

  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState<Date | null>(null);
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  const [idFront, setIdFront] = useState('');
  const [idBack, setIdBack] = useState('');
  const [selfie, setSelfie] = useState('');
  const { user } = useAuthContext();

  useEffect(() => {
    const loadKyc = async () => {
      try {
        if (!user) return;

        const metadata = user.user.user_metadata ?? {};

        setFullName(metadata.full_name ?? metadata.name ?? '');
        setDob(parseStoredDate(metadata.kyc_dob));
        setGender(metadata.kyc_gender ?? '');
        setPhone(metadata.phone ?? metadata.kyc_phone ?? '');
        setAddress(metadata.kyc_address ?? '');
        setIdNumber(metadata.kyc_id_number ?? '');
        setEmergencyName(metadata.kyc_emergency_name ?? '');
        setEmergencyPhone(metadata.kyc_emergency_phone ?? '');
        setIdFront(metadata.kyc_id_front ?? '');
        setIdBack(metadata.kyc_id_back ?? '');
        setSelfie(metadata.kyc_selfie ?? '');
      } catch (error: any) {
        Alert.alert(t('kyc.errors.title'), error?.message ?? t('kyc.errors.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    void loadKyc();
  }, [router, user]);

  const onChangeDob = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS !== 'ios') {
      setShowDobPicker(false);
    }

    if (event.type === 'set' && date) {
      setDob(date);
    }
  };

  const uploadKycImage = async (
    localUri: string,
    type: 'id-front' | 'id-back' | 'selfie',
  ) => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('User not found. Please log in again.');
    }

    const manipulated = await ImageManipulator.manipulateAsync(
      localUri,
      [{ resize: { width: 1280 } }],
      {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
      },
    );

    const response = await fetch(manipulated.uri);
    const arrayBuffer = await response.arrayBuffer();

    const filePath = `${user.id}/${type}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from(KYC_BUCKET)
      .upload(filePath, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from(KYC_BUCKET).getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error('Could not generate file URL.');
    }

    return data.publicUrl;
  };

  const pickImage = async (
    type: 'id-front' | 'id-back' | 'selfie',
    useCamera = false,
  ) => {
    try {
      setUploading(true);

      const permission = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          t('kyc.permissions.neededTitle'),
          useCamera
            ? t('kyc.permissions.cameraMessage')
            : t('kyc.permissions.libraryMessage'),
        );
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
          });

      if (result.canceled || !result.assets?.[0]?.uri) return;

      const uploadedUrl = await uploadKycImage(result.assets[0].uri, type);

      if (type === 'id-front') setIdFront(uploadedUrl);
      if (type === 'id-back') setIdBack(uploadedUrl);
      if (type === 'selfie') setSelfie(uploadedUrl);
    } catch (error: any) {
      Alert.alert(
        t('kyc.errors.uploadFailedTitle'),
        error?.message ?? t('kyc.errors.uploadFailed'),
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert(t('kyc.errors.missingNameTitle'), t('kyc.errors.missingNameMessage'));
      return;
    }

    if (!dob) {
      Alert.alert(t('kyc.errors.missingDobTitle'), t('kyc.errors.missingDobMessage'));
      return;
    }

    if (!phone.trim()) {
      Alert.alert(t('kyc.errors.missingPhoneTitle'), t('kyc.errors.missingPhoneMessage'));
      return;
    }

    if (!address.trim()) {
      Alert.alert(
        t('kyc.errors.missingAddressTitle'),
        t('kyc.errors.missingAddressMessage'),
      );
      return;
    }

    if (!idNumber.trim()) {
      Alert.alert(t('kyc.errors.missingIdTitle'), t('kyc.errors.missingIdMessage'));
      return;
    }

    if (!idFront || !idBack || !selfie) {
      Alert.alert(
        t('kyc.errors.missingDocumentsTitle'),
        t('kyc.errors.missingDocumentsMessage'),
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        full_name: fullName.trim(),
        phone: phone.trim(),
        kyc_dob: formatISODate(dob),
        kyc_gender: gender.trim() || null,
        kyc_phone: phone.trim(),
        kyc_address: address.trim(),
        kyc_id_number: idNumber.trim(),
        kyc_emergency_name: emergencyName.trim() || null,
        kyc_emergency_phone: emergencyPhone.trim() || null,
        kyc_id_front: idFront,
        kyc_id_back: idBack,
        kyc_selfie: selfie,
        kyc_status: 'verified',
        kyc_submitted_at: new Date().toISOString(),
      };

      const { data, error } = await supabase.auth.updateUser({
        data: payload,
      });

      if (error) throw error;
      if (!data.user) {
        throw new Error('KYC saved but user data was not returned.');
      }

      Alert.alert(t('kyc.success.title'), t('kyc.success.submitted'));
      router.back();
    } catch (error: any) {
      Alert.alert(
        t('kyc.errors.saveFailedTitle'),
        error?.message ?? t('kyc.errors.saveFailed'),
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-3 text-gray-500">{t('kyc.loading')}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ padding: 16, paddingVertical: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="mb-2 flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="mr-5 h-10 w-10 items-center justify-center rounded-full bg-gray-100"
        >
          <Ionicons name="chevron-back" size={20} color="#111827" />
        </Pressable>

        <View className="flex-1">
          <Text className="text-3xl font-bold text-black">{t('kyc.title')}</Text>
          <Text className="mt-1 text-base text-gray-500">{t('kyc.subtitle')}</Text>
        </View>
      </View>

      <ElevatedContainer className="mt-6 px-5 py-6">
        <Text className="text-xl font-bold text-black">{t('kyc.sections.personal')}</Text>

        <Text className="mt-5 text-sm font-medium text-gray-500">
          {t('kyc.fields.fullName')}
        </Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder={t('kyc.placeholders.fullName')}
          placeholderTextColor="#9CA3AF"
          className="mt-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-base text-gray-900"
        />

        <Text className="mt-5 text-sm font-medium text-gray-500">
          {t('kyc.fields.dob')}
        </Text>
        <Pressable
          onPress={() => setShowDobPicker(true)}
          className="mt-2 flex-row items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-4"
        >
          <Text className="text-base text-gray-900">
            {dob ? formatDisplayDate(dob) : t('kyc.placeholders.dob')}
          </Text>
          <FontAwesome5 name="calendar-alt" size={18} color="#6B7280" />
        </Pressable>

        <Text className="mt-5 text-sm font-medium text-gray-500">
          {t('kyc.fields.gender')}
        </Text>
        <TextInput
          value={gender}
          onChangeText={setGender}
          placeholder={t('kyc.placeholders.gender')}
          placeholderTextColor="#9CA3AF"
          className="mt-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-base text-gray-900"
        />

        <Text className="mt-5 text-sm font-medium text-gray-500">
          {t('kyc.fields.phoneNumber')}
        </Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder={t('kyc.placeholders.phone')}
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          className="mt-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-base text-gray-900"
        />

        <Text className="mt-5 text-sm font-medium text-gray-500">
          {t('kyc.fields.address')}
        </Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder={t('kyc.placeholders.address')}
          placeholderTextColor="#9CA3AF"
          multiline
          textAlignVertical="top"
          className="mt-2 min-h-[96px] rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-base text-gray-900"
        />

        <Text className="mt-5 text-sm font-medium text-gray-500">
          {t('kyc.fields.idNumber')}
        </Text>
        <TextInput
          value={idNumber}
          onChangeText={setIdNumber}
          placeholder={t('kyc.placeholders.idNumber')}
          placeholderTextColor="#9CA3AF"
          className="mt-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-base text-gray-900"
        />
      </ElevatedContainer>

      <ElevatedContainer className="mt-6 px-5 py-6">
        <Text className="text-xl font-bold text-black">
          {t('kyc.sections.emergency')}
        </Text>

        <Text className="mt-5 text-sm font-medium text-gray-500">
          {t('kyc.fields.name')}
        </Text>
        <TextInput
          value={emergencyName}
          onChangeText={setEmergencyName}
          placeholder={t('kyc.placeholders.emergencyName')}
          placeholderTextColor="#9CA3AF"
          className="mt-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-base text-gray-900"
        />

        <Text className="mt-5 text-sm font-medium text-gray-500">
          {t('kyc.fields.phoneNumber')}
        </Text>
        <TextInput
          value={emergencyPhone}
          onChangeText={setEmergencyPhone}
          placeholder={t('kyc.placeholders.emergencyPhone')}
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          className="mt-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-base text-gray-900"
        />
      </ElevatedContainer>

      <ElevatedContainer className="mt-6 px-5 py-6">
        <Text className="text-xl font-bold text-black">
          {t('kyc.sections.documents')}
        </Text>
        <Text className="mt-2 text-sm text-gray-500">{t('kyc.documents.hint')}</Text>

        <UploadBlock
          title={t('kyc.documents.idFront')}
          imageUrl={idFront}
          uploading={uploading}
          onSelect={() => pickImage('id-front', false)}
          onCamera={() => pickImage('id-front', true)}
        />

        <UploadBlock
          title={t('kyc.documents.idBack')}
          imageUrl={idBack}
          uploading={uploading}
          onSelect={() => pickImage('id-back', false)}
          onCamera={() => pickImage('id-back', true)}
        />

        <UploadBlock
          title={t('kyc.documents.selfie')}
          imageUrl={selfie}
          uploading={uploading}
          onSelect={() => pickImage('selfie', false)}
          onCamera={() => pickImage('selfie', true)}
          circular
        />

        {uploading ? (
          <View className="mt-4 flex-row items-center">
            <ActivityIndicator size="small" color="#2563EB" />
            <Text className="ml-2 text-sm text-gray-500">
              {t('kyc.documents.uploading')}
            </Text>
          </View>
        ) : null}
      </ElevatedContainer>

      <View className="mt-6 gap-4">
        <Pressable
          onPress={handleSave}
          disabled={saving || uploading}
          className={`items-center rounded-md py-4 ${
            saving || uploading ? 'bg-blue-300' : 'bg-blue-600'
          }`}
        >
          <Text className="text-base font-semibold text-white">
            {saving ? t('kyc.actions.submitting') : t('kyc.actions.submit')}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          disabled={saving || uploading}
          className="items-center rounded-md border border-gray-200 py-4"
        >
          <Text className="text-base font-semibold text-gray-700">
            {t('common.actions.cancel')}
          </Text>
        </Pressable>
      </View>

      {showDobPicker ? (
        <DateTimePicker
          value={dob ?? new Date(2000, 0, 1)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeDob}
          maximumDate={new Date()}
        />
      ) : null}
    </ScrollView>
  );
}
