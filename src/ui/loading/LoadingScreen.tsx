import { Animated, Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { getLoadingArtworkLayout } from './loadingState';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

interface LoadingScreenProps {
  progress: Animated.Value;
  percentage: number;
  fontsReady: boolean;
  onReady(): void;
}

/**
 * L'illustration contient déjà le cadre et le fond sombre de la barre.
 * On ne dessine donc que son remplissage, positionné dans l'ouverture.
 */
export function LoadingScreen({ progress, percentage, fontsReady, onReady }: LoadingScreenProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const artworkLayout = getLoadingArtworkLayout(screenWidth, screenHeight);
  const percentageFontSize = Math.max(18, artworkLayout.width * 0.06);
  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={styles.screen}
      accessibilityRole="progressbar"
      accessibilityLabel="Chargement de Divine City"
      accessibilityValue={{ min: 0, max: 100, now: percentage, text: `${percentage} %` }}
    >
      <View style={[styles.artwork, artworkLayout]}>
        <Image
          source={require('../../../assets/chargement.jpg')}
          resizeMode="stretch"
          style={styles.background}
          onLoad={onReady}
        />
        <Text
          style={[
            styles.percentage,
            {
              fontFamily: fontsReady ? 'Cinzel_700Bold' : undefined,
              fontSize: percentageFontSize,
              lineHeight: percentageFontSize * 1.15,
            },
          ]}
          allowFontScaling={false}
          accessible={false}
        >
          {percentage} %
        </Text>
        <View style={styles.track}>
          <AnimatedGradient
            colors={['#8f4f12', '#f0b93f', '#fff0a6', '#d7831e']}
            locations={[0, 0.35, 0.62, 1]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[styles.fill, { width }]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#77b9e5',
    overflow: 'hidden',
  },
  artwork: {
    position: 'absolute',
  },
  background: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  percentage: {
    position: 'absolute',
    top: '84.3%',
    right: 0,
    left: 0,
    color: '#f7d982',
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
    textShadowColor: '#4a220b',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  track: {
    position: 'absolute',
    left: '12%',
    top: '88.6%',
    width: '76.5%',
    height: '4.15%',
    overflow: 'hidden',
    borderRadius: 4,
  },
  fill: {
    height: '100%',
    overflow: 'hidden',
    borderRadius: 3,
    borderColor: 'rgba(255, 241, 168, 0.72)',
    borderWidth: 1,
  },
});
