import * as Device from 'expo-device';

// STATIC SINGLETON
export default class Utilities {
  static instance = Utilities.instance || new Utilities();

  state = {
    deviceType: Device.DeviceType.PHONE,
  };

  // INITIALIZE
  initialize = async () => {
    await this.setDeviceType();
  };

  // FOR DEVICE TYPE
  getDeviceType = () => {
    return Utilities.instance.state.deviceType;
  };

  setDeviceType = async () => {
    let dType = await Device.getDeviceTypeAsync();
    if (dType != Device.DeviceType.PHONE) {
      dType = Device.DeviceType.TABLET;
    }

    Utilities.instance.state.deviceType = dType;
  };
}
