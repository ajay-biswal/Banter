import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../../../components/PrimaryButton';
import TextField from '../../../components/TextField';
import { colors, spacing, typography } from '../../../theme/tokens';
import AuthScreenLayout from '../components/AuthScreenLayout';
import { hasErrors, validateLoginForm } from '../validation';
import { LoginFormErrors, LoginFormValues } from '../types';

type LoginScreenProps = {
  onCreateAccount: () => void;
};

const INITIAL_VALUES: LoginFormValues = {
  email: '',
  password: '',
};

export default function LoginScreen({ onCreateAccount }: LoginScreenProps) {
  const [values, setValues] = useState<LoginFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<LoginFormErrors>({});

  const updateField = (field: keyof LoginFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = () => {
    const nextErrors = validateLoginForm(values);
    setErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      return;
    }

    Alert.alert(
      'Login UI ready',
      'Your details passed local validation. We will connect this screen to the Banter API in the next step.',
    );
  };

  return (
    <AuthScreenLayout
      title="Good to see you."
      description="Sign in to pick up where your conversations left off."
      topNote="Your people are one tap away"
      footerPrompt="New to Banter?"
      footerAction="Create an account"
      onFooterPress={onCreateAccount}
    >
      <TextField
        label="Email address"
        placeholder="you@example.com"
        value={values.email}
        onChangeText={(value) => updateField('email', value)}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        error={errors.email}
      />
      <TextField
        label="Password"
        placeholder="Enter your password"
        value={values.password}
        onChangeText={(value) => updateField('password', value)}
        secure
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        error={errors.password}
      />
      <View style={styles.actionsRow}>
        <View style={styles.secureHint}>
          <View style={styles.secureDot} />
          <Text style={styles.secureText}>Your conversations stay yours.</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => Alert.alert('Password reset', 'Password recovery will be connected when we integrate the authentication API.')}
          hitSlop={8}
        >
          <Text style={styles.forgotLink}>Forgot password?</Text>
        </Pressable>
      </View>
      <PrimaryButton label="Sign in" onPress={handleSubmit} />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: -spacing.sm,
  },
  secureHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  secureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  secureText: {
    color: colors.textSecondary,
    fontSize: typography.small,
  },
  forgotLink: {
    color: colors.primaryPressed,
    fontSize: typography.small,
    fontWeight: '700',
  },
});