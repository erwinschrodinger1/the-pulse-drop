import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Modal,
  Pressable,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import ViewModeToggle from '@/components/ViewModeToggle';
import { useTranslation } from 'react-i18next';

type DonationHistoryItem = {
  id: string;
  date: string;
  location: string;
  bloodGroup: string;
  units?: string;
  notes?: string;
};

type RequestHistoryItem = {
  id: string;
  date: string;
  location: string;
  bloodGroup: string;
  units?: string;
  notes?: string;
};

const initialDonationHistory: DonationHistoryItem[] = [
  {
    id: '1',
    date: '2025-12-12',
    location: 'City Blood Bank',
    bloodGroup: 'A+',
    units: '1 pint',
    notes: 'Smooth donation process',
  },
  {
    id: '2',
    date: '2025-08-03',
    location: 'Red Cross Center',
    bloodGroup: 'A+',
    units: '1 pint',
  },
];

const initialRequestHistory: RequestHistoryItem[] = [
  {
    id: '1',
    date: '2025-11-20',
    location: 'Bir Hospital',
    bloodGroup: 'B+',
    units: '500 mL',
    notes: 'Urgent requirement for surgery',
  },
  {
    id: '2',
    date: '2025-09-15',
    location: 'Kanti Children Hospital',
    bloodGroup: 'O-',
    units: '250 mL',
  },
];

