import * as Type from '../constants/notification.constants';

export function setNotificationTyping(_params) {
  return {
    type: Type.TYPING,
    _params: _params
  }
}
export function setNotification(_params) {
  return {
    type: Type.NOTIFICATION,
    _params: _params
  }
}

export function setLiveActionNotification(_params) {
  return {
    type: Type.NOTIFICATION_LIVE,
    _params: _params
  }
}


export function setNotificationStatus(_params) {
  return {
    type: Type.NOTIFICATION_STATUS,
    _params: _params
  }
}
export function setTypingSubscribe(_params) {
  return {
    type: Type.SUBSCRIBE_TYPING,
    _params: _params
  }
}