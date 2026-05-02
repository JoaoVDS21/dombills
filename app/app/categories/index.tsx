import { AddCategorySheet } from '@/components/features/settings/AddCategorySheet';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/contexts/auth';
import { useCategories } from '@/hooks/useCategories';
import { softDeleteCategory } from '@/lib/database/actions/createCategory';
import { CATEGORY_ICON_MAP } from '@/lib/category-icons';
import type { Category } from '@/lib/database/models/Category';
import { cn } from '@/lib/utils';
import { useRouter } from 'expo-router';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function CategoryRow({
  category,
  canDelete,
  onDelete,
}: {
  category: Category;
  canDelete: boolean;
  onDelete: () => void;
}) {
  const IconComp = CATEGORY_ICON_MAP[category.iconName];

  return (
    <View className="flex-row items-center gap-3 border-b border-border px-5 py-4 last:border-0">
      <View
        className="h-9 w-9 items-center justify-center rounded-xl"
        style={{ backgroundColor: category.color }}
      >
        {IconComp ? (
          <Icon as={IconComp} size={18} className="text-white" />
        ) : (
          <Text className="text-sm font-bold text-white">
            {category.name.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>

      <Text className="flex-1 text-base font-medium text-foreground">
        {category.name}
      </Text>

      {canDelete ? (
        <Pressable
          onPress={onDelete}
          hitSlop={8}
          className="p-1 active:opacity-70"
        >
          <Icon as={Trash2} size={18} className="text-destructive" />
        </Pressable>
      ) : (
        <Text variant="muted" className="text-xs">Sistema</Text>
      )}
    </View>
  );
}

export default function CategoriesScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [addVisible, setAddVisible] = useState(false);

  const { categories, loading } = useCategories(user?.id ?? '');

  const userCategories = categories.filter((c) => c.userId === user?.id);
  const systemCategories = categories.filter((c) => c.userId === null);

  function handleDelete(category: Category) {
    Alert.alert(
      'Excluir categoria',
      `Deseja excluir "${category.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => softDeleteCategory(category.id),
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
          <Text variant="h3">Categorias</Text>
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
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </View>
        ) : (
          <>
            {/* User categories */}
            {userCategories.length > 0 && (
              <>
                <Text variant="muted" className="mb-2 px-5 text-xs uppercase tracking-wide">
                  Minhas categorias
                </Text>
                <View className={cn('mx-5 mb-6 overflow-hidden rounded-2xl border border-border bg-card')}>
                  {userCategories.map((cat) => (
                    <CategoryRow
                      key={cat.id}
                      category={cat}
                      canDelete
                      onDelete={() => handleDelete(cat)}
                    />
                  ))}
                </View>
              </>
            )}

            {/* System categories */}
            {systemCategories.length > 0 && (
              <>
                <Text variant="muted" className="mb-2 px-5 text-xs uppercase tracking-wide">
                  Categorias do sistema
                </Text>
                <View className="mx-5 overflow-hidden rounded-2xl border border-border bg-card">
                  {systemCategories.map((cat) => (
                    <CategoryRow
                      key={cat.id}
                      category={cat}
                      canDelete={false}
                      onDelete={() => {}}
                    />
                  ))}
                </View>
              </>
            )}

            {userCategories.length === 0 && systemCategories.length === 0 && (
              <View className="mx-5 items-center rounded-2xl border border-dashed border-border py-12">
                <Text variant="muted" className="text-sm">
                  Nenhuma categoria encontrada
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <AddCategorySheet
        visible={addVisible}
        onClose={() => setAddVisible(false)}
        userId={user.id}
      />
    </View>
  );
}
