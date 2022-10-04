export const TABS = {
  CHATS: 'Chats',
  REQUESTS: 'Request',
};

export const DUMMY_CHATS = [
  {
    image: require('assets/chat/wallet1.png'),
    wallet: '0x3B51c44...f5303bA1',
    text: 'Hi, can we talk?',
    time: '9:30',
  },
  {
    image: require('assets/chat/wallet2.png'),
    wallet: '0x3B51c44...f5303bA1',
    text: 'This was created yesterday',
    time: '8:00',
  },
  {
    image: require('assets/chat/wallet3.png'),
    wallet: '0x3B51c44...f5303bA1',
    text: 'Please call me!',
    time: '7:59',
  },
  {
    image: require('assets/chat/wallet4.png'),
    wallet: '0x3B51c44...f5303bA1',
    text: 'How was your day?',
    time: '6:41',
    count: 10,
  },
  {
    image: require('assets/chat/wallet5.png'),
    wallet: '0x3B51c44...f5303bA1',
    text: "Hi, it's me again",
    time: '5:00',
    count: 1,
  },
];

export const DUMMY_REQUESTS = [
  {
    image: require('assets/chat/wallet1.png'),
    wallet: '0x3B51c44...f5303bA1',
    text: "Hi, let's connect",
    time: '10:30',
  },
  {
    image: require('assets/chat/wallet2.png'),
    wallet: '0x3B51c44...f5303bA1',
    text: "Hi, let's connect",
    time: '9:00',
  },
  {
    image: require('assets/chat/wallet3.png'),
    wallet: '0x3B51c44...f5303bA1',
    text: "Hi, let's connect",
    time: '8:46',
  },
  {
    image: require('assets/chat/wallet4.png'),
    wallet: '0x3B51c44...f5303bA1',
    text: "Hi, let's connect",
    time: '7:32',
  },
  {
    image: require('assets/chat/wallet5.png'),
    wallet: '0x3B51c44...f5303bA1',
    text: "Hi, let's connect",
    time: '7:20',
  },
  {
    image: require('assets/chat/wallet1.png'),
    wallet: '0x3B51c44...f5303bA1',
    text: "Hi, let's connect",
  },
  {
    image: require('assets/chat/wallet2.png'),
    wallet: '0x3B51c44...f5303bA1',
    text: "Hi, let's connect",
    time: '7:10',
  },
  {
    image: require('assets/chat/wallet3.png'),
    wallet: '0x3B51c44...f5303bA1',
    text: "Hi, let's connect",
    time: '7:00',
  },
  {
    image: require('assets/chat/wallet4.png'),
    wallet: '0x3B51c44...f5303bA1',
    text: "Hi, let's connect",
    time: '4:20',
  },
  {
    image: require('assets/chat/wallet5.png'),
    wallet: '0x3B51c44...f5303bA1',
    text: "Hi, let's connect",
    time: '1:20',
  },
];

export const CHAT_TYPES = {
  RECIPIENT: 'recipient',
  SENDER: 'sender',
};

export const FULL_CHAT = [
  {
    type: CHAT_TYPES.RECIPIENT,
    time: '9:00',
    text: 'Hey are you there?',
  },
  {
    type: CHAT_TYPES.SENDER,
    time: '9:00',
    text: 'Hi, yes I am',
  },
  {
    type: CHAT_TYPES.RECIPIENT,
    time: '9:00',
    text: 'Hey! This wallet chat feature is great! I wonder if we can chat with any wallet...',
  },
  {
    type: CHAT_TYPES.SENDER,
    time: '9:00',
    text: 'Hey! This wallet chat feature is great! I wonder if we can chat with any wallet...!',
  },
  {
    type: CHAT_TYPES.RECIPIENT,
    time: '9:00',
    text: 'Did you see the latest price trend?',
  },
  {
    type: CHAT_TYPES.SENDER,
    time: '9:00',
    text: 'No, I did not',
  },
];

export const STORAGE_CONSTANTS = {
  CHAT_DATA: 'chat-data',
  PRIVATE_CHAT: 'private-chat',
};

export const CACHE_LIMIT = 100;

export const FETCH_ONCE = 15;
