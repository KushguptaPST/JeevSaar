import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, FileText, Calendar, Settings } from 'lucide-react-native';

import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { COLORS } from '../design/tokens';

import { LanguagePickerScreen } from '../screens/LanguagePickerScreen';
import { ConsentScreen } from '../screens/ConsentScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { UploadScreen } from '../screens/UploadScreen';
import { ProcessingScreen } from '../screens/ProcessingScreen';
import { ResultScreen } from '../screens/ResultScreen';
import { MyReportsScreen } from '../screens/MyReportsScreen';
import { BookAppointmentScreen } from '../screens/BookAppointmentScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size || 22} color={color} />,
        }}
      />
      <Tab.Screen
        name="MyReportsTab"
        component={MyReportsScreen}
        options={{
          tabBarLabel: 'Reports',
          tabBarIcon: ({ color, size }) => <FileText size={size || 22} color={color} />,
        }}
      />
      <Tab.Screen
        name="AppointmentsTab"
        component={BookAppointmentScreen}
        options={{
          tabBarLabel: 'Book Slot',
          tabBarIcon: ({ color, size }) => <Calendar size={size || 22} color={color} />,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size || 22} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { hasConsented, isFirstLaunch } = useAppStore();
  const { isAuthenticated } = useAuthStore();

  const getInitialRouteName = () => {
    if (isFirstLaunch) return 'LanguagePicker';
    if (!hasConsented) return 'Consent';
    if (!isAuthenticated) return 'Login';
    return 'MainTabs';
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={getInitialRouteName()}
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="LanguagePicker" component={LanguagePickerScreen} />
        <Stack.Screen name="Consent" component={ConsentScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen
          name="Upload"
          component={UploadScreen}
          options={{ headerShown: true, title: 'Upload Report', headerTintColor: COLORS.primary }}
        />
        <Stack.Screen name="Processing" component={ProcessingScreen} />
        <Stack.Screen
          name="Result"
          component={ResultScreen}
          options={{ headerShown: true, title: 'Explanation', headerTintColor: COLORS.primary }}
        />
        <Stack.Screen
          name="BookAppointment"
          component={BookAppointmentScreen}
          options={{ headerShown: true, title: 'Book Appointment', headerTintColor: COLORS.primary }}
        />
        <Stack.Screen
          name="MyReports"
          component={MyReportsScreen}
          options={{ headerShown: true, title: 'Reports History', headerTintColor: COLORS.primary }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

