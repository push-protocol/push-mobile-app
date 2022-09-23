import {Feather} from '@expo/vector-icons';
import {Ionicons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Globals from 'src/Globals';

import {Recipient, Sender, Time} from './components';
import {CHAT_TYPES, FULL_CHAT} from './constants';

const SingleChatScreen = () => {
  const navigation = useNavigation();

  return (
    <LinearGradient colors={['#EEF5FF', '#ECE9FA']} style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name="arrow-back"
          size={35}
          color={Globals.COLORS.CHAT_LIGHT_DARK}
          onPress={() => navigation.goBack()}
        />

        <View style={styles.info}>
          <View style={styles.user}>
            <Image
              style={styles.image}
              source={require('assets/chat/wallet1.png')}
            />

            <Text style={styles.wallet}>Adam.eth</Text>
          </View>
          <Feather name="more-vertical" size={24} color="black" />
        </View>
      </View>

      <ScrollView style={styles.section} showsHorizontalScrollIndicator={false}>
        <Time text="July 26, 2022" />

        {FULL_CHAT.map(({text, time, type}) =>
          type === CHAT_TYPES.RECIPIENT ? (
            <Recipient text={text} time={time} />
          ) : (
            <Sender text={text} time={time} />
          ),
        )}
      </ScrollView>
    </LinearGradient>
  );
};

export default SingleChatScreen;

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    height: windowHeight,
    flex: 1,
    alignItems: 'center',
    width: windowWidth,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
    padding: 15,
  },
  info: {
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
    marginLeft: 10,
    borderRadius: 20,
    backgroundColor: 'white',
    height: 50,
    padding: 15,
    width: '85%',
    justifyContent: 'space-between',
  },

  image: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  user: {
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
  },
  wallet: {
    fontSize: 16,
    marginLeft: 10,
    color: Globals.COLORS.BLACK,
    fontWeight: '500',
  },
  section: {
    height: windowHeight,
    width: windowWidth,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
});