function formatDisplayDate(date: Date | null) {
  if (!date) return null;

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatISODate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function HistoryCard({
  item,
  type,
  onPress,
}: {
  item: DonationHistoryItem | RequestHistoryItem;
  type: 'donation' | 'request';
  onPress: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={onPress}
      className="my-2 rounded-2xl border border-gray-100 bg-white px-4 py-4"
    >
      <View className="flex-row items-center justify-between">
        <Text className="flex-1 pr-3 text-lg font-semibold text-gray-900">
          {item.location}
        </Text>
        <Text
          className={`text-sm font-semibold ${
            type === 'donation' ? 'text-red-600' : 'text-blue-600'
          }`}
        >
          {item.bloodGroup}
        </Text>
      </View>

      <Text className="mt-1 text-sm text-gray-500">{item.date}</Text>

      {item.units ? (
        <Text className="mt-2 text-sm text-gray-700">
          <Text className="font-semibold">
            {type === 'donation'
              ? `${t('history.donated')}: `
              : `${t('history.requested')}: `}
          </Text>
          {item.units}
        </Text>
      ) : null}
    </Pressable>
  );
}

export default function DonationHistoryScreen() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'donation' | 'request'>('donation');

  const [donationHistory, setDonationHistory] =
    useState<DonationHistoryItem[]>(initialDonationHistory);
  const [requestHistory] = useState<RequestHistoryItem[]>(initialRequestHistory);

  const [selectedDonation, setSelectedDonation] = useState<DonationHistoryItem | null>(
    null,
  );
  const [selectedRequest, setSelectedRequest] = useState<RequestHistoryItem | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [donationDate, setDonationDate] = useState<Date | null>(null);
  const [location, setLocation] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [units, setUnits] = useState('');
  const [notes, setNotes] = useState('');

  const sortedDonationHistory = useMemo(() => {
    return [...donationHistory].sort((a, b) => b.date.localeCompare(a.date));
  }, [donationHistory]);

  const sortedRequestHistory = useMemo(() => {
    return [...requestHistory].sort((a, b) => b.date.localeCompare(a.date));
  }, [requestHistory]);

  const closeDonationDrawer = () => setSelectedDonation(null);
  const closeRequestDrawer = () => setSelectedRequest(null);
  const closeAddModal = () => setShowAddModal(false);

  const onChangeDate = (event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(false);

    if (event.type === 'set' && date) {
      setDonationDate(date);
    }
  };

  const resetForm = () => {
    setDonationDate(null);
    setLocation('');
    setBloodGroup('');
    setUnits('');
    setNotes('');
  };

  const handleAddManualEntry = () => {
    if (!donationDate) {
      Alert.alert(
        t('history.errors.missingDateTitle'),
        t('history.errors.missingDateMessage'),
      );
      return;
    }

    if (!location.trim()) {
      Alert.alert(
        t('history.errors.missingLocationTitle'),
        t('history.errors.missingLocationMessage'),
      );
      return;
    }

    if (!bloodGroup.trim()) {
      Alert.alert(
        t('history.errors.missingBloodGroupTitle'),
        t('history.errors.missingBloodGroupMessage'),
      );
      return;
    }

    const newItem: DonationHistoryItem = {
      id: Date.now().toString(),
      date: formatISODate(donationDate),
      location: location.trim(),
      bloodGroup: bloodGroup.trim(),
      units: units.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    setDonationHistory((prev) => [newItem, ...prev]);
    closeAddModal();
    resetForm();
  };

  return (
    <ScrollView
      className="flex-1 px-4 pt-6"
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-gray-900">{t('history.title')}</Text>

        {mode === 'donation' ? (
          <Pressable
            onPress={() => setShowAddModal(true)}
            className="flex-row items-center rounded-xl bg-blue-600 px-4 py-3"
          >
            <FontAwesome5 name="plus" size={14} color="white" />
            <Text className="ml-2 font-semibold text-white">
              {t('history.addManualEntry')}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <ViewModeToggle
        className="mb-4 self-start"
        width={280}
        height={52}
        value={mode}
        onChange={(value) => setMode(value as 'donation' | 'request')}
        options={[
          {
            key: 'donation',
            render: (active) => (
              <Text
                className={`w-full px-4 text-center text-base font-semibold ${
                  active ? 'text-white' : 'text-gray-700'
                }`}
              >
                {t('history.donationTab')}
              </Text>
            ),
          },
          {
            key: 'request',
            render: (active) => (
              <Text
                className={`w-full px-4 text-center text-base font-semibold ${
                  active ? 'text-white' : 'text-gray-700'
                }`}
              >
                {t('history.requestTab')}
              </Text>
            ),
          },
        ]}
      />

      {mode === 'donation' ? (
        <>
          {sortedDonationHistory.length === 0 ? (
            <View className="mt-10 items-center rounded-2xl bg-white px-6 py-10">
              <Text className="text-lg font-semibold text-gray-800">
                {t('history.noDonationTitle')}
              </Text>
              <Text className="mt-2 text-center text-gray-500">
                {t('history.noDonationSubtitle')}
              </Text>
            </View>
          ) : (
            sortedDonationHistory.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                type="donation"
                onPress={() => setSelectedDonation(item)}
              />
            ))
          )}
        </>
      ) : (
        <>
          {sortedRequestHistory.length === 0 ? (
            <View className="mt-10 items-center rounded-2xl bg-white px-6 py-10">
              <Text className="text-lg font-semibold text-gray-800">
                {t('history.noRequestTitle')}
              </Text>
              <Text className="mt-2 text-center text-gray-500">
                {t('history.noRequestSubtitle')}
              </Text>
            </View>
          ) : (
            sortedRequestHistory.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                type="request"
                onPress={() => setSelectedRequest(item)}
              />
            ))
          )}
        </>
      )}

      <Modal
        visible={!!selectedDonation}
        animationType="slide"
        transparent
        onRequestClose={closeDonationDrawer}
      >
        <View className="flex-1 justify-end bg-black/40">
          <Pressable className="flex-1" onPress={closeDonationDrawer} />

          <View className="max-h-[70%] rounded-t-3xl bg-white p-4">
            {selectedDonation ? (
              <>
                <View className="mb-3 flex-row items-start justify-between">
                  <View className="flex-1 pr-3">
                    <Text className="text-lg font-semibold text-gray-900">
                      {selectedDonation.location}
                    </Text>
                    <Text className="mt-1 text-sm text-gray-500">
                      {selectedDonation.date}
                    </Text>
                  </View>

                  <Pressable onPress={closeDonationDrawer}>
                    <FontAwesome5 name="times" size={18} color="#6b7280" />
                  </Pressable>
                </View>

                <View className="mb-3 h-px bg-gray-200" />

                <View className="space-y-2">
                  <Text className="text-sm text-gray-700">
                    <Text className="font-semibold">{t('history.bloodGroup')}: </Text>
                    {selectedDonation.bloodGroup}
                  </Text>

                  {selectedDonation.units ? (
                    <Text className="text-sm text-gray-700">
                      <Text className="font-semibold">{t('history.amount')}: </Text>
                      {selectedDonation.units}
                    </Text>
                  ) : null}

                  {selectedDonation.notes ? (
                    <Text className="text-sm text-gray-700">
                      <Text className="font-semibold">{t('history.notes')}: </Text>
                      {selectedDonation.notes}
                    </Text>
                  ) : null}
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!selectedRequest}
        animationType="slide"
        transparent
        onRequestClose={closeRequestDrawer}
      >
        <View className="flex-1 justify-end bg-black/40">
          <Pressable className="flex-1" onPress={closeRequestDrawer} />

          <View className="max-h-[70%] rounded-t-3xl bg-white p-4">
            {selectedRequest ? (
              <>
                <View className="mb-3 flex-row items-start justify-between">
                  <View className="flex-1 pr-3">
                    <Text className="text-lg font-semibold text-gray-900">
                      {selectedRequest.location}
                    </Text>
                    <Text className="mt-1 text-sm text-gray-500">
                      {selectedRequest.date}
                    </Text>
                  </View>

                  <Pressable onPress={closeRequestDrawer}>
                    <FontAwesome5 name="times" size={18} color="#6b7280" />
                  </Pressable>
                </View>

                <View className="mb-3 h-px bg-gray-200" />

                <View className="space-y-2">
                  <Text className="text-sm text-gray-700">
                    <Text className="font-semibold">{t('history.bloodGroup')}: </Text>
                    {selectedRequest.bloodGroup}
                  </Text>

                  {selectedRequest.units ? (
                    <Text className="text-sm text-gray-700">
                      <Text className="font-semibold">{t('history.requested')}: </Text>
                      {selectedRequest.units}
                    </Text>
                  ) : null}

                  {selectedRequest.notes ? (
                    <Text className="text-sm text-gray-700">
                      <Text className="font-semibold">{t('history.notes')}: </Text>
                      {selectedRequest.notes}
                    </Text>
                  ) : null}
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={closeAddModal}
      >
        <View className="flex-1 justify-end bg-black/40">
          <Pressable className="flex-1" onPress={closeAddModal} />

          <View className="rounded-t-3xl bg-white p-4">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-gray-900">
                {t('history.addDonationEntry')}
              </Text>

              <Pressable onPress={closeAddModal}>
                <FontAwesome5 name="times" size={18} color="#6b7280" />
              </Pressable>
            </View>

            <View className="gap-4">
              <View>
                <Text className="mb-2 text-sm font-semibold text-gray-600">
                  {t('history.donationDate')}
                </Text>
                <Pressable
                  onPress={() => setShowDatePicker(true)}
                  className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4"
                >
                  <Text className="text-base text-gray-800">
                    {donationDate
                      ? formatDisplayDate(donationDate)
                      : t('history.selectDate')}
                  </Text>
                </Pressable>
              </View>

              <View>
                <Text className="mb-2 text-sm font-semibold text-gray-600">
                  {t('history.location')}
                </Text>
                <TextInput
                  value={location}
                  onChangeText={setLocation}
                  placeholder={t('history.placeholders.center')}
                  className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-base text-gray-900"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View>
                <Text className="mb-2 text-sm font-semibold text-gray-600">
                  {t('history.bloodGroupField')}
                </Text>
                <TextInput
                  value={bloodGroup}
                  onChangeText={setBloodGroup}
                  placeholder={t('history.placeholders.bloodGroup')}
                  className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-base text-gray-900"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View>
                <Text className="mb-2 text-sm font-semibold text-gray-600">
                  {t('history.amountField')}
                </Text>
                <TextInput
                  value={units}
                  onChangeText={setUnits}
                  placeholder={t('history.placeholders.amount')}
                  className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-base text-gray-900"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View>
                <Text className="mb-2 text-sm font-semibold text-gray-600">
                  {t('history.notesField')}
                </Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder={t('history.placeholders.notes')}
                  multiline
                  className="min-h-[96px] rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-base text-gray-900"
                  placeholderTextColor="#9CA3AF"
                  textAlignVertical="top"
                />
              </View>

              <Pressable
                onPress={handleAddManualEntry}
                className="mt-2 items-center rounded-xl bg-red-600 py-4"
              >
                <Text className="text-base font-semibold text-white">
                  {t('history.saveEntry')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {showDatePicker ? (
        <DateTimePicker
          value={donationDate ?? new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeDate}
          maximumDate={new Date()}
        />
      ) : null}
    </ScrollView>
  );
}
