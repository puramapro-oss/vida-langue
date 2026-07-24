import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { Background } from '@/components/Background';
import { Button, Card } from '@/components/ui/Button';
import { SESSION_MODES } from '@/lib/constants';
import { fetchGuidedSession, logSession } from '@/lib/api';

type Phase = { title: string; text: string; duration: number };

export default function GuidedSessionScreen() {
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const config = SESSION_MODES.find((m) => m.slug === mode);

  const [phases, setPhases] = useState<Phase[]>([]);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  useEffect(() => {
    if (!running || phases.length === 0) return;
    if (secondsLeft <= 0) {
      if (currentPhase < phases.length - 1) {
        const next = currentPhase + 1;
        setCurrentPhase(next);
        setSecondsLeft(phases[next].duration);
        Speech.stop();
        Speech.speak(phases[next].text, { language: 'fr-FR', rate: 0.85 });
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        ).catch(() => {});
      } else {
        setRunning(false);
        Speech.stop();
        logSession({
          mode: mode ?? 'unknown',
          duration_minutes: config?.duration ?? 15,
          language: 'en',
        }).catch(() => {});
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        ).catch(() => {});
      }
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, secondsLeft, currentPhase, phases, mode, config]);

  async function load() {
    if (!mode || !config) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetchGuidedSession({
        mode,
        language: 'en',
      });
      const list = (res.phases ?? []).map((p) => ({
        title: p.title,
        text: p.text,
        duration: Math.max(30, p.duration ?? 60),
      }));
      if (list.length === 0) {
        throw new Error('Pas de phases retournées');
      }
      setPhases(list);
      setCurrentPhase(0);
      setSecondsLeft(list[0].duration);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erreur';
      setError(`Impossible de charger la session : ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  function start() {
    if (phases.length === 0) return;
    setRunning(true);
    Speech.stop();
    Speech.speak(phases[currentPhase].text, {
      language: 'fr-FR',
      rate: 0.85,
    });
  }

  function pause() {
    setRunning(false);
    Speech.stop();
  }

  if (!config) {
    return (
      <Background>
        <SafeAreaView className="flex-1 items-center justify-center">
          <Text className="text-emerald-50">Mode introuvable 🌱</Text>
          <Pressable onPress={() => router.back()} className="mt-4">
            <Text className="text-emerald-300">← Retour</Text>
          </Pressable>
        </SafeAreaView>
      </Background>
    );
  }

  const phase = phases[currentPhase];
  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <Background>
      <SafeAreaView className="flex-1">
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 80 }}
        >
          <Pressable onPress={() => router.back()} className="mt-4 mb-4">
            <Text className="text-emerald-300">← Retour</Text>
          </Pressable>

          <Text className="text-4xl">{config.emoji}</Text>
          <Text className="mt-2 text-3xl font-bold text-emerald-50">
            {config.title}
          </Text>
          <Text className="mt-1 text-emerald-200/70">
            {config.duration} min · {config.description}
          </Text>

          {phases.length === 0 ? (
            <View className="mt-10">
              <Card>
                <Text className="text-emerald-100/90">
                  Prêt à entrer dans la zone {config.title.toLowerCase()} ?
                </Text>
                <Text className="mt-2 text-sm text-emerald-200/70">
                  NAMA va générer une session guidée sur mesure.
                </Text>
                <View className="mt-5">
                  <Button
                    testID="guided-prepare"
                    title={loading ? 'Préparation…' : 'Préparer la session'}
                    onPress={load}
                    loading={loading}
                  />
                </View>
                {error ? (
                  <Text className="mt-3 text-red-400">{error}</Text>
                ) : null}
              </Card>
            </View>
          ) : (
            <View className="mt-8">
              <Card>
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs uppercase tracking-wide text-emerald-300">
                    Phase {currentPhase + 1} / {phases.length}
                  </Text>
                  <Text className="text-xs text-emerald-200/70">
                    {phase?.title}
                  </Text>
                </View>
                <Text className="mt-4 text-5xl font-bold text-emerald-50">
                  {minutes}:{secs.toString().padStart(2, '0')}
                </Text>
                <Text className="mt-4 text-base text-emerald-100/90">
                  {phase?.text}
                </Text>
                <View className="mt-6 gap-3">
                  {running ? (
                    <Button
                      testID="guided-pause"
                      title="Pause ⏸"
                      variant="secondary"
                      onPress={pause}
                    />
                  ) : (
                    <Button
                      testID="guided-start"
                      title={
                        currentPhase === 0 && secondsLeft === phases[0].duration
                          ? 'Démarrer 🌱'
                          : 'Reprendre'
                      }
                      onPress={start}
                    />
                  )}
                  <Button
                    testID="guided-restart"
                    title="Recharger une autre session"
                    variant="ghost"
                    onPress={load}
                  />
                </View>
              </Card>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
}
