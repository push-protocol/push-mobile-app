import React, {useMemo, useState} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {useSelector} from 'react-redux';
import GLOBALS from 'src/Globals';
import PrimaryButton from 'src/components/buttons/PrimaryButton';
import useSubscriptions from 'src/hooks/channel/useSubscriptions';
import {
  selectIsLoadingSubscriptions,
  selectSubscriptions,
} from 'src/redux/channelSlice';

const SubscriptionStatus = ({channel}: {channel: string}) => {
  const [processing, setProcessing] = useState(false);
  const subscriptions = useSelector(selectSubscriptions);
  const isLoadingSubscriptions = useSelector(selectIsLoadingSubscriptions);

  const {subscribe, unsubscribe} = useSubscriptions();

  const subscribed = useMemo(() => {
    return subscriptions?.[channel] !== undefined;
  }, [subscriptions, channel]);

  const handleChangeSubStatus = async () => {
    setProcessing(true);
    if (subscribed === true) {
      await unsubscribe(channel);
    } else {
      await subscribe(channel);
    }
    setProcessing(false);
  };

  return (
    <View style={styles.container}>
      {isLoadingSubscriptions && (
        <ActivityIndicator
          size={'small'}
          color={GLOBALS.COLORS.GRADIENT_PRIMARY}
        />
      )}

      {subscribed === true && (
        <PrimaryButton
          style={styles.controlPrimary}
          setButtonStyle={{borderRadius: 0, padding: 0}}
          iconFactory="MaterialCommunityIcons"
          icon="checkbox-marked"
          iconSize={24}
          fontSize={10}
          fontColor={GLOBALS.COLORS.WHITE}
          bgColor={GLOBALS.COLORS.GRADIENT_PRIMARY}
          setHeight="100%"
          disabled={processing}
          loading={processing}
          onPress={handleChangeSubStatus}
        />
      )}

      {subscribed === false && (
        <PrimaryButton
          style={styles.controlPrimary}
          setButtonStyle={{borderRadius: 0, padding: 0}}
          setButtonInnerStyle={{flexDirection: 'column-reverse'}}
          title="Opt In"
          iconFactory="MaterialCommunityIcons"
          icon="checkbox-blank-outline"
          iconSize={24}
          iconColor={GLOBALS.COLORS.BLACK}
          fontSize={10}
          fontColor={GLOBALS.COLORS.MID_BLACK_TRANS}
          bgColor={GLOBALS.COLORS.LIGHT_BLACK_TRANS}
          color={GLOBALS.COLORS.GRADIENT_PRIMARY}
          setHeight="100%"
          disabled={processing}
          loading={processing}
          onPress={handleChangeSubStatus}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: 'center',
  },
  controlPrimary: {
    flex: 1,
    maxHeight: '100%',
  },
});

export default SubscriptionStatus;
