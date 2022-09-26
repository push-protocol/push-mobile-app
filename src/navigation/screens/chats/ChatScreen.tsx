import React, {useState} from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Globals from 'src/Globals';

import {Chat, Requests} from './components';
import {ChatSetup} from './components/ChatSetup';
import {TABS} from './constants';
import {useChatLoader} from './helpers/useChatLoader';

const ChatScreen = () => {
  const [tab, setTab] = useState(TABS.CHATS);

  const [isLoading, chatData] = useChatLoader();

  const onPress = (value: string) => {
    setTab(value);
  };

  if (!isLoading) {
    console.log('Chat data loaded', 'num threads', chatData.feeds.length);
  }

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <ChatSetup />
      ) : (
        <View>
          <View style={styles.header}>
            <TouchableWithoutFeedback onPress={() => onPress(TABS.CHATS)}>
              <View
                style={
                  tab === TABS.CHATS ? styles.activeTab : styles.inactiveTab
                }>
                <Text
                  style={
                    tab === TABS.CHATS
                      ? styles.activeTabText
                      : styles.inactiveTabText
                  }>
                  Chats
                </Text>
              </View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback onPress={() => onPress(TABS.REQUESTS)}>
              <View
                style={
                  tab === TABS.REQUESTS ? styles.activeTab : styles.inactiveTab
                }>
                <Text
                  style={
                    tab === TABS.REQUESTS
                      ? styles.activeTabText
                      : styles.inactiveTabText
                  }>
                  Requests
                </Text>
                <View style={styles.count}>
                  <Text style={styles.countText}>{10}</Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>

          <ScrollView
            style={styles.content}
            showsHorizontalScrollIndicator={false}>
            {tab === TABS.CHATS ? (
              <Chat feeds={chatData.feeds} />
            ) : (
              <Requests />
            )}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ChatScreen;

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    height: windowHeight,
    flex: 1,
    alignItems: 'center',
    width: windowWidth,
    padding: 20,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    display: 'flex',
    alignItems: 'center',
  },
  activeTab: {
    width: '50%',
    textAlign: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderBottomColor: Globals.COLORS.PINK,
    borderBottomWidth: 3,
    height: 50,
    alignItems: 'center',
    paddingBottom: 5,
    color: Globals.COLORS.PINK,
  },
  inactiveTab: {
    width: '50%',
    textAlign: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderBottomColor: Globals.COLORS.LIGHT_GRAY,
    borderBottomWidth: 1,
    height: 50,
    alignItems: 'center',
    paddingBottom: 5,
  },
  activeTabText: {
    fontSize: 18,
    color: Globals.COLORS.PINK,
    paddingBottom: 10,
    paddingTop: 10,
  },
  inactiveTabText: {
    fontSize: 18,
    color: Globals.COLORS.BLACK,
  },
  content: {marginTop: 5},
  count: {
    backgroundColor: Globals.COLORS.PINK,
    borderRadius: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    marginLeft: 10,
  },
  countText: {
    color: 'white',
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
    paddingVertical: 20,
    paddingHorizontal: 30,
    backgroundColor: 'white',
  },
  walletImage: {
    width: 24,
    height: 24,
    marginRight: 5,
    resizeMode: 'contain',
  },
});
