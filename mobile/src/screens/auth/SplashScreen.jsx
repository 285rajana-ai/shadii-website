import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import {
  Animated, Dimensions, StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import colors from '../../theme/colors';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(20)).current;
  const petalsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence: logo appears, then tagline, then navigate
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(taglineOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(taglineY, { toValue: 0, duration: 600, useNativeDriver: true }),
        Animated.timing(petalsOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
      Animated.delay(1500),
    ]).start(() => {
      navigation.replace('Onboarding');
    });
  }, []);

  return (
    <LinearGradient
      colors={[colors.gradients.primaryFull[0], colors.gradients.primaryFull[2], colors.gradients.primaryFull[3]]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Decorative circles */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />
      <View style={[styles.circle, styles.circle3]} />

      {/* Floating Icons */}
      <Animated.View style={[styles.petalsContainer, { opacity: petalsOpacity }]}>
        {['heart', 'star', 'diamond', 'flower', 'heart-outline'].map((icon, i) => (
          <MaterialCommunityIcons 
            key={i} 
            name={icon}
            size={24}
            color="rgba(255,255,255,0.6)"
            style={[styles.petal, { left: (i * 70) + 20, top: i % 2 === 0 ? 80 : 120 }]}
          />
        ))}
      </Animated.View>

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <View style={styles.logoIcon}>
          <MaterialCommunityIcons name="heart-multiple" size={48} color={colors.maroon} />
        </View>
        <Text style={styles.appName}>shadii.pk</Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={{ opacity: taglineOpacity, transform: [{ translateY: taglineY }] }}>
        <Text style={styles.taglineUrdu}>ہم قدم: ایک مکمل زندگی کا سفر</Text>
        <Text style={styles.taglineEn}>A lifetime journey, together.</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  circle1: { width: 300, height: 300, top: -80, right: -80, backgroundColor: 'rgba(255,255,255,0.05)' },
  circle2: { width: 200, height: 200, bottom: 100, left: -60, backgroundColor: 'rgba(255,255,255,0.04)' },
  circle3: { width: 150, height: 150, bottom: -40, right: 40, backgroundColor: 'rgba(255,255,255,0.03)' },
  petalsContainer: { position: 'absolute', top: 60, left: 0, right: 0 },
  petal: { position: 'absolute', opacity: 0.6 },
  logoContainer: { alignItems: 'center', marginBottom: 24 },
  logoIcon: {
    width: 104, height: 104, borderRadius: 32,
    backgroundColor: 'rgba(212,175,55,0.8)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3, shadowRadius: 20,
  },
  appName: {
    fontSize: 40, fontWeight: '800', color: '#FFFFFF',
    letterSpacing: -1,
    textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  taglineUrdu: {
    fontSize: 16, color: 'rgba(255,255,255,0.90)',
    textAlign: 'center', marginTop: 8, fontWeight: '500',
    writingDirection: 'rtl',
  },
  taglineEn: {
    fontSize: 12, color: 'rgba(255,255,255,0.65)',
    textAlign: 'center', marginTop: 4, letterSpacing: 0.5, lineHeight: 20,
  },
});
