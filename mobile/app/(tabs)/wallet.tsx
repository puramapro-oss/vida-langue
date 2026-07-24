import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Background } from '@/components/Background';
import { Button, Card } from '@/components/ui/Button';
import { useAuth } from '@/components/AuthProvider';
import { apiPost } from '@/lib/api';
import { WALLET_MIN } from '@/lib/constants';

export default function Wallet() {
  const { profile, refreshProfile } = useAuth();
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const balance = profile?.wallet_balance ?? 0;
  const balanceEur = (balance / 100).toFixed(2);
  const canWithdraw = balance >= WALLET_MIN * 100;

  async function openPortal() {
    setError(null);
    setOpening(true);
    try {
      const data = await apiPost<{ url: string }>('/stripe/portal', {});
      if (data?.url) {
        await WebBrowser.openBrowserAsync(data.url, {
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
        });
      } else {
        setError("Aucun portail n'a pu être ouvert. Active un abonnement d'abord.");
      }
    } catch {
      setError(
        "Pas encore d'abonnement Stripe associé. Démarre ton essai 14 j depuis /pricing 🌱"
      );
    } finally {
      setOpening(false);
    }
  }

  return (
    <Background>
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        >
          <View className="mt-4 mb-6">
            <Text className="text-3xl font-bold text-emerald-50">Wallet 💰</Text>
            <Text className="mt-2 text-emerald-200/70">
              Tes gains parrainage et ton abonnement.
            </Text>
          </View>

          <Card>
            <Text className="text-xs uppercase tracking-wide text-emerald-300">
              Solde disponible
            </Text>
            <Text className="mt-2 text-5xl font-bold text-emerald-50">
              {balanceEur} <Text className="text-2xl text-emerald-300">€</Text>
            </Text>
            <Text className="mt-3 text-sm text-emerald-100/70">
              Retrait possible dès {WALLET_MIN} € via virement IBAN.
            </Text>
            <View className="mt-5">
              <Button
                testID="wallet-withdraw"
                title={
                  canWithdraw
                    ? 'Demander un retrait'
                    : `Encore ${(WALLET_MIN - balance / 100).toFixed(2)} € pour retirer`
                }
                disabled={!canWithdraw}
                onPress={() => router.push('/(tabs)/wallet')}
              />
            </View>
          </Card>

          <View className="mt-6">
            <Card>
              <Text className="text-lg font-bold text-emerald-50">
                Abonnement Vida
              </Text>
              <Text className="mt-2 text-sm text-emerald-100/80">
                Gère ton abonnement, mets à jour ta carte ou télécharge tes factures
                via le portail Stripe sécurisé.
              </Text>
              <View className="mt-4">
                <Button
                  testID="wallet-portal"
                  title="Gérer mon abonnement"
                  variant="secondary"
                  onPress={openPortal}
                  loading={opening}
                />
              </View>
              {error ? (
                <Text className="mt-3 text-sm text-amber-300">{error}</Text>
              ) : null}
            </Card>
          </View>

          <View className="mt-6">
            <Card>
              <Text className="text-lg font-bold text-emerald-50">
                Parrainage 🌱
              </Text>
              <Text className="mt-2 text-sm text-emerald-100/80">
                Gagne 50 % de commission à vie sur chaque ami qui s&apos;abonne. Partage
                ton lien depuis l&apos;onglet Profil.
              </Text>
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
}
