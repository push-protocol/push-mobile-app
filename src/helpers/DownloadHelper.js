import * as FileSystem from 'expo-file-system';

import GLOBALS from 'src/Globals';

// Download Helper Function
const DownloadHelper = {
  // To get Temp Save Location
  getTempSaveLocation: function(fileURL) {
    return FileSystem.documentDirectory
      + DownloadHelper.getSaveFileName(fileURL, true);
  },
  // To get Actual Save Location
  getActualSaveLocation: function(fileURL) {
    return FileSystem.documentDirectory
      + DownloadHelper.getSaveFileName(fileURL, false);
  },
  // To get Save File Name
  getSaveFileName: function(fileURL, useTempLocation) {
    // Remove all http, https protocols first
    fileURL = fileURL.replace(/(^\w+:|^)\/\//, '');

    // /[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi
    // Remove all special characters
    fileURL = fileURL.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');

    // Remove all but 250 characters
    if (fileURL.length > 250) {
      fileURL = fileURL.substr(-250);
    }

    if (useTempLocation) {
      return fileURL+ '.temp';
    }
    else {
      return fileURL;
    }
  },
}

export default DownloadHelper;
