import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { TextInputProps } from 'react-native';
import { colors, radii, spacing, typography } from '../theme/tokens';

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  error?: string;
  secure?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
  accessibilityLabel?: string;
};

export default function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secure = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete = 'off',
  textContentType,
  returnKeyType = 'next',
  onSubmitEditing,
  accessibilityLabel,
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isSecure = secure && !passwordVisible;

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputFrame,
          focused && styles.inputFrameFocused,
          error && styles.inputFrameError,
        ]}
      >
        <TextInput
          accessibilityLabel={accessibilityLabel ?? label}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          autoCorrect={false}
          keyboardType={keyboardType}
          onBlur={() => setFocused(false)}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onSubmitEditing={onSubmitEditing}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          returnKeyType={returnKeyType}
          secureTextEntry={isSecure}
          selectionColor={colors.primaryPressed}
          style={styles.input}
          textContentType={textContentType}
          value={value}
        />
        {secure && (
          <Text
            accessibilityRole="button"
            accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}
            onPress={() => setPasswordVisible((visible) => !visible)}
            style={styles.visibilityToggle}
          >
            {passwordVisible ? 'Hide' : 'Show'}
          </Text>
        )}
      </View>
      {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.sm,
  },
  label: {
    color: colors.text,
    fontSize: typography.label,
    fontWeight: '700',
  },
  inputFrame: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
  },
  inputFrameFocused: {
    borderColor: colors.primary,
  },
  inputFrameError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 14,
    color: colors.text,
    fontSize: typography.body,
  },
  visibilityToggle: {
    marginLeft: spacing.sm,
    paddingVertical: spacing.sm,
    color: colors.primaryPressed,
    fontSize: typography.small + 1,
    fontWeight: '700',
  },
  error: {
    color: colors.error,
    fontSize: typography.small + 1,
    lineHeight: 18,
  },
});