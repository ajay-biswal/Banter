import type { PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import BrandMark from '../../../components/BrandMark';
import { colors, radii, spacing, typography } from '../../../theme/tokens';

type AuthScreenLayoutProps = PropsWithChildren<{
  title: string;
  description: string;
  footerPrompt: string;
  footerAction: string;
  onFooterPress: () => void;
  topNote?: string;
}>;

export default function AuthScreenLayout({
  title,
  description,
  footerPrompt,
  footerAction,
  onFooterPress,
  topNote,
  children,
}: AuthScreenLayoutProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor={colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topAccent} />
          <View style={styles.content}>
            <BrandMark />
            {topNote ? (
              <View style={styles.notePill}>
                <View style={styles.noteDot} />
                <Text style={styles.noteText}>{topNote}</Text>
              </View>
            ) : null}
            <View style={styles.headingBlock}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.description}>{description}</Text>
            </View>
            <View style={styles.form}>{children}</View>
            <View style={styles.footer}>
              <Text style={styles.footerPrompt}>{footerPrompt}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={onFooterPress}
                hitSlop={8}
              >
                <Text style={styles.footerAction}>{footerAction}</Text>
              </Pressable>
            </View>
            <Text style={styles.legalNote}>
              By continuing, you agree to use Banter respectfully and keep your account secure.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  topAccent: {
    position: 'absolute',
    top: -92,
    right: -58,
    width: 190,
    height: 190,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMint,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  notePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
  },
  noteDot: {
    width: 7,
    height: 7,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  noteText: {
    color: colors.textSecondary,
    fontSize: typography.small,
    fontWeight: '600',
  },
  headingBlock: {
    gap: spacing.sm,
    marginTop: spacing.xxxl,
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: typography.title,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  description: {
    color: colors.textSecondary,
    fontSize: typography.subtitle,
    lineHeight: 24,
  },
  form: {
    gap: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: spacing.xxl,
  },
  footerPrompt: {
    color: colors.textSecondary,
    fontSize: typography.body,
  },
  footerAction: {
    color: colors.primaryPressed,
    fontSize: typography.body,
    fontWeight: '800',
  },
  legalNote: {
    marginTop: spacing.xl,
    color: colors.placeholder,
    fontSize: typography.small,
    lineHeight: 18,
    textAlign: 'center',
  },
});