import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const LoadingAnimation = () => {
  const rotation1 = useRef(new Animated.Value(0)).current;
  const rotation2 = useRef(new Animated.Value(0)).current;
  const rotation3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(rotation1, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }),
      Animated.timing(rotation2, {
        toValue: -1,
        duration: 3000,
        useNativeDriver: true,
      }),
      Animated.timing(rotation3, {
        toValue: 1.5,
        duration: 3000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const rotate = (anim) =>
    anim.interpolate({
      inputRange: [-1.5, 1.5],
      outputRange: ['-540deg', '540deg'],
    });

  return (
    <View style={styles.gearContainer}>
      <Animated.View style={{ transform: [{ rotate: rotate(rotation1) }] }}>
        <MaterialCommunityIcons name="cog" size={width * 0.15} color="#2E4F2F" />
      </Animated.View>
      <Animated.View style={{ transform: [{ rotate: rotate(rotation2) }] }}>
        <MaterialCommunityIcons name="cog" size={width * 0.15} color="#2E4F2F" />
      </Animated.View>
      <Animated.View style={{ transform: [{ rotate: rotate(rotation3) }] }}>
        <MaterialCommunityIcons name="cog" size={width * 0.15} color="#2E4F2F" />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  gearContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '70%',
  },
});

export default LoadingAnimation;
