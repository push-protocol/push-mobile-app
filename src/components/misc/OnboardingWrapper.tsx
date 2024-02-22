import Constants from 'expo-constants';
import React, {useRef} from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import GLOBALS from 'src/Globals';
import StylishLabel from 'src/components/labels/StylishLabel';

import PrimaryButton from '../buttons/PrimaryButton';

interface OnboardingWrapperProps {
  title: string;
  subtitle?: string;
  backgroundColor?: ViewStyle['backgroundColor'];
  children?: React.ReactNode;
  footerLabel?: string;
  footerTopLabel?: string;
  footerButtons?: Array<any>;
}

const OnboardingWrapper = ({
  title,
  subtitle,
  backgroundColor = GLOBALS.COLORS.WHITE,
  children,
  footerLabel,
  footerTopLabel,
  footerButtons,
}: OnboardingWrapperProps) => {
  const fader = useRef(new Animated.Value(1));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, {backgroundColor}]}>
      <StatusBar backgroundColor={backgroundColor} barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.flexGrow}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        <View style={styles.children}>{children}</View>
        <Animated.View style={[styles.footer, {opacity: fader.current}]}>
          {footerTopLabel && (
            <StylishLabel
              style={styles.footerLinkTop}
              fontSize={12}
              title={footerTopLabel}
              textStyle={styles.footerLinkText}
            />
          )}
          <View style={styles.footerButtons}>
            {footerButtons?.map((footerBtnProps, index) => {
              return <PrimaryButton key={index} {...footerBtnProps} />;
            })}
          </View>
          {footerLabel && (
            <StylishLabel
              style={styles.footerLink}
              fontSize={12}
              title={footerLabel}
              textStyle={styles.footerLinkText}
            />
          )}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default OnboardingWrapper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
  flexGrow: {
    flexGrow: 1,
  },
  title: {
    marginHorizontal: '12%',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    paddingTop: 55,
  },
  subtitle: {
    marginHorizontal: '16%',
    marginTop: 16,
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
  },
  footer: {
    paddingBottom: '10%',
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
  },
  footerLink: {
    marginTop: 24,
    marginHorizontal: '10%',
  },
  footerLinkTop: {
    marginVertical: 23,
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
  children: {
    flex: 1,
    width: '100%',
  },
});
