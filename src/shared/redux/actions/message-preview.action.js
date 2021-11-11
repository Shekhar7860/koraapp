import * as Type from '../constants/message-preview.constants';

export function createThread(message) {
  return {
    type: Type.CREATE_THREAD,
    message,
  };
}
export function createNewThread(_params, onCreateNewThread = () => {}) {
  return {
    type: Type.CREATE_NEW_THREAD,
    _params: _params,
    onCreateNewThread,
  };
}

export function saveThread(
  message,
  id,
  msg = null,
  onSaveThreadStatus = () => {},
) {
  return {
    type: Type.SAVE_THREAD,
    message,
    id,
    msg,
    onSaveThreadStatus,
  };
}
export function downloadAtatchment(_params, cb = null) {
  return {
    type: Type.DOWNLOAD_ATTACHMENT,
    _params: _params,
    callBack: cb,
  };
}
export function showMsgTraceInfo(_params) {
  return {
    type: Type.MESSAGETRACE_INFO_ACTION,
    _params: _params,
  };
}
export function recallMessage(_params) {
  return {
    type: Type.RECALLMESSAGE,
    _params: _params,
  };
}

export function searchModeOn() {
  return {
    type: Type.SEARCH_MODE_ON,
  };
}

export function searchModeOff() {
  return {
    type: Type.SEARCH_MODE_OFF,
  };
}

export function sendParticipantBack(data) {
  return {
    type: Type.SEND_PARTICIPANTS_BACK,
    payload: data,
  };
}

export function addParticipants(_params, payload, extraParams = {}) {
  return {
    type: Type.ADD_PARTICIPANTS,
    payload: payload,
    _params: _params,
    ...extraParams,
  };
}

export function storeForwardMessage(payload) {
  return {
    type: Type.STORE_FORWARD_MESSAGE,
    payload: payload,
  };
}

export function forwardMessage(payload, onSuccessCB = () => {}) {
  return {
    type: Type.FORWARD_MESSAGE,
    payload: payload,
    onSuccessCB,
  };
}

export function reactMessage(_params, payload) {
  return {
    type: Type.REACT_MESSAGE,
    payload: payload,
    _params: _params,
  };
}

export function replyTo(payload = null) {
  return {
    type: Type.REPLY_TO,
    payload,
  };
}

export function replyToPrivate(payload = null) {
  return {
    type: Type.REPLY_TO_PRIVATE_ACTION,
    payload,
  };
}

export function setMessageReminder(_params, payload, onSuccessCB = () => {}) {
  return {
    type: Type.SET_MESSAGE_REMINDER,
    _params,
    payload,
    onSuccessCB,
  };
}

export function deleteMessageReminder(
  _params,
  payload,
  onSuccessCB = () => {},
) {
  return {
    type: Type.DELETE_MESSAGE_REMINDER,
    _params,
    payload,
    onSuccessCB,
  };
}
