import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function Background({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-1 bg-[#0A0A0F]">
      <LinearGradient
        colors={['#0A0A0F', '#0a1a14', '#0A0A0F']}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -120,
          right: -120,
          width: 320,
          height: 320,
          borderRadius: 320,
          backgroundColor: '#10B981',
          opacity: 0.12,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: -160,
          left: -120,
          width: 360,
          height: 360,
          borderRadius: 360,
          backgroundColor: '#34D399',
          opacity: 0.08,
        }}
      />
      {children}
    </View>
  );
}
