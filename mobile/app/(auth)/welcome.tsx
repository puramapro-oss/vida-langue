import { Image, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Background } from '@/components/Background';
import { Button } from '@/components/ui/Button';

export default function Welcome() {
  return (
    <Background>
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 28,
            paddingVertical: 32,
          }}
        >
          <View className="flex-1 items-center justify-center">
            <View className="h-32 w-32 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
              <Image
                source={require('../../assets/icon.png')}
                style={{ width: 100, height: 100, borderRadius: 24 }}
              />
            </View>

            <Text className="mt-8 text-center text-4xl font-bold text-emerald-50">
              VEDA
            </Text>
            <Text className="mt-3 text-center text-base text-emerald-200/80">
              Apprends une langue comme un natif. Phonétique 3 couches, voix réelles,
              50+ langues. Guidé par NAMA.
            </Text>

            <View className="mt-10 w-full gap-3">
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl">🧬</Text>
                <Text className="flex-1 text-emerald-100/90">
                  Natif Instinct™ — la phonétique décomposée comme un natif la pense
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl">🎭</Text>
                <Text className="flex-1 text-emerald-100/90">
                  8 modes de session : conversation, sommeil, hypno, reality
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl">🌱</Text>
                <Text className="flex-1 text-emerald-100/90">
                  14 jours d'essai gratuit. Annule en 1 clic.
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-8 gap-3">
            <Button
              testID="welcome-signup"
              title="Démarrer mes 14 jours gratuits"
              onPress={() => router.push('/(auth)/signup')}
            />
            <Button
              testID="welcome-login"
              title="J'ai déjà un compte"
              variant="secondary"
              onPress={() => router.push('/(auth)/login')}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
}
