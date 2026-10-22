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
          <View pointerEvents="none" style={styles.decorations}>
            <View style={[styles.topMintShape, isWideScreen && styles.wideMintShape]} />
            <View style={styles.peachShape} />
            <View style={styles.sageShape} />
          </View>
          <View
            style={[
              styles.content,
              isWideScreen && styles.wideContent,
              isShortScreen && styles.shortContent,
            ]}
          >
            <View style={styles.brandHeader}>
              <Text accessibilityRole="header" style={styles.wordmark}>Banter</Text>
              <Text style={styles.brandTagline}>good people. better conversations.</Text>
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
  decorations: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  topMintShape: {
    position: 'absolute',
    top: -115,
    right: -90,
    width: 255,
    height: 255,
    borderRadius: 128,
    backgroundColor: colors.surfaceMint,
  },
  wideMintShape: {
    right: '10%',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  peachShape: {
    position: 'absolute',
    top: 190,
    left: -65,
    width: 105,
    height: 105,
    borderRadius: 53,
    backgroundColor: colors.surfacePeach,
    opacity: 0.85,
  },
  sageShape: {
    position: 'absolute',
    bottom: 75,
    right: -45,
    width: 125,
    height: 125,
    borderRadius: 63,
    backgroundColor: colors.surfaceSage,
    opacity: 0.75,
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
    minHeight: 58,
    marginBottom: spacing.sm,
  },
  wordmark: {
    color: colors.text,
    fontSize: typography.brand + 3,
    fontWeight: '800',
    letterSpacing: -1,
  },
  brandTagline: {
    marginTop: 2,
    color: colors.textSecondary,
    fontSize: 10,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    fontWeight: '600',
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
    backgroundColor: colors.surfacePeach,
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
