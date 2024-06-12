import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';
import GLOBALS from 'src/Globals';
import PrimaryButton from 'src/components/buttons/PrimaryButton';
import {useToaster} from 'src/contexts/ToasterContext';
import {TimeoutHelper} from 'src/helpers/TimeoutHelper';
import useSubscriptions from 'src/hooks/channel/useSubscriptions';
import {
  Channel,
  selectIsLoadingSubscriptions,
  selectSubscriptions,
} from 'src/redux/channelSlice';

import {ToasterOptions} from '../indicators/Toaster';

const SubscriptionStatus = ({
  selectChannelForSettings,
  channel: channelData,
}: {
  channel: Channel;
  selectChannelForSettings: (channel: Channel) => void;
}) => {
  const [processing, setProcessing] = useState(false);
  const subscriptions = useSelector(selectSubscriptions);
  const isLoadingSubscriptions = useSelector(selectIsLoadingSubscriptions);
  const {subscribe} = useSubscriptions();
  const {toastRef} = useToaster();

  const channelSettings = channelData.channel_settings;
  const channel = channelData.channel;

  const subscribed = useMemo(() => {
    return subscriptions?.[channel] !== undefined;
  }, [subscriptions, channel]);

  const handleChangeSubStatus = async () => {
    setProcessing(true);
    if (subscribed === true) {
      selectChannelForSettings(channelData);
    } else {
      if (channelSettings) {
        selectChannelForSettings(channelData);
      } else {
        await TimeoutHelper.timeoutAsync({
          asyncFunction: subscribe(channel),
          onError: () => {
            toastRef.current?.showToast(
              'Request timed out.\nYou might have to restart the wallet and try again.',
              '',
              ToasterOptions.TYPE.ERROR,
            );
          },
        })();
      }
    }
    setProcessing(false);
  };

  return (
    <View style={styles.container}>
      {!isLoadingSubscriptions && subscribed === true && (
        <Pressable
          onPress={handleChangeSubStatus}
          style={styles.unsubButton}
          disabled={processing}>
          {processing ? (
            <ActivityIndicator size="small" color={GLOBALS.COLORS.BLACK} />
          ) : (
            <>
              <MaterialIcons
                name="notifications-active"
                size={16}
                color={GLOBALS.COLORS.BLACK}
              />
              <Text style={styles.text}>Subscribed</Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={GLOBALS.COLORS.BLACK}
              />
            </>
          )}
        </Pressable>
      )}

      {!isLoadingSubscriptions && subscribed === false && (
        <PrimaryButton
          style={styles.subButton}
          setButtonStyle={styles.buttonStyle}
          title="Subscribe"
          fontSize={15}
          fontColor={GLOBALS.COLORS.WHITE}
          bgColor={GLOBALS.COLORS.BLACK}
          disabled={processing}
          loading={processing}
          onPress={handleChangeSubStatus}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  subButton: {
    minWidth: 95,
  },
  buttonStyle: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  unsubButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFEFEF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 6,
    minWidth: 130,
  },
  text: {
    color: GLOBALS.COLORS.BLACK,
    fontSize: 15,
  },
});

export default SubscriptionStatus;
