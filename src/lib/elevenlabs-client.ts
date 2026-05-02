/**
 * ElevenLabs TTS client (browser-side).
 * Fallback Web Speech API si fetch fail (réseau, 401, 429, 500…).
 * Cache mémoire local par texte+langue pour éviter re-fetch identiques.
 */

const LOCALE_MAP: Record<string, string> = {
  en: 'en-US', es: 'es-ES', it: 'it-IT', de: 'de-DE', pt: 'pt-PT',
  ja: 'ja-JP', zh: 'zh-CN', ko: 'ko-KR', ar: 'ar-SA', ru: 'ru-RU',
  hi: 'hi-IN', tr: 'tr-TR', nl: 'nl-NL', pl: 'pl-PL', sv: 'sv-SE', fr: 'fr-FR',
}

// Cache audio par clé `${language}::${text}` → blob URL
const audioCache = new Map<string, string>()

// Audio actuellement joué (pour pouvoir l'arrêter)
let currentAudio: HTMLAudioElement | null = null

function speakWithWebSpeech(text: string, language: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  const clean = text.replace(/\([^)]*\)/g, '').replace(/\*[^*]*\*/g, '').trim()
  if (!clean) return
  const utterance = new SpeechSynthesisUtterance(clean)
  utterance.lang = LOCALE_MAP[language] ?? 'en-US'
  utterance.rate = 0.95
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio = null
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

/**
 * Joue le texte avec ElevenLabs. Fallback sur Web Speech si erreur.
 * @param text Texte à lire (sera nettoyé : parenthèses, astérisques retirés)
 * @param language Code ISO 2 lettres (en, es, fr, ja…)
 */
export async function speakWithElevenLabs(text: string, language: string): Promise<void> {
  const clean = text.replace(/\([^)]*\)/g, '').replace(/\*[^*]*\*/g, '').trim()
  if (!clean) return

  stopSpeaking()

  const cacheKey = `${language}::${clean.slice(0, 200)}`
  const cachedUrl = audioCache.get(cacheKey)
  if (cachedUrl) {
    return playUrl(cachedUrl, text, language)
  }

  try {
    const res = await fetch('/api/elevenlabs/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: clean, language }),
    })

    if (!res.ok || !res.body) {
      // Fallback Web Speech
      speakWithWebSpeech(text, language)
      return
    }

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    audioCache.set(cacheKey, url)
    return playUrl(url, text, language)
  } catch {
    speakWithWebSpeech(text, language)
  }
}

function playUrl(url: string, fallbackText: string, language: string): Promise<void> {
  return new Promise((resolve) => {
    const audio = new Audio(url)
    currentAudio = audio
    audio.onended = () => {
      if (currentAudio === audio) currentAudio = null
      resolve()
    }
    audio.onerror = () => {
      speakWithWebSpeech(fallbackText, language)
      resolve()
    }
    audio.play().catch(() => {
      speakWithWebSpeech(fallbackText, language)
      resolve()
    })
  })
}
