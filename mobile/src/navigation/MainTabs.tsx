import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { TripDetailScreen } from '../screens/dashboard/TripDetailScreen';
import { TrackingScreen } from '../screens/tracking/TrackingScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { ExportScreen } from '../screens/export/ExportScreen';
import { useTripStore } from '../store/tripStore';
import { colors } from '../theme';

export type MainTabParamList = {
  DashboardTab: undefined;
  TrackingTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  TripDetail: { id: string };
  Export: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TabNavigator: React.FC = () => {
  const isRecording = useTripStore((s) => s.isRecording);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          title: 'Fahrten',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="TrackingTab"
        component={TrackingScreen}
        options={{
          title: 'Fahrt',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.trackingIconWrapper}>
              <View style={[styles.trackingIcon, isRecording && styles.trackingIconActive]}>
                <Ionicons
                  name={isRecording ? 'stop-circle' : 'play-circle'}
                  size={32}
                  color={isRecording ? colors.danger : colors.primary}
                />
              </View>
              {isRecording && <View style={styles.recordingBadge} />}
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const MainTabs: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={TabNavigator} />
    <Stack.Screen
      name="TripDetail"
      component={TripDetailScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="Export"
      component={ExportScreen}
      options={{ animation: 'slide_from_bottom' }}
    />
  </Stack.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 4,
    paddingTop: 4,
    height: 60,
    backgroundColor: colors.surface,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  trackingIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  trackingIcon: {
    marginTop: -8,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  trackingIconActive: {
    backgroundColor: colors.dangerLight,
  },
  recordingBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.danger,
    borderWidth: 2,
    borderColor: colors.surface,
  },
});
