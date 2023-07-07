// import RNCallKeep, {AnswerCallPayload} from 'react-native-callkeep';

// type DidDisplayIncomingCallArgs = {
//   error: string;
//   callUUID: string;
//   handle: string;
//   localizedCallerName: string;
//   hasVideo: string;
//   fromPushKit: string;
//   payload: string;
// };

// export class CallKeep {
//   private static instance: CallKeep;
//   private callId: string;
//   private callerName: string;
//   private callerId: string;
//   private isAudioCall: string | undefined;
//   private deviceOS: string;
//   private endCallCallback: Function | undefined;
//   private muteCallback: Function | undefined;
//   public IsRinging: boolean = false;

//   constructor(
//     callId: string,
//     callerName: string,
//     callerId: string,
//     deviceOS: string,
//     isAudioCall?: string,
//   ) {
//     this.callId = callId;
//     this.callerName = callerName;
//     this.callerId = callerId;
//     this.isAudioCall = isAudioCall;
//     this.deviceOS = deviceOS;

//     CallKeep.instance = this;
//     this.setupEventListeners();
//   }

//   public static getInstance(): CallKeep {
//     return CallKeep.instance;
//   }

//   endCall = () => {
//     RNCallKeep.endCall(this.callId);

//     if (this.endCallCallback) {
//       this.endCallCallback();
//     }

//     this.removeEventListeners();
//   };

//   displayCallAndroid = () => {
//     this.IsRinging = true;
//     RNCallKeep.displayIncomingCall(
//       this.callId,
//       this.callerName,
//       this.callerName,
//       'generic',
//     );
//     setTimeout(() => {
//       if (this.IsRinging) {
//         this.IsRinging = false;
//         // 6 = MissedCall
//         // https://github.com/react-native-webrtc/react-native-callkeep#constants
//         RNCallKeep.reportEndCallWithUUID(this.callId, 6);
//       }
//     }, 15000);
//   };

//   answerCall = ({callUUID}: AnswerCallPayload) => {
//     this.IsRinging = false;
//     console.log('go some where', callUUID);
//     // navigate('somewhere'); // navigated to call screen in our app
//   };

//   didDisplayIncomingCall = (args: DidDisplayIncomingCallArgs) => {
//     if (args.error) {
//       console.log({
//         message: `Callkeep didDisplayIncomingCall error: ${args.error}`,
//       });
//     }

//     this.IsRinging = true;
//     RNCallKeep.updateDisplay(this.callId, `${this.callerName}`, this.callerId);

//     setTimeout(() => {
//       if (this.IsRinging) {
//         this.IsRinging = false;
//         // 6 = MissedCall
//         // https://github.com/react-native-webrtc/react-native-callkeep#constants
//         RNCallKeep.reportEndCallWithUUID(this.callId, 6);
//       }
//     }, 15000);
//   };

//   private setupEventListeners() {
//     RNCallKeep.addEventListener('endCall', this.endCall);
//     RNCallKeep.addEventListener('didDisplayIncomingCall', (e: any) => {
//       this.didDisplayIncomingCall(e);
//     });
//   }

//   private removeEventListeners() {
//     RNCallKeep.removeEventListener('endCall');
//     RNCallKeep.removeEventListener('didDisplayIncomingCall');
//     this.endCallCallback = undefined;
//   }
// }
