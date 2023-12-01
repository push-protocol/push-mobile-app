import React, {Component} from 'react';
import {Linking, Platform, StyleSheet, Text, View} from 'react-native';
import ParsedText from 'react-native-parsed-text';
import GLOBALS from 'src/Globals';

export default class CalendarEvents extends Component {
  // Constructor
  constructor(props) {
    super(props);
  }

  // Component Mounted
  componentDidMount() {}

  // FUNCTIONS
  handleUrlPress(matchingString, matchIndex /*: number*/) {
    let pattern = /\[([^:]+):([^\]]+)\]/i;
    let match = matchingString.match(pattern);

    let midComponent = `${match[2]}`;
    const url = midComponent.substr(midComponent.indexOf('||') + 2);

    Linking.openURL(url);
  }

  handlePhonePress(phone, matchIndex /*: number*/) {
    // console.log(`${phone} has been pressed!`);
  }

  handleNamePress(name, matchIndex /*: number*/) {
    // console.log(`Hello ${name}`);
  }

  handleEmailPress(email, matchIndex /*: number*/) {
    // console.log(`send email to ${email}`);
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

  renderThreeStyles(matchingString, matches) {
    // matches => ["[@michel:5455345]", "@michel", "5455345"]
    let pattern = /\[([^:]+):([^\]]+)\]/i;
    let match = matchingString.match(pattern);

    let midComponent = `${match[2]}`;
    const midText = midComponent.substr(0, midComponent.indexOf('||'));
    return midText;
  }

  handleAnchorRender(matchingString, matches) {
    let renderString = matchingString;
    renderString = renderString.replace(/<a[^>]*>/, '');
    renderString = renderString.replace('</a>', '');
    return renderString;
  }

  handelAnchorClick(matchingString, matches) {
    let url = matchingString;
    url = url.match(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/)[0];
    url = url.replace('<a href=', '');
    url = url.replace(/"/g, '');
    url = url.replace(/'/g, '');

    Linking.openURL(url);
  }

  handelUrlPress(matchingString, matches) {
    Linking.openURL(matchingString);
  }

  newLineStyles() {
    return '\n';
  }

  renderTextStyles(matchingString) {
    const pattern =
      /<span color=["']?(#[0-9A-Fa-f]{3,6}|[a-zA-Z]+)["']?>(.*?)<\/span>/i;
    const match = matchingString.match(pattern);

    if (match) {
      const colorName = match[1].toLowerCase();
      let color;
      switch (colorName) {
        case 'primary':
          color = GLOBALS.COLORS.PRIMARY;
          break;
        case 'secondary':
          color = GLOBALS.COLORS.GRADIENT_SECONDARY;
          break;
        case 'white':
          color = GLOBALS.COLORS.WHITE;
          break;
        // can add more custom color names if needed, couldn't find the tertiary color
        default:
          color = colorName;
      }
      let textContent = match[2];
      return <Text style={{color: color}}>{textContent}</Text>;
    }

    return matchingString;
  }

  renderLinkWithColor(matchingString) {
    const pattern =
      /<PUSHText color=["']?(#[0-9A-Fa-f]{3,6}|[a-zA-Z]+)["']?\s+link=["'](https?:\/\/[^"']+)["']>(.*?)<\/PUSHText>/i;
    const linkPattern = /\[([^\]]+)]\((https?:\/\/[^)]+)/;
    const match = matchingString.match(pattern);
    const markdownLinkPattern = matchingString.match(linkPattern);

    const tryLink = url => {
      Linking.canOpenURL(url).then(supported => {
        if (supported) Linking.openURL(url);
        else console.log("Don't know how to open URI: " + url);
      });
    };

    if (match) {
      const colorName = match[1].toLowerCase();
      let color;
      // Map custom color names to specific values
      switch (colorName) {
        case 'primary':
          color = GLOBALS.COLORS.PRIMARY;
          break;
        case 'secondary':
          color = GLOBALS.COLORS.GRADIENT_SECONDARY;
          break;
        case 'tertiary':
          color = GLOBALS.COLORS.GRADIENT_THIRD;
          break;
        case 'white':
          color = GLOBALS.COLORS.WHITE;
          break;
        // Add more custom color names if needed
        default:
          color = colorName;
      }

      const link = match[2];
      let textContent = match[3];
      return (
        <Text style={{color: color}} onPress={() => tryLink(link)}>
          {textContent}
        </Text>
      );
    } else if (markdownLinkPattern) {
      const linkText = markdownLinkPattern[1];
      const linkUrl = markdownLinkPattern[2];
      return (
        <Text
          onPress={() => tryLink(linkUrl)}
          style={{color: GLOBALS.COLORS.PINK, flex: 0}}>
          {linkText}
        </Text>
      );
    }

    return matchingString;
  }

  // RENDER
  render() {
    const {style, title, fontSize, textStyle} = this.props;

    let TextUpdatedStyle = {
      fontSize: fontSize,
    };

    let parseSettings = [
      {
        type: 'email',
        style: [styles.link, styles.underline],
        onPress: this.handleEmailPress,
      },
      {
        pattern: /\[([^\]]+)]\((https?:\/\/[^)]+)\)/g,
        style: {},
        renderText: this.renderLinkWithColor,
      },
      {
        pattern: /\[(u):([^\]]+)\]/i, // url
        style: [styles.primary, styles.bold, styles.italics, styles.underline],
        onPress: this.handleUrlPress,
        renderText: this.renderThreeStyles,
      },
      {
        pattern: /\[(ub):([^\]]+)\]/i, // urli
        style: [
          styles.secondary,
          styles.bold,
          styles.italics,
          styles.underline,
        ],
        onPress: this.handleUrlPress,
        renderText: this.renderThreeStyles,
      },
      {
        pattern: /\[(ut):([^\]]+)\]/i, // url
        style: [styles.third, styles.bold, styles.italics, styles.underline],
        onPress: this.handleUrlPress,
        renderText: this.renderThreeStyles,
      },
      {
        pattern: /<a[^>]*>([^<]+)<\/a>/, // for anchor tage
        style: [styles.third, styles.bold, styles.italics, styles.underline],
        onPress: this.handelAnchorClick,
        renderText: this.handleAnchorRender,
      },
      {
        pattern: /\[(up):([^\]]+)\]/i, // url
        style: [styles.primary, styles.italics, styles.underline],
        onPress: this.handleUrlPress,
        renderText: this.renderThreeStyles,
      },
      {
        pattern:
          /<span color=["']?(#[0-9A-Fa-f]{3,6}|[a-zA-Z]+)["']?>(.*?)<\/span>/gi,
        style: {}, // we can add aditional styles here if needed
        renderText: this.renderTextStyles,
      },
      {
        pattern: /\[(d):([^\]]+)\]/i, // default or primary gradient color
        style: [styles.primary, styles.bold],
        renderText: this.renderStyles,
      },
      {
        pattern: /\[(s):([^\]]+)\]/i, // secondary gradient color
        style: [styles.secondary, styles.bold],
        renderText: this.renderStyles,
      },
      {
        pattern: /\[(t):([^\]]+)\]/i, // third gradient color
        style: [styles.third, styles.bold],
        renderText: this.renderStyles,
      },
      {
        pattern: /\[(e):([^\]]+)\]/i, // error
        style: [styles.error, styles.bold],
        renderText: this.renderStyles,
      },
      {
        pattern: /\[(bi):([^\]]+)\]/i, // bolditalics
        style: [styles.bold, styles.italics],
        renderText: this.renderStyles,
      },
      {
        pattern: /\*\*\*(.*?)\*\*\*/g, // bolditalics ***text***
        style: {
          ...styles.bold,
          ...styles.italics,
        },
        renderText: matchingString =>
          matchingString.replace(/\*\*\*(.*?)\*\*\*/g, '$1'),
      },
      {
        pattern: /\[(b):([^\]]+)\]/i, // bold
        style: styles.bold,
        renderText: this.renderStyles,
      },
      {
        pattern: /\*\*(.*?)\*\*/g, // bold **text**
        style: styles.bold,
        renderText: matchingString =>
          matchingString.replace(/\*\*(.*?)\*\*/g, '$1'),
      },
      {
        pattern: /\[(i):([^\]]+)\]/i, // italics
        style: styles.italics,
        renderText: this.renderStyles,
      },
      {
        pattern: /\*(.*?)\*/g, // italic *some text*
        style: {
          ...styles.italics,
        },
        renderText: matchingString =>
          matchingString.replace(/\*(.*?)\*/g, '$1'),
      },
      {
        pattern: /\[(w):([^\]]+)\]/i, // white
        style: [styles.white],
        renderText: this.renderStyles,
      },
      {
        pattern: /\[(wb):([^\]]+)\]/i, // whitebold
        style: [styles.white, styles.bold],
        renderText: this.renderStyles,
      },
      {
        pattern: /\[(mg):([^\]]+)\]/i, // midgray
        style: [styles.midgray],
        renderText: this.renderStyles,
      },
      {
        pattern: /\[(dg):([^\]]+)\]/i, // darkgray
        style: [styles.darkgray],
        renderText: this.renderStyles,
      },
      {
        pattern: /\[(ddg):([^\]]+)\]/i, // darker gray
        style: [styles.darkergray],
        renderText: this.renderStyles,
      },
      {
        type: 'url',
        style: [styles.link, styles.underline],
        onPress: this.handelUrlPress,
      },
      {
        pattern: /\\n/g,
        style: {},
        renderText: this.newLineStyles,
      },
    ];

    if (Platform.OS === 'ios') {
      parseSettings.push({
        pattern: /\[(appsettings):([^\]]+)\]/i,
        style: [styles.link, styles.bold, styles.italics, styles.underline],
        onPress: this.handleAppSettings,
        renderText: this.renderStyles,
      });
    } else if (Platform.OS === 'android') {
      parseSettings.push({
        pattern: /\[(appsettings):([^\]]+)\]/i,
        style: [styles.bold],
        renderText: this.renderStyles,
      });
    }

    return (
      <View style={[styles.container, style]}>
        <ParsedText
          style={[styles.text, TextUpdatedStyle, textStyle]}
          parse={parseSettings}
          childrenProps={{allowFontScaling: false}}>
          {title}
        </ParsedText>
      </View>
    );
  }
}

