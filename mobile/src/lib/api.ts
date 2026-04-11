import { API_URL } from './constants';
import { supabase } from './supabase';

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

export async function apiPost<T = unknown>(
  path: string,
  body: unknown
): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erreur ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function apiGet<T = unknown>(path: string): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}${path}`, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erreur ${res.status}`);
  }
  return (await res.json()) as T;
}

export type PhoneticResult = {
  layers: { name: string; text: string }[];
  word_breakdown: { word: string; meaning: string; phonetic: string }[];
};

export async function fetchPhonetic(input: {
  text: string;
  source_language: string;
  target_language: string;
}): Promise<PhoneticResult> {
  return apiPost<PhoneticResult>('/phonetic', input);
}

export async function logSession(input: {
  mode: string;
  duration_minutes: number;
  language: string;
}): Promise<{ ok: boolean; xp: number }> {
  return apiPost('/sessions', input);
}

export async function fetchGuidedSession(input: {
  mode: string;
  language: string;
  topic?: string;
}): Promise<{ phases: { title: string; text: string; duration: number }[] }> {
  return apiPost('/sessions/guided', input);
}
