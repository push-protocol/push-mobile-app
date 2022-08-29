# os in React Native

node's [os](https://nodejs.org/api/os.html) API in React Native

This module is used by [Peel](http://www.peel.com/)

## Install

* Create a new react-native project. [Check react-native getting started](http://facebook.github.io/react-native/docs/getting-started.html#content)

* In your project dir:

```
npm install react-native-os --save
```

__Note for iOS:__ If your react-native version < 0.40 install with this tag instead:
```
npm install react-native-os@1.0.3 --save
```

## Link in the native dependency

```
react-native link react-native-os
```

***Step 3 Profit***

## Usage

### package.json

_only if you want to write require('os') in your javascript_

```json
{
  "react-native": {
    "os": "react-native-os"
  }
}
```

## Contributors

[Andy Prock](https://github.com/aprock)  

PR's welcome!
