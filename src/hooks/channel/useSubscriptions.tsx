import type {UserSetting as PushUserSetting} from '@pushprotocol/restapi';
import {channels} from '@pushprotocol/restapi';
import {PushNotificationBaseClass} from '@pushprotocol/restapi/src/lib/pushNotification/pushNotificationBase';
import {ENV} from '@pushprotocol/socket/src/lib/constants';
import {useWalletConnectModal} from '@walletconnect/modal-react-native';
import {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {ToasterOptions} from 'src/components/indicators/Toaster';
import {UserSetting} from 'src/components/sheets/NFSettingSheet';
import {usePushApi} from 'src/contexts/PushApiContext';
import {useToaster} from 'src/contexts/ToasterContext';
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
import {getSigner} from 'src/walletconnect/chat/utils';

const useSubscriptions = () => {
  const [loaded, setLoaded] = useState(false);
  const {userPushSDKInstance, readOnlyMode} = usePushApi();
  const subscriptions = useSelector(selectSubscriptions);
  const dispatch = useDispatch();
  const {isConnected, provider, open} = useWalletConnectModal();
  const {toastRef} = useToaster();

  const subscribe = async (channel: string, settings?: UserSetting[]) => {
    const channelCaip = `eip155:${envConfig.CHAIN_ID}:${channel}`;
    const pushSettings: PushUserSetting[] | undefined = settings?.map(
      setting => {
        if (setting.type === 1) return {enabled: setting.user};
        else
          return {
            enabled: setting.enabled,
            value: setting.user,
          };
      },
    );
    const onSuccess = () => {
      dispatch(
        addChannelSubscription({
          channel,
          user_settings: settings ?? null,
        }),
      );
      toastRef.current?.showToast(
        `Successfully subscribed to channel`,
        '',
        ToasterOptions.TYPE.GRADIENT_PRIMARY,
      );
    };
    const onError = () => {
      toastRef.current?.showToast(
        `Error subscribing to channel`,
        '',
        ToasterOptions.TYPE.ERROR,
      );
    };

    if (readOnlyMode) {
      try {
        if (isConnected && provider) {
          const [signer, account] = await getSigner(provider);
          const baseClass = new PushNotificationBaseClass(
            signer,
            envConfig.ENV as ENV,
            account,
          );
          const settings = pushSettings
            ? // @ts-ignore
              baseClass.getMinimalUserSetting(pushSettings)
            : null;
          await channels.subscribeV2({
            channelAddress: channelCaip,
            signer: signer,
            userAddress: account,
            env: envConfig.ENV as ENV,
            settings: settings,
            onSuccess: onSuccess,
            onError: onError,
          });
        } else {
          await open();
        }
      } catch (e) {
        console.error(e);
      }
      return;
    } else {
      try {
        await userPushSDKInstance?.notification.subscribe(channelCaip, {
          settings: pushSettings,
          onSuccess: onSuccess,
          onError: onError,
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const unsubscribe = async (channel: string) => {
    const channelCaip = `eip155:${envConfig.CHAIN_ID}:${channel}`;
    const onSuccess = () => {
      dispatch(removeChannelSubscription({channel}));
      toastRef.current?.showToast(
        `Successfully unsubscribed from channel`,
        '',
        ToasterOptions.TYPE.GRADIENT_PRIMARY,
      );
    };

    const onError = () => {
      toastRef.current?.showToast(
        `Error unsubscribing from channel`,
        '',
        ToasterOptions.TYPE.ERROR,
      );
    };

    if (readOnlyMode) {
      try {
        if (isConnected && provider) {
          const [signer, account] = await getSigner(provider);
          await channels.unsubscribeV2({
            channelAddress: channelCaip,
            signer,
            userAddress: account,
            env: envConfig.ENV as ENV,
            onSuccess: onSuccess,
            onError: onError,
          });
        } else {
          await open();
        }
      } catch (e) {
        console.error(e);
      }
      return;
    }
    try {
      await userPushSDKInstance?.notification.unsubscribe(channelCaip, {
        onSuccess: onSuccess,
        onError: onError,
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
