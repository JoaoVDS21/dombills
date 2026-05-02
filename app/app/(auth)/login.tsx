import { Link, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/contexts/auth';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) return setError('Preencha todos os campos');
    setError('');
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace('/(tabs)');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao entrar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-950"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 justify-center px-6">
        <Text className="mb-2 text-3xl font-bold text-white">Entrar</Text>
        <Text className="mb-10 text-base text-slate-400">Bem-vindo de volta</Text>

        <TextInput
          className="mb-4 rounded-xl border border-slate-700 bg-slate-900 px-4 py-4 text-base text-white"
          placeholder="Email"
          placeholderTextColor="#64748b"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          className="mb-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-4 text-base text-white"
          placeholder="Senha"
          placeholderTextColor="#64748b"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={handleLogin}
        />

        {error ? <Text className="mb-4 text-sm text-red-400">{error}</Text> : <View className="mb-4" />}

        <TouchableOpacity
          className="items-center rounded-xl bg-blue-600 py-4 active:opacity-80 disabled:opacity-50"
          onPress={handleLogin}
          disabled={loading}
        >
          <Text className="text-base font-semibold text-white">
            {loading ? 'Entrando...' : 'Entrar'}
          </Text>
        </TouchableOpacity>

        <View className="mt-6 flex-row justify-center">
          <Text className="text-slate-400">Não tem conta? </Text>
          <Link href="/(auth)/register" className="text-blue-400 font-semibold">
            Cadastrar
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
