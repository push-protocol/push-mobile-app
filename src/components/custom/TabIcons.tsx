import React from 'react';
import {Image} from 'react-native';

const ICONS = {
  INBOX: 'INBOX',
  CHANNELS: 'CHANNELS',
  CHAT: 'CHAT',
  SETTINGS: 'SETTINGS',
};

type ICON_TYPE = 'INBOX' | 'SETTINGS' | 'CHANNELS' | 'CHAT';

interface TabIconProps {
  icon: ICON_TYPE;
  active: boolean;
}

const TabIcon = ({icon, active}: TabIconProps) => {
  switch (icon) {
    case 'CHAT':
      if (active) {
        return (
          <ImageComponent
            src={require('assets/icons/nav_icon_filled/chat-icon.png')}
          />
        );
      } else {
        return (
          <ImageComponent
            src={require('assets/icons/nav_icons/chat-icon.png')}
          />
        );
      }

    case 'CHANNELS':
      if (active) {
        return (
          <ImageComponent
            src={require('assets/icons/nav_icon_filled/channel-icon.png')}
          />
        );
      } else {
        return (
          <ImageComponent
            src={require('assets/icons/nav_icons/channel-icon.png')}
          />
        );
      }

    case 'SETTINGS':
      if (active) {
        return (
          <ImageComponent
            src={require('assets/icons/nav_icons/settings-icon.png')}
          />
        );
      } else {
        return (
          <ImageComponent
            src={require('assets/icons/nav_icons/settings-icon.png')}
          />
        );
      }

    default:
      if (active) {
        return (
          <ImageComponent
            src={require('assets/icons/nav_icon_filled/inbox-icon.png')}
          />
        );
      } else {
        return (
          <ImageComponent
            src={require('assets/icons/nav_icons/inbox-icon.png')}
          />
        );
      }
  }
};

const ImageComponent = ({src}: {src: any}) => {
  return <Image source={src} style={{width: 28, height: 28}} />;
};

export {ICONS, TabIcon};
