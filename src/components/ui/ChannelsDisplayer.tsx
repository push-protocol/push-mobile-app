import '@ethersproject/shims';
import BottomSheet, {BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';
import StylishLabel from 'src/components/labels/StylishLabel';
import EPNSActivity from 'src/components/loaders/EPNSActivity';
import ChannelItem from 'src/components/ui/ChannelItem';
import {usePushApi} from 'src/contexts/PushApiContext';
import useChannels from 'src/hooks/channel/useChannels';
import useSubscriptions from 'src/hooks/channel/useSubscriptions';
import {
  selectChannels,
  selectChannelsReachedEnd,
  selectIsLoadingSubscriptions,
} from 'src/redux/channelSlice';

import Globals from '../../Globals';
import NFSettingsSheet from '../sheets/NFSettingSheet';

const ChannelsDisplayer = () => {
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout>();
  const [nfSettingCurrentChannelIndex, setNfSettingCurrentChannelIndex] =
    useState<number>();

  const DEBOUNCE_TIMEOUT = 500; //time in millisecond which we want to wait for then to finish typing
  const [search, setSearch] = React.useState('');

  const [showSearchResults, setShowSearchResults] = useState(false);

  const channelResults = useSelector(selectChannels);
  const channelsReachedEnd = useSelector(selectChannelsReachedEnd);
  const {
    loadMoreChannels,
    loadSearchResults,
    isLoadingChannels,
    isLoadingSearchResults,
    searchResults,
  } = useChannels();

  const isLoadingSubscriptions = useSelector(selectIsLoadingSubscriptions);
  const {refreshSubscriptions} = useSubscriptions();
  const {userPushSDKInstance} = usePushApi();

  const bottomSheetRef = useRef<BottomSheet>(null);

  const channels = useMemo(() => {
    return showSearchResults ? searchResults : channelResults;
  }, [showSearchResults, searchResults, channelResults]);

  const endReached = useMemo(() => {
    return showSearchResults ? true : channelsReachedEnd;
  }, [showSearchResults, true, channelsReachedEnd]);

  const isLoading = useMemo(() => {
    return showSearchResults ? isLoadingSearchResults : isLoadingChannels;
  }, [showSearchResults, isLoadingSearchResults, isLoadingChannels]);

  const loadMore = useMemo(() => {
    return showSearchResults ? () => {} : loadMoreChannels;
  }, [showSearchResults]);

  useEffect(() => {
    if (userPushSDKInstance) {
      refreshSubscriptions();
      loadMore();
    }
  }, [userPushSDKInstance]);

  const selectChannelForSettings = (index: number) => {
    setNfSettingCurrentChannelIndex(index);
    bottomSheetRef.current?.expand();
  };

  const searchForChannel = async (channelName: string) => {
    if (channelName.trim() === '') {
      setShowSearchResults(false);
      return;
    }
    setShowSearchResults(true);
    await loadSearchResults(channelName);
  };

  const handleChannelSearch = async (searchQuery: string) => {
    if (searchTimer) {
      clearTimeout(searchTimer);
    }
    setSearch(searchQuery);
    setSearchTimer(
      setTimeout(() => {
        searchForChannel(searchQuery);
      }, DEBOUNCE_TIMEOUT),
    );
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.searchView}>
          <Image
            source={require('assets/ui/search.png')}
            style={styles.imageLogoStyle}
          />
          <TextInput
            style={styles.searchBar}
            onChangeText={e => {
              handleChannelSearch(e);
            }}
            value={search}
            placeholder={'Search for channel name or address'}
            placeholderTextColor="#7D7F89"
          />
        </View>

        {channels.length === 0 && (
          <View style={[styles.infodisplay]}>
            {!isLoading && !isLoadingSubscriptions ? (
              // Show channel not found label
              <StylishLabel
                style={styles.infoText}
                fontSize={16}
                title="[dg:No channels match your query, please search for another name/address]"
              />
            ) : (
              // Show channel fetching label
              <>
                <EPNSActivity style={{}} size="small" />
                <StylishLabel
                  style={styles.infoText}
                  fontSize={16}
                  title="[dg:Fetching Channels!]"
                />
              </>
            )}
          </View>
        )}

        {channels.length !== 0 && !isLoadingSubscriptions && (
          <FlatList
            data={channels}
            style={styles.channels}
            contentContainerStyle={{paddingVertical: 10}}
            keyExtractor={item => item.channel.toString()}
            initialNumToRender={20}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.seperator} />}
            onEndReached={() => {
              if (!endReached) {
                loadMore();
              }
            }}
            renderItem={({index}) => (
              <ChannelItem {...{index, selectChannelForSettings}} />
            )}
            ListFooterComponent={() => {
              return isLoading ? (
                <View style={{paddingBottom: 20, marginTop: 20}}>
                  <EPNSActivity style={{}} size="small" />
                </View>
              ) : null;
            }}
          />
        )}
      </SafeAreaView>
      <BottomSheet
        ref={bottomSheetRef}
        handleIndicatorStyle={styles.handleIndicator}
        enablePanDownToClose={true}
        onClose={() => setNfSettingCurrentChannelIndex(undefined)}
        index={-1}
        backdropComponent={props => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
          />
        )}
        snapPoints={['80%']}>
        {nfSettingCurrentChannelIndex && (
          <NFSettingsSheet
            index={nfSettingCurrentChannelIndex}
            hideSheet={() => {
              bottomSheetRef.current?.close();
              setNfSettingCurrentChannelIndex(undefined);
            }}
          />
        )}
      </BottomSheet>
    </>
  );
};

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 16,
  },
  channels: {
    flex: 1,
    width: '100%',
  },
  infodisplay: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  infoIcon: {
    height: 48,
    resizeMode: 'contain',
    margin: 10,
  },
  infoText: {
    marginVertical: 10,
  },
  searchView: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#EFEFEF',
    marginBottom: 24,
  },
  searchBar: {
    fontSize: 14,
    color: Globals.COLORS.DARKER_GRAY,
  },
  imageLogoStyle: {
    margin: 5,
    height: 20,
    width: 20,
    resizeMode: 'stretch',
    alignItems: 'center',
  },
  seperator: {
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
    marginVertical: 24,
  },
  handleIndicator: {
    top: -24,
    width: 50,
    backgroundColor: 'white',
  },
});

export default ChannelsDisplayer;