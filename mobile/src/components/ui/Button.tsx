import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = {
  onPress?: () => void;
  title: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: Variant;
  testID?: string;
  fullWidth?: boolean;
};

export function Button({
  onPress,
  title,
  loading,
  disabled,
  variant = 'primary',
  testID,
  fullWidth = true,
}: Props) {
  const isDisabled = disabled || loading;

  function handlePress() {
    if (isDisabled || !onPress) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onPress();
  }

  const widthClass = fullWidth ? 'w-full' : '';

  if (variant === 'primary') {
    return (
      <Pressable
        onPress={handlePress}
        disabled={isDisabled}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={title}
        className={`${widthClass} ${isDisabled ? 'opacity-50' : 'active:opacity-90'}`}
      >
        <LinearGradient
          colors={['#10B981', '#34D399']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 52,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#0A0A0F" />
          ) : (
            <Text className="text-base font-semibold text-[#0A0A0F]">
              {title}
            </Text>
          )}
        </LinearGradient>
      </Pressable>
    );
  }

  const baseClass =
    variant === 'secondary'
      ? 'border border-emerald-500/40 bg-emerald-500/10'
      : 'bg-transparent';

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
      className={`${widthClass} ${baseClass} rounded-2xl py-4 items-center justify-center min-h-[52px] ${isDisabled ? 'opacity-50' : 'active:opacity-80'}`}
    >
      {loading ? (
        <ActivityIndicator color="#34D399" />
      ) : (
        <Text className="text-base font-semibold text-emerald-200">
          {title}
        </Text>
      )}
    </Pressable>
  );
}

export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View
      className={`rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5 ${className}`}
    >
      {children}
    </View>
  );
}
