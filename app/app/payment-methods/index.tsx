import { AddPaymentMethodSheet } from '@/components/features/settings/AddPaymentMethodSheet';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/contexts/auth';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { softDeletePaymentMethod } from '@/lib/database/actions/createPaymentMethod';
import type { PaymentMethod } from '@/lib/database/models/PaymentMethod';
import { useRouter } from 'expo-router';
import { Banknote, ChevronLeft, CreditCard, Plus, Smartphone, Trash2 } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PM_ICONS: Record<string, LucideIcon> = {
  CREDIT: CreditCard,
  DEBIT: CreditCard,
  PIX: Smartphone,
  CASH: Banknote,
};

const PM_LABELS: Record<string, string> = {
  CREDIT: 'Crédito',
  DEBIT: 'Débito',
  PIX: 'Pix',
  CASH: 'Dinheiro',
};

const PM_COLORS: Record<string, string> = {
  CREDIT: '#3b82f6',
  DEBIT: '#22c55e',
  PIX: '#06b6d4',
  CASH: '#eab308',
};

function PaymentMethodRow({
  pm,
  onDelete,
}: {
  pm: PaymentMethod;
  onDelete: () => void;
}) {
  const IconComp = PM_ICONS[pm.type] ?? CreditCard;
  const color = PM_COLORS[pm.type] ?? '#64748b';
  const typeLabel = PM_LABELS[pm.type] ?? pm.type;

  return (
    <View className="flex-row items-center gap-3 border-b border-border px-5 py-4 last:border-0">
      <View
        className="h-9 w-9 items-center justify-center rounded-xl"
        style={{ backgroundColor: color }}
      >
        <Icon as={IconComp} size={18} className="text-white" />
      </View>

      <View className="flex-1">
        <Text className="text-base font-medium text-foreground">{pm.name}</Text>
        <Text variant="muted" className="text-xs">
          {typeLabel}
          {pm.lastDigits ? ` · ····${pm.lastDigits}` : ''}
        </Text>
      </View>

      <Pressable
        onPress={onDelete}
        hitSlop={8}
        className="p-1 active:opacity-70"
      >
        <Icon as={Trash2} size={18} className="text-destructive" />
      </Pressable>
    </View>
  );
}

export default function PaymentMethodsScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [addVisible, setAddVisible] = useState(false);

  const { paymentMethods, loading } = usePaymentMethods(user?.id ?? '');

  function handleDelete(pm: PaymentMethod) {
    Alert.alert(
      'Excluir forma de pagamento',
      `Deseja excluir "${pm.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => softDeletePaymentMethod(pm.id),
        },
      ],
    );
  }

  if (!user) return null;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-5 pb-4"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full border border-border bg-card active:opacity-70"
          >
            <Icon as={ChevronLeft} size={20} className="text-foreground" />
          </Pressable>
          <Text variant="h3">Pagamentos</Text>
        </View>
        <Pressable
          onPress={() => setAddVisible(true)}
          className="h-10 w-10 items-center justify-center rounded-full bg-primary active:opacity-70"
        >
          <Icon as={Plus} size={20} className="text-primary-foreground" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {loading ? (
          <View className="mx-5 gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </View>
        ) : paymentMethods.length === 0 ? (
          <View className="mx-5 items-center rounded-2xl border border-dashed border-border py-12">
            <Text variant="muted" className="text-sm">
              Nenhuma forma de pagamento
            </Text>
            <Pressable
              className="mt-3 active:opacity-70"
              onPress={() => setAddVisible(true)}
            >
              <Text className="text-sm font-medium text-primary">
                Adicionar agora
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="mx-5 overflow-hidden rounded-2xl border border-border bg-card">
            {paymentMethods.map((pm) => (
              <PaymentMethodRow
                key={pm.id}
                pm={pm}
                onDelete={() => handleDelete(pm)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <AddPaymentMethodSheet
        visible={addVisible}
        onClose={() => setAddVisible(false)}
        userId={user.id}
      />
    </View>
  );
}
