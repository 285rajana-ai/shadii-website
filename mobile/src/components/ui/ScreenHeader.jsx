import { StyleSheet, Text, View } from 'react-native';
import colors from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import IconButton from './IconButton';

export default function ScreenHeader({
  title,
  subtitle,
  onBack,
  insetsTop = 0,
  right,
  rightWidth = 44,
}) {
  return (
    <View style={[styles.header, { paddingTop: insetsTop + spacing.sm }]}>
      {onBack ? <IconButton icon="arrow-left" onPress={onBack} /> : <View style={styles.placeholder} />}
      <View style={styles.copy}>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>
      <View style={[styles.rightSlot, { width: rightWidth }]}>{right || <View style={styles.placeholder} />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  copy: {
    flex: 1,
    marginHorizontal: spacing.sm,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    color: colors.text,
  },
  rightSlot: {
    width: 44,
    alignItems: 'flex-end',
  },
  placeholder: {
    width: 44,
    height: 44,
  },
});
