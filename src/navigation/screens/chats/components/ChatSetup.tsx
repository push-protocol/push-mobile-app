import React from 'react';
import {Image, View} from 'react-native';

const ChatSetup = () => {
  return (
    <View>
      <Image
        style={{marginTop: 150, width: 60, height: 60}}
        source={require('assets/chat/loading.gif')}
      />
    </View>
  );
};

export {ChatSetup};
