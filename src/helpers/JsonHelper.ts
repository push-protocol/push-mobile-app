const JsonHelper = {
  isJSON: (str: string): boolean => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  },
};

export default JsonHelper;
