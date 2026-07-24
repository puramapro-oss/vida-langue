import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { Background } from '@/components/Background';
import { Card } from '@/components/ui/Button';
import { API_URL } from '@/lib/constants';
import { supabase } from '@/lib/supabase';

type Persona = {
  id: string;
  name: string;
  emoji: string;
  language: string;
  voice: string;
  description: string;
};

const PERSONAS: Persona[] = [
  {
    id: 'maya-en',
    name: 'Maya',
    emoji: '🇺🇸',
    language: 'en',
    voice: 'en-US',
    description: 'New York · 28 ans · journaliste, parle vite et chaleureux',
  },
  {
    id: 'lucia-es',
    name: 'Lucía',
    emoji: '🇪🇸',
    language: 'es',
    voice: 'es-ES',
    description: 'Séville · 32 ans · prof d\'art, accent andalou doux',
  },
  {
    id: 'matteo-it',
    name: 'Matteo',
    emoji: '🇮🇹',
    language: 'it',
    voice: 'it-IT',
    description: 'Rome · 35 ans · architecte, gestes et énergie',
  },
  {
    id: 'klaus-de',
    name: 'Klaus',
    emoji: '🇩🇪',
    language: 'de',
    voice: 'de-DE',
    description: 'Berlin · 41 ans · ingénieur précis et bienveillant',
  },
  {
    id: 'rafa-pt',
    name: 'Rafa',
    emoji: '🇧🇷',
    language: 'pt',
    voice: 'pt-BR',
    description: 'Rio · 26 ans · musicien, accent carioca',
  },
  {
    id: 'yuki-ja',
    name: 'Yuki',
    emoji: '🇯🇵',
    language: 'ja',
    voice: 'ja-JP',
    description: 'Tokyo · 30 ans · designer, parle calmement',
  },
];

type Message = { role: 'user' | 'assistant'; content: string };

export default function Holotalk() {
  const [persona, setPersona] = useState<Persona>(PERSONAS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content:
          persona.language === 'fr'
            ? `Salut, je suis ${persona.name} ✨`
            : persona.language === 'en'
              ? `Hi! I'm ${persona.name}. What do you want to talk about today?`
              : persona.language === 'es'
                ? `¡Hola! Soy ${persona.name}. ¿De qué hablamos hoy?`
                : persona.language === 'it'
                  ? `Ciao! Sono ${persona.name}. Di che cosa parliamo oggi?`
                  : persona.language === 'de'
                    ? `Hallo! Ich bin ${persona.name}. Worüber wollen wir reden?`
                    : persona.language === 'pt'
                      ? `Oi! Eu sou ${persona.name}. Sobre o que falamos hoje?`
                      : `こんにちは！${persona.name}です。今日は何の話をしましょうか？`,
      },
    ]);
  }, [persona.id, persona.name, persona.language]);

  async function send() {
    const trimmed = input.trim();
    if (!trimmed || busy) return;
    setInput('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    const userMsg: Message = { role: 'user', content: trimmed };
    const optimistic = [...messages, userMsg];
    setMessages(optimistic);
    setBusy(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch(`${API_URL}/holotalk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          persona: persona.id,
          language: persona.language,
          messages: optimistic,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const text = await res.text();
      const reply = text.trim().length > 0 ? text : '…';
      setMessages([...optimistic, { role: 'assistant', content: reply }]);

      Speech.stop();
      Speech.speak(reply, { language: persona.voice, rate: 0.92 });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erreur';
      setMessages([
        ...optimistic,
        {
          role: 'assistant',
          content: `Impossible de répondre pour le moment 🌿 (${msg})`,
        },
      ]);
    } finally {
      setBusy(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  return (
    <Background>
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <View className="px-5 pt-4">
            <Pressable onPress={() => router.back()} className="mb-3">
              <Text className="text-emerald-300">← Retour</Text>
            </Pressable>
            <Text className="text-2xl font-bold text-emerald-50">🎭 Holotalk</Text>
            <Text className="text-emerald-200/70 text-sm">
              {persona.emoji} {persona.name} · {persona.description}
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-3"
              contentContainerStyle={{ gap: 8 }}
            >
              {PERSONAS.map((p) => {
                const active = p.id === persona.id;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => {
                      setPersona(p);
                      Speech.stop();
                      Haptics.selectionAsync().catch(() => {});
                    }}
                    testID={`holotalk-persona-${p.id}`}
                    className={`rounded-full border px-4 py-2 ${active ? 'border-emerald-400 bg-emerald-500/20' : 'border-white/10 bg-white/5'}`}
                  >
                    <Text
                      className={
                        active ? 'text-emerald-100' : 'text-emerald-200/70'
                      }
                    >
                      {p.emoji} {p.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <ScrollView
            ref={scrollRef}
            className="flex-1 px-5"
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
          >
            {messages.map((m, i) => (
              <View
                key={i}
                className={`mb-3 ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <View
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    m.role === 'user'
                      ? 'bg-emerald-500/30 border border-emerald-400/40'
                      : 'bg-white/[0.06] border border-white/[0.08]'
                  }`}
                >
                  <Text className="text-emerald-50">{m.content}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View className="px-5 pb-6 pt-2">
            <Card className="flex-row items-end gap-2 p-2">
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder={`Écris en ${persona.language}…`}
                placeholderTextColor="rgba(167,243,208,0.4)"
                className="flex-1 px-3 py-3 text-emerald-50"
                style={{ minHeight: 44 }}
                multiline
                testID="holotalk-input"
                onSubmitEditing={send}
              />
              <Pressable
                onPress={send}
                disabled={busy || !input.trim()}
                testID="holotalk-send"
                className={`h-11 w-11 items-center justify-center rounded-full ${busy || !input.trim() ? 'bg-emerald-500/30' : 'bg-emerald-500'}`}
              >
                <Text className="text-lg text-[#0A0A0F]">↑</Text>
              </Pressable>
            </Card>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Background>
  );
}
