import * as Type from '../constants/message-board.constants';
import {CREATE_NEW_BOARD, MARK_MSGS_READ, MARK_POSTS_READ, QUERY_ITEM} from '../actions/actionTypes';

export function getMessageBoardsAction() {
  return {
    type: Type.GET_MESSAGE_BOARDS,
  };
}

export function getBoards(_params) {
  return {
    type: Type.GET_BOARDS,
    _params: _params,
  };
}

export function getAllBoards(_params) {
  return {
    type: Type.GET_BOARDS,
    _params: _params,
  };
}

export function getChatBoards() {
  return {
    type: Type.GET_CHAT_BOARDS,
  };
}

export function getUnreadBoards() {
  return {
    type: Type.GET_UNREAD_BOARDS,
  };
}

export function getMutedBoards() {
  return {
    type: Type.GET_MUTED_BOARDS,
  };
}

export function getShareBoards(_params) {
  return {
    type: Type.GET_SHARE_BOARDS,
    _params: _params,
  };
}

export function getStarredBoards() {
  return {
    type: Type.GET_STARRED_BOARDS,
  };
}

export function updateMessageBoard(payload) {
  return {
    type: Type.UPDATE_MESSAGE_BOARD,
    payload: payload,
  };
}

export function addBoardsListener(params) {
  return {
    type: Type.ADD_BOARDS_LISTENER,
    params: params,
  };
}

export function startOrStopTrackingMsgBoards(params) {
  return {
    type: Type.UPDATE_MSG_BOARDS_TRACKING,
    params: params,
  };
}

export function createNewBoard(boardId) {
  return {
    type: CREATE_NEW_BOARD.REQUEST,
    boardId: boardId,
  };
}

export function markMessagesAsRead(params) {
  return {
    type: MARK_MSGS_READ.REQUEST,
    params: params,
  };
}

export function markPostsAsRead(params) {
  return {
    type: MARK_POSTS_READ.REQUEST,
    params: params,
  };
}

export function getQueryItem(filter) {
  return {
    type: QUERY_ITEM.REQUEST,
    filter: filter,
  };
}