import {useNavigation} from '@react-navigation/native';
import {useWalletConnect} from '@walletconnect/react-native-dapp';
import React, {useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Globals from 'src/Globals';
import * as PushNodeClient from 'src/apis';
import {Toaster} from 'src/components/indicators/Toaster';
import {DappScanPage} from 'src/components/ui/DappScanPage';
import MetaStorage from 'src/singletons/MetaStorage';
import {handleWalletConnectLogin} from 'src/walletconnect';

import {Chat, Requests} from './components';
import {ChatSetup} from './components/ChatSetup';
import {TABS} from './constants';
import {useChatLoader} from './helpers/useChatLoader';

export interface AppContext {
  connectedUser: PushNodeClient.ConnectedUser;
  feeds: PushNodeClient.Feeds[];
  requests: PushNodeClient.Feeds[];
  chatCredentials: UserChatCredentials | undefined;
}

export const Context = React.createContext<AppContext | null>(null);

export interface UserChatCredentials {
  pgpPrivateKey: string;
  encryptionPublicKey: string;
}

const ChatScreen = (props: any) => {
  const navigation = useNavigation();
  const toastRef = useRef<any>();

  const [tab, setTab] = useState(TABS.CHATS);
  const [isReady, setIsReady] = useState(false);
  const [isPrivateKeyUser, setIsPrivateKeyUser] = useState(true);
  const [chatCredentials, setChatCredentials] = useState<UserChatCredentials>();
  const connector = useWalletConnect();

  const onPress = (value: string) => {
    setTab(value);
  };

  const [isLoading, chatData, refresh] = useChatLoader(chatCredentials);

  const initalizate = async () => {
    const signedInType = await MetaStorage.instance.getIsPrivateKeyAvailable();

    const _data: UserChatCredentials =
      await MetaStorage.instance.getUserChatData();

    // user PGP pair was not found
    if (!_data) {
      // user logged with private key
      // ask user to generate the pgp pair
      if (signedInType === Globals.CONSTANTS.CRED_TYPE_PRIVATE_KEY) {
        // @ts-ignore
        navigation.navigate(Globals.SCREENS.PGP_FROM_PK_SCREEN, {
          navigation: navigation,
        });
      } else if (isWcConnected()) {
        console.log('do your work abishek');
        const chatInfoLoaded = await handleWalletConnectLogin(connector);
        if (chatInfoLoaded) {
          //TOdo
        } else {
          setIsPrivateKeyUser(false);
          return;
        }
      }
      // user is new user ask them to use dapp qr
      else {
        setIsPrivateKeyUser(false);
        return;
      }
    } else {
      setChatCredentials({..._data});
      setTab(TABS.CHATS);
      setIsReady(true);
    }
  };

  const isWcConnected = () => {
    console.log(connector.accounts);

    return connector.accounts.length > 0;
  };

  useEffect(() => {
    let lis: any;
    (async () => {
      try {
        lis = props.navigation.addListener('focus', () => {
          if (chatData.connectedUserData) {
            refresh();
          } else {
            initalizate();
          }
        });
      } catch (error) {
        console.log('error fetching the chats');
      }
    })();
    return lis;
  }, [props, props.navigation]);

  if (!isPrivateKeyUser && !isReady) {
    return <DappScanPage />;
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
        chatCredentials: chatCredentials,
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
              <Chat
                feeds={chatData.feeds}
                isIntentReceivePage={false}
                toastRef={toastRef.current}
              />
            ) : (
              <Requests
                requests={chatData.requests}
                isIntentReceivePage={true}
              />
            )}
          </ScrollView>
        </View>
        <Toaster ref={toastRef} />
      </SafeAreaView>

      <TouchableWithoutFeedback
        onPress={() => {
          console.log('dadda', Date.now());

          // @ts-ignore
          navigation.navigate(Globals.SCREENS.NewChatScreen, {
            chatCredentials: chatCredentials,
          });
        }}>
        <View
          style={{
            bottom: 15,
            position: 'absolute',
            right: 15,
          }}>
          <Image
            source={require('assets/icons/compose-chat-icon.png')}
            style={{
              width: 55,
              height: 55,
            }}
          />
        </View>
      </TouchableWithoutFeedback>
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
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    display: 'flex',
    alignItems: 'center',
    padding: 20,
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
  content: {marginTop: 0},
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
