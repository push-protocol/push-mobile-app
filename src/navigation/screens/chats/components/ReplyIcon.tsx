import React, {FC} from 'react';
import {Image, Pressable, StyleSheet} from 'react-native';

export type ReplyIconProps = {disabled?: boolean};

const ReplyIcon: FC<ReplyIconProps> = ({disabled}) => {
  return (
    <Pressable disabled={disabled} style={styles.button}>
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
