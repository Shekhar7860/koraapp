import {put, takeLatest, all, select} from 'redux-saga/effects';
import * as Type from '../constants/notification.constants';

//worker functions
function* setTypingNotification(action) {
  try {
    yield put({
      type: Type.TYPING_SUCCESSFUL,
      payload: action._params,
    });
  } catch (error) {
    console.log('Error: ', error);
  }
}

function* setNotification(action) {
  try {
    yield put({
      type: Type.NOTIFICATION_SUCCESSFUL,
      payload: action._params,
    });
  } catch (error) {
    console.log('Error: ', error);
  }
}

function* setNotificationStatus(action) {
  try {
    yield put({
      type: Type.NOTIFICATION_STATUS_SUCCESSFUL,
      payload: action._params,
    });
  } catch (error) {
    console.log('Error: ', error);
  }
}

function* subscribeTyping(action) {
  try {
    yield put({
      type: Type.SUBSCRIBE_TYPING_SUCCESSFUL,
      payload: action._params,
    });
  } catch (error) {
    console.log('Error: ', error);
  }
}

function* setNotificationLive(action) {
  try {
    yield put({
      type: Type.NOTIFICATION_LIVE_SUCCESSFUL,
      payload: action._params,
    });
  } catch (error) {
    console.log('Error: ', error);
  }
}

export function* NotificationSaga() {
  yield all([
    takeLatest(Type.TYPING, setTypingNotification),
    takeLatest(Type.NOTIFICATION, setNotification),
    takeLatest(Type.NOTIFICATION_LIVE, setNotificationLive),
    takeLatest(Type.NOTIFICATION_STATUS, setNotificationStatus),
    takeLatest(Type.SUBSCRIBE_TYPING, subscribeTyping),
  ]);
}
