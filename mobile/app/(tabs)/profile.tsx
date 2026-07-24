import { useState } from 'react';
import { Alert, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Background } from '@/components/Background';
import { Button, Card } from '@/components/ui/Button';
import { useAuth } from '@/components/AuthProvider';
import { REFERRAL_TIERS, WEB_URL } from '@/lib/constants';

export default function Profile() {
  const { profile, user, signOut } = useAuth();
  const [copied, setCopied] = useState(false);

  const code = profile?.referral_code ?? '';
  const link = code ? `${WEB_URL}/go/${code}` : `${WEB_URL}`;
  const subscribed = 0;

  const tier =
    [...REFERRAL_TIERS]
      .reverse()
      .find((t) => subscribed >= t.count) ?? REFERRAL_TIERS[0];

  async function copy() {
    await Clipboard.setStringAsync(link);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {}
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function share() {
    try {
      await Share.share({
        message: `Apprends une langue comme un natif avec VEDA 🌱 ${link}`,
      });
    } catch {
      // Ignore share errors
    }
  }

  function confirmSignOut() {
    Alert.alert('Déconnexion', 'Tu veux vraiment te déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Se déconnecter',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  }

  return (
    <Background>
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        >
          <View className="mt-4 mb-6">
            <Text className="text-3xl font-bold text-emerald-50">Profil 👤</Text>
          </View>

          <Card>
            <Text className="text-lg font-bold text-emerald-50">
              {profile?.full_name ?? user?.email}
            </Text>
            <Text className="mt-1 text-sm text-emerald-200/70">{user?.email}</Text>
            <View className="mt-4 flex-row gap-2">
              <View className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
                <Text className="text-xs text-emerald-200">
                  Plan : {profile?.plan ?? 'free'}
                </Text>
              </View>
              <View className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
                <Text className="text-xs text-emerald-200">
                  {profile?.current_streak ?? 0} j 🔥
                </Text>
              </View>
            </View>
          </Card>

          <View className="mt-6">
            <Card>
              <Text className="text-lg font-bold text-emerald-50">
                Mon parrainage 🌱
              </Text>
              <Text className="mt-2 text-sm text-emerald-100/80">
                Palier actuel : <Text className="text-emerald-300">{tier.label}</Text>
              </Text>
              <View className="mt-4 rounded-2xl bg-black/30 p-4">
                <Text className="text-xs uppercase text-emerald-300/70">
                  Ton lien
                </Text>
                <Text
                  className="mt-1 text-sm text-emerald-100"
                  selectable
                  testID="profile-referral-link"
                >
                  {link}
                </Text>
              </View>
              <View className="mt-4 flex-row gap-3">
                <View className="flex-1">
                  <Button
                    testID="profile-copy"
                    title={copied ? 'Copié ✓' : 'Copier'}
                    variant="secondary"
                    onPress={copy}
                  />
                </View>
                <View className="flex-1">
                  <Button
                    testID="profile-share"
                    title="Partager"
                    onPress={share}
                  />
                </View>
              </View>
            </Card>
          </View>

          <View className="mt-6">
            <Card>
              <Text className="text-lg font-bold text-emerald-50">Réglages</Text>
              <Pressable
                onPress={() => router.push('/sessions/holotalk')}
                className="mt-4 flex-row items-center justify-between py-3"
              >
                <Text className="text-emerald-100">Aide & FAQ</Text>
                <Text className="text-emerald-300">→</Text>
              </Pressable>
              <View className="h-px bg-white/[0.06]" />
              <Pressable
                onPress={confirmSignOut}
                testID="profile-signout"
                className="mt-2 flex-row items-center justify-between py-3"
              >
                <Text className="text-red-300">Se déconnecter</Text>
                <Text className="text-red-300">→</Text>
              </Pressable>
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
}
