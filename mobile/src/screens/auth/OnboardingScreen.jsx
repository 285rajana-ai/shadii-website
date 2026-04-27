import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Dimensions,
  TouchableOpacity, Animated, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../theme/colors';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    emoji: '💕',
    title: 'Find Your Perfect Match',
    titleUrdu: 'اپنا ہم سفر تلاش کریں',
    desc: 'Connect with thousands of verified profiles. Your journey to a beautiful life begins here.',
    gradient: [colors.primary, '#C44B7A'],
  },
  {
    id: '2',
    emoji: '✅',
    title: 'Verified & Safe',
    titleUrdu: 'محفوظ اور تصدیق شدہ',
    desc: 'Every profile goes through CNIC verification and live photo review. Your safety is our priority.',
    gradient: ['#C44B7A', '#D4AF37'],
  },
  {
    id: '3',
    emoji: '🤖',
    title: 'Smart Daily Matches',
    titleUrdu: 'روزانہ ذہین میچز',
    desc: 'Our algorithm sends you 3-5 high-quality matches every morning based on your preferences.',
    gradient: [colors.primary, '#5C0F31'],
  },
  {
    id: '4',
    emoji: '🔒',
    title: 'Privacy Protected',
    titleUrdu: 'پرائیویسی محفوظ',
    desc: 'Verified female photos are blurred by default. Share contact info only when you feel ready.',
    gradient: ['#5C0F31', colors.primary],
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => navigation.replace('Login');

  const renderSlide = ({ item }) => (
    <LinearGradient colors={item.gradient} style={styles.slide} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      {/* Decorative bg circles */}
      <View style={[styles.bgCircle, { width: 280, height: 280, top: -60, right: -60 }]} />
      <View style={[styles.bgCircle, { width: 180, height: 180, bottom: 80, left: -50 }]} />

      <View style={styles.emojiContainer}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>

      <Text style={styles.titleUrdu}>{item.titleUrdu}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.desc}>{item.desc}</Text>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
      />

      {/* Controls overlay */}
      <View style={styles.controls}>
        {/* Dots */}
        <View style={styles.dots}>
          {slides.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange, outputRange: [8, 24, 8], extrapolate: 'clamp',
            });
            const dotOpacity = scrollX.interpolate({
              inputRange, outputRange: [0.4, 1, 0.4], extrapolate: 'clamp',
            });
            return (
              <Animated.View key={i} style={[styles.dot, { width: dotWidth, opacity: dotOpacity }]} />
            );
          })}
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNext} style={styles.nextBtn}>
            <LinearGradient
              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.15)']}
              style={styles.nextBtnInner}
            >
              <Text style={styles.nextText}>
                {currentIndex === slides.length - 1 ? "Let's Start 🌸" : 'Next →'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: {
    width, height,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 160,
  },
  bgCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  emojiContainer: {
    width: 120, height: 120,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 32,
  },
  emoji: { fontSize: 56 },
  titleUrdu: {
    fontSize: 22, fontWeight: '700', color: 'rgba(255,255,255,0.85)',
    textAlign: 'center', marginBottom: 8, writingDirection: 'rtl',
  },
  title: {
    fontSize: 28, fontWeight: '800', color: '#FFFFFF',
    textAlign: 'center', marginBottom: 16, letterSpacing: -0.5,
  },
  desc: {
    fontSize: 15, color: 'rgba(255,255,255,0.75)',
    textAlign: 'center', lineHeight: 22,
  },
  controls: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 24, paddingBottom: 48,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 24 },
  dot: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.85)' },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skipBtn: { paddingHorizontal: 16, paddingVertical: 12 },
  skipText: { color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: '500' },
  nextBtn: { borderRadius: 14, overflow: 'hidden' },
  nextBtnInner: {
    paddingHorizontal: 32, paddingVertical: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 14,
  },
  nextText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
