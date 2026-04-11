import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Background } from '@/components/Background';
import { Card } from '@/components/ui/Button';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/AuthProvider';

export default function Dashboard() {
  const { profile, user } = useAuth();
  const firstName =
    profile?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? '';
  const streak = profile?.current_streak ?? 0;
  const xp = profile?.total_xp ?? 0;

  return (
    <Background>
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mt-4 mb-6">
            <Text className="text-emerald-200/70 text-sm">Bonjour 🌱</Text>
            <Text className="text-3xl font-bold text-emerald-50">
              {firstName ? `Salut ${firstName}` : 'Bienvenue'}
            </Text>
          </View>

          <View className="flex-row gap-3">
            <Card className="flex-1">
              <Text className="text-emerald-200/60 text-xs uppercase tracking-wide">
                Streak
              </Text>
              <Text className="mt-2 text-3xl font-bold text-emerald-50">
                {streak}
                <Text className="text-base text-emerald-300"> j 🔥</Text>
              </Text>
            </Card>
            <Card className="flex-1">
              <Text className="text-emerald-200/60 text-xs uppercase tracking-wide">
                Énergie
              </Text>
              <Text className="mt-2 text-3xl font-bold text-emerald-50">
                {xp}
                <Text className="text-base text-emerald-300"> XP ✨</Text>
              </Text>
            </Card>
          </View>

          <View className="mt-6">
            <Text className="text-lg font-semibold text-emerald-50 mb-3">
              Session du jour
            </Text>
            <Card>
              <Text className="text-2xl">🧬</Text>
              <Text className="mt-3 text-xl font-bold text-emerald-50">
                Natif Instinct™
              </Text>
              <Text className="mt-2 text-sm text-emerald-200/80">
                12 min · Phonétique 3 couches. Décompose un mot comme un natif le
                pense, et grave-le pour de bon.
              </Text>
              <View className="mt-4">
                <Button
                  testID="dashboard-start-natif"
                  title="Démarrer la session"
                  onPress={() => router.push('/sessions/natif-instinct')}
                />
              </View>
            </Card>
          </View>

          <View className="mt-6">
            <Text className="text-lg font-semibold text-emerald-50 mb-3">
              Conversation libre
            </Text>
            <Card>
              <Text className="text-2xl">🎭</Text>
              <Text className="mt-3 text-xl font-bold text-emerald-50">Holotalk</Text>
              <Text className="mt-2 text-sm text-emerald-200/80">
                6 personas natifs, conversation streaming temps réel. Pratique sans
                jugement.
              </Text>
              <View className="mt-4">
                <Button
                  testID="dashboard-start-holotalk"
                  title="Discuter maintenant"
                  variant="secondary"
                  onPress={() => router.push('/sessions/holotalk')}
                />
              </View>
            </Card>
          </View>

          <View className="mt-6">
            <Text className="text-lg font-semibold text-emerald-50 mb-3">
              Tous les modes
            </Text>
            <View className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-2">
              <Button
                testID="dashboard-all-sessions"
                title="Voir les 8 modes →"
                variant="ghost"
                onPress={() => router.push('/(tabs)/sessions')}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
}
