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
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
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
  const { width, height } = useWindowDimensions();
  const isWideScreen = width >= 600;
  const isShortScreen = height < 720;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isWideScreen && styles.wideScrollContent,
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        >
          <View
            pointerEvents="none"
            style={[styles.topAccent, isWideScreen && styles.wideTopAccent]}
          />
          <View
            style={[
              styles.content,
              isWideScreen && styles.wideContent,
              isShortScreen && styles.shortContent,
            ]}
          >
            <View style={styles.brandHeader}>
              <Text accessibilityRole="header" style={styles.wordmark}>Banter</Text>
            </View>
            {topNote ? (
              <View style={[styles.notePill, isShortScreen && styles.shortNotePill]}>
                <View style={styles.noteDot} />
                <Text style={styles.noteText}>{topNote}</Text>
              </View>
            ) : null}
            <View
              style={[
                styles.headingBlock,
                isShortScreen && styles.shortHeadingBlock,
              ]}
            >
              <Text
                accessibilityRole="header"
                style={[
                  styles.title,
                  isWideScreen && styles.wideTitle,
                  isShortScreen && styles.shortTitle,
                ]}
              >
                {title}
              </Text>
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
  wideScrollContent: {
    alignItems: 'center',
  },
  topAccent: {
    position: 'absolute',
    top: -100,
    right: -72,
    width: 230,
    height: 230,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMint,
  },
  wideTopAccent: {
    right: '12%',
    width: 280,
    height: 280,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  wideContent: {
    maxWidth: 480,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  shortContent: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
  },
  brandHeader: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginBottom: spacing.md,
  },
  wordmark: {
    color: colors.text,
    fontSize: typography.brand + 3,
    fontWeight: '800',
    letterSpacing: -1,
  },
  notePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
  },
  shortNotePill: {
    marginTop: spacing.sm,
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
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  shortHeadingBlock: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: typography.title,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  wideTitle: {
    fontSize: 34,
    lineHeight: 42,
  },
  shortTitle: {
    fontSize: 27,
    lineHeight: 34,
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
