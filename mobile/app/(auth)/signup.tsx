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

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accept, setAccept] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignup() {
    setError(null);
    if (!fullName || !email || !password) {
      setError('Tous les champs sont requis 🌱');
      return;
    }
    if (password.length < 8) {
      setError('Mot de passe : 8 caractères minimum 🌿');
      return;
    }
    if (!accept) {
      setError('Tu dois accepter les CGU pour continuer.');
      return;
    }
    setLoading(true);
    const { error: signError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: fullName.trim() },
      },
    });
    setLoading(false);
    if (signError) {
      setError(
        signError.message.includes('already')
          ? 'Cet email a déjà un compte. Connecte-toi.'
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
              Bienvenue sur VEDA 🌱
            </Text>
            <Text className="mt-2 text-emerald-200/70">
              14 jours d'essai gratuit. Annule en 1 clic.
            </Text>

            <View className="mt-8 gap-4">
              <Input
                label="Prénom"
                value={fullName}
                onChangeText={setFullName}
                placeholder="Marie"
                autoComplete="name"
                testID="signup-name"
              />
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="toi@exemple.com"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                testID="signup-email"
              />
              <Input
                label="Mot de passe"
                value={password}
                onChangeText={setPassword}
                placeholder="8 caractères minimum"
                secureTextEntry
                autoComplete="password-new"
                testID="signup-password"
              />

              <Pressable
                onPress={() => setAccept(!accept)}
                className="flex-row items-center gap-3 py-2"
                testID="signup-cgu"
              >
                <View
                  className={`h-6 w-6 items-center justify-center rounded-md border ${accept ? 'border-emerald-400 bg-emerald-500/30' : 'border-white/20 bg-white/5'}`}
                >
                  {accept ? (
                    <Text className="text-emerald-200">✓</Text>
                  ) : null}
                </View>
                <Text className="flex-1 text-sm text-emerald-100/80">
                  J'accepte les CGU et la politique de confidentialité de VEDA.
                </Text>
              </Pressable>

              {error ? (
                <Text className="text-red-400" testID="signup-error">
                  {error}
                </Text>
              ) : null}

              <Button
                testID="signup-submit"
                title="Créer mon compte"
                onPress={handleSignup}
                loading={loading}
              />

              <Pressable
                onPress={() => router.replace('/(auth)/login')}
                className="items-center py-3"
              >
                <Text className="text-emerald-100/70">
                  Déjà inscrit ? <Text className="text-emerald-300">Se connecter</Text>
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Background>
  );
}
