import {BottomSheetScrollView, BottomSheetView} from '@gorhom/bottom-sheet';
// @ts-ignore
import _ from 'lodash';
import React, {useEffect, useMemo, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import GLOBALS from 'src/Globals';
import {useToaster} from 'src/contexts/ToasterContext';
import {TimeoutHelper} from 'src/helpers/TimeoutHelper';
import useSubscriptions from 'src/hooks/channel/useSubscriptions';
import {Channel, selectSubscriptions} from 'src/redux/channelSlice';

import PrimaryButton from '../buttons/PrimaryButton';
import ToggleButton from '../buttons/ToggleButton';
import {ToasterOptions} from '../indicators/Toaster';
import RangeInput from '../input/RangeInput';
import InputSlider from '../input/SliderInput';
import {ChannelLogo, ChannelTitleCard} from '../ui/ChannelComponents';

export type ChannelSetting =
  | {
      type: 1; // Boolean
      default: boolean;
      description: string;
      index: number;
    }
  | {
      type: 2; // Range
      default: number;
      enabled: boolean;
      description: string;
      index: number;
      lowerLimit: number;
      upperLimit: number;
      ticker: number;
    }
  | {
      type: 3; // Range
      default: {
        lower: number;
        upper: number;
      };
      enabled: boolean;
      description: string;
      index: number;
      lowerLimit: number;
      upperLimit: number;
      ticker: number;
    };

export type UserSetting =
  | {
      type: 1; // Boolean
      default: boolean;
      description: string;
      index: number;
      user: boolean;
    }
  | {
      type: 2; // Range
      default: number;
      enabled: boolean;
      description: string;
      index: number;
      lowerLimit: number;
      upperLimit: number;
      user: number;
      ticker: number;
    }
  | {
      type: 3; // Range
      default: {
        lower: number;
        upper: number;
      };
      enabled: boolean;
      description: string;
      index: number;
      lowerLimit: number;
      upperLimit: number;
      user: {
        lower: number;
        upper: number;
      };
      ticker: number;
    };

interface NFSettingsSheetProps {
  channel: Channel;
  hideSheet: () => void;
}

const NFSettingsSheet = ({hideSheet, channel}: NFSettingsSheetProps) => {
  const subscriptions = useSelector(selectSubscriptions);
  const [currentSettings, setCurrentSettings] = useState<Array<UserSetting>>();
  const {subscribe, unsubscribe} = useSubscriptions();
  const [isLoadingSubscribe, setIsLoadingSubscribe] = useState(false);
  const [isLoadingUnsubscribe, setIsLoadingUnsubscribe] = useState(false);
  const {toastRef} = useToaster();

  const isSubscribed = subscriptions[channel?.channel] !== undefined;

  const channelSettings: ChannelSetting[] = channel.channel_settings
    ? JSON.parse(channel.channel_settings)
    : [];

  const userSettings = useMemo(() => {
    return subscriptions?.[channel?.channel]?.user_settings;
  }, [subscriptions]);

  // Check if the user has updated the settings
  const isUpdated = useMemo(() => {
    return !_.isEqual(userSettings, currentSettings);
  }, [currentSettings, userSettings]);

  const handleToggleSwitch = (index: number) => {
    if (!currentSettings) return;
    const updatedSettings = [...currentSettings];
    if (updatedSettings[index].type === 1) {
      // Type 1
      // Use a type guard to narrow the type to UserSetting of type 1
      const setting = updatedSettings[index] as UserSetting & {type: 1};
      setting.user = !setting.user;
    } else if (updatedSettings[index].type === 2) {
      // Type 2
      // Use a type guard to narrow the type to UserSetting of type 2
      const setting = updatedSettings[index] as UserSetting & {type: 2};
      setting.enabled = !setting.enabled;
    } else {
      // Type 3
      // Use a type guard to narrow the type to UserSetting of type 2
      const setting = updatedSettings[index] as UserSetting & {type: 3};
      setting.enabled = !setting.enabled;
    }
    setCurrentSettings(updatedSettings);
  };

  const handleSliderChange = (
    index: number,
    value: number | {lower: number; upper: number},
  ) => {
    if (!currentSettings) return;
    const updatedSettings = [...currentSettings];
    updatedSettings[index].user = value;
    setCurrentSettings(updatedSettings);
  };

  const handleSubscribe = async () => {
    setIsLoadingSubscribe(true);
    await TimeoutHelper.timeoutAsync({
      asyncFunction: subscribe(channel.channel, currentSettings),
      onError: () => {
        toastRef.current?.showToast(
          'Request timed out.\nYou might have to restart the wallet and try again.',
          '',
          ToasterOptions.TYPE.ERROR,
        );
      },
    })();
    setIsLoadingSubscribe(false);
    hideSheet();
  };

  const handleUnsubscribe = async () => {
    if (isSubscribed) {
      setIsLoadingUnsubscribe(true);
      await TimeoutHelper.timeoutAsync({
        asyncFunction: unsubscribe(channel.channel),
        onError: () => {
          toastRef.current?.showToast(
            'Request timed out.\nYou might have to restart the wallet and try again.',
            '',
            ToasterOptions.TYPE.ERROR,
          );
        },
      })();
      console.log('Unsubscribed');
      setIsLoadingUnsubscribe(false);
    }
    hideSheet();
  };

  useEffect(() => {
    if (userSettings) {
      /**
       * This is a workaround to avoid mutating the state directly
       * by creating a deep copy of the current settings object
       * Since this is a simple object, we can use JSON.parse and JSON.stringify
       */
      setCurrentSettings(JSON.parse(JSON.stringify(userSettings)));
    } else {
      const settings: UserSetting[] = [];
      for (const setting of channelSettings) {
        // @ts-ignore
        settings.push({...setting, user: setting.default});
      }
      setCurrentSettings(settings);
    }
  }, [userSettings]);

  return (
    <BottomSheetScrollView
      style={styles.contentContainer}
      contentContainerStyle={styles.flexGrow}>
      <View style={styles.headerContainer}>
        <ChannelLogo icon={channel.icon} />
        <ChannelTitleCard channel={channel} />
      </View>
      <BottomSheetView style={styles.innerContainer}>
        {currentSettings?.length !== 0 && (
          <>
            <Text style={styles.sheetTitle}>
              {isSubscribed
                ? 'Manage Notification Settings'
                : 'Subscribe to get Notified'}
            </Text>
            <Text style={styles.sheetDescription} numberOfLines={2}>
              Select which setting list you would like to receive notifications
              from.
            </Text>
          </>
        )}
        {currentSettings && currentSettings.length > 0 && (
          <View style={styles.scrollViewContainer}>
            {currentSettings.map((setting, index) => {
              switch (setting.type) {
                case 1:
                  return (
                    <View style={styles.type1Container} key={index}>
                      <Text style={styles.description}>
                        {setting.description}
                      </Text>
                      <ToggleButton
                        isOn={setting.user}
                        onToggle={() => handleToggleSwitch(index)}
                      />
                    </View>
                  );
                case 2:
                  return (
                    <View style={styles.type2Container} key={index}>
                      <View style={styles.internalContainer}>
                        <Text style={styles.description}>
                          {setting.description}
                        </Text>
                        <ToggleButton
                          isOn={setting.enabled}
                          onToggle={() => handleToggleSwitch(index)}
                        />
                      </View>
                      {setting.enabled && (
                        <InputSlider
                          max={setting.upperLimit}
                          min={setting.lowerLimit}
                          defaultValue={setting.default}
                          step={setting.ticker}
                          val={setting.user}
                          onChange={({x}) => handleSliderChange(index, x)}
                        />
                      )}
                    </View>
                  );
                case 3:
                  return (
                    <View style={styles.type2Container} key={index}>
                      <View style={styles.internalContainer}>
                        <Text style={styles.description}>
                          {setting.description}
                        </Text>
                        <ToggleButton
                          isOn={setting.enabled}
                          onToggle={() => handleToggleSwitch(index)}
                        />
                      </View>
                      {setting.enabled && (
                        <RangeInput
                          max={setting.upperLimit}
                          min={setting.lowerLimit}
                          defaultStartValue={setting.default.lower}
                          defaultEndValue={setting.default.upper}
                          startValue={setting.user.lower}
                          endValue={setting.user.upper}
                          step={setting.ticker}
                          onChange={({startVal, endVal}) =>
                            handleSliderChange(index, {
                              lower: startVal,
                              upper: endVal,
                            })
                          }
                        />
                      )}
                    </View>
                  );
                default:
                  return null;
              }
            })}
          </View>
        )}
      </BottomSheetView>
      <BottomSheetView style={styles.buttonsContainer}>
        {currentSettings?.length !== 0 ? (
          <>
            <Text style={styles.note}>
              You will receive all important updates from this channel.
            </Text>
            <PrimaryButton
              loading={isLoadingSubscribe}
              bgColor={
                !isSubscribed || isUpdated ? GLOBALS.COLORS.BLACK : '#E0E3E7'
              }
              fontColor={
                !isSubscribed || isUpdated ? GLOBALS.COLORS.WHITE : '#BAC4D6'
              }
              disabled={isSubscribed && !isUpdated}
              title={isSubscribed ? 'Update Preferences' : 'Subscribe'}
              onPress={handleSubscribe}
            />
          </>
        ) : (
          <View style={[styles.seperator, styles.seperatorMargin]} />
        )}
        <PrimaryButton
          loading={isLoadingUnsubscribe}
          bgColor={GLOBALS.COLORS.TRANSPARENT}
          fontColor={GLOBALS.COLORS.BLACK}
          title={isSubscribed ? 'Unsubscribe' : 'Cancel'}
          onPress={handleUnsubscribe}
        />
      </BottomSheetView>
    </BottomSheetScrollView>
  );
};

export default NFSettingsSheet;

const styles = StyleSheet.create({
  headerContainer: {
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  contentContainer: {
    flex: 1,
    paddingVertical: 16,
  },
  innerContainer: {
    marginHorizontal: 24,
    overflow: 'visible',
  },
  buttonsContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetTitle: {
    color: GLOBALS.COLORS.BLACK,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 27,
  },
  sheetDescription: {
    color: '#575D73',
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18.2,
    marginBottom: 12,
  },
  note: {
    color: '#657795',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16.86,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.24,
  },
  description: {
    color: '#1E1E1E',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22.5,
    letterSpacing: -0.3,
    flex: 1,
  },
  type1Container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  type2Container: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  internalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  seperator: {
    height: 1,
    backgroundColor: '#E5E5E5',
    width: '100%',
  },
  seperatorMargin: {
    marginBottom: 8,
  },
  scrollViewContainer: {},
  flexGrow: {
    flexGrow: 1,
  },
});
