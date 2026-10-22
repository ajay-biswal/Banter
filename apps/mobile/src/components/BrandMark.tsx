import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, typography } from '../theme/tokens';

type BrandMarkProps = {
  compact?: boolean;
};

export default function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <View style={styles.container} accessibilityRole="image" accessibilityLabel="Banter logo">
      <View style={[styles.mark, compact && styles.markCompact]}>
        <View style={styles.bubble}>
          <View style={styles.bubbleDot} />
          <View style={styles.bubbleDot} />
          <View style={styles.bubbleDot} />
        </View>
      </View>
      {!compact && <Text style={styles.wordmark}>banter</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mark: {
    width: 46,
    height: 46,
    borderRadius: radii.lg,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markCompact: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
  },
  bubble: {
    width: 25,
    height: 18,
    borderRadius: 7,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  bubbleDot: {
    width: 3,
    height: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
  },
  wordmark: {
    color: colors.text,
    fontSize: typography.brand,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
});