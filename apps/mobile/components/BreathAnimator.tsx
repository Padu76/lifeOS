import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

export default function BreathAnimator(){
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.3, duration: 4000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(scale, { toValue: 1.3, duration: 7000, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.9, duration: 8000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    );
    loop.start();
    return () => { loop.stop(); };
  }, []);

  return <Animated.View style={{ width: 160, height: 160, borderRadius: 80, backgroundColor: '#E6F4EA', transform: [{ scale }] }} />;
}
