import { Ionicons } from '@expo/vector-icons';
import { Tabs, usePathname } from 'expo-router';
import {
  Image,
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors } from '@/constants/colors';
import AppHeader from '@/components/AppHeader';
import { t } from 'i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

const TABS = [
  {
    name: 'index',
    label: 'Home',
    icon: 'home-outline',
    activeIcon: 'home',
    route: '/',
    showHeader: true,
  },
  {
    name: 'request',
    label: 'Map',
    icon: 'location-outline',
    activeIcon: 'location',
    route: '/request',
    showHeader: true,
  },
  {
    name: 'community',
    label: 'Community',
    icon: 'grid-outline',
    activeIcon: 'grid',
    route: '/community',
    showHeader: true,
  },
  {
    name: 'settings/index',
    label: 'settings',
    icon: 'settings-outline',
    activeIcon: 'settings',
    route: '/settings',
    showHeader: false,
  },
] as const;

type TabItem = (typeof TABS)[number];
const LEFT_TABS = TABS.slice(0, 2);
const RIGHT_TABS = TABS.slice(2);

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingTop: Platform.OS === 'ios' ? 8 : 6,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    borderTopWidth: 2.5,
    borderTopColor: Colors.lightTheme.border,
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  tabBarItem: {
    paddingVertical: Platform.OS === 'ios' ? 2 : 4,
  },
  tabLabelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabelText: {
    fontSize: 12,
    marginTop: Platform.OS === 'ios' ? 1 : 2,
  },
  tabIndicator: {
    marginTop: 4,
    height: 4,
    width: 50,
    borderRadius: 50,
    backgroundColor: 'transparent',
  },
  tabIndicatorActive: {
    backgroundColor: Colors.lightTheme.primary,
  },
  centerTabButton: {
    top: Platform.OS === 'ios' ? -18 : -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerTabInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FB3E35',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.lightTheme.border,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  centerTabInnerActive: {
    backgroundColor: Colors.lightTheme.primary,
  },
  centerTabLabel: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  centerTabIndicator: {
    marginTop: 6,
    height: 4,
    width: 50,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    backgroundColor: 'transparent',
  },
  centerTabIndicatorActive: {
    backgroundColor: Colors.lightTheme.primary,
  },
});

function TabIcon({ focused, tab }: { focused: boolean; tab: TabItem }) {
  return (
    <View className="h-10 w-12 items-center justify-end">
      <Ionicons
        name={focused ? tab.activeIcon : tab.icon}
        size={30}
        color={focused ? Colors.lightTheme.primary : Colors.darkTheme.primary}
      />
    </View>
  );
}

function TabLabel({
  focused,
  color,
  label,
}: {
  focused: boolean;
  color: string;
  label: string;
}) {
  return (
    <View style={styles.tabLabelContainer}>
      <Text style={[styles.tabLabelText, { color }]}>{label}</Text>
      <View style={[styles.tabIndicator, focused && styles.tabIndicatorActive]} />
    </View>
  );
}

function getTabOptions(tab: TabItem) {
  return {
    href: tab.route,
    headerShown: tab.showHeader,
    tabBarIcon: ({ focused }: { focused: boolean }) => (
      <TabIcon focused={focused} tab={tab} />
    ),
    tabBarLabel: ({ focused, color }: { focused: boolean; color: string }) => (
      <TabLabel focused={focused} color={color} label={tab.label} />
    ),
  };
}

export default function Layout() {
  const pathname = usePathname();
  const isDonateActive = pathname.startsWith('/donate');

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ImageBackground
        source={require('@/assets/images/background.png')}
        className="flex-1"
        resizeMode="none"
      >
        <Image
          source={require('@/assets/images/background-1.png')}
          className="absolute left-0 right-0 top-20 w-full"
          resizeMode="contain"
        />

        <Tabs
          backBehavior="history"
          screenOptions={{
            animation: 'fade',
            headerShown: true,
            header: () => <AppHeader />,
            headerTransparent: false,
            headerShadowVisible: false,
            headerStatusBarHeight: 0,
            headerStyle: {
              backgroundColor: 'transparent',
              shadowColor: 'transparent',
              shadowOpacity: 0,
              shadowRadius: 0,
              elevation: 0,
              borderBottomWidth: 0,
            },
            sceneStyle: { backgroundColor: 'transparent' },
            tabBarStyle: styles.tabBar,
            tabBarItemStyle: styles.tabBarItem,
            tabBarActiveTintColor: Colors.lightTheme.primary,
            tabBarInactiveTintColor: Colors.darkTheme.primary,
          }}
        >
          {LEFT_TABS.map((tab) => (
            <Tabs.Screen key={tab.name} name={tab.name} options={getTabOptions(tab)} />
          ))}
          <Tabs.Screen
            name="donate"
            options={{
              tabBarButton: ({ onPress, accessibilityLabel }) => (
                <Pressable
                  onPress={onPress}
                  accessibilityRole="button"
                  accessibilityLabel={accessibilityLabel ?? 'Donate'}
                  style={styles.centerTabButton}
                >
                  <View
                    style={[
                      styles.centerTabInner,
                      isDonateActive && styles.centerTabInnerActive,
                    ]}
                  >
                    <Ionicons
                      name={isDonateActive ? 'water' : 'water-outline'}
                      size={36}
                      color="#FFFFFF"
                    />
                    <Text style={styles.centerTabLabel}>{t('donate.title')}</Text>
                  </View>
                  <View
                    style={[
                      styles.centerTabIndicator,
                      isDonateActive && styles.centerTabIndicatorActive,
                    ]}
                  />
                </Pressable>
              ),
            }}
          />
          {RIGHT_TABS.map((tab) => (
            <Tabs.Screen key={tab.name} name={tab.name} options={getTabOptions(tab)} />
          ))}
          <Tabs.Screen name="history" options={{ href: null }} />
          <Tabs.Screen name="details" options={{ href: null }} />
          <Tabs.Screen name="profile" options={{ href: null }} />
          <Tabs.Screen name="settings/kyc" options={{ href: null, headerShown: false }} />
        </Tabs>
      </ImageBackground>
    </SafeAreaView>
  );
}
