import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { useTripStore } from '../store/tripStore';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { notificationService } from '../services/notification.service';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';

// Import background task registration (side effect only — must run at app start)
import '../tasks/backgroundLocation.task';

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isInitialized, initialize } = useAuthStore();
  const { restoreActiveTrip } = useTripStore();

  useEffect(() => {
    initialize();
    notificationService.requestPermissions();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      restoreActiveTrip();
    }
  }, [isAuthenticated]);

  if (!isInitialized) {
    return <LoadingSpinner fullScreen message="Laden…" />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};
