import React, {FC} from 'react';
import {Image, Pressable, StyleSheet, ViewStyle} from 'react-native';

export type ReplyIconProps = {
  disabled?: boolean;
  buttonStyle?: ViewStyle;
  onPress?: () => void;
};

const ReplyIcon: FC<ReplyIconProps> = ({disabled, buttonStyle, onPress}) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, buttonStyle]}>
      <Image
        style={styles.icon}
        source={require('../../../../../assets/chat/icReply.png')}
      />
    </Pressable>
  );
};

export {ReplyIcon};

const styles = StyleSheet.create({
  button: {
    padding: 5,
  },
  icon: {
    height: 24,
    width: 24,
    resizeMode: 'contain',
  },
});
