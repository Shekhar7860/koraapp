import {Dimensions, Platform, PixelRatio} from 'react-native';
import * as UsersDao from '../../dao/UsersDao';
import {colors} from './../../native/theme/colors';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// based on iphone X's scale
let NEW_SCREEN_WIDTH =
  SCREEN_WIDTH > SCREEN_HEIGHT ? SCREEN_HEIGHT : SCREEN_WIDTH;
const scale = NEW_SCREEN_WIDTH / 375;

export function normalize(size) {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.ceil(PixelRatio.roundToNearestPixel(newSize));
  }
}

const fullMonths = [
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
const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const fullDays = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const yesterdayOffset = 1000 * 60 * 60 * 24;
export const getTimeline = (time, type) => {  

  const givenDate = new Date(time);
  const day = days[givenDate.getDay()];
  let month = months[givenDate.getMonth()];
  const date = givenDate.getDate();
  const year = givenDate.getFullYear();

  const currentDate = new Date();
  const todayDay = days[currentDate.getDay()];
  const todayMonth = months[currentDate.getMonth()];
  const todayDate = currentDate.getDate();
  const todayYear = currentDate.getFullYear();

  const yesterday = new Date(new Date().valueOf() - yesterdayOffset);
  const yesterdayDay = days[yesterday.getDay()];
  const yesterdayMonth = months[yesterday.getMonth()];
  const yesterdayDate = yesterday.getDate();

  let dd = givenDate.getDate();
  let mm = givenDate.getMonth();
  mm = mm + 1;
  let yy = givenDate.getFullYear();
  dd = dd < 10 ? '0' + dd : dd;
  mm = mm < 10 ? '0' + mm : mm;

  if (type === 'time') {
    return getTime(time);
  } else if (type === 'thread') {
    if (day + month + date === todayDay + todayMonth + todayDate) {
      return getTime(time);
    } else if (
      day + month + date ===
      yesterdayDay + yesterdayMonth + yesterdayDate
    ) {
      return 'Yesterday';
    } else if (year !== todayYear) {
      var finalDate =
        months[givenDate.getMonth()] + ' ' + givenDate.getDate() + ', ' + year;
      return finalDate;
    } else {
      var finalDate = months[givenDate.getMonth()] + ' ' + givenDate.getDate();
      return finalDate;
    }
  } else if (type === 'message') {
    if (day + month + date === todayDay + todayMonth + todayDate) {
      return 'Today';
    } else if (
      day + month + date ===
      yesterdayDay + yesterdayMonth + yesterdayDate
    ) {
      return 'Yesterday';
    } else if (year !== todayYear) {
      var finalDate =
        months[givenDate.getMonth()] + ' ' + givenDate.getDate() + ', ' + year;
      return finalDate;
    } else {
      var finalDate = months[givenDate.getMonth()] + ' ' + givenDate.getDate();
      return finalDate;
    }
  } else if (type === 'numberDate') {
    let finalData = dd + '/' + mm + '/' + yy;
    return finalData;
  } else if (type === 'numberDateTime') {
    let finalData = dd + '/' + mm + '/' + yy + ' ' + getTime(time);
    return finalData;
  } else if (type === 'fulldate') {
    let creationDate =
      day +
      ', ' +
      month +
      ' ' +
      givenDate.getDate() +
      ', ' +
      givenDate.getFullYear() +
      ', ' +
      getTime(time);
    return creationDate;
  } else if (type === 'getFullMonth') {
    return fullMonths;
  } else if (type === 'getShortMonth') {
    return months;
  } else if (type === 'fullMonthAndYear') {
    let fullMonth = fullMonths[givenDate.getMonth()];
    let monthAndYear = fullMonth;
    if (year !== todayYear) {
      monthAndYear = monthAndYear + ' ' + year;
    }
    return monthAndYear;
  } else if (type === 'dateAndTime') {
    let finalData =
      days[givenDate.getDay()] +
      ', ' +
      months[mm - 1] +
      ' ' +
      dd +
      ' , ' +
      getTime(time);
    return finalData;
  } else if (type === 'post') {
    let finalData = months[mm - 1] + ' ' + dd + ', ' + getTime(time);
    if (day + month + date === todayDay + todayMonth + todayDate) {
      return getTime(time);
    } else {
      return finalData;
    }
  } else if (type === 'discList') {
    //let finalData =  months[mm - 1] + ' ' + dd;
    let finalData = dd + '/' + mm + '/' + yy.toString().substr(-2);
    if (day + month + date === todayDay + todayMonth + todayDate) {
      return getTime(time);
    } else if (
      day + month + date ===
      yesterdayDay + yesterdayMonth + yesterdayDate
    ) {
      return 'Yesterday';
    } else if (year !== todayYear) {
      var finalDate =
        months[givenDate.getMonth()] + ' ' + givenDate.getDate() + ', ' + year;
      return finalDate;
    } else {
      return finalData;
    }
  } else if (type === 'file') {
    let newDate =
      months[givenDate.getMonth()] + ' ' + dd + ', ' + givenDate.getFullYear();
    return newDate;
  } else if (type === 'meetings') {
    let dd = givenDate.getDate();
    //let currentMonth = month + ', ' + day;
    let currentMonth = day;
    return [dd, currentMonth];
  } else if (type === 'meetingNotes') {
    const getFullDay = fullDays[givenDate.getDay()];
    return getFullDay + ', ' + month + ' ' + date + ' - ' + year + ', ';
  } else if (type === 'meetingInfo') {
    const getFullDay = fullDays[givenDate.getDay()];
    return month + ' ' + date + ', ' + getFullDay;
  }
};
function getTime(time) {
  const givenDate = new Date(time);
  var hours = givenDate.getHours();
  var minutes = givenDate.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const mMinutes = minutes < 10 ? '0' + minutes : minutes;
  var strTime = hours + ':' + mMinutes + ' ' + ampm;
  return strTime;
}

export const getHourDiiferenceFromToday = (time) => {
  const givenDate = new Date(time);
  var today = new Date();
  var diff = (givenDate - today) / 1000;
  diff /= 60 * 60;
  return Math.abs(Math.round(diff));
};

export const getThreadContact = (to, from, currentUserId) => {
  let obj = [...(to || []), from];
  let threadName = [];
  let fullName = [];
  if (obj && obj.length > 0) {
    obj.forEach(function (value, index) {
      if (value?.id !== currentUserId) {
        threadName.push(value?.fN);
        fullName.push(value?.fN + ' ' + value?.lN);
      }
    });
  }
  if (threadName && threadName.length === 1) {
    threadName[0] = fullName[0];
  }
  return threadName.join(', ');
};

/**
 * @param obj User object
 * @returns username string
 */
export const getNameFromUserObject = (obj, identifyCurrentUser = true) => {
  if (identifyCurrentUser && obj?.id === UsersDao.getUserId()) {
    return 'You';
  }

  if (obj?.fN || obj?.lN) {
    return obj?.fN + ' ' + obj?.lN;
  } else {
    return obj?.emailId;
  }
};

/**
 * Converts members list to text
 * @param {*} memberList List of user objects
 * @param {*} totalCount Total members count
 * @param {*} t Translation function from props
 */
export const memberListToText = (
  memberList = [],
  totalCount = 0,
  t = (text) => text,
) => {
  if (totalCount <= 3) {
    return memberList.map(getNameFromUserObject).join(', ');
  } else {
    let suffix = '';
    const remaining = totalCount - 3;
    if (remaining === 1) {
      suffix = `${remaining} ${t('Other')}`;
    } else {
      suffix = `${remaining} ${t('Others')}`;
    }

    return (
      memberList?.slice(0, 3).map(getNameFromUserObject).join(', ') +
      ', + ' +
      suffix
    );
  }
};
//To get the intersection of two lists - initial sync->getting msg boards
export const intersectionOfArray = (mainList, subList, isUnion = false) =>
  mainList.filter((a) => isUnion === subList.some((b) => b === a.id));

export const notIn = (mainList, subList, isUnion = false) =>
  mainList.filter((a) => isUnion === subList.some((b) => b !== a.id));

export const msgBoards = (listOne, listTwo) =>
  intersectionOfArray(listOne, listTwo, true);
export const discussionBoards = (listOne, listTwo) =>
  notIn(listOne, listTwo, true);

export const delteOptionsArray = [
    {name: 'Delete', key: 1, color: colors.koraAlertNegative},
    {name: 'Cancel', key: 2, color: colors.koraAlertPositive},
  ];

export default class NetworkHeaderValues {
  static myInstance = null;
  _height = 0;
  status = true;
  /**
   * @returns {NetworkHeaderValues}
   */
  static getInstance() {
    if (NetworkHeaderValues.myInstance == null) {
      NetworkHeaderValues.myInstance = new NetworkHeaderValues();
    }

    return this.myInstance;
  }

  getNetworkHeight() {
    return this._height;
  }

  setNetworkHeight(height) {
    this._height = height;
  }
  
}
