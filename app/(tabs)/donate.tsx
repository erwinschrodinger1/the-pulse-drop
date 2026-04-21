import { View, FlatList } from 'react-native';
import { t } from 'i18next';
import { BloodRequestItem } from '@/components/BloodRequestItem';
import { useEffect, useState } from 'react';
import { BloodRequest } from '@/constants/types';
import HeaderText from '@/components/HeaderText';

export default function DonateScreen() {
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);

  // TODO: fetch blood requests from API
  function fetchBloodRequests() {
    // Mock data for now
    const mockData: BloodRequest[] = [
      {
        id: 'req-1',
        bloodType: 'O+',
        location: 'Bir Hospital',
        amount: 2,
        urgency: 'high',
        date: new Date().toISOString(),
        description: 'Need immediate blood transfusion',
        contactName: 'John Doe',
        phoneNumbers: ['123-456-7890'],
      },
      {
        id: 'req-2',
        bloodType: 'A-',
        location: 'Patan Hospital',
        amount: 1,
        urgency: 'medium',
        date: new Date().toISOString(),
        description: 'Scheduled surgery, need blood in advance',
        contactName: 'Jane Smith',
        phoneNumbers: ['987-654-3210'],
      },
    ];
    // Sort with high urgency requests first
    const sorted = mockData.sort((a, b) => {
      if (a.urgency === 'high' && b.urgency !== 'high') return -1;
      if (a.urgency !== 'high' && b.urgency === 'high') return 1;
      return 0;
    });
    setBloodRequests(sorted);
  }

  useEffect(() => {
    fetchBloodRequests();
  }, []);

  return (
    <View className="flex-1 gap-4 px-4 py-6">
      <HeaderText text={t('donate.header')} color="white" />
      <FlatList
        data={bloodRequests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BloodRequestItem item={item} />}
        scrollEnabled={true}
        contentContainerStyle={{
          borderRadius: 8,
          overflow: 'hidden',
          borderColor: '#e0e0e0',
          borderWidth: 1,
        }}
      />
    </View>
  );
}
