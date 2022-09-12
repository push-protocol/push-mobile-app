import '@ethersproject/shims'
import React, { useState, useEffect } from 'react'
import {
  View,
  SafeAreaView,
  FlatList,
  Image,
  StyleSheet,
  TextInput,
} from 'react-native'

import StylishLabel from 'src/components/labels/StylishLabel'
import EPNSActivity from 'src/components/loaders/EPNSActivity'
import ChannelItem from 'src/components/ui/ChannelItem'
import ENV_CONFIG from 'src/env.config'

const ChannelsDisplayer = ({ style, wallet, pKey }) => {
  const [channels, setChannels] = useState([])
  const [page, setPage] = useState(1)

  const [refreshing, setRefreshing] = useState(false)

  const [contract, setContract] = useState(null)
  const [endReached, setEndReached] = useState(false)

  const [searchTimer, setSearchTimer] = useState(null)
  const [isSearchEnded, setIsSearchEnded] = useState(false)

  const DEBOUNCE_TIMEOUT = 500 //time in millisecond which we want to wait for then to finish typing
  const [search, setSearch] = React.useState('')

  useEffect(() => {
    setRefreshing(true)
  }, [])

  const fetchChannels = async () => {
    const apiURL = ENV_CONFIG.EPNS_SERVER + ENV_CONFIG.ENDPOINT_FETCH_CHANNELS
    const requestURL = `${apiURL}?limit=10&page=${page}` 
    const resJson = await fetch(requestURL).then((response) => response.json())
    if (resJson.count != 0 && resJson.channels != []) {
      setChannels((prev) => [...prev, ...resJson.channels])
      setPage((prev) => prev + 1 )
    }
    setRefreshing(false)
  }

  useEffect(() => {
    if (refreshing == true) {
      fetchChannels()
    }
  }, [refreshing])

  // to check valid url
  const validURL = (str) => {
    var pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i',
    ) // fragment locator
    return !!pattern.test(str)
  }

  const searchForChannel = async (channelName) => {
    setChannels([])

    // normal fetch for empty query
    if (channelName.trim() === '') {
      await fetchChannels()
      return
    }

    setIsSearchEnded(false)
    const apiURL = ENV_CONFIG.EPNS_SERVER + '/channels/search'
    const searchRes = await fetch(apiURL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chainId: 42,
        page: 1,
        pageSize: 20,
        op: 'read',
        query: channelName,
      }),
    })

    const resJson = await searchRes.json()
    setChannels(resJson.channels)
    setIsSearchEnded(true)
  }

  const handleChannelSearch = async (searchQuery) => {
    if (searchTimer) {
      clearTimeout(searchTimer)
    }
    setSearch(searchQuery)
    setSearchTimer(
      setTimeout(() => {
        searchForChannel(searchQuery)
      }, DEBOUNCE_TIMEOUT),
    )
  }

  return (
    <SafeAreaView style={[styles.container, style]}>
      <View style={styles.searchView}>
        <TextInput
          style={styles.searchBar}
          onChangeText={(e) => {
            handleChannelSearch(e)
          }}
          value={search}
          placeholder={'Search by name/address'}
        />
        <Image
          source={require('assets/ui/search.png')}
          style={styles.imageLogoStyle}
        />
      </View>

      {channels.length == 0 && (
        <View style={[styles.infodisplay, styles.noPendingFeeds]}>
          {isSearchEnded ? (
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

      {channels.length != 0 && (
        <FlatList
          data={channels}
          style={styles.channels}
          contentContainerStyle={{ paddingVertical: 10 }}
          keyExtractor={(item) => item.channel.toString()}
          initialNumToRender={20}
          showsVerticalScrollIndicator={false}
          onEndReached={async () =>
            !endReached && search === '' ? setRefreshing(true) : null
          }
          renderItem={({ item }) => (
            <ChannelItem
              item={item}
              wallet={wallet}
              contract={contract}
              pKey={pKey}
            />
          )}
          ListFooterComponent={() => {
            return endReached ? (
              <View style={{ paddingBottom: 20, marginTop: 20 }}>
                <EPNSActivity style={styles.activity} size="small" />
              </View>
            ) : null
          }}
        />
      )}
    </SafeAreaView>
  )
}

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
  },
  imageLogoStyle: {
    padding: 15,
    margin: 5,
    height: 50,
    width: 50,
    resizeMode: 'stretch',
    alignItems: 'center',
  },
})

export default ChannelsDisplayer