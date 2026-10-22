import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import PrimaryButton from '../../../components/PrimaryButton';
import TextField from '../../../components/TextField';
import { spacing, typography, colors } from '../../../theme/tokens';
import AuthScreenLayout from '../components/AuthScreenLayout';
import { hasErrors, validateSignupForm } from '../validation';
import type { SignupFormErrors, SignupFormValues } from '../types';

type SignupScreenProps = {
  onSignIn: () => void;
};

const INITIAL_VALUES: SignupFormValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export default function SignupScreen({ onSignIn }: SignupScreenProps) {
  const [values, setValues] = useState<SignupFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<SignupFormErrors>({});

  const updateField = (field: keyof SignupFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = () => {
    const nextErrors = validateSignupForm(values);
    setErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      return;
    }

    Alert.alert(
      'Signup UI ready',
      'Your details passed local validation. We will connect account creation to the Banter API in the next step.',
    );
  };

  return (
    <AuthScreenLayout
      title="Let's get you connected."
      description="Create your account and make room for better conversations."
      topNote="A little closer, every day"
      footerPrompt="Already have an account?"
      footerAction="Sign in"
      onFooterPress={onSignIn}
    >
      <TextField
        label="Full name"
        placeholder="What should we call you?"
        value={values.name}
        onChangeText={(value) => updateField('name', value)}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        error={errors.name}
      />
      <TextField
        label="Email address"
        placeholder="you@example.com"
        value={values.email}
        onChangeText={(value) => updateField('email', value)}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        error={errors.email}
      />
      <TextField
        label="Create password"
        placeholder="At least 8 characters"
        value={values.password}
        onChangeText={(value) => updateField('password', value)}
        secure
        autoComplete="new-password"
        textContentType="newPassword"
        error={errors.password}
      />
      <TextField
        label="Confirm password"
        placeholder="Enter your password again"
        value={values.confirmPassword}
        onChangeText={(value) => updateField('confirmPassword', value)}
        secure
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        error={errors.confirmPassword}
      />
      <Text style={styles.passwordHint}>
        Use at least 8 characters. You can choose a unique password you don't use elsewhere.
      </Text>
      <PrimaryButton label="Create account" onPress={handleSubmit} />
      <Text style={styles.disclaimer}>
        We will never ask you to share your password with another person.
      </Text>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  passwordHint: {
    marginTop: -spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.small,
    lineHeight: 18,
  },
  disclaimer: {
    color: colors.placeholder,
    fontSize: typography.small,
    lineHeight: 18,
    textAlign: 'center',
  },
});