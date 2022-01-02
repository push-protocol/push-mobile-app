import React, { Component, createContext } from 'react';

const AuthContext = React.createContext({});
export default AuthContext;

export const useAuthContext = () => React.useContext(AuthContext);

export const APP_AUTH_STATES = {
  INITIALIZING: 1,
  ONBOARDING: 2,
  ONBOARDED: 3,
  AUTHENTICATED: 4
};



// LOOK INTO IT LATER

// import React, { Component, createContext } from 'react';
//
// export const AuthContext = React.createContext({});
//
// export class AuthProvider extends Component {
//   // CONSTRUCTOR
//   constructor(props) {
//     super(props);
//
//     this.state = {
//       initialized: false,
//       signedIn: false,
//       authenticated: false,
//
//       pkey: '',
//     };
//   }
//
//   // FUNCTIONS
//   setSignedIn = (signedIn) => {
//     let authenticated = this.state.authenticated;
//     let pkey = this.state.pkey;
//
//     if (!signedIn) {
//       authenticated = false;
//       pkey = '';
//     }
//
//     this.setAuthState(true, signedIn, authenticated, pkey);
//   }
//
//   setAuthenticated = (signedIn, authenticated, pkey) => {
//     this.setAuthState(true, signedIn, authenticated, pkey);
//   }
//
//   setAuthState = (initialized, signedIn, authenticated, pkey) => {
//     this.setState({
//       initialized: initialized,
//       signedIn: signedIn,
//       authenticated: authenticated,
//       pkey: pkey,
//     }, () => {
//       console.log("Initialized: " + this.state.initialized);
//       console.log("SignedIn: " + this.state.signedIn);
//       console.log("Authenticated: " + this.state.authenticated);
//       console.log("PrivKey: " + this.state.pkey);
//     })
//   }
//
//   render() {
//     const { children } = this.props;
//
//     return (
//       <AuthContext.Provider
//         value={{
//           initialized: this.openSnackbar,
//           signedIn: this.closeSnackbar,
//           authenticated: this.state.isOpen,
//           pkey: this.state.pkey,
//
//           setSignedIn: (signedIn) => {
//             this.setSignedIn(signedIn)
//           },
//           setAuthenticated: (signedIn, authenticated, pkey) => {
//             this.setAuthenticated(signedIn, authenticated, pkey)
//           },
//         }}
//       >
//         {children}
//       </AuthContext.Provider>
//     );
//   }
// }
//
// export const AuthConsumer = AuthContext.Consumer;
