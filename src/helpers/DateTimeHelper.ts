const formatAMPM = (timeStamp: number) => {
  const date = new Date(timeStamp);
  const hrs = date.getHours();
  const min = getTwoDig(date.getMinutes());

  if (hrs > 12) {
    return `${getTwoDig(hrs % 12)}:${min} PM`;
  } else {
    return `${getTwoDig(hrs)}:${min} AM`;
  }
};

const formatDate = (timeStamp: number) => {
  const date = new Date(timeStamp);
  return `${days[date.getDay()]}, ${months[date.getMonth()]}, ${getTwoDig(
    date.getDate(),
  )}, ${date.getFullYear()}`;
};

export {formatAMPM, formatDate};

const getTwoDig = (num: number) => {
  const str = num.toString();
  if (str.length === 1) {
    return `0${str}`;
  }
  return str;
};

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
