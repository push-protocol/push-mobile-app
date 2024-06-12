import Globals from 'src/Globals';

export const DeeplinkHelper = {
  parseUrl: (url: string) => {
    const simplifiedUrl = url.replace('app.push.org://', '');
    const page = simplifiedUrl.split('?')[0];
    const params = simplifiedUrl
      .split('?')[1]
      ?.split('&')
      ?.reduce((acc, param) => {
        const [key, value] = param.split('=');
        return {...acc, [key]: value};
      }, {});
    return {
      page: DeeplinkHelper.getPageFromName(page),
      params,
    };
  },

  getPageFromName: (name: string): keyof typeof Globals.SCREENS => {
    switch (name) {
      case 'inbox':
      case 'spam':
        return 'FEED';
      case 'channels':
        return 'CHANNELS';
      default:
        return 'CHANNELS';
    }
  },
};
