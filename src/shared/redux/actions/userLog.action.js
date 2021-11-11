import {USER_LOG, CHAT_TIMESTAMP} from '../constants/userLog.constants';

export function userLogStatus(isUserLoggedIn) {
  return {
    type: USER_LOG,
    payload: isUserLoggedIn,
  };
}
export function getTimestamp(timestamp) {
  return {
    type: CHAT_TIMESTAMP,
    payload: timestamp,
  };
}
