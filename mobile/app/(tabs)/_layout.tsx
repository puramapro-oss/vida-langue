import { useEffect } from 'react';
import { Tabs, router } from 'expo-router';
import { Text } from 'react-native';
import { useAuth } from '@/components/AuthProvider';

function Icon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text
      style={{
        fontSize: 22,
        opacity: focused ? 1 : 0.55,
        textShadowColor: focused ? '#34d399' : 'transparent',
        textShadowRadius: focused ? 8 : 0,
      }}
    >
      {emoji}
    </Text>
  );
}

export default function TabsLayout() {
  const { loading, session } = useAuth();

  useEffect(() => {
    if (!loading && !session) router.replace('/(auth)/welcome');
  }, [loading, session]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(10,10,15,0.95)',
          borderTopColor: 'rgba(52,211,153,0.18)',
          borderTopWidth: 0.5,
          paddingTop: 6,
          paddingBottom: 22,
          height: 78,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarActiveTintColor: '#34D399',
        tabBarInactiveTintColor: 'rgba(167,243,208,0.55)',
        sceneStyle: { backgroundColor: '#0A0A0F' },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ focused }) => <Icon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: 'Sessions',
          tabBarIcon: ({ focused }) => <Icon emoji="🧬" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="missions"
        options={{
          title: 'Missions',
          tabBarIcon: ({ focused }) => <Icon emoji="🌍" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ focused }) => <Icon emoji="💰" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ focused }) => <Icon emoji="👤" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
