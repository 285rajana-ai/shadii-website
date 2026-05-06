import { StyleSheet, Text, View } from 'react-native';
import { spacing } from '../../theme/spacing';
import { type } from '../../theme/typography';
import IconButton from './IconButton';

export default function ScreenHeader({
  title,
  onBack,
  insetsTop = 0,
  right,
  rightWidth = 44,
}) {
  return (
    <View style={[styles.header, { paddingTop: insetsTop + spacing.sm }]}>
      <IconButton icon="arrow-left" onPress={onBack} />
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
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
  title: {
    ...type.h3,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
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
