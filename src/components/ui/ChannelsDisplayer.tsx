import '@ethersproject/shims';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {FlatList, Image, StyleSheet, TextInput, View} from 'react-native';
import {useSelector} from 'react-redux';
import StylishLabel from 'src/components/labels/StylishLabel';
import EPNSActivity from 'src/components/loaders/EPNSActivity';
import ChannelItem from 'src/components/ui/ChannelItem';
import {usePushApi} from 'src/contexts/PushApiContext';
import {useSheets} from 'src/contexts/SheetContext';
import useChannels from 'src/hooks/channel/useChannels';
import useSubscriptions from 'src/hooks/channel/useSubscriptions';
import {
  Channel,
  selectChannels,
  selectChannelsReachedEnd,
  selectIsLoadingSubscriptions,
} from 'src/redux/channelSlice';

import GLOBALS from '../../Globals';

const ChannelsDisplayer = () => {
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout>();

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
  const {openSheet} = useSheets();

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

  const selectChannelForSettings = (channel: Channel) => {
    openSheet({name: 'NFSettingsSheet', channel});
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
    try {
      if (searchTimer) {
        clearTimeout(searchTimer);
      }
      setSearch(searchQuery);
      setSearchTimer(
        setTimeout(() => {
          searchForChannel(searchQuery);
        }, DEBOUNCE_TIMEOUT),
      );
    } catch (e) {}
  };

  return (
    <>
      <View style={styles.container}>
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
            renderItem={({item: channel}) => (
              <ChannelItem {...{channel, selectChannelForSettings}} />
            )}
            ListFooterComponent={() => {
              return isLoading ? (
                <View style={{paddingBottom: 80, marginTop: 20}}>
                  <EPNSActivity style={{}} size="small" />
                </View>
              ) : null;
            }}
          />
        )}
      </View>
    </>
  );
};

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: GLOBALS.COLORS.WHITE,
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
    height: 42,
    paddingHorizontal: 8,
  },
  searchBar: {
    fontSize: 14,
    color: GLOBALS.COLORS.DARKER_GRAY,
    flex: 1,
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
});

export default ChannelsDisplayer;
