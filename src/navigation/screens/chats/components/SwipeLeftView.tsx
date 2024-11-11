import React, {FC} from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';

import {ReplyIcon} from './ReplyIcon';

export type SwipeLeftViewProps = {
  style?: ViewStyle;
};

const SwipeLeftView: FC<SwipeLeftViewProps> = ({style}) => {
  return (
    <View style={[styles.container, style]}>
      <ReplyIcon disabled />
    </View>
  );
};

export {SwipeLeftView};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: 'auto',
  },
});
