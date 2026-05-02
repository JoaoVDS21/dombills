import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useAddSheet } from '@/contexts/add-sheet';
import { useRouter } from 'expo-router';
import { List, MinusCircle, PlusCircle, TrendingUp, UserPlus, Users } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

type ActionItem = {
  label: string;
  icon: LucideIcon;
  onPress: () => void;
};

function ActionButton({ label, icon, onPress }: ActionItem) {
  return (
    <Pressable
      className="flex-1 items-center gap-2 rounded-2xl border border-border bg-card py-4 active:opacity-70"
      onPress={onPress}
    >
      <Icon as={icon} size={20} className="text-primary" />
      <Text className="text-center text-xs font-medium text-foreground">{label}</Text>
    </Pressable>
  );
}

export function QuickActions() {
  const router = useRouter();
  const { openExpense, openRevenue } = useAddSheet();

  const rows: [ActionItem, ActionItem, ActionItem][] = [
    [
      { label: 'Ver Grupos', icon: Users, onPress: () => {} },
      { label: 'Criar Grupo', icon: UserPlus, onPress: () => {} },
      { label: 'Ver Despesas', icon: List, onPress: () => router.push('/expenses' as any) },
    ],
    [
      { label: 'Add Despesa', icon: MinusCircle, onPress: openExpense },
      { label: 'Ver Receitas', icon: TrendingUp, onPress: () => {} },
      { label: 'Add Receita', icon: PlusCircle, onPress: openRevenue },
    ],
  ];

  return (
    <View className="gap-3 px-5">
      {rows.map((row, i) => (
        <View key={i} className="flex-row gap-3">
          {row.map((action) => (
            <ActionButton key={action.label} {...action} />
          ))}
        </View>
      ))}
    </View>
  );
}
