import {Feather, FontAwesome, FontAwesome5, Ionicons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import dayjs from 'dayjs';
import React, {useState} from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Globals from 'src/Globals';

import {Recipient, Sender, Time} from './components';
import {CHAT_TYPES, FULL_CHAT} from './constants';

const SingleChatScreen = () => {
  const navigation = useNavigation();
  const [text, onChangeText] = React.useState('');
  const [chats, setChats] = useState(FULL_CHAT);

  const onSend = () => {
    setChats([
      ...chats,
      {
        type: CHAT_TYPES.SENDER,
        text,
        time: dayjs(new Date().toISOString()).format('HH:mm'),
      },
    ]);
    onChangeText('');
  };

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

        {chats.map(chat =>
          chat.type === CHAT_TYPES.RECIPIENT ? (
            <Recipient text={chat.text} time={chat.time} />
          ) : (
            <Sender text={chat.text} time={chat.time} />
          ),
        )}
      </ScrollView>

      <View style={styles.keyboard}>
        <View style={styles.textInputContainer}>
          <View style={styles.smileyIcon}>
            <FontAwesome5 name="smile" size={20} color="black" />
          </View>

          <TextInput
            style={styles.input}
            onChangeText={onChangeText}
            value={text}
            placeholder="Type your message here..."
            placeholderTextColor="#494D5F"
          />
        </View>

        <View style={styles.textButtonContainer}>
          <View>
            <Feather name="paperclip" size={20} color="black" />
          </View>

          <View style={styles.sendIcon}>
            <FontAwesome
              name="send"
              size={24}
              color={Globals.COLORS.PINK}
              onPress={onSend}
            />
          </View>
        </View>
      </View>
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
    position: 'relative',
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
    maxHeight: (windowHeight * 3) / 5 - 15,
    width: windowWidth,
    paddingVertical: 10,
    paddingHorizontal: 20,
    overflow: 'scroll',
  },
  moreIcon: {
    marginTop: -3,
  },
  keyboard: {
    display: 'flex',
    position: 'absolute',
    bottom: 5,
    backgroundColor: Globals.COLORS.WHITE,
    borderRadius: 16,
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    height: 35,
    margin: 12,
    padding: 10,
    color: Globals.COLORS.BLACK,
    fontSize: 16,
  },
  smileyIcon: {
    marginTop: 20,
    marginLeft: 20,
  },
  textInputContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  textButtonContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 20,
    marginRight: 20,
  },
  fileIcon: {},
  sendIcon: {
    marginLeft: 10,
  },
});
