import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Text } from '@/components/ui/text';
import { createPaymentMethod } from '@/lib/database/actions/createPaymentMethod';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

type PaymentType = 'CREDIT' | 'DEBIT' | 'PIX' | 'CASH';

const PAYMENT_TYPES: { value: PaymentType; label: string }[] = [
  { value: 'CREDIT', label: 'Crédito' },
  { value: 'DEBIT', label: 'Débito' },
  { value: 'PIX', label: 'Pix' },
  { value: 'CASH', label: 'Dinheiro' },
];

type AddPaymentMethodSheetProps = {
  visible: boolean;
  onClose: () => void;
  userId: string;
};

export function AddPaymentMethodSheet({
  visible,
  onClose,
  userId,
}: AddPaymentMethodSheetProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<PaymentType>('CREDIT');
  const [lastDigits, setLastDigits] = useState('');
  const [saving, setSaving] = useState(false);

  const isCard = type === 'CREDIT' || type === 'DEBIT';

  async function handleSave() {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      await createPaymentMethod({
        userId,
        name: name.trim(),
        type,
        lastDigits: isCard && lastDigits.length === 4 ? lastDigits : undefined,
      });
      setName('');
      setType('CREDIT');
      setLastDigits('');
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Nova Forma de Pagamento">
      <View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
        {/* Name */}
        <Text variant="muted" className="mb-2 text-xs uppercase tracking-wide">
          Nome
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ex: Cartão Nubank"
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

        {/* Type */}
        <Text variant="muted" className="mb-3 text-xs uppercase tracking-wide">
          Tipo
        </Text>
        <View className="mb-5 flex-row gap-2">
          {PAYMENT_TYPES.map((pt) => (
            <Pressable
              key={pt.value}
              onPress={() => setType(pt.value)}
              className={cn(
                'flex-1 items-center rounded-xl border py-3 active:opacity-70',
                type === pt.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-background',
              )}
            >
              <Text
                className={cn(
                  'text-sm font-medium',
                  type === pt.value ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {pt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Last digits — only for card types */}
        {isCard && (
          <>
            <Text variant="muted" className="mb-2 text-xs uppercase tracking-wide">
              Últimos 4 dígitos (opcional)
            </Text>
            <TextInput
              value={lastDigits}
              onChangeText={(v) => setLastDigits(v.replace(/\D/g, '').slice(0, 4))}
              placeholder="1234"
              keyboardType="number-pad"
              maxLength={4}
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
                letterSpacing: 4,
              }}
              placeholderTextColor="#71717a"
            />
          </>
        )}

        <Pressable
          onPress={handleSave}
          disabled={!name.trim() || saving}
          className="items-center rounded-2xl bg-primary py-4 active:opacity-80 disabled:opacity-50"
        >
          <Text className="text-base font-semibold text-primary-foreground">
            {saving ? 'Salvando...' : 'Criar Forma de Pagamento'}
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}
