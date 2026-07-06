import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { AppBackground, Card, TrustBadge } from '../../components/ui/LightPrimitives';
import colors from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';

const { width } = Dimensions.get('window');

const slides = [
  {
    icon: 'account-heart-outline',
    eyebrow: 'Trusted introductions',
    title: 'Meet serious people looking for marriage',
    desc: 'Discover verified profiles with family-friendly details, preferences, and respectful communication controls.',
    bullets: ['Verified profiles', 'Private photos', 'Connection-first chat'],
  },
  {
    icon: 'shield-check-outline',
    eyebrow: 'Privacy by design',
    title: 'You decide what becomes visible',
    desc: 'Photos, phone numbers, and conversations stay protected until both sides are ready to connect.',
    bullets: ['Photo approval', 'Report and block', 'Safe messaging'],
  },
  {
    icon: 'star-four-points-outline',
    eyebrow: 'Better daily matches',
    title: 'A calmer way to find the right match',
    desc: 'Review high-quality suggestions, refine preferences, and keep your profile complete for better results.',
    bullets: ['Daily picks', 'Profile checklist', 'Smart filters'],
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
      return;
    }
    navigation.replace('Login');
  };

  return (
    <AppBackground>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <View style={[styles.top, { paddingTop: insets.top + 18 }]}>
        <View style={styles.brandMark}>
          <MaterialCommunityIcons name="heart-multiple" size={25} color={colors.primary} />
        </View>
        <Text style={styles.brand}>Shadii.pk</Text>
        <Pressable onPress={() => navigation.replace('Login')} hitSlop={12}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.title}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onMomentumScrollEnd={(e) => setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Card style={styles.heroCard}>
              <LinearGradient colors={colors.gradients.hero} style={StyleSheet.absoluteFill} />
              <View style={styles.iconRing}>
                <MaterialCommunityIcons name={item.icon} size={44} color={colors.primary} />
              </View>
              <TrustBadge icon="check-decagram" label={item.eyebrow} tone="trust" />
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.desc}>{item.desc}</Text>
              <View style={styles.bullets}>
                {item.bullets.map((b) => (
                  <View key={b} style={styles.bullet}>
                    <MaterialCommunityIcons name="check-circle" size={17} color={colors.success} />
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </View>
        )}
      />

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 18) + 8 }]}>
        <View style={styles.dots}>
          {slides.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 26, 8],
              extrapolate: 'clamp',
            });
            return <Animated.View key={i} style={[styles.dot, i === currentIndex && styles.dotActive, { width: dotWidth }]} />;
          })}
        </View>
        <PrimaryButton
          label={currentIndex === slides.length - 1 ? 'Create or sign in' : 'Continue'}
          icon={currentIndex === slides.length - 1 ? 'arrow-right' : 'chevron-right'}
          onPress={handleNext}
        />
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: 10,
  },
  brandMark: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  brand: {
    flex: 1,
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  skip: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '800',
  },
  slide: {
    width,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  heroCard: {
    minHeight: 500,
    justifyContent: 'center',
    gap: spacing.md,
    overflow: 'hidden',
  },
  iconRing: {
    width: 112,
    height: 112,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 31,
    lineHeight: 38,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  desc: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  bullets: {
    marginTop: spacing.sm,
    gap: 10,
  },
  bullet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulletText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
  },
  dot: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.borderStrong,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
});
