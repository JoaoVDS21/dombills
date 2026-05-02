import { SettingsRow } from '@/components/ui/settings-row';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/contexts/auth';
import { Bell, Lock, LogOut, Moon, UserCircle } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { router } from 'expo-router';
import { ScrollView, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function Avatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <View className="h-20 w-20 items-center justify-center rounded-full bg-blue-600">
      <Text className="text-2xl font-bold text-white">{initials}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const { colorScheme, setColorScheme } = useColorScheme();

  const isDark = colorScheme === 'dark';

  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login' as any);
  }

  if (!user) return null;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      <View
        className="px-5 pb-4"
        style={{ paddingTop: insets.top + 16 }}
      >
        <Text variant="h3">Perfil</Text>
      </View>

      {/* Avatar + info */}
      <View className="mb-8 items-center gap-3 px-5">
        <Avatar name={user.name} avatarUrl={user.avatarUrl} />
        <View className="items-center">
          <Text className="text-xl font-bold text-foreground">{user.name}</Text>
          <Text variant="muted" className="text-sm">{user.email}</Text>
        </View>
      </View>

      {/* Conta */}
      <Text variant="muted" className="mb-2 px-5 text-xs uppercase tracking-wide">
        Conta
      </Text>
      <View className="mx-5 mb-6 overflow-hidden rounded-2xl border border-border bg-card">
        <SettingsRow
          icon={UserCircle}
          iconBg="#3b82f6"
          label="Alterar dados pessoais"
          onPress={() => {}}
        />
        <View className="mx-5 h-px bg-border" />
        <SettingsRow
          icon={Lock}
          iconBg="#6366f1"
          label="Redefinir senha"
          onPress={() => {}}
        />
      </View>

      {/* Preferências */}
      <Text variant="muted" className="mb-2 px-5 text-xs uppercase tracking-wide">
        Preferências
      </Text>
      <View className="mx-5 mb-6 overflow-hidden rounded-2xl border border-border bg-card">
        <SettingsRow
          icon={Bell}
          iconBg="#f97316"
          label="Notificações"
          onPress={() => {}}
        />
        <View className="mx-5 h-px bg-border" />
        <SettingsRow
          icon={Moon}
          iconBg="#1e293b"
          label="Tema escuro"
          showChevron={false}
          rightElement={
            <Switch
              value={isDark}
              onValueChange={(v) => setColorScheme(v ? 'dark' : 'light')}
              trackColor={{ false: '#27272a', true: '#3b82f6' }}
              thumbColor="#ffffff"
            />
          }
        />
      </View>

      {/* Sair */}
      <View className="mx-5 overflow-hidden rounded-2xl border border-border bg-card">
        <SettingsRow
          icon={LogOut}
          iconBg="#ef4444"
          label="Sair da conta"
          destructive
          showChevron={false}
          onPress={handleLogout}
        />
      </View>
    </ScrollView>
  );
}
