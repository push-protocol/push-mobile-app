import {UserSetting} from '@pushprotocol/restapi';
import {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {usePushApi} from 'src/contexts/PushApiContext';
import envConfig from 'src/env.config';
import {caip10ToWallet} from 'src/helpers/CAIPHelper';
import {
  SubscriptionsMapping,
  addChannelSubscription,
  removeChannelSubscription,
  selectSubscriptions,
  setLoadingSubscriptions,
  setSubscriptions,
} from 'src/redux/channelSlice';

const useSubscriptions = () => {
  const [loaded, setLoaded] = useState(false);
  const {userPushSDKInstance, showUnlockProfileModal, readOnlyMode} =
    usePushApi();
  const subscriptions = useSelector(selectSubscriptions);
  const dispatch = useDispatch();

  const subscribe = async (channel: string, settings?: UserSetting[]) => {
    if (readOnlyMode) {
      showUnlockProfileModal();
      return;
    }
    try {
      const channelCaip = `eip155:${envConfig.CHAIN_ID}:${channel}`;
      await userPushSDKInstance?.notification.subscribe(channelCaip, {
        settings,
        onSuccess: () => {
          dispatch(
            addChannelSubscription({
              channel,
              user_settings: null, // TODO: ADD USER's SETTINGS
            }),
          );
        },
      });
    } catch (e) {
      console.error(e);
    }
  };

  const unsubscribe = async (channel: string) => {
    if (readOnlyMode) {
      showUnlockProfileModal();
      return;
    }
    try {
      const channelCaip = `eip155:${envConfig.CHAIN_ID}:${channel}`;
      await userPushSDKInstance?.notification.unsubscribe(channelCaip, {
        onSuccess: () => {
          dispatch(removeChannelSubscription({channel}));
        },
      });
    } catch (e) {}
  };

  const refreshSubscriptions = async (force = false) => {
    try {
      if (loaded && !force) return;
      dispatch(setLoadingSubscriptions(true));
      const response = await userPushSDKInstance?.notification.subscriptions({
        account: caip10ToWallet(userPushSDKInstance?.account),
        limit: 100,
        page: 1,
      });
      const subscriptionsMapping: SubscriptionsMapping = {};
      response.forEach((subscription: any) => {
        subscriptionsMapping[subscription.channel] = {
          channel: subscription.channel,
          user_settings: subscription.user_settings
            ? JSON.parse(subscription.user_settings)
            : null,
        };
      });
      dispatch(setSubscriptions(subscriptionsMapping));
      setLoaded(true);
    } catch (e) {
    } finally {
      dispatch(setLoadingSubscriptions(false));
    }
  };

  return {subscribe, unsubscribe, subscriptions, refreshSubscriptions};
};

export default useSubscriptions;
