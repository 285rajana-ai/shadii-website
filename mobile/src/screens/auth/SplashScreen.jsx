import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

      {/* Floating petals */}
      <Animated.View style={[styles.petalsContainer, { opacity: petalsOpacity }]}>
        {['🌸', '🌺', '🌸', '💐', '🌹'].map((petal, i) => (
          <Text key={i} style={[styles.petal, { left: (i * 70) + 20, top: i % 2 === 0 ? 80 : 120 }]}>
            {petal}
          </Text>
        ))}
      </Animated.View>

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <View style={styles.logoIcon}>
          <Text style={styles.heartIcon}>💕</Text>
        </View>
        <Text style={styles.appName}>shadii.pk</Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={{ opacity: taglineOpacity, transform: [{ translateY: taglineY }] }}>
        <Text style={styles.taglineUrdu}>ہم قدم: ایک مکمل زندگی کا سفر</Text>
        <Text style={styles.taglineEn}>A lifetime journey, together.</Text>
      </Animated.View>

      {/* Bottom dots */}
      <View style={styles.bottomDots}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.dot, i === 0 && styles.dotActive]} />
        ))}
      </View>
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
  petal: { position: 'absolute', fontSize: 24, opacity: 0.6 },
  logoContainer: { alignItems: 'center', marginBottom: 20 },
  logoIcon: {
    width: 100, height: 100, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3, shadowRadius: 20,
  },
  heartIcon: { fontSize: 48 },
  appName: {
    fontSize: 40, fontWeight: '800', color: '#FFFFFF',
    letterSpacing: -1,
    textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  taglineUrdu: {
    fontSize: 18, color: 'rgba(255,255,255,0.90)',
    textAlign: 'center', marginTop: 8, fontWeight: '500',
    writingDirection: 'rtl',
  },
  taglineEn: {
    fontSize: 13, color: 'rgba(255,255,255,0.65)',
    textAlign: 'center', marginTop: 6, letterSpacing: 0.5,
  },
  bottomDots: {
    position: 'absolute', bottom: 60,
    flexDirection: 'row', gap: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive: { backgroundColor: '#FFFFFF', width: 24 },
});
