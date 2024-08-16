import Constants from 'expo-constants';
import LottieView, {LottieViewProps} from 'lottie-react-native';
import React from 'react';
import {
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Globals from 'src/Globals';
import StylishLabel from 'src/components/labels/StylishLabel';

import PrimaryButton from '../buttons/PrimaryButton';

type OnboardingSliderProps = {
  backgroundColor?: string;
  data: Array<{
    title: string;
    image: LottieViewProps['source'];
  }>;
  onDone: () => void;
  footerLabel?: string;
};

const OnboardingSlider = ({
  backgroundColor = Globals.COLORS.BG_OBSLIDER,
  data,
  onDone,
  footerLabel,
}: OnboardingSliderProps) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const flatListRef = React.useRef<FlatList>(null);

  const scrollToIndex = () => {
    if (currentIndex === data.length - 1) {
      onDone();
    } else {
      flatListRef.current?.scrollToIndex({
        animated: true,
        index: currentIndex + 1,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, {backgroundColor}]}>
      <StatusBar backgroundColor={backgroundColor} barStyle="dark-content" />
      <View style={styles.flexGrow}>
        <FlatList
          horizontal
          ref={flatListRef}
          data={data}
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => index.toString()}
          onScroll={({nativeEvent}) => {
            const newIndex = Math.round(
              nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width,
            );
            if (newIndex !== currentIndex) {
              setCurrentIndex(newIndex);
            }
          }}
          scrollEventThrottle={16}
          renderItem={({item}) => {
            return (
              <View style={styles.item}>
                <Text style={styles.title}>{item.title}</Text>
                <View style={styles.imageContainer}>
                  <LottieView
                    source={item.image}
                    style={styles.image}
                    autoPlay
                    loop
                    hardwareAccelerationAndroid
                  />
                </View>
              </View>
            );
          }}
        />
        <View style={styles.footer}>
          <View style={styles.pagerContainer}>
            {data.map((_, index) => {
              return (
                <View
                  key={index}
                  style={[
                    styles.pager,
                    index === currentIndex && styles.selectedPager,
                  ]}
                />
              );
            })}
          </View>
          <PrimaryButton
            title="Continue"
            fontColor={Globals.COLORS.WHITE}
            bgColor={Globals.COLORS.BLACK}
            onPress={scrollToIndex}
          />
          {footerLabel && (
            <StylishLabel
              style={styles.footerLink}
              fontSize={12}
              title={footerLabel}
              textStyle={styles.footerLinkText}
            />
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default OnboardingSlider;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    flexGrow: 1,
  },
  flexGrow: {
    flexGrow: 1,
  },
  item: {
    width: Dimensions.get('screen').width,
  },
  title: {
    marginHorizontal: '12%',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    paddingTop: 55,
  },
  footer: {
    paddingVertical: '10%',
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
  },
  footerLink: {
    marginTop: 24,
    marginHorizontal: '10%',
  },
  footerLinkText: {
    textAlign: 'center',
  },
  footerButtons: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
  },
  pager: {
    width: 37.254,
    height: 3.548,
    borderRadius: 9,
    backgroundColor: Globals.COLORS.BLACK,
  },
  selectedPager: {
    backgroundColor: '#CF59E2',
  },
  pagerContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 35,
    marginTop: 10,
  },
});
