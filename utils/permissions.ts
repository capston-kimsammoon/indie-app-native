// utils/permissions.ts
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

// 알림 권한 요청
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return true; // 웹은 그냥 허용

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// 위치 권한 요청
export async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return true;

  const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}
