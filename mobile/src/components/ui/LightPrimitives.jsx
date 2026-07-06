import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import colors from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { softShadow } from '../../theme/glassmorphism';

export function AppBackground({ children, style }) {
  return (
    <View style={[styles.root, style]}>
      <LinearGradient colors={colors.gradients.hero} style={StyleSheet.absoluteFill} />
      <View style={styles.washTop} />
      <View style={styles.washBottom} />
      {children}
    </View>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function TrustBadge({ icon = 'check-decagram', label, tone = 'primary', style }) {
  const isGreen = tone === 'trust';
  return (
    <View style={[styles.badge, isGreen && styles.badgeTrust, style]}>
      <MaterialCommunityIcons name={icon} size={13} color={isGreen ? colors.success : colors.primary} />
      <Text style={[styles.badgeText, isGreen && styles.badgeTrustText]}>{label}</Text>
    </View>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  right,
  error,
  helper,
  style,
  inputStyle,
  ...props
}) {
  return (
    <View style={[styles.fieldWrap, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.field, error && styles.fieldError]}>
        {icon ? <MaterialCommunityIcons name={icon} size={19} color={colors.textMuted} /> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textPlaceholder}
          style={[styles.input, inputStyle]}
          {...props}
        />
        {right}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

export function SelectField({ label, value, placeholder, icon, onPress, style }) {
  return (
    <View style={[styles.fieldWrap, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable style={({ pressed }) => [styles.field, styles.select, pressed && styles.pressed]} onPress={onPress}>
        {icon ? <MaterialCommunityIcons name={icon} size={19} color={colors.textMuted} /> : null}
        <Text style={[styles.selectText, !value && styles.placeholder]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={19} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

export function Chip({ label, icon, active, onPress, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        pressed && styles.pressed,
        style,
      ]}
    >
      {icon ? (
        <MaterialCommunityIcons
          name={icon}
          size={14}
          color={active ? colors.primary : colors.textSecondary}
        />
      ) : null}
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function EmptyState({ icon = 'heart-search', title, body, action }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <MaterialCommunityIcons name={icon} size={34} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {body ? <Text style={styles.emptyBody}>{body}</Text> : null}
      {action}
    </View>
  );
}

export const primitiveStyles = styles;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  washTop: {
    position: 'absolute',
    top: -90,
    right: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#FCE8EF',
    opacity: 0.74,
  },
  washBottom: {
    position: 'absolute',
    bottom: -90,
    left: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#EEF7F2',
    opacity: 0.7,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...softShadow,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.primaryLightBg,
    borderWidth: 1,
    borderColor: colors.accentLight,
  },
  badgeTrust: {
    backgroundColor: '#E7F5EF',
    borderColor: '#BFE3D4',
  },
  badgeText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '800',
  },
  badgeTrustText: {
    color: colors.success,
  },
  fieldWrap: {
    gap: 7,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  field: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
  },
  fieldError: {
    borderColor: colors.error,
    backgroundColor: '#FFF7F7',
  },
  input: {
    flex: 1,
    minHeight: 50,
    color: colors.text,
    fontSize: 16,
  },
  select: {
    justifyContent: 'space-between',
  },
  selectText: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  placeholder: {
    color: colors.textPlaceholder,
    fontWeight: '500',
  },
  helper: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  error: {
    color: colors.error,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  chip: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primaryLightBg,
    borderColor: colors.accentLight,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  chipTextActive: {
    color: colors.primary,
  },
  pressed: {
    opacity: 0.78,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLightBg,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyBody: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
});
