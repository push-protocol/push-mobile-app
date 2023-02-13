import React, {Component} from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import GLOBALS from 'src/Globals';

import StylishLabel from '../labels/StylishLabel';

export default class NoticePrompt extends Component {
  // Constructor
  constructor(props) {
    super(props);

    this.state = {
      title: '',
      subtitle: '',
      notice: '',
      indicator: false,
      fader: new Animated.Value(0),
      render: false,
    };
  }

  // Set Title
  changeTitle = title => {
    this.setState({
      title: title,
    });
  };

  // Set Subtitle
  changeSubtitle = subtitle => {
    this.setState({
      subtitle: subtitle,
    });
  };

  // Set Notice
  changeNotice = notice => {
    this.setState({
      notice: notice,
    });
  };

  // Set Indicator
  changeIndicator = showIndicator => {
    this.setState({
      indicator: showIndicator,
    });
  };

  // Set Render
  changeRenderState = (shouldOpen, animate) => {
    if (shouldOpen) {
      this.animateFadeIn(animate);
    } else {
      this.animateFadeOut(animate);
    }
  };

  // Set Fade In and Fade Out Animation
  animateFadeIn = animate => {
    this.setState({
      render: true,
      qrcode: '',
    });

    if (animate) {
      Animated.timing(this.state.fader, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      this.setState({
        fader: new Animated.Value(1),
      });
    }
  };

  animateFadeOut = animate => {
    if (animate) {
      Animated.timing(this.state.fader, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        this.setState({
          render: false,
        });
      });
    } else {
      this.setState({
        fader: new Animated.Value(0),
        render: false,
      });
    }
  };

  //Render
  render() {
    const {closeTitle, closeFunc} = this.props;

    return this.state.render === false ? null : (
      <Animated.View style={[styles.container, {opacity: this.state.fader}]}>
        <View style={styles.modal}>
          <View style={[styles.titleArea]}>
            {this.state.title == null ? null : (
              <Text style={[styles.title]}>{this.state.title}</Text>
            )}
            {this.state.subtitle == null ? null : (
              <Text style={[styles.subtitle]}>{this.state.subtitle}</Text>
            )}
          </View>
          <View style={[styles.noticeArea]}>
            {this.state.notice == null ? null : this.state.indicator ===
              true ? (
              <ActivityIndicator
                style={styles.activity}
                size="large"
                color={GLOBALS.COLORS.BLACK}
              />
            ) : (
              <StylishLabel
                style={styles.notice}
                textStyle={styles.overrideStylish}
                title={this.state.notice}
                fontSize={14}
              />
            )}
          </View>
          {this.state.indicator === true ? null : (
            <View style={[styles.cancelArea]}>
              <TouchableHighlight
                style={[styles.cancel]}
                underlayColor={GLOBALS.COLORS.MID_GRAY}
                onPress={closeFunc}>
                <Text style={[styles.cancelText]}>{closeTitle}</Text>
              </TouchableHighlight>
            </View>
          )}
        </View>
      </Animated.View>
    );
  }
}

// Styling
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
  },
  modal: {
    position: 'absolute',
    display: 'flex',
    alignSelf: 'center',
    width: '75%',
    maxWidth: 300,
    overflow: 'hidden',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GLOBALS.COLORS.LIGHT_GRAY,
  },
  titleArea: {},
  title: {
    fontSize: 16,
    backgroundColor: GLOBALS.COLORS.WHITE,
    color: GLOBALS.COLORS.BLACK,
    paddingTop: 20,
    paddingBottom: 5,
    paddingHorizontal: 15,
    justifyContent: 'center',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    paddingTop: 5,
    paddingBottom: 20,
    paddingHorizontal: 15,
    backgroundColor: GLOBALS.COLORS.WHITE,
    color: GLOBALS.COLORS.BLACK,
    textAlign: 'center',
    fontSize: 14,
  },
  noticeArea: {
    paddingVertical: 25,
    paddingHorizontal: 15,
    justifyContent: 'center',
    backgroundColor: GLOBALS.COLORS.SLIGHT_GRAY,
  },
  notice: {
    fontSize: 14,
    minWidth: 20,
    minHeight: 30,
    textAlign: 'center',
    color: GLOBALS.COLORS.BLACK,
  },
  cancelArea: {},
  cancel: {
    padding: 15,
    backgroundColor: GLOBALS.COLORS.WHITE,
  },
  cancelText: {
    color: GLOBALS.COLORS.LINKS,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  overrideStylish: {
    textAlign: 'center',
  },
});
