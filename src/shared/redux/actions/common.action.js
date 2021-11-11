import * as Type from '../constants/common.constants';

export function processLinkImage(imageUrl) {
  return {
    type: Type.PROCESS_IMAGE_URL,
    payload: imageUrl,
  };
}

export function setToastMessage(data) {
  return {
    type: Type.TOAST_MESSAGE,
    payload: data,
  };
}

export function resetToastMessage() {
  return {
    type: Type.TOAST_MESSAGE,
    payload: null,
  };
}

export function loader(payload) {
  return {
    type: Type.LOADER,
    payload,
  };
}

export function setActiveWsId(payload) {
  return {
      type: Type.ACTIVE_WS_ID,
      payload
  }
}

export function setActiveTab(payload) {
  return {
      type: Type.ACTIVE_TAB,
      payload
  }
}
