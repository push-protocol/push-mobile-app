import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import GLOBALS from 'src/Globals';

import PrimaryButton from '../buttons/PrimaryButton';
import LockIcon from '../icons/LockIcon';
import UserProfile from '../ui/UserProfile';

interface AuthModalWrapperProps {
  children?: React.ReactNode;
  title: string;
  subtitle: string;
  lockIconColor: string;
  footerButtons?: Array<any>;
  icon: 'copy' | 'warning';
}

const AuthModalWrapper = ({
  title,
  subtitle,
  footerButtons,
  lockIconColor,
  icon,
}: AuthModalWrapperProps) => {
  return (
    <View>
      <View style={styles.lockIcon}>
        <LockIcon color={lockIconColor} />
      </View>
      <View style={styles.userProfile}>
        <UserProfile icon={icon} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {footerButtons && (
        <View style={styles.buttonsContainer}>
          {footerButtons.map((props, index) => {
            return <PrimaryButton {...props} fontSize={16} key={index} />;
          })}
        </View>
      )}
    </View>
  );
};

export default AuthModalWrapper;

const styles = StyleSheet.create({
  title: {
    color: GLOBALS.COLORS.BLACK,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    letterSpacing: -0.43,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 32,
    textAlign: 'center',
    color: '#3D3E45',
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    letterSpacing: -0.43,
  },
  buttonsContainer: {
    flexDirection: 'column',
    gap: 16,
  },
  lockIcon: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  userProfile: {
    alignSelf: 'center',
    marginBottom: 32,
  },
});
