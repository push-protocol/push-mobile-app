import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import GLOBALS from 'src/Globals';
import PrimaryButton from 'src/components/buttons/PrimaryButton';
import {usePushApi} from 'src/contexts/PushApiContext';
import {useToaster} from 'src/contexts/ToasterContext';
import {TimeoutHelper} from 'src/helpers/TimeoutHelper';
import useSubscriptions from 'src/hooks/channel/useSubscriptions';
import {selectIsGuest} from 'src/redux/authSlice';
import {
  Channel,
  selectChannelPendingSubscription,
  selectIsLoadingSubscriptions,
  selectSubscriptions,
  setChannelPendingSubscription,
} from 'src/redux/channelSlice';

import {ToasterOptions} from '../indicators/Toaster';

export type SubscriptionStatusProps = {
  channel: Channel;
  selectChannelForSettings: (channel: Channel) => void;
};

export type ChannelPendingSubscriptionType = {
  channel_id: string | null;
  status: boolean;
};

const SubscriptionStatus = ({
  selectChannelForSettings,
  channel: channelData,
}: SubscriptionStatusProps) => {
  const dispatch = useDispatch();
  const [processing, setProcessing] = useState(false);

  const subscriptions = useSelector(selectSubscriptions);
  const channelPendingSubscription = useSelector(
    selectChannelPendingSubscription,
  );
  const isLoadingSubscriptions = useSelector(selectIsLoadingSubscriptions);
  const isGuest = useSelector(selectIsGuest);

  const {subscribe} = useSubscriptions();
  const {toastRef} = useToaster();
  const {showUnlockProfileModal, isUnlockProfileModalOpen} = usePushApi();

  const channelSettings = channelData.channel_settings;
  const channel = channelData.channel;

  const subscribed = useMemo(() => {
    return subscriptions?.[channel] !== undefined;
  }, [subscriptions, channel]);

  useEffect(() => {
    // If the channel is pending subscription and the unlock profile modal is not open
    if (
      channelPendingSubscription.status &&
      channelPendingSubscription.channel_id === channelData.channel_id &&
      !isUnlockProfileModalOpen
    ) {
      // If the user is not guest, then subscribe/unsubscribe the channel
      if (!isGuest) {
        dispatch(
          setChannelPendingSubscription({
            channel_id: null,
            status: false,
          }),
        );
        handleChangeSubStatus();
      } else {
        dispatch(
          setChannelPendingSubscription({
            channel_id: null,
            status: false,
          }),
        );
        setProcessing(false);
      }
    }
  }, [isGuest]);

  const checkIfGuest = async () => {
    // If the user is a guest, show the unlock profile modal
    if (isGuest) {
      setProcessing(true);
      dispatch(
        setChannelPendingSubscription({
          channel_id: channelData.channel_id,
          status: true,
        }),
      );
      showUnlockProfileModal();
      return true;
    }
    return false;
  };

  const handleChangeSubStatus = async () => {
    if (await checkIfGuest()) return;
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
