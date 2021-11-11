import {
  SET_SEARCH_HEADER_TEXT,
  SET_SEARCH_HEADER_MODE,
  SET_SHARE_EXTENSION_DATA,
  SET_NO_NETWORK_HEIGHT,
  TOGGLE_EXCEPTION_LIST_ITEM,
  SET_EXCEPTION_LIST,
  SET_SEARCH_CANCEL_ACTION,
  NATIVE_LOADER,
  UPDATE_NEW_WS_REQ_BODY,
  SET_SEARCH_SUBMIT_ACTION,
  SET_UNIVERSAL_SEARCH_FILTER_DATA,
  SET_POST_ID,
  SET_COMMENT_ID,
} from '../constants/native.constants';

export function setSearchHeaderText(text = '') {
  return {
    type: SET_SEARCH_HEADER_TEXT,
    payload: text,
  };
}

export function setShareExtensionData(data = []) {
  return {
    type: SET_SHARE_EXTENSION_DATA,
    payload: data,
  };
}

export function setNoNetworkHeight(height = 0) {
  return {
    type: SET_NO_NETWORK_HEIGHT,
    payload: height,
  };
}

export function setUniversalSearchFilterData(data = []) {
  return {
    type: SET_UNIVERSAL_SEARCH_FILTER_DATA,
    payload: data,
  };
}

export function searchHeaderCancelAction(press = false) {
  return {
    type: SET_SEARCH_CANCEL_ACTION,
    payload: press,
  };
}

export function searchHeaderSubmitAction(press) {
  return {
    type: SET_SEARCH_SUBMIT_ACTION,
    payload: press,
  };
}

export function setSearchHeaderMode(mode = false) {
  return {
    type: SET_SEARCH_HEADER_MODE,
    payload: mode,
  };
}

export function toggleExceptionListItem(id) {
  return {
    type: TOGGLE_EXCEPTION_LIST_ITEM,
    payload: id,
  };
}

export function setExceptionList(list) {
  return {
    type: SET_EXCEPTION_LIST,
    payload: list,
  };
}

export function setNativeLoader(key, value = null) {
  return {
    type: NATIVE_LOADER,
    payload: {key, value},
  };
}

export function setNewWSReqBody(payload = null) {
  return {
    type: UPDATE_NEW_WS_REQ_BODY,
    payload,
  };
}

export function setPostId(postId) {
  return {
    type: SET_POST_ID,
    postId,
  };
}

export function setCommentId(commentId) {
  return {
    type: SET_COMMENT_ID,
    commentId,
  };
}
