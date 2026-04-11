import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Background } from '@/components/Background';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { WEB_URL } from '@/lib/constants';

export default function Forgot() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    setError(null);
    if (!email) {
      setError('Email requis 🌱');
      return;
    }
    setLoading(true);
    const { error: rpcError } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${WEB_URL}/forgot-password` }
    );
    setLoading(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    setSent(true);
  }

  return (
    <Background>
      <SafeAreaView className="flex-1">
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 28,
            paddingVertical: 32,
          }}
        >
          <Pressable onPress={() => router.back()} className="mb-4">
            <Text className="text-emerald-300">← Retour</Text>
          </Pressable>

          <Text className="text-3xl font-bold text-emerald-50">
            Mot de passe oublié 🌿
          </Text>
          <Text className="mt-2 text-emerald-200/70">
            Saisis ton email — on t'envoie un lien de réinitialisation.
          </Text>

          <View className="mt-8 gap-4">
            {sent ? (
              <View className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
                <Text className="text-emerald-100">
                  Email envoyé ✨ Vérifie ta boîte de réception.
                </Text>
              </View>
            ) : (
              <>
                <Input
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="toi@exemple.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  testID="forgot-email"
                />
                {error ? <Text className="text-red-400">{error}</Text> : null}
                <Button
                  testID="forgot-submit"
                  title="Envoyer le lien"
                  onPress={handleSend}
                  loading={loading}
                />
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
}
