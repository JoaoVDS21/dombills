import { SettingsRow } from '@/components/ui/settings-row';
import { Text } from '@/components/ui/text';
import { CreditCard, Tags, Users } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      <View
        className="px-5 pb-4"
        style={{ paddingTop: insets.top + 16 }}
      >
        <Text variant="h3">Configurações</Text>
      </View>

      <View className="mx-5 overflow-hidden rounded-2xl border border-border bg-card">
        <SettingsRow
          icon={Users}
          iconBg="#3b82f6"
          label="Gerenciar Grupos"
          onPress={() => {}}
        />
        <View className="mx-5 h-px bg-border" />
        <SettingsRow
          icon={Tags}
          iconBg="#8b5cf6"
          label="Gerenciar Categorias"
          onPress={() => router.push('/categories' as any)}
        />
        <View className="mx-5 h-px bg-border" />
        <SettingsRow
          icon={CreditCard}
          iconBg="#06b6d4"
          label="Gerenciar Formas de Pagamento"
          onPress={() => router.push('/payment-methods' as any)}
        />
      </View>
    </ScrollView>
  );
}
