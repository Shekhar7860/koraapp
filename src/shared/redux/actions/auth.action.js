import {
  KORA_APP_UPDATE,
  KORA_PROFILE,
  REDUX_FLUSH,
  KORA_PROFILE_DND,
  KORA_PROFILE_ICON,
  KORA_IMAGE_REFRESH,
} from '../constants/auth.constants';
import {ACCOUNT} from './actionTypes';

export function getKoraProfile() {
  return {
    type: KORA_PROFILE,
  };
}

export function getAppUpdateDetail(payload, updateStatus = () => {}) {
  return {
    type: KORA_APP_UPDATE,
    payload: payload,
    updateStatus,
  };
}

export function refreshImage(mode = false) {
  return {
    type: KORA_IMAGE_REFRESH,
    payload: mode,
  };
}

export function updateDNDProfile(profileId, payload) {
  return {
    type: KORA_PROFILE_DND,
    payload: payload,
    profileId: profileId,
  };
}

export function updateProfileIcon(profileId, payload, onSuccess = () => {}) {
  return {
    type: KORA_PROFILE_ICON,
    payload: payload,
    profileId: profileId,
    onSuccess,
  };
}

export function reduxFlush() {
  return {
    type: REDUX_FLUSH,
  };
}

export function getAccount() {
  return {
    type: ACCOUNT.REQUEST,
  };
}
