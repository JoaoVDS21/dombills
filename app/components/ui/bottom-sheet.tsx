import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { X } from 'lucide-react-native';
import { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxHeightPct?: number;
};

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  maxHeightPct = 90,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View className="flex-1 justify-end bg-black/50">
          <Pressable className="absolute inset-0" onPress={onClose} />
          <View
            className="rounded-t-3xl bg-card"
            style={{
              paddingBottom: insets.bottom + 16,
              maxHeight: `${maxHeightPct}%`,
            }}
          >
            {/* Drag handle */}
            <View className="items-center pb-2 pt-3">
              <View className="h-1 w-10 rounded-full bg-muted" />
            </View>

            {title && (
              <View className="flex-row items-center justify-between px-5 pb-3">
                <Text variant="h4">{title}</Text>
                <Pressable onPress={onClose} className="p-1 active:opacity-70">
                  <Icon as={X} size={20} className="text-muted-foreground" />
                </Pressable>
              </View>
            )}

            {children}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
