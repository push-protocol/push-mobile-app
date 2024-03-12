import {BottomSheetView} from '@gorhom/bottom-sheet';
import React, {useEffect, useMemo, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {useSelector} from 'react-redux';
import GLOBALS from 'src/Globals';
import {Channel, selectSubscriptions} from 'src/redux/channelSlice';

import PrimaryButton from '../buttons/PrimaryButton';
import ToggleButton from '../buttons/ToggleButton';
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

  const channelSettings: ChannelSetting[] = channel.channel_settings
    ? JSON.parse(channel.channel_settings)
    : [];
  // const channelSettings: ChannelSetting[] = JSON.parse(
  //   '[{"type": 3, "index": 1, "ticker": 0.1, "default": {"lower": 1.2, "upper": 1.6}, "enabled": true, "lowerLimit": 1, "upperLimit": 3, "description": "Choose Health Factor Range"}, {"type": 2, "index": 2, "ticker": 1, "default": 3, "enabled": true, "lowerLimit": 0, "upperLimit": 25, "description": "Choose Token Supply Rate (in percentage)"}, {"type": 2, "index": 3, "ticker": 1, "default": 3, "enabled": true, "lowerLimit": 0, "upperLimit": 25, "description": "Choose Token Borrow Rate (in percentage)"}]',
  // );
  const userSettings = useMemo(() => {
    console.log('re-render');
    return subscriptions?.[channel?.channel]?.user_settings;
  }, [subscriptions]);

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

  useEffect(() => {
    if (userSettings) {
      setCurrentSettings(userSettings);
    } else {
      const settings: UserSetting[] = [];
      for (const setting of channelSettings) {
        // @ts-ignore
        settings.push({...setting, user: setting.default});
      }
      setCurrentSettings(settings);
    }
  }, [userSettings]);

  const [test, setTest] = useState({
    startVal: 0,
    endVal: 100,
  });

  return (
    <BottomSheetView style={styles.contentContainer}>
      <View style={styles.headerContainer}>
        <ChannelLogo icon={channel.icon} />
        <ChannelTitleCard channel={channel} />
      </View>
      <BottomSheetView style={styles.innerContainer}>
        <Text style={styles.sheetTitle}>
          {userSettings
            ? 'Manage Notification Settings'
            : 'Subscribe to get Notified'}
        </Text>
        <Text style={styles.sheetDescription} numberOfLines={2}>
          Select which setting list you would like to receive notifications
          from.
        </Text>
        {currentSettings && (
          <View style={styles.scrollViewContainer}>
            <ScrollView>
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
            </ScrollView>
          </View>
        )}
      </BottomSheetView>
      <BottomSheetView style={styles.buttonsContainer}>
        <Text style={styles.note}>
          You will receive all important updates from this channel.
        </Text>
        <PrimaryButton
          bgColor={GLOBALS.COLORS.BLACK}
          fontColor={GLOBALS.COLORS.WHITE}
          title="Subscribe"
        />
        <PrimaryButton
          bgColor={GLOBALS.COLORS.TRANSPARENT}
          fontColor={GLOBALS.COLORS.BLACK}
          title="Cancel"
          onPress={hideSheet}
        />
      </BottomSheetView>
    </BottomSheetView>
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
    paddingVertical: 20,
  },
  innerContainer: {
    marginHorizontal: 24,
    overflow: 'visible',
  },
  buttonsContainer: {
    marginHorizontal: 16,
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
  scrollViewContainer: {
    maxHeight: '60%',
  },
});
