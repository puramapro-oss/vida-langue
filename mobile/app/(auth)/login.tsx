import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Background } from '@/components/Background';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setError(null);
    if (!email || !password) {
      setError('Email et mot de passe requis 🌱');
      return;
    }
    setLoading(true);
    const { error: signError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);
    if (signError) {
      setError(
        signError.message.includes('Invalid')
          ? 'Email ou mot de passe incorrect. Réessaie 🌿'
          : signError.message
      );
      return;
    }
    router.replace('/(tabs)/dashboard');
  }

  return (
    <Background>
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 28,
              paddingVertical: 32,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <Pressable onPress={() => router.back()} className="mb-4">
              <Text className="text-emerald-300">← Retour</Text>
            </Pressable>

            <Text className="text-3xl font-bold text-emerald-50">
              Bon retour 🌱
            </Text>
            <Text className="mt-2 text-emerald-200/70">
              Reprends ton voyage linguistique là où tu l&apos;as laissé.
            </Text>

            <View className="mt-8 gap-4">
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="toi@exemple.com"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                testID="login-email"
              />
              <Input
                label="Mot de passe"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                autoComplete="password"
                testID="login-password"
              />
              {error ? (
                <Text className="text-red-400" testID="login-error">
                  {error}
                </Text>
              ) : null}

              <Button
                testID="login-submit"
                title="Se connecter"
                onPress={handleLogin}
                loading={loading}
              />

              <Pressable
                onPress={() => router.push('/(auth)/forgot')}
                className="items-center py-3"
              >
                <Text className="text-emerald-300">Mot de passe oublié ?</Text>
              </Pressable>

              <Pressable
                onPress={() => router.replace('/(auth)/signup')}
                className="items-center py-3"
              >
                <Text className="text-emerald-100/70">
                  Pas encore de compte ? <Text className="text-emerald-300">Créer un compte</Text>
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Background>
  );
}
