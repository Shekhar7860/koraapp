import * as Type from '../constants/message-thread.constants';
import {
  READ_NOTIFICATION,
  MessageThreadListResolve,
  NOTIFICATION_POST_RESOLVE,
  REFRESH_CHAT_SCREEN,
} from '../constants/message-thread.constants';
import * as MessagesDao from '../../../dao/MessagesDao';
import {store} from '../store';
import {call, put, takeLatest, all, select} from 'redux-saga/effects';

export function getBoardFiles(_params, payload = null) {
  return {
    type: Type.GetBoardFiles,
    _params: _params,
    payload,
  };
}

export function sendMessage(message, id, msg = null) {
  return {
    type: Type.SEND_MESSAGE,
    message,
    id,
    msg,
  };
}

export function getThreadList(_params, onThreadStatus = () => {}) {
  return {
    type: Type.MessageThreadList,
    _params: _params,
    onThreadStatus,
  };
}

export function getBoardFromDb(_params, onBoardLoadSuccess = () => {}) {
  return {
    type: Type.GET_DB_BOARD,
    _params: _params,
    onBoardLoadSuccess,
  };
}

export function resolveNotification(_params, onThreadStatus = () => {}) {
  return {
    type: MessageThreadListResolve,
    _params: _params,
    onThreadStatus,
  };
}

export function readNotification(_params,onReadStatus=()=>{}) {
  return {
    type: READ_NOTIFICATION,
    _params: _params,
    onReadStatus,
  };
}

export function resolvePostNotification(_params, onPostStatus = () => {}) {
  return {
    type: NOTIFICATION_POST_RESOLVE,
    _params: _params,
    onPostStatus,
  };
}

export function refreshChatScreen(boardId) {
  return {
    type: REFRESH_CHAT_SCREEN,
    payload: boardId,
  };
}
export function getBoardMessages(_params) {
  return {
    type: Type.GET_BOARD_MESSAGES,
    _params: _params,
  };
}
export function getBoardMessagesMoreMessagesTrue() {
  return {
    type: Type.GET_BOARD_MORE_MESSAGES_TRUE,
    payload: true,
  };
}
export function groupNameChange(_params, payload) {
  return {
    type: Type.CHANGE_GROUP_NAME,
    payload: payload,
    _params: _params,
  };
}
export function getNewChat(_param) {
  return {
    type: Type.NEWCHAT,
    _param: _param,
  };
}

export function setActiveBoard(_param) {
  return {
    type: Type.ACTIVE_BOARD,
    _param: _param,
  };
}

export function setDropdownEvent(param, payload) {
  return {
    type: Type.DROPDOWNMESSAGE,
    param,
    payload,
  };
}

export function markThreadAsStar(_params, payload) {
  return {
    type: Type.STAR_MESSAGE,
    _params: _params,
    payload: payload,
  };
}

export function universalSearchCall(params, onSuccessCB = () => {}) {
  return {
    type: Type.UNIVERSAL_SEARCH,
    params,
    onSuccessCB,
  };
}

export function setThreadList(payload) {
  return {
    type: Type.SET_THREAD_LIST,
    payload: payload,
  };
}
export function setThreadMessage(payload) {
  return {
    type: Type.SET_THREAD_MESSAGE,
    payload: payload,
  };
}

export function deleteUserChtHistry(param, fromGroupDetails = false) {
  return {
    type: Type.DELETE_USER_CHAT_MESSAGE,
    param,
    fromGroupDetails,
  };
}

export function clearUSerChatHistory(payload) {
  return {
    type: Type.CLEAR_USER_CHAT_HISTORY,
    payload: payload,
  };
}

export function deleteThreadChat(boardId, fromGroupDetails = false) {
  return {
    type: Type.DELETE_USER_CHAT_MESSAGE,
    boardId,
    fromGroupDetails,
  };
}

export function deleteGroupChat(boardId) {
  return {
    type: Type.DELETE_GROUP_CHAT,
    boardId: boardId,
  };
}

export function MuteUnmute(_params, payload, extraParams = {}) {
  return {
    type: Type.MUTE_UNMUTE_THREAD,
    _params: _params,
    payload: payload,
    ...extraParams,
  };
}

export function markBoardAsSeen(_params, payload) {
  return {
    type: Type.MARK_BOARD_AS_READ,
    _params: _params,
    payload: payload,
  };
}

export function deleteUserFromGrup(_params, payload, onSuccess = () => {}) {
  return {
    type: Type.DELETE_USER_FROM_GROUP,
    payload: payload,
    _params: _params,
    onSuccess,
  };
}

export function markUnreadThread(_params, payload) {
  return {
    type: Type.MARK_UNREAD_THREAD,
    _params: _params,
    payload: payload,
  };
}
export function getOnlyThreadList(_params) {
  return {
    type: Type.OnlyThreadList,
    _params: _params,
  };
}

export function messageResolve(_params, payload, callback = () => {}) {
  return {
    type: Type.MESSAGE_RESOLVE,
    _params: _params,
    payload: payload,
    callback,
  };
}

export function threadResolve(_params) {
  return {
    type: Type.THREAD_RESOLVE,
    _params: _params,
  };
}

export function deleteMessageNew(_params, callback = () => {}) {
  return {
    type: Type.DELETE_MESSAGE_NEW,
    _params: _params,
    callback,
    //message: message,
  };
}

export function deleteMessageForEveryoneNew(_params, callback = () => {}) {
  //  console.log("deleteMessageForEveryoneNew action called  _params  ->:",_params);
  return {
    type: Type.DELETE_MESSAGE_EVERYONE_NEW,
    _params: _params,
    callback,
    //payload: payload,
    //message: message,
  };
}

export function updateMessage(payload, t = '') {
  return {
    type: Type.UPDATE_MESSAGE,
    payload: payload,
    t: t,
  };
}

export function getmessageAvailability(payload) {
  return {
    type: Type.MESSAGE_AVAILABILITY,
    payload,
  };
}

export function setForwardSelectedMessageID(payload) {
  return {
    type: Type.SET_FORWARD_MESSAGE_ID,
    payload,
  };
}

export function getGoToPost(payload) {
  return {
    type: Type.GET_GO_TO_POST,
    payload,
  };
}

export function getGoToMessage(payload) {
  return {
    type: Type.GET_GO_TO_MESSAGE,
    payload,
  };
}

export function setGotoMessages(payload) {
  return {
    type: Type.SET_GO_TO_MESSAGE,
    payload,
  };
}

export function scrollToMessage(payload) {
  return {
    type: Type.SCROLL_TO_MESSAGE,
    payload,
  };
}

export function deleteConversation(payload) {
  return {
    type: Type.DELETE_CONVERSATION,
    payload,
  };
}

export function getMessages(payload) {
  return {
    type: Type.GET_MESSAGES,
  };
}

export function addMessageEventListener(boardId, boardClientId) {
  return {
    type: Type.ADD_MESSAGES_LISTENER,
    boardId: boardId,
    boardClientId: boardClientId,
  };
}

export function removeMessageEventListener() {
  return {
    type: Type.REMOVE_MESSAGES_LISTENER,
  };
}
