import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  useSharedValue,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const DOT_SIZE = 4;
const NUM_DOTS = 100;

const generateDots = () => {
  return Array.from({ length: NUM_DOTS }, (_, i) => ({
    id: i,
    initialX: Math.random() * width,
    initialY: Math.random() * height,
    color: `rgba(${Math.random() * 50 + 74}, ${Math.random() * 50 + 158}, 255, ${Math.random() * 0.3 + 0.4})`,
  }));
};

export default function AnimatedBackground() {
  const dots = generateDots();

  return (
    <View style={styles.container}>
      {dots.map((dot) => (
        <AnimatedDot
          key={dot.id}
          initialX={dot.initialX}
          initialY={dot.initialY}
          color={dot.color}
        />
      ))}
    </View>
  );
}

function AnimatedDot({ initialX, initialY, color }) {
  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    const duration = 3000 + Math.random() * 3000;
    const delay = Math.random() * 1500;

    translateX.value = withRepeat(
      withDelay(
        delay,
        withTiming(initialX + (Math.random() - 0.5) * 70, {
          duration,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      true
    );

    translateY.value = withRepeat(
      withDelay(
        delay,
        withTiming(initialY + (Math.random() - 0.5) * 70, {
          duration,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      true
    );

    scale.value = withRepeat(
      withDelay(
        delay,
        withTiming(1.5, {
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      true
    );

    opacity.value = withRepeat(
      withDelay(
        delay,
        withTiming(0.6, {
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    shadowColor: '#4a9eff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});