// Styling
const styles = StyleSheet.create({
  container: {},
  name: {
    color: GLOBALS.COLORS.SUBLIME_RED,
  },
  username: {
    color: GLOBALS.COLORS.GRADIENT_SECONDARY,
  },
  text: {
    color: GLOBALS.COLORS.BLACK,
  },
  primary: {
    color: GLOBALS.COLORS.GRADIENT_PRIMARY,
  },
  secondary: {
    color: GLOBALS.COLORS.GRADIENT_SECONDARY,
  },
  third: {
    color: GLOBALS.COLORS.GRADIENT_THIRD,
  },
  error: {
    color: GLOBALS.COLORS.SUBLIME_RED,
  },
  white: {
    color: GLOBALS.COLORS.WHITE,
  },
  midgray: {
    color: GLOBALS.COLORS.MID_GRAY,
  },
  darkgray: {
    color: GLOBALS.COLORS.DARK_GRAY,
  },
  darkergray: {
    color: GLOBALS.COLORS.DARKER_GRAY,
  },
  link: {
    color: GLOBALS.COLORS.GRADIENT_PRIMARY,
  },
  underline: {
    textDecorationLine: 'underline',
  },
  bold: {
    fontWeight: 'bold',
  },
  italics: {
    fontStyle: 'italic',
  },
});
