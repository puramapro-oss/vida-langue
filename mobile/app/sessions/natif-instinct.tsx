import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Background } from '@/components/Background';
import { Button, Card } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { fetchPhonetic, logSession, type PhoneticResult } from '@/lib/api';

const LANGUAGES = [
  { code: 'en', label: 'Anglais', voice: 'en-US' },
  { code: 'es', label: 'Espagnol', voice: 'es-ES' },
  { code: 'it', label: 'Italien', voice: 'it-IT' },
  { code: 'de', label: 'Allemand', voice: 'de-DE' },
  { code: 'pt', label: 'Portugais', voice: 'pt-BR' },
  { code: 'ja', label: 'Japonais', voice: 'ja-JP' },
];

export default function NatifInstinct() {
  const [text, setText] = useState('');
  const [target, setTarget] = useState(LANGUAGES[0]);
  const [result, setResult] = useState<PhoneticResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decompose() {
    if (!text.trim()) {
      setError('Tape une phrase à décomposer 🌱');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetchPhonetic({
        text: text.trim(),
        source_language: 'fr',
        target_language: target.code,
      });
      setResult(res);
      await logSession({
        mode: 'natif-instinct',
        duration_minutes: 12,
        language: target.code,
      }).catch(() => {});
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erreur inconnue';
      setError(`Impossible de décomposer pour le moment. ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  function speak(content: string) {
    Haptics.selectionAsync().catch(() => {});
    Speech.stop();
    Speech.speak(content, { language: target.voice, rate: 0.85 });
  }

  return (
    <Background>
      <SafeAreaView className="flex-1">
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        >
          <Pressable onPress={() => router.back()} className="mt-4 mb-4">
            <Text className="text-emerald-300">← Retour</Text>
          </Pressable>

          <Text className="text-3xl font-bold text-emerald-50">
            🧬 Natif Instinct™
          </Text>
          <Text className="mt-2 text-emerald-200/70">
            Décompose une phrase en 3 couches phonétiques.
          </Text>

          <View className="mt-6">
            <Text className="mb-2 text-sm text-emerald-100/80">Langue cible</Text>
            <View className="flex-row flex-wrap gap-2">
              {LANGUAGES.map((lang) => {
                const active = lang.code === target.code;
                return (
                  <Pressable
                    key={lang.code}
                    onPress={() => {
                      setTarget(lang);
                      Haptics.selectionAsync().catch(() => {});
                    }}
                    testID={`lang-${lang.code}`}
                    className={`rounded-full border px-4 py-2 ${active ? 'border-emerald-400 bg-emerald-500/20' : 'border-white/10 bg-white/5'}`}
                  >
                    <Text
                      className={
                        active ? 'text-emerald-100' : 'text-emerald-200/70'
                      }
                    >
                      {lang.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="mt-6">
            <Input
              label="Phrase en français"
              value={text}
              onChangeText={setText}
              placeholder="Bonjour, comment ça va ?"
              testID="natif-input"
              multiline
            />
          </View>

          {error ? (
            <Text className="mt-3 text-red-400">{error}</Text>
          ) : null}

          <View className="mt-5">
            <Button
              testID="natif-decompose"
              title={loading ? 'Décomposition…' : 'Décomposer 🌱'}
              onPress={decompose}
              loading={loading}
            />
          </View>

          {result?.layers?.length ? (
            <View className="mt-8 gap-4">
              <Text className="text-lg font-semibold text-emerald-50">
                3 couches phonétiques
              </Text>
              {result.layers.map((layer, i) => (
                <Card key={i}>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs uppercase tracking-wide text-emerald-300">
                      Couche {i + 1} · {layer.name}
                    </Text>
                    <Pressable
                      onPress={() => speak(layer.text)}
                      className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1"
                      testID={`natif-speak-${i}`}
                    >
                      <Text className="text-xs text-emerald-200">▶ Écouter</Text>
                    </Pressable>
                  </View>
                  <Text
                    className="mt-3 text-base text-emerald-50"
                    selectable
                  >
                    {layer.text}
                  </Text>
                </Card>
              ))}

              {result.word_breakdown?.length ? (
                <View>
                  <Text className="mt-4 text-lg font-semibold text-emerald-50">
                    Mot par mot
                  </Text>
                  <View className="mt-3 gap-2">
                    {result.word_breakdown.map((w, i) => (
                      <View
                        key={i}
                        className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4"
                      >
                        <View className="flex-row items-center justify-between">
                          <Text className="text-base font-semibold text-emerald-100">
                            {w.word}
                          </Text>
                          <Pressable onPress={() => speak(w.word)}>
                            <Text className="text-xs text-emerald-300">▶</Text>
                          </Pressable>
                        </View>
                        <Text className="mt-1 text-sm text-emerald-200/80">
                          {w.phonetic}
                        </Text>
                        <Text className="mt-1 text-sm text-emerald-100/70">
                          → {w.meaning}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
            </View>
          ) : (
            !loading && (
              <View className="mt-12 items-center">
                <Text className="text-6xl">🌿</Text>
                <Text className="mt-3 text-center text-emerald-200/70">
                  Tape une phrase et appuie sur Décomposer pour démarrer.
                </Text>
              </View>
            )
          )}

          {loading ? (
            <View className="mt-8 items-center">
              <ActivityIndicator color="#34D399" />
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
}
