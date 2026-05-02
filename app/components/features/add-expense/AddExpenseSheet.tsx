import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/contexts/auth';
import { useCategories } from '@/hooks/useCategories';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { createTransaction } from '@/lib/database/actions/createTransaction';
import { cn } from '@/lib/utils';
import { ChevronRight, Minus, Plus, X } from 'lucide-react-native';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Types ────────────────────────────────────────────────────────────────────

type FormData = {
  type: 'EXPENSE' | 'REVENUE';
  description: string;
  amount: string;
  categoryId: string;
  paymentMethodId: string;
  installments: number;
  isRecurring: boolean;
  frequency: 'NONE' | 'MONTHLY' | 'WEEKLY';
};

export type AddExpenseSheetRef = { open: (initialType?: 'EXPENSE' | 'REVENUE') => void };

// ─── Picker Modal ─────────────────────────────────────────────────────────────

function PickerModal<T extends { id: string; name: string }>({
  visible,
  title,
  items,
  selectedId,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  items: T[];
  selectedId?: string;
  onSelect: (item: T) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/60">
        <Pressable className="absolute inset-0" onPress={onClose} />
        <View className="max-h-[60%] rounded-t-3xl bg-card">
          <View className="flex-row items-center justify-between px-5 py-4">
            <Text variant="h4">{title}</Text>
            <Pressable onPress={onClose} className="p-1">
              <Icon as={X} size={20} className="text-muted-foreground" />
            </Pressable>
          </View>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
            renderItem={({ item }) => (
              <Pressable
                className={cn(
                  'flex-row items-center justify-between border-b border-border py-3.5 active:opacity-70',
                )}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text className="text-base text-foreground">{item.name}</Text>
                {selectedId === item.id && (
                  <View className="h-2.5 w-2.5 rounded-full bg-primary" />
                )}
              </Pressable>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

// ─── Form Row ─────────────────────────────────────────────────────────────────

function FormRow({
  label,
  value,
  placeholder = 'Selecionar',
  onPress,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      className="flex-row items-center justify-between border-b border-border py-4 active:opacity-70"
      onPress={onPress}
      disabled={!onPress}
    >
      <Text variant="muted">{label}</Text>
      <View className="flex-row items-center gap-1.5">
        <Text className={cn('text-sm', value ? 'text-foreground' : 'text-muted-foreground')}>
          {value ?? placeholder}
        </Text>
        {onPress && <Icon as={ChevronRight} size={15} className="text-muted-foreground" />}
      </View>
    </Pressable>
  );
}

// ─── Main Sheet ───────────────────────────────────────────────────────────────

export const AddExpenseSheet = forwardRef<AddExpenseSheetRef>((_, ref) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showPaymentPicker, setShowPaymentPicker] = useState(false);

  const { categories } = useCategories(user?.id ?? '');
  const { paymentMethods } = usePaymentMethods(user?.id ?? '');

  const { control, handleSubmit, reset, watch, setValue } = useForm<FormData>({
    defaultValues: {
      type: 'EXPENSE',
      description: '',
      amount: '',
      categoryId: '',
      paymentMethodId: '',
      installments: 1,
      isRecurring: false,
      frequency: 'NONE',
    },
  });

  const type = watch('type');
  const installments = watch('installments');
  const isRecurring = watch('isRecurring');
  const categoryId = watch('categoryId');
  const paymentMethodId = watch('paymentMethodId');

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const selectedPaymentMethod = paymentMethods.find((p) => p.id === paymentMethodId);

  useImperativeHandle(ref, () => ({
    open: (initialType?: 'EXPENSE' | 'REVENUE') => {
      reset({ ...{ type: 'EXPENSE', description: '', amount: '', categoryId: '', paymentMethodId: '', installments: 1, isRecurring: false, frequency: 'NONE' }, type: initialType ?? 'EXPENSE' });
      setVisible(true);
    },
  }));

  async function onSubmit(data: FormData) {
    if (!user || !data.categoryId || !data.paymentMethodId) return;

    const rawAmount = parseFloat(data.amount.replace(/\./g, '').replace(',', '.'));
    if (!rawAmount || rawAmount <= 0) return;

    try {
      const today = new Date();
      await createTransaction({
        userId: user.id,
        description: data.description || (data.type === 'EXPENSE' ? 'Despesa' : 'Receita'),
        totalAmount: rawAmount,
        type: data.type,
        categoryId: data.categoryId,
        paymentMethodId: data.paymentMethodId,
        date: today,
        dueDate: today,
        totalInstallments: data.type === 'EXPENSE' ? data.installments : 1,
        isRecurring: data.type === 'EXPENSE' ? data.isRecurring : false,
        frequency:
          data.type === 'EXPENSE' && data.isRecurring ? data.frequency : 'NONE',
      });
      setVisible(false);
    } catch (e) {
      console.error('[AddExpense]', e);
    }
  }

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <View className="flex-1 justify-end bg-black/50">
            <Pressable className="absolute inset-0" onPress={() => setVisible(false)} />

            <View
              className="rounded-t-3xl bg-card"
              style={{ paddingBottom: insets.bottom + 16, maxHeight: '92%' }}
            >
              {/* Handle */}
              <View className="items-center pb-2 pt-3">
                <View className="h-1 w-10 rounded-full bg-muted" />
              </View>

              {/* Header */}
              <View className="flex-row items-center justify-between px-5 pb-3">
                <Text variant="h4">
                  {type === 'EXPENSE' ? 'Nova Despesa' : 'Nova Receita'}
                </Text>
                <Pressable onPress={() => setVisible(false)} className="p-1 active:opacity-70">
                  <Icon as={X} size={20} className="text-muted-foreground" />
                </Pressable>
              </View>

              <ScrollView
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 8 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Type toggle */}
                <Controller
                  control={control}
                  name="type"
                  render={({ field: { value, onChange } }) => (
                    <View className="mb-5 flex-row rounded-xl bg-muted p-1">
                      {(['EXPENSE', 'REVENUE'] as const).map((t) => (
                        <Pressable
                          key={t}
                          className={cn(
                            'flex-1 items-center rounded-lg py-2.5',
                            value === t && 'bg-card',
                          )}
                          onPress={() => onChange(t)}
                        >
                          <Text
                            className={cn(
                              'text-sm font-medium',
                              value === t ? 'text-foreground' : 'text-muted-foreground',
                            )}
                          >
                            {t === 'EXPENSE' ? 'Despesa' : 'Receita'}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                />

                {/* Amount */}
                <View className="mb-5 items-center">
                  <Text variant="muted" className="mb-2 text-xs uppercase tracking-widest">
                    Valor
                  </Text>
                  <Controller
                    control={control}
                    name="amount"
                    rules={{ required: true }}
                    render={({ field: { value, onChange, onBlur } }) => (
                      <View className="flex-row items-center gap-2">
                        <Text className="text-2xl font-medium text-muted-foreground">R$</Text>
                        <TextInput
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          placeholder="0,00"
                          keyboardType="decimal-pad"
                          style={{
                            fontSize: 40,
                            fontWeight: '700',
                            minWidth: 120,
                            textAlign: 'center',
                            color: '#f4f4f5',
                          }}
                          placeholderTextColor="#52525b"
                        />
                      </View>
                    )}
                  />
                </View>

                {/* Description */}
                <Controller
                  control={control}
                  name="description"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Descrição (opcional)"
                      style={{
                        height: 48,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#27272a',
                        backgroundColor: '#09090b',
                        paddingHorizontal: 16,
                        fontSize: 16,
                        color: '#f4f4f5',
                        marginBottom: 8,
                      }}
                      placeholderTextColor="#71717a"
                    />
                  )}
                />

                {/* Category */}
                <FormRow
                  label="Categoria"
                  value={selectedCategory?.name}
                  onPress={() => setShowCategoryPicker(true)}
                />

                {/* Payment method */}
                <FormRow
                  label="Forma de Pagamento"
                  value={selectedPaymentMethod?.name}
                  onPress={() => setShowPaymentPicker(true)}
                />

                {/* Installments — expenses only */}
                {type === 'EXPENSE' && (
                  <>
                    <View className="flex-row items-center justify-between border-b border-border py-4">
                      <Text variant="muted">Parcelas</Text>
                      <View className="flex-row items-center gap-4">
                        <Pressable
                          className="h-8 w-8 items-center justify-center rounded-full border border-border active:opacity-70"
                          onPress={() =>
                            setValue('installments', Math.max(1, installments - 1))
                          }
                        >
                          <Icon as={Minus} size={14} className="text-foreground" />
                        </Pressable>
                        <Text className="w-6 text-center font-semibold text-foreground">
                          {installments}
                        </Text>
                        <Pressable
                          className="h-8 w-8 items-center justify-center rounded-full border border-border active:opacity-70"
                          onPress={() =>
                            setValue('installments', Math.min(36, installments + 1))
                          }
                        >
                          <Icon as={Plus} size={14} className="text-foreground" />
                        </Pressable>
                      </View>
                    </View>

                    {/* Recurrence — only when installments = 1 */}
                    {installments === 1 && (
                      <>
                        <View className="flex-row items-center justify-between border-b border-border py-4">
                          <Text variant="muted">Recorrente</Text>
                          <Controller
                            control={control}
                            name="isRecurring"
                            render={({ field: { value, onChange } }) => (
                              <Pressable
                                onPress={() => onChange(!value)}
                                style={{
                                  width: 48,
                                  height: 28,
                                  borderRadius: 14,
                                  padding: 2,
                                  backgroundColor: value ? '#f4f4f5' : '#27272a',
                                  justifyContent: 'center',
                                }}
                              >
                                <View
                                  style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 12,
                                    backgroundColor: value ? '#09090b' : '#71717a',
                                    transform: [{ translateX: value ? 20 : 0 }],
                                  }}
                                />
                              </Pressable>
                            )}
                          />
                        </View>

                        {isRecurring && (
                          <Controller
                            control={control}
                            name="frequency"
                            render={({ field: { value, onChange } }) => (
                              <View className="flex-row gap-3 py-3">
                                {(['MONTHLY', 'WEEKLY'] as const).map((f) => (
                                  <Pressable
                                    key={f}
                                    className={cn(
                                      'flex-1 items-center rounded-xl border py-3',
                                      value === f
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border bg-background',
                                    )}
                                    onPress={() => onChange(f)}
                                  >
                                    <Text
                                      className={cn(
                                        'text-sm font-medium',
                                        value === f ? 'text-primary' : 'text-muted-foreground',
                                      )}
                                    >
                                      {f === 'MONTHLY' ? 'Mensal' : 'Semanal'}
                                    </Text>
                                  </Pressable>
                                ))}
                              </View>
                            )}
                          />
                        )}
                      </>
                    )}
                  </>
                )}

                {/* Submit */}
                <Pressable
                  className="mt-5 items-center rounded-2xl bg-primary py-4 active:opacity-80"
                  onPress={handleSubmit(onSubmit)}
                >
                  <Text className="text-base font-semibold text-primary-foreground">
                    Salvar {type === 'EXPENSE' ? 'Despesa' : 'Receita'}
                  </Text>
                </Pressable>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <PickerModal
        visible={showCategoryPicker}
        title="Categoria"
        items={categories}
        selectedId={categoryId}
        onSelect={(c) => setValue('categoryId', c.id)}
        onClose={() => setShowCategoryPicker(false)}
      />
      <PickerModal
        visible={showPaymentPicker}
        title="Forma de Pagamento"
        items={paymentMethods}
        selectedId={paymentMethodId}
        onSelect={(p) => setValue('paymentMethodId', p.id)}
        onClose={() => setShowPaymentPicker(false)}
      />
    </>
  );
});

AddExpenseSheet.displayName = 'AddExpenseSheet';
