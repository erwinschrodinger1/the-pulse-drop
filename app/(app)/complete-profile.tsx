import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
  ScrollView,
  Platform,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  getPossibleCountries,
  CountryCode,
} from 'libphonenumber-js';

import ElevatedContainer from '@/components/ElevatedContainer';
import { supabase } from '@/lib/supabase';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Generate all countries dynamically
const allCountries = getCountries().map((code) => ({
  code,
  callingCode: getCountryCallingCode(code),
}));

function formatDate(date: Date | null) {
  if (!date) return 'Select date';

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function CompleteProfile() {
  const router = useRouter();

  const [country, setCountry] = useState<CountryCode>('NP');
  const [showCountryModal, setShowCountryModal] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [lastDonated, setLastDonated] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const callingCode = getCountryCallingCode(country);

  const formattedDate = useMemo(
    () => formatDate(lastDonated),
    [lastDonated]
  );

  // Detect possible countries dynamically
  const possibleCountries = useMemo(() => {
    if (!phoneNumber) return [];

    try {
      return getPossibleCountries(phoneNumber);
    } catch {
      return [];
    }
  }, [phoneNumber]);

  const onChangeDate = (
    event: DateTimePickerEvent,
    date?: Date
  ) => {
    if (Platform.OS !== 'ios') {
      setShowDatePicker(false);
    }

    if (event.type === 'set' && date) {
      setLastDonated(date);
    }
  };

  const handleSave = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert(
        'Missing phone number',
        'Please enter your phone number.'
      );
      return;
    }

    if (!selectedBloodGroup) {
      Alert.alert(
        'Missing blood group',
        'Please select your blood group.'
      );
      return;
    }

    const fullPhone = `+${callingCode}${phoneNumber.trim()}`;

    const parsed = parsePhoneNumberFromString(fullPhone);

    if (!parsed || !parsed.isValid()) {
      Alert.alert(
        'Invalid phone number',
        'Please enter a valid phone number.'
      );
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not found.');
      }

      const payload = {
        phone: parsed.number, // single string
        blood_group: selectedBloodGroup,
        last_blood_donated: lastDonated
          ? formatDate(lastDonated)
          : null,
      };

      const { error } =
        await supabase.auth.updateUser({
          data: payload,
        });

      if (error) throw error;

      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert(
        'Save failed',
        err?.message ?? 'Something went wrong.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      className="mt-24 flex-1"
      contentContainerStyle={{ paddingBottom: 36 }}
      showsVerticalScrollIndicator={false}
    >
      <ElevatedContainer className="mx-8 mt-4 py-12">

        <Text className="text-3xl font-bold text-black">
          Complete Profile
        </Text>

        {/* PHONE INPUT */}

        <View className="mt-6">
          <Text className="text-2xl font-bold">
            Phone Number
          </Text>

          <View className="mt-5 flex-row items-center gap-2">

            {/* COUNTRY SELECTOR */}

            <Pressable
              onPress={() =>
                setShowCountryModal(true)
              }
              className="rounded-xl border-2 border-blue-400 bg-gray-100 px-4 py-4"
            >
              <Text className="font-semibold">
                +{callingCode}
              </Text>
            </Pressable>

            {/* PHONE */}

            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              className="flex-1 rounded-xl border-2 border-blue-400 bg-gray-100 px-4 py-4"
            />

          </View>

          {/* Suggested countries */}
          {possibleCountries.length > 0 && (
            <View className="mt-2 flex-row flex-wrap">
              {possibleCountries.map((c) => (
                <Text
                  key={c}
                  className="mr-2 text-xs text-gray-500"
                >
                  Possible: {c}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* BLOOD GROUP */}

        <View className="mt-6 flex-row flex-wrap gap-3">
          {bloodGroups.map((group) => {
            const active =
              selectedBloodGroup === group;

            return (
              <Pressable
                key={group}
                onPress={() =>
                  setSelectedBloodGroup(group)
                }
                className={`rounded-2xl border px-5 py-3 ${active
                  ? 'border-red-600 bg-red-600'
                  : 'border-gray-200 bg-white'
                  }`}
              >
                <Text
                  className={`font-bold ${active
                    ? 'text-white'
                    : 'text-gray-800'
                    }`}
                >
                  {group}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* DATE */}

        <View className="mt-6">

          <Pressable
            onPress={() =>
              setShowDatePicker(true)
            }
            className="flex-row items-center justify-between rounded-xl border-2 border-blue-400 bg-gray-100 px-4 py-4"
          >
            <Text>
              {lastDonated
                ? formattedDate
                : 'Select date'}
            </Text>

            <FontAwesome5
              name="calendar-alt"
              size={18}
              color="#6b7280"
            />

          </Pressable>

        </View>

        {showDatePicker && (
          <DateTimePicker
            value={lastDonated ?? new Date()}
            mode="date"
            onChange={onChangeDate}
            maximumDate={new Date()}
          />
        )}

        {/* SAVE */}

        <Pressable
          onPress={handleSave}
          disabled={loading}
          className={`mt-6 items-center rounded-md py-4 ${loading
            ? 'bg-blue-300'
            : 'bg-blue-600'
            }`}
        >
          <Text className="font-semibold text-white">
            {loading
              ? 'Saving...'
              : 'Continue'}
          </Text>
        </Pressable>

      </ElevatedContainer>

      {/* COUNTRY MODAL */}

      <Modal
        visible={showCountryModal}
        animationType="slide"
      >
        <FlatList
          data={allCountries}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                setCountry(item.code);
                setShowCountryModal(false);
              }}
              className="border-b px-5 py-4"
            >
              <Text>
                {item.code} (+{item.callingCode})
              </Text>
            </Pressable>
          )}
        />
      </Modal>

    </ScrollView>
  );
}
