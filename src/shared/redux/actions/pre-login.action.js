import {
  LOGIN,
  PWD_LOGIN,
  PWD_RESET,
  SSO_LOGIN,
  SIGNUP,
  FORGOT_PWD,
  PROFILE_PREFERENCE,
  CREATE_ACCOUNT,
  RESEND_VERIFY_LINK,
  CREATE_TOKEN_FOR_ACCOUNT,
  JOIN_ACCOUNT,
  BROWSE_ACCOUNT,
  SET_DEFAULT_ACCOUNT,
  VERIFY_ACCOUNT,
  INVITES_LIST,
  ACCEPT_INVITED_ACCOUNT,
} from '../constants/login.constants';

export function signup(payload, callback = (obj) => {}) {
  return {
    type: SIGNUP,
    payload,
    callback,
  };
}

export function createAccount(payload, callback = (obj) => {}) {
  return {
    type: CREATE_ACCOUNT,
    payload,
    callback,
  };
}

export function getInvitiesList(payload) {
  return {
    type: INVITES_LIST,
    payload,
  };
}

export function profilePreference(payload, callback = (obj) => {}) {
  return {
    type: PROFILE_PREFERENCE,
    payload,
    callback,
  };
}

export function SSOLogin(payload) {
  return {
    type: SSO_LOGIN,
    payload,
  };
}

export function joinAccount(payload, callback = (obj) => {}) {
  return {
    type: JOIN_ACCOUNT,
    payload,
    callback,
  };
}

export function createTokenForAccount(payload) {
  return {
    type: CREATE_TOKEN_FOR_ACCOUNT,
    payload,
  };
}

export function PasswordLogin(payload) {
  return {
    type: PWD_LOGIN,
    payload,
  };
}

export function browseAccount(callback = (obj) => {}) {
  return {
    type: BROWSE_ACCOUNT,
    callback,
  };
}

export function forgotPassword(payload, callback = (obj) => {}) {
  return {
    type: FORGOT_PWD,
    payload,
    callback,
  };
}

export function setDefaultAccount(payload, callback = (obj) => {}) {
  return {
    type: SET_DEFAULT_ACCOUNT,
    payload,
    callback,
  };
}

export function verifyAccount(payload, callback = (obj) => {}) {
  return {
    type: VERIFY_ACCOUNT,
    payload,
    callback,
  };
}

export function acceptInvitedAccount(payload, callback = (obj) => {}) {
  return {
    type: ACCEPT_INVITED_ACCOUNT,
    payload,
    callback,
  };
}

export function resetPassword(payload, callback = (obj) => {}) {
  return {
    type: PWD_RESET,
    payload,
    callback,
  };
}

export function resendVerificationLink(payload, callback = (obj) => {}) {
  return {
    type: RESEND_VERIFY_LINK,
    payload,
    callback,
  };
}
