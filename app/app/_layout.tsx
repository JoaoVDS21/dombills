import '@/global.css';
import { NAV_THEME } from '@/lib/theme';
import { AuthProvider, useAuth } from '@/contexts/auth';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { ActivityIndicator, View } from 'react-native';

export { ErrorBoundary } from 'expo-router';

function RootNavigator() {
  const { user, isLoading } = useAuth();
  const { colorScheme } = useColorScheme();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-950">
        <ActivityIndicator color="#3b82f6" />
      </View>
    );
  }

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {!user && <Redirect href={'/(auth)/login' as any} />}
      <PortalHost />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
