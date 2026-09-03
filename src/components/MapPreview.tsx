import { StyleSheet, View } from 'react-native';

import { colors } from '../theme';

export function MapPreview() {
  return (
    <View style={styles.map}>
      <View style={[styles.road, styles.roadOne]} />
      <View style={[styles.road, styles.roadTwo]} />
      <View style={[styles.road, styles.roadThree]} />
      <View style={[styles.route, styles.routeOne]} />
      <View style={[styles.route, styles.routeTwo]} />
      <View style={[styles.route, styles.routeThree]} />
      <View style={[styles.pin, styles.startPin]} />
      <View style={[styles.pin, styles.endPin]} />
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    backgroundColor: colors.map,
    borderRadius: 20,
    height: 138,
    overflow: 'hidden',
    position: 'relative',
  },
  road: {
    backgroundColor: '#F9FCF8',
    height: 16,
    position: 'absolute',
    width: '150%',
  },
  roadOne: {
    left: -30,
    top: 42,
    transform: [{ rotate: '12deg' }],
  },
  roadTwo: {
    left: -25,
    top: 108,
    transform: [{ rotate: '-16deg' }],
  },
  roadThree: {
    height: 14,
    left: 120,
    top: -14,
    transform: [{ rotate: '-17deg' }],
    width: 20,
  },
  route: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    height: 8,
    position: 'absolute',
  },
  routeOne: {
    left: 38,
    top: 93,
    transform: [{ rotate: '-28deg' }],
    width: 92,
  },
  routeTwo: {
    left: 110,
    top: 67,
    transform: [{ rotate: '-12deg' }],
    width: 85,
  },
  routeThree: {
    left: 178,
    top: 53,
    transform: [{ rotate: '5deg' }],
    width: 112,
  },
  pin: {
    borderColor: colors.accent,
    borderRadius: 10,
    borderWidth: 4,
    height: 17,
    position: 'absolute',
    width: 17,
  },
  startPin: {
    backgroundColor: colors.white,
    bottom: 18,
    left: 28,
  },
  endPin: {
    backgroundColor: colors.accent,
    right: 30,
    top: 25,
  },
});
