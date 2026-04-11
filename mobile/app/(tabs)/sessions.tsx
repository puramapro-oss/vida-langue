import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Background } from '@/components/Background';
import { SESSION_MODES } from '@/lib/constants';

export default function Sessions() {
  return (
    <Background>
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mt-4 mb-6">
            <Text className="text-3xl font-bold text-emerald-50">
              8 modes de session
            </Text>
            <Text className="mt-2 text-emerald-200/70">
              Chaque mode active une zone différente du cerveau linguistique.
            </Text>
          </View>

          <View className="gap-3">
            {SESSION_MODES.map((mode) => (
              <Pressable
                key={mode.slug}
                testID={`session-card-${mode.slug}`}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  router.push(`/sessions/${mode.slug}`);
                }}
                className="active:opacity-80"
              >
                <View
                  className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5"
                  style={{ borderLeftWidth: 4, borderLeftColor: mode.color }}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-3xl">{mode.emoji}</Text>
                    <Text className="text-xs text-emerald-300/70">
                      {mode.duration} min
                    </Text>
                  </View>
                  <Text className="mt-3 text-xl font-bold text-emerald-50">
                    {mode.title}
                  </Text>
                  <Text className="mt-1 text-sm text-emerald-200/70">
                    {mode.description}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
}
