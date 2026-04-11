import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/components/AuthProvider';
import { Background } from '@/components/Background';

export default function Index() {
  const { loading, session } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (session) {
      router.replace('/(tabs)/dashboard');
    } else {
      router.replace('/(auth)/welcome');
    }
  }, [loading, session]);

  return (
    <Background>
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#34D399" />
      </View>
    </Background>
  );
}
