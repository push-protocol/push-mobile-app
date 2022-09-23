import {EvilIcons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {StyleSheet, TextInput, View} from 'react-native';
import Globals from 'src/Globals';

import {DUMMY_CHATS} from '../constants';
import SingleChatItem from './SingleChatItem';

const Chats = () => {
  const [value, setValue] = useState('');
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <View style={styles.searchView}>
        <TextInput
          style={styles.input}
          onChangeText={setValue}
          value={value}
          placeholder="Search name.eth or 0x123.."
        />
        <EvilIcons
          name="search"
          size={30}
          color="black"
          style={styles.searchImage}
        />
      </View>

      <View style={styles.content}>
        {DUMMY_CHATS.map((item, index) => (
          <SingleChatItem
            key={index}
            image={item.image}
            wallet={item.wallet}
            text={item.text}
            time={item.time}
            count={item.count}
            onPress={() =>
              //@ts-ignore
              navigation.navigate(Globals.SCREENS.SINGLE_CHAT, {
                wallet: item.wallet,
              })
            }
          />
        ))}
      </View>
    </View>
  );
};

export default Chats;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    width: '95%',
    height: '100%',
  },
  content: {padding: 10, width: '100%'},
  input: {
    margin: 12,
    borderRadius: 20,
    padding: 20,
    color: Globals.COLORS.BLACK,
    fontSize: 18,
    textTransform: 'capitalize',
    height: 50,
    paddingLeft: 15,
    paddingRight: 10,
  },
  searchView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    margin: 12,
    backgroundColor: Globals.COLORS.LIGHT_BLUE,
    borderRadius: 20,
    padding: 4,
    color: Globals.COLORS.BLACK,
    marginBottom: 10,
  },
  searchImage: {
    marginRight: 20,
  },

  walletImage: {
    width: 24,
    height: 24,
    marginRight: 5,
    resizeMode: 'contain',
  },
  bottomText: {
    color: Globals.COLORS.BLACK,
    marginLeft: 10,
    fontSize: 16,
  },
  bottomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomContainer: {
    borderTopColor: Globals.COLORS.LIGHT_GRAY,
    flex: 1,
    justifyContent: 'space-between',
    borderTopWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 30,
  },
});
