import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {useDispatch} from 'react-redux';
import Globals from 'src/Globals';
import * as PushNodeClient from 'src/apis';
import AuthenticationHelper from 'src/helpers/AuthenticationHelper';
import {setLogout} from 'src/redux/authSlice';
import MetaStorage from 'src/singletons/MetaStorage';

import {Chat, Requests} from './components';
import AlertPrompt from './components/Alert';
import {ChatSetup} from './components/ChatSetup';
import {TABS} from './constants';
import {useChatLoader} from './helpers/useChatLoader';

export interface AppContext {
  connectedUser: PushNodeClient.ConnectedUser;
  feeds: PushNodeClient.Feeds[];
  requests: PushNodeClient.Feeds[];
}

export const Context = React.createContext<AppContext | null>(null);

export interface UserChatCredentials {
  pgpPrivateKey: string;
  encryptionPublicKey: string;
}

const ChatScreen = (props: any) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [tab, setTab] = useState(TABS.CHATS);
  const [isReady, setIsReady] = useState(false);
  const [isPrivateKeyUser, setIsPrivateKeyUser] = useState(true);
  const [chatCredentials, setChatCredentials] = useState<UserChatCredentials>();

  const onPress = (value: string) => {
    setTab(value);
  };

  const [isLoading, chatData] = useChatLoader(chatCredentials);

  useEffect(() => {
    (async () => {
      const signedInType =
        await MetaStorage.instance.getIsPrivateKeyAvailable();

      const _data: UserChatCredentials =
        await MetaStorage.instance.getUserChatData();

      if (signedInType !== Globals.CONSTANTS.CRED_TYPE_PRIVATE_KEY) {
        setIsPrivateKeyUser(false);
        return;
      }

      if (!_data) {
        // @ts-ignore
        navigation.navigate(Globals.SCREENS.PGP_FROM_PK_SCREEN, {
          navigation: navigation,
        });
      } else {
        setChatCredentials(_data);
        setIsReady(true);
      }
    })();
  }, [props]);

  if (!isPrivateKeyUser) {
    return (
      <View style={styles.container}>
        <AlertPrompt
          title="No Private Key"
          subtitle="You are currently not logged in with your private key. By procceding your credentials will be reset and you need to login in with Advanced SignIn."
          closeTitle="Procced"
          closeFunc={async () => {
            await AuthenticationHelper.resetSignedInUser();
            await MetaStorage.instance.clearStorage();
            dispatch(setLogout(null));
          }}
        />
      </View>
    );
  }

  if (isLoading || !isReady) {
    return (
      <SafeAreaView style={styles.container}>
        <ChatSetup />
      </SafeAreaView>
    );
  }

  if (!chatData.connectedUserData) {
    throw new Error('No user data');
  }

  return (
    <Context.Provider
      value={{
        connectedUser: chatData.connectedUserData,
        feeds: chatData.feeds,
        requests: chatData.requests,
      }}>
      <SafeAreaView style={styles.container}>
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
                  <Text style={styles.countText}>
                    {chatData.requests ? chatData.requests.length : 0}
                  </Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
          <ScrollView
            style={styles.content}
            showsHorizontalScrollIndicator={false}>
            {tab === TABS.CHATS ? (
              <Chat feeds={chatData.feeds} isIntentReceivePage={false} />
            ) : (
              <Requests
                requests={chatData.requests}
                isIntentReceivePage={true}
              />
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Context.Provider>
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
    paddingLeft: 3,
    paddingRight: 3,
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
