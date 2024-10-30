import {FontAwesome} from '@expo/vector-icons';
import React, {FC} from 'react';
import {StyleSheet, View} from 'react-native';
import Globals from 'src/Globals';

const SwipeLeftView: FC = () => {
  return (
    <View style={styles.container}>
      <FontAwesome
        name="reply"
        size={18}
        color={Globals.COLORS.CHAT_LIGHT_DARK}
      />
    </View>
  );
};

export default SwipeLeftView;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: 'auto',
  },
});
