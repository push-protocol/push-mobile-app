import React, { Component } from 'react';
import { StyleSheet, View, Text, Linking, Platform } from 'react-native';

import ParsedText from 'react-native-parsed-text';

import GLOBALS from 'src/Globals';

export default class CalendarEvents extends Component<Prop> {
  // Constructor
  constructor(props) {
    super(props);
  }

  // Component Mounted
  componentDidMount() {

  }

  // FUNCTIONS
  handleUrlPress(url, matchIndex /*: number*/) {
    console.log(url);
    Linking.openURL(url);
  }

  handlePhonePress(phone, matchIndex /*: number*/) {
    console.log(`${phone} has been pressed!`);
  }

  handleNamePress(name, matchIndex /*: number*/) {
    console.log(`Hello ${name}`);
  }

  handleEmailPress(email, matchIndex /*: number*/) {
    console.log(`send email to ${email}`);
  }

  handleAppSettings() {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    }
  }

  renderStyles(matchingString, matches) {
    // matches => ["[@michel:5455345]", "@michel", "5455345"]
    let pattern = /\[([^:]+):([^\]]+)\]/i;
    let match = matchingString.match(pattern);

    return `${match[2]}`;
  }

  // RENDER
  render() {
    const {
      style,
      title,
      fontSize,
      textStyle,
    } = this.props;

    let TextUpdatedStyle = {
      fontSize: fontSize
    }

    let parseSettings = [
      {
        type: 'url',
        style: [styles.link, styles.italics, styles.underline],
        onPress: this.handleUrlPress
      },
      {
        type: 'phone',
        style: styles.underline,
        onPress: this.handlePhonePress
      },
      {
        type: 'email',
        style: [styles.link, styles.underline],
        onPress: this.handleEmailPress
      },
      {
        pattern: /\[(default):([^\]]+)\]/i,
        style: [styles.primary, styles.bold],
        renderText: this.renderStyles
      },
      {
        pattern: /\[(bold):([^\]]+)\]/i,
        style: styles.bold,
        renderText: this.renderStyles
      },
      {
        pattern: /\[(italics):([^\]]+)\]/i,
        style: styles.italics,
        renderText: this.renderStyles
      },
      {
        pattern: /\[(bolditalics):([^\]]+)\]/i,
        style: [styles.bold, styles.italics],
        renderText: this.renderStyles
      },
    ];

    if (Platform.OS === 'ios') {
      parseSettings.push(
        {
          pattern: /\[(appsettings):([^\]]+)\]/i,
          style: [styles.link, styles.bold, styles.italics, styles.underline],
          onPress: this.handleAppSettings,
          renderText: this.renderStyles
        }
      );
    }
    else if (Platform.OS === 'android') {
      parseSettings.push(
        {
          pattern: /\[(appsettings):([^\]]+)\]/i,
          style: [styles.bold],
          renderText: this.renderStyles
        }
      );
    }

    return (
      <View style = {[ styles.container, style ]}>
        <ParsedText
          style = {[ styles.text, TextUpdatedStyle, textStyle ]}
          parse = {parseSettings}
          childrenProps={{allowFontScaling: false}}
        >
          {title}
        </ParsedText>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
  },
  name: {
    color: GLOBALS.COLORS.SUBLIME_RED
  },
  username: {
    color: GLOBALS.COLORS.PRIMARY
  },
  text: {
    color: GLOBALS.COLORS.BLACK
  },
  primary: {
    color: GLOBALS.COLORS.PRIMARY,
  },
  link: {
    color: GLOBALS.COLORS.LINKS,
  },
  underline: {
    textDecorationLine: 'underline',
  },
  bold: {
    fontWeight: 'bold'
  },
  italics: {
    fontStyle: 'italic'
  }
});
