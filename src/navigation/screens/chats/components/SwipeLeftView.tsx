import {FontAwesome} from '@expo/vector-icons';
import React, {FC} from 'react';
import {StyleSheet, View} from 'react-native';
import Globals from 'src/Globals';

import {ReplyIcon} from './ReplyIcon';

const SwipeLeftView: FC = () => {
  return (
    <View style={styles.container}>
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
