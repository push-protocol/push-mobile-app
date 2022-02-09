import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import SafeAreaView from "react-native-safe-area-view";
import * as Device from "expo-device";
import { LinearGradient } from "expo-linear-gradient";
import moment from "moment";

import StylishLabel from "src/components/labels/StylishLabel";
import EPNSActivity from "src/components/loaders/EPNSActivity";
import { ToasterOptions } from "src/components/indicators/Toaster";

import DownloadHelper from "src/helpers/DownloadHelper";
import ImageDownloadWithIndicator from "src/components/loaders/ImageDownloadWithIndicator";
import VideoDownloadWithIndicator from "src/components/loaders/VideoDownloadWithIndicator";

import CryptoHelper from "src/helpers/CryptoHelper";
import Utilities from "src/singletons/Utilities";

import GLOBALS from "src/Globals";

export default class FeedItem extends Component {
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    this.state = {
      loading: true,

      sub: null,
      msg: null,
      cta: null,
      img: null,
      timestamp: false,

      type: 1,
    };
  }

  // COMPONENT MOUNTED
  async componentDidMount() {
    await this.compileMessage();
  }

  // FUNCTIONS
  compileMessage = async () => {
    const item = this.props.item;

    let sub = !item["asub"] || item["asub"] === "" ? null : item["asub"];
    let msg = !item["amsg"] || item["amsg"] === "" ? null : item["amsg"];
    let cta = !item["acta"] || item["acta"] === "" ? null : item["acta"];
    let img = !item["aimg"] || item["aimg"] === "" ? null : item["aimg"];

    if (item["type"] == 1 || item["type"] == 3) {
      // all clear, plain message types
      let showTimestamp = false;
      const matches = msg.match(/\[timestamp:(.*?)\]/);
      if (matches) {
        showTimestamp = matches[1];
        msg = msg.replace(/ *\[timestamp:[^)]*\] */g, "");
      }

      this.setState({
        sub: sub,
        msg: msg,
        cta: cta,
        img: img,
        timestamp: showTimestamp,

        type: item["type"],

        loading: false,
      });
    }

    if (item["type"] == 2 || item["type"] == -2) {
      const privateKey = this.props.privateKey;

      if (privateKey && privateKey !== GLOBALS.CONSTANTS.NULL_EXCEPTION) {
        // Private key present, else display action banner as it's a wallet sign in
        // decrypt the message
        const secret = await CryptoHelper.decryptWithECIES(
          item["secret"],
          privateKey
        );
        // console.log("SECR:" + secret);

        if (sub) {
          sub = CryptoHelper.decryptWithAES(sub, secret);
        }

        if (msg) {
          msg = CryptoHelper.decryptWithAES(msg, secret);
        }

        if (cta) {
          cta = CryptoHelper.decryptWithAES(cta, secret);
        }

        if (img) {
          img = CryptoHelper.decryptWithAES(img, secret);
        }
      }

      let showTimestamp = false;
      const matches = msg.match(/\[timestamp:(.*?)\]/);
      if (matches) {
        showTimestamp = matches[1];
        msg = msg.replace(/ *\[timestamp:[^)]*\] */g, "");
      }

      this.setState({
        sub: sub,
        msg: msg,
        cta: cta,
        img: img,
        timestamp: showTimestamp,

        type: item["type"],

        loading: false,
      });
    }
  };

  // For on Press
  onPress = async (url, showToast) => {
    // if (this.validURL(url) || 1) { // Bypassing the check so that custom app domains can be opened
    //   Linking.canOpenURL(url).then(supported => {
    //     if (supported) {
    await Linking.openURL(url);
    //     } else {
    //       showToast("Device Not Supported", "ios-link", ToasterOptions.TYPE.GRADIENT_PRIMARY)
    //     }
    //   });
    // }
    // else {
    //   showToast("Link not valid", "ios-link", ToasterOptions.TYPE.GRADIENT_PRIMARY)
    // }
  };

  // to check valid url
  validURL = (str) => {
    var pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    ); // fragment locator
    return !!pattern.test(str);
  };

  // RENDER
  render() {
    const { style, item, showToast, onImagePreview, privateKey } = this.props;

    //console.log(item);

    // Do stuff with contants like internal bot, app meta info, etc
    let internalBot = false;
    if (item["appbot"] == 1) {
      internalBot = true;
    }

    let iconURL = item["icon"];
    if (internalBot) {
      iconURL = require("assets/ui/epnsbot.png");
    }

    // Also add secret icon if message type is 2
    let addSecretIcon = false;
    if (item["type"] == 2 || item["type"] == -2) {
      addSecretIcon = true;
    }

    // CTA can be determined for the view since even encrypted, it will have some string
    let ctaBorderEnabled = true;
    let cta = item["acta"];

    if (!cta || cta === "") {
      ctaBorderEnabled = false;
    }

    let ctaEnabled = false;
    if (this.state.cta) {
      ctaEnabled = true;
    }

    // Finally mark if the device is a tablet or a phone
    let contentInnerStyle = {};
    let contentImgStyle = {};
    let contentMsgImgStyle = {};
    let contentVidStyle = {};
    let contentMsgVidStyle = {};

    let contentBodyStyle = {};
    let containMode = "contain";
    if (Utilities.instance.getDeviceType() == Device.DeviceType.TABLET) {
      // Change the style to better suit tablet

      contentInnerStyle = {
        flexDirection: "row",
        alignItems: "center",
      };

      contentImgStyle = {
        width: "25%",
        aspectRatio: 1,
      };

      contentMsgImgStyle = {
        margin: 20,
        marginRight: 5,
        borderRadius: 10,
        borderWidth: 0,
      };

      contentBodyStyle = {
        flex: 1,
      };

      containMode = "cover";
    }

    return (
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={() => this.onPress(this.state.cta, showToast)}
        disabled={!ctaEnabled}
      >
        {ctaBorderEnabled ? (
          <LinearGradient
            colors={[
              GLOBALS.COLORS.GRADIENT_SECONDARY,
              GLOBALS.COLORS.GRADIENT_SECONDARY,
            ]}
            style={[styles.cover]}
            start={[0.1, 0.3]}
            end={[1, 1]}
          ></LinearGradient>
        ) : (
          <View style={[styles.cover, styles.coverPlain]}></View>
        )}
        <View style={styles.inner}>
          <View style={styles.header}>
            <View style={styles.appinfo}>
              <TouchableOpacity
                style={[styles.appLink]}
                onPress={() => this.onPress(item["url"], showToast)}
                disabled={!item["url"] || item["url"] === "" ? true : false}
              >
                <ImageDownloadWithIndicator
                  style={styles.appicon}
                  fileURL={internalBot ? "" : iconURL}
                  imgsrc={internalBot ? iconURL : false}
                  miniProgressLoader={true}
                  margin={2}
                  resizeMode="contain"
                />
                <Text style={styles.apptext} numberOfLines={1}>
                  {item["app"]}
                </Text>
              </TouchableOpacity>
            </View>
            {addSecretIcon == false ? null : (
              <View style={styles.appsecret}>
                <LinearGradient
                  colors={[
                    GLOBALS.COLORS.GRADIENT_PRIMARY,
                    GLOBALS.COLORS.GRADIENT_SECONDARY,
                  ]}
                  style={[styles.cover]}
                  start={[0.1, 0.3]}
                  end={[1, 1]}
                ></LinearGradient>
              </View>
            )}
          </View>

          <View style={[styles.content]}>
            {this.state.loading ? (
              <EPNSActivity style={styles.contentLoader} size="small" />
            ) : (
              <View style={[styles.contentInner, contentInnerStyle]}>
                {!this.state.img ? null : DownloadHelper.isMediaSupportedVideo(
                    this.state.img
                  ) ? (
                  <View style={[styles.contentVid, contentVidStyle]}>
                    <VideoDownloadWithIndicator
                      style={[styles.msgVid, contentMsgVidStyle]}
                      fileURL={this.state.img}
                      resizeMode={containMode}
                    />
                  </View>
                ) : (
                  <View style={[styles.contentImg, contentImgStyle]}>
                    <ImageDownloadWithIndicator
                      style={[styles.msgImg, contentMsgImgStyle]}
                      fileURL={this.state.img}
                      imgsrc={false}
                      resizeMode={containMode}
                      onPress={(fileURL) => {
                        onImagePreview(fileURL);
                      }}
                    />
                  </View>
                )}

                <View style={[styles.contentBody, contentBodyStyle]}>
                  {!this.state.sub ? null : (
                    <Text style={[styles.msgSub]}>{this.state.sub}</Text>
                  )}

                  <StylishLabel
                    style={[styles.msg]}
                    fontSize={14}
                    title={this.state.msg}
                  />

                  {!this.state.timestamp ? null : (
                    <View style={styles.timestampOuter}>
                      <Text style={styles.timestamp}>
                        {moment
                          .utc(parseInt(this.state.timestamp) * 1000)
                          .local()
                          .format("DD MMM YYYY | hh:mm A")}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

// Styling
const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 15,
  },
  cover: {
    position: "absolute",
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    flex: 1,
    borderRadius: GLOBALS.ADJUSTMENTS.FEED_ITEM_RADIUS,
  },
  coverPlain: {
    backgroundColor: GLOBALS.COLORS.SLIGHT_GRAY,
  },
  inner: {
    margin: 1,
    overflow: "hidden",
    borderRadius: GLOBALS.ADJUSTMENTS.FEED_ITEM_RADIUS,
  },
  header: {
    width: "100%",
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: GLOBALS.COLORS.SLIGHTER_GRAY,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: GLOBALS.COLORS.SLIGHT_GRAY,
  },
  appInfo: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "red",
  },
  appLink: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  appicon: {
    flex: 0,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
    height: 24,
    aspectRatio: 1,
    marginRight: 5,
    overflow: "hidden",
    backgroundColor: GLOBALS.COLORS.SLIGHT_GRAY,
  },
  apptext: {
    marginRight: 10,
    marginLeft: 5,
    fontSize: 12,
    color: GLOBALS.COLORS.MID_BLACK_TRANS,
    fontWeight: "300",
  },
  appsecret: {
    width: 16,
    height: 16,
    borderRadius: 16,
  },
  content: {
    backgroundColor: GLOBALS.COLORS.WHITE,
  },
  contentLoader: {
    margin: 20,
  },
  contentVid: {
    width: "100%",
  },
  msgVid: {
    borderColor: GLOBALS.COLORS.SLIGHT_GRAY,
    backgroundColor: GLOBALS.COLORS.SLIGHTER_GRAY,
    borderBottomWidth: 1,
  },
  contentImg: {
    width: "100%",
    aspectRatio: 2,
  },
  msgImg: {
    borderColor: GLOBALS.COLORS.SLIGHT_GRAY,
    backgroundColor: GLOBALS.COLORS.SLIGHTER_GRAY,
    borderBottomWidth: 1,
    resizeMode: "contain",
  },
  contentBody: {
    paddingHorizontal: 15,
  },
  msgSub: {
    fontSize: 16,
    fontWeight: "300",
    color: GLOBALS.COLORS.MID_BLACK_TRANS,
    paddingVertical: 10,
  },
  msg: {
    paddingTop: 5,
    paddingBottom: 20,
  },
  timestampOuter: {
    display: "flex",
    justifyContent: "center",
    alignSelf: "flex-end",
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginRight: -20,
    borderTopLeftRadius: 5,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: GLOBALS.COLORS.SLIGHT_GRAY,
    overflow: "hidden",

    backgroundColor: GLOBALS.COLORS.SLIGHTER_GRAY,
  },
  timestamp: {
    fontWeight: "300",
    fontSize: 12,

    color: GLOBALS.COLORS.MID_BLACK_TRANS,
  },
});
