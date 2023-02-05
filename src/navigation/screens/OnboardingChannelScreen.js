import '@ethersproject/shims';
import {useNavigation} from '@react-navigation/native';
import {ethers} from 'ethers';
import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  Linking,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import GLOBALS from 'src/Globals';
import PrimaryButton from 'src/components/buttons/PrimaryButton';
import SubscriptionStatus from 'src/components/buttons/SubscriptionStatus';
import StylishLabel from 'src/components/labels/StylishLabel';
import DetailedInfoPresenter from 'src/components/misc/DetailedInfoPresenter';
import ENV_CONFIG from 'src/env.config';

import EPNSABI from '../abis/epnscore.json';
import addresses from '../templates/addresses';

export default function OnboardingChannelScreen(props) {
  const navigation = useNavigation();

  const [channels, setChannels] = useState([]);
  const [page, setPage] = useState(1);

  const [contract, setContract] = useState(null);

  const [provider, setProvider] = useState(null);
  const [endReached, setEndReached] = useState(false);

  useEffect(() => {
    // fetchChannels();
    const network = 'ropsten';
    const providerState = ethers.getDefaultProvider(network, {
      etherscan: 'TZCWZ8YCQDH4THP54865SDGTG3XXY8ZAQU',
      infura: ENV_CONFIG.INFURA_PROJECT_ID
        ? {
            projectId: ENV_CONFIG.INFURA_PROJECT_ID,
            projectSecret: ENV_CONFIG.INFURA_PROJECT_SECRET,
          }
        : null,
      alchemy: 'wxQBUQ4vvHpc8HJBJWw1YjWoCMDwiHh2',
    });
    setProvider(providerState);
    initiateContractInstance(providerState);
  }, []);

  const initiateContractInstance = async provider => {
    const contractInstanceState = await new ethers.Contract(
      addresses.epnscore,
      EPNSABI,
      provider,
    );

    setContract(contractInstanceState);
  };

  useEffect(() => {
    fetchChannels();
  }, [contract]);

  const fetchChannels = async () => {
    const apiURL = ENV_CONFIG.EPNS_SERVER + ENV_CONFIG.ENDPOINT_FETCH_CHANNELS;

    const response = await fetch(apiURL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page: page,
        limit: 10,
      }),
    });
    const resJson = await response.json();

    if (resJson.count != 0 && resJson.results != []) {
      const data = channels;
      await setChannels([...data, ...resJson.results]);
      await setPage(page + 1);
    }
  };

  const openURL = url => {
    if (validURL(url) || 1) {
      // console.log("OPENING URL ", url);
      // Bypassing the check so that custom app domains can be opened
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          // showToast("Device Not Supported", "ios-link", ToasterOptions.TYPE.GRADIENT_PRIMARY)
        }
      });
    } else {
      // showToast("Link not valid", "ios-link", ToasterOptions.TYPE.GRADIENT_PRIMARY)
    }
  };

  // to check valid url
  const validURL = str => {
    var pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i',
    ); // fragment locator
    return !!pattern.test(str);
  };

  return (
    <SafeAreaView style={{backgroundColor: '#fff', flex: 1}}>
      <DetailedInfoPresenter
        contentView={
          <View style={styles.introContent}>
            <StylishLabel
              style={styles.para}
              fontSize={18}
              title="[b:ONE] last thing!"
            />

            <StylishLabel
              style={styles.para}
              fontSize={16}
              title="Have a look at these [d:dApp] channels and [b:Subscribe] to those whom you wish to receive notifications from."
            />
          </View>
        }
      />

      <FlatList
        data={channels}
        style={{backgroundColor: '#fff', marginBottom: 60, height: '80%'}}
        keyExtractor={item => item.channel.toString()}
        initialNumToRender={5}
        showsVerticalScrollIndicator={false}
        onEndReached={async () => (!endReached ? await fetchChannels() : null)}
        renderItem={({item}) => (
          <View>
            {item.icon && item.name && item.info ? (
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  marginVertical: 10,
                  marginHorizontal: 20,
                  borderWidth: 1,
                  borderColor: '#ccc',
                  padding: 10,
                  borderRadius: 10,
                }}>
                <View
                  style={{
                    flex: 0.2,
                    // justifyContent: "center",
                    alignItems: 'center',
                    marginVertical: 10,
                  }}>
                  {item.icon ? (
                    <Image
                      source={{uri: item.icon}}
                      style={{
                        width: 50,
                        height: 50,
                        borderWidth: 1,
                        borderColor: '#ccc',
                      }}
                    />
                  ) : null}
                </View>
                <View
                  style={{
                    flex: 0.8,
                    marginTop: 8,
                    marginHorizontal: 8,
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      openURL(item.url);
                    }}>
                    <Text
                      style={{
                        color: '#E10780',
                        fontWeight: 'bold',
                        fontSize: 14,
                        flexWrap: 'wrap',
                      }}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                  <Text
                    style={{
                      flex: 1,
                      flexWrap: 'wrap',
                      marginTop: 5,
                      fontSize: 10,
                    }}>
                    {item.info}
                  </Text>
                  <View
                    style={{
                      marginTop: 10,
                      justifyContent: 'flex-end',
                      alignItems: 'flex-end',
                    }}>
                    <SubscriptionStatus
                      channel={item.channel}
                      user={props.route.params.wallet}
                      contract={contract}
                    />
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        )}
      />
      <View
        style={{
          width: '70%',
          height: 75,
          position: 'absolute',
          bottom: 0,
          alignSelf: 'center',
        }}>
        <PrimaryButton
          iconFactory="Ionicons"
          icon="ios-arrow-forward"
          iconSize={24}
          title="I'll do this later"
          fontSize={16}
          fontColor={GLOBALS.COLORS.WHITE}
          bgColor={GLOBALS.COLORS.GRADIENT_THIRD}
          disabled={false}
          onPress={() => {
            navigation.navigate('SetupComplete', {
              privateKey: props.route.params.privateKey,
              fromOnboarding: props.route.params.fromOnboarding,
            });
          }}
        />
      </View>
    </SafeAreaView>
  );
}

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: GLOBALS.COLORS.WHITE,
  },
  profile: {},
  header: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'center',
    marginHorizontal: GLOBALS.ADJUSTMENTS.SCREEN_GAP_HORIZONTAL,
    zIndex: 99,
    height: 55,
  },
  notifier: {
    marginTop: 5,
    marginRight: 10,
  },
  settings: {
    marginTop: 5,
    width: 24,
  },
  help: {
    width: 24,
    marginTop: 5,
    marginRight: 10,
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedDisplayer: {
    flex: 1,
    width: '100%',
  },
  introContent: {
    marginBottom: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
