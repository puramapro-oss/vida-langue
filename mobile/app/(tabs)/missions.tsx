import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Background } from '@/components/Background';
import { Card } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

type Mission = {
  id: string;
  title: string;
  description: string;
  reward_xp: number;
  category: string;
  active: boolean;
};

export default function Missions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase
      .from('missions')
      .select('*')
      .eq('active', true)
      .order('reward_xp', { ascending: false })
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          setMissions([]);
        } else {
          setMissions((data ?? []) as Mission[]);
        }
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Background>
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        >
          <View className="mt-4 mb-6">
            <Text className="text-3xl font-bold text-emerald-50">
              Missions 🌍
            </Text>
            <Text className="mt-2 text-emerald-200/70">
              Apprends en aidant le monde réel.
            </Text>
          </View>

          {loading ? (
            <View className="items-center py-12">
              <ActivityIndicator color="#34D399" />
            </View>
          ) : missions.length === 0 ? (
            <Card>
              <Text className="text-emerald-100/80">
                Aucune mission disponible pour le moment 🌱
              </Text>
            </Card>
          ) : (
            <View className="gap-3">
              {missions.map((m) => (
                <Card key={m.id}>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs uppercase tracking-wide text-emerald-300">
                      {m.category}
                    </Text>
                    <Text className="text-sm font-semibold text-emerald-200">
                      +{m.reward_xp} XP
                    </Text>
                  </View>
                  <Text className="mt-2 text-lg font-bold text-emerald-50">
                    {m.title}
                  </Text>
                  <Text className="mt-1 text-sm text-emerald-100/80">
                    {m.description}
                  </Text>
                </Card>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
}
