import * as Type from '../constants/home.constants';

export function getJWTToken() {
  return {
    type: Type.JWT_TOKEN,
  };
}

export function presenceStart() {
  return {
    type: Type.PRESENCE_START,
  };
}

export function getHelpThunderbolt() {
  return {
    type: Type.GET_HELP_THUNDERBOLT,
  };
}

export function helpSkillSuggestion() {
  return {
    type: Type.HELP_SKILL_SUGGESTION,
  };
}

export function getMetaDetail() {
  console.log('get meta detail called');
  return {
    type: Type.GET_META_DETAIL,
  };
}

export function setMetaDetail(_params) {
  return {
    type: Type.SET_META_DETAIL,
    _params: _params,
  };
}

export function resolveUser(_params) {
  return {
    type: Type.RESOLVE_USER_DETAIL,
    _params: _params,
  };
}

export function getAppPermissions() {
  return {
    type: Type.APP_PERMISSIONS,
  };
}

export function setDeviceToken(payload) {
  return {
    type: Type.SET_DEVICE_TOKEN,
    payload: payload,
  };
}

export function pushNotifData(_params) {
  return {
    type: Type.PUSH_NOTIFICATION_DATA,
    payload: _params,
  };
}

export function subscribeForPushNotifications(_params) {
  return {
    type: Type.PUSH_NOTIFICATIONS_SUBSCRIBE,
    _params: _params,
  };
}

export function unsubscribeForPushNotifications() {
  return {
    type: Type.PUSH_NOTIFICATIONS_UNSUBSCRIBE,
  };
}
