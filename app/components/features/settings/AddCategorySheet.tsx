import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { createCategory } from '@/lib/database/actions/createCategory';
import { CATEGORY_COLORS, CATEGORY_ICON_OPTIONS } from '@/lib/category-icons';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

type AddCategorySheetProps = {
  visible: boolean;
  onClose: () => void;
  userId: string;
};

export function AddCategorySheet({ visible, onClose, userId }: AddCategorySheetProps) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(CATEGORY_COLORS[5]);
  const [selectedIcon, setSelectedIcon] = useState(CATEGORY_ICON_OPTIONS[0].name);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      await createCategory({
        userId,
        name: name.trim(),
        iconName: selectedIcon,
        color: selectedColor,
      });
      setName('');
      setSelectedColor(CATEGORY_COLORS[5]);
      setSelectedIcon(CATEGORY_ICON_OPTIONS[0].name);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Nova Categoria">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Name */}
        <Text variant="muted" className="mb-2 text-xs uppercase tracking-wide">
          Nome
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ex: Alimentação"
          style={{
            height: 48,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#27272a',
            backgroundColor: '#09090b',
            paddingHorizontal: 16,
            fontSize: 16,
            color: '#f4f4f5',
            marginBottom: 20,
          }}
          placeholderTextColor="#71717a"
        />

        {/* Color picker */}
        <Text variant="muted" className="mb-3 text-xs uppercase tracking-wide">
          Cor
        </Text>
        <View className="mb-5 flex-row flex-wrap gap-3">
          {CATEGORY_COLORS.map((color) => (
            <Pressable
              key={color}
              onPress={() => setSelectedColor(color)}
              className={cn(
                'h-9 w-9 rounded-full active:opacity-70',
                selectedColor === color && 'ring-2 ring-white ring-offset-1 ring-offset-card',
              )}
              style={{ backgroundColor: color }}
            >
              {selectedColor === color && (
                <View className="flex-1 items-center justify-center">
                  <Text className="text-xs font-bold text-white">✓</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>

        {/* Icon picker */}
        <Text variant="muted" className="mb-3 text-xs uppercase tracking-wide">
          Ícone
        </Text>
        <View className="mb-6 flex-row flex-wrap gap-2">
          {CATEGORY_ICON_OPTIONS.map((opt) => {
            const isSelected = selectedIcon === opt.name;
            return (
              <Pressable
                key={opt.name}
                onPress={() => setSelectedIcon(opt.name)}
                className={cn(
                  'items-center gap-1 rounded-xl border p-2 active:opacity-70',
                  isSelected ? 'border-primary bg-primary/10' : 'border-border bg-background',
                )}
                style={{ width: 64 }}
              >
                <View
                  className="h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: selectedColor }}
                >
                  <Icon as={opt.icon} size={16} className="text-white" />
                </View>
                <Text
                  className={cn(
                    'text-center text-[10px]',
                    isSelected ? 'text-primary' : 'text-muted-foreground',
                  )}
                  numberOfLines={1}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={handleSave}
          disabled={!name.trim() || saving}
          className="items-center rounded-2xl bg-primary py-4 active:opacity-80 disabled:opacity-50"
        >
          <Text className="text-base font-semibold text-primary-foreground">
            {saving ? 'Salvando...' : 'Criar Categoria'}
          </Text>
        </Pressable>
      </ScrollView>
    </BottomSheet>
  );
}
