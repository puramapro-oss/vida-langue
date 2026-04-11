import { Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';

type Props = TextInputProps & {
  label?: string;
  error?: string;
};

export function Input({ label, error, ...rest }: Props) {
  return (
    <View className="w-full">
      {label ? (
        <Text className="mb-2 text-sm text-emerald-100/80">{label}</Text>
      ) : null}
      <TextInput
        {...rest}
        placeholderTextColor="rgba(167,243,208,0.4)"
        className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-4 text-base text-emerald-50"
        style={{ minHeight: 52 }}
      />
      {error ? (
        <Text className="mt-1 text-sm text-red-400">{error}</Text>
      ) : null}
    </View>
  );
}
