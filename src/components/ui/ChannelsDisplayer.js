import '@ethersproject/shims';
import React, {useEffect, useMemo, useState} from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
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
import {selectChannels, selectChannelsReachedEnd} from 'src/redux/channelSlice';

import Globals from '../../Globals';

const ChannelsDisplayer = ({style}) => {
  const [searchTimer, setSearchTimer] = useState(null);

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

  const {refreshSubscriptions} = useSubscriptions();
  const {userPushSDKInstance} = usePushApi();

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
      loadMore();
      refreshSubscriptions();
    }
  }, [userPushSDKInstance]);

  const searchForChannel = async channelName => {
    if (channelName.trim() === '') {
      setShowSearchResults(false);
      return;
    }
    setShowSearchResults(true);
    await loadSearchResults(channelName);
  };

  const handleChannelSearch = async searchQuery => {
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
    <SafeAreaView style={[styles.container, style]}>
      <View style={styles.searchView}>
        <TextInput
          style={styles.searchBar}
          onChangeText={e => {
            handleChannelSearch(e);
          }}
          value={search}
          placeholder={'Search by name/address'}
        />
        <Image
          source={require('assets/ui/search.png')}
          style={styles.imageLogoStyle}
        />
      </View>

      {channels.length === 0 && (
        <View style={[styles.infodisplay, styles.noPendingFeeds]}>
          {!isLoading ? (
            // Show channel not found label
            <StylishLabel
              style={styles.infoText}
              fontSize={16}
              title="[dg:No channels match your query, please search for another name/address]"
            />
          ) : (
            // Show channel fetching label
            <>
              <EPNSActivity style={styles.activity} size="small" />
              <StylishLabel
                style={styles.infoText}
                fontSize={16}
                title="[dg:Fetching Channels!]"
              />
            </>
          )}
        </View>
      )}

      {channels.length !== 0 && (
        <FlatList
          data={channels}
          style={styles.channels}
          contentContainerStyle={{paddingVertical: 10}}
          keyExtractor={item => item.channel.toString()}
          initialNumToRender={20}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (!endReached) {
              loadMore(search);
            }
          }}
          renderItem={({item}) => <ChannelItem item={item} />}
          ListFooterComponent={() => {
            return isLoading ? (
              <View style={{paddingBottom: 20, marginTop: 20}}>
                <EPNSActivity style={styles.activity} size="small" />
              </View>
            ) : null;
          }}
        />
      )}
    </SafeAreaView>
  );
};

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
    margin: 12,
    borderWidth: 1.5,
    borderColor: '1px solid rgba(169, 169, 169, 0.5)',
    borderRadius: 10,
    padding: 4,
  },
  searchBar: {
    fontSize: 18,
    textTransform: 'capitalize',
    height: 55,
    paddingLeft: 35,
    paddingRight: 30,
    color: Globals.COLORS.DARKER_GRAY,
  },
  imageLogoStyle: {
    padding: 15,
    margin: 5,
    height: 50,
    width: 50,
    resizeMode: 'stretch',
    alignItems: 'center',
  },
});

export default ChannelsDisplayer;
