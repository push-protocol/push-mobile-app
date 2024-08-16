import React, {useState} from 'react';
import {StyleSheet, Text} from 'react-native';
import {View} from 'react-native';
import GLOBALS from 'src/Globals';

import PrimaryButton from '../buttons/PrimaryButton';

type ErrorModalProps = {
  title: string;
  subtitle: string;
  footerButtons: Array<any>;
};

export const ErrorModal = ({
  subtitle,
  title,
  footerButtons,
}: ErrorModalProps) => {
  const [loading, setLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState<number>();

  const handlePress = async (index: number) => {
    setLoading(true);
    setLoadingIndex(index);
    await footerButtons[index]?.onPress?.();
    setTimeout(() => {
      setLoading(false);
      setLoadingIndex(undefined);
    }, 500);
  };

  return (
    <View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {footerButtons && (
        <View style={styles.buttonsContainer}>
          {footerButtons.map((props, index) => {
            return (
              <PrimaryButton
                {...props}
                fontSize={16}
                key={index}
                onPress={() => handlePress(index)}
                loading={loadingIndex === index}
                disabled={loading === true}
              />
            );
          })}
        </View>
      )}
    </View>
  );
};

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
    gap: 8,
  },
});
