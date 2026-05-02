import { Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/contexts/auth';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login');
  }

  return (
    <View className="flex-1 items-center justify-center bg-slate-950 px-6">
      <Text className="text-xl font-semibold text-white">{user?.name}</Text>
      <Text className="mt-1 text-slate-400">{user?.email}</Text>

      <TouchableOpacity
        className="mt-10 w-full items-center rounded-xl border border-red-800 py-4"
        onPress={handleLogout}
      >
        <Text className="font-semibold text-red-400">Sair</Text>
      </TouchableOpacity>
    </View>
  );
}
