import {call, put, takeLatest, all} from 'redux-saga/effects';
import * as Type from '../constants/message-board.constants';
import {
  CREATE_NEW_BOARD,
  MARK_MSGS_READ,
  MARK_POSTS_READ,
  QUERY_ITEM,
} from '../actions/actionTypes';
import * as BoardsDao from '../../../dao/BoardsDao';
import * as QueryItemsDao from '../../../dao/updateQueryItems';

function* getAllBoardsShare(action) {
  yield put({
    type: Type.MessageBoardsListLoading,
  });

  let boards = yield call(BoardsDao.getBoardsShare, {
    filter: action._params.queryParam,
  });
  yield put({type: Type.MessageBoardsLoaded});
  yield put({
    type: Type.GET_SHARE_BOARDS_SUCCESSFUL,
    payload: boards,
  });
}

function* getAllBoards(action) {
  yield put({
    type: Type.MessageBoardsListLoading,
  });
  yield put({
    type: Type.UPDATE_BOARDS_FILTER,
    filter: action._params.queryParam,
  });
}

function* refreshTheBoardData(action) {}

function* updateMessageBoard(action) {
  try {
    const board = yield BoardsDao.updateBoard(action.payload);
    yield put({
      type: Type.UPDATE_WORKSPACE,
      board: board,
    });
  } catch (e) {
    console.log('Unable to create/update board: ' + e);
  }
}

function* doMarkMessagesAsRead(action) {
  yield call(BoardsDao.doMarkMessagesAsRead, action.params);
  yield put({
    type: MARK_MSGS_READ.SUCCESS,
  });
}

function* doMarkPostsAsRead(action) {
  yield call(BoardsDao.doMarkPostsAsRead, action.params);
  yield put({
    type: MARK_POSTS_READ.SUCCESS,
  });
}

function* getQueryItem(action) {
  try {
    const queryItem = yield call(QueryItemsDao.getQueryItem, action.filter);
    yield put({
      type: QUERY_ITEM.SUCCESS,
      queryItem: queryItem,
    });
  } catch (e) {
    yield put({
      type: QUERY_ITEM.FAILURE,
    });
  }
}

function* createNewBoard(action) {
  if (action.boardId) {
    yield put({
      type: CREATE_NEW_BOARD.SUCCESS,
      boardId: action.boardId,
    });
  } else {
    yield put({
      type: CREATE_NEW_BOARD.FAILURE,
    });
  }
}

//watcher function
export function* createMessageBoardsSaga() {
  yield all([
    takeLatest(Type.GET_BOARDS, getAllBoards),
    takeLatest(Type.UPDATE_MESSAGE_BOARD, updateMessageBoard),
    takeLatest(Type.GET_SHARE_BOARDS, getAllBoardsShare),
    takeLatest(Type.UPDATE_MSG_BOARDS_TRACKING, refreshTheBoardData),
    takeLatest(MARK_MSGS_READ.REQUEST, doMarkMessagesAsRead),
    takeLatest(MARK_POSTS_READ.REQUEST, doMarkPostsAsRead),
    takeLatest(QUERY_ITEM.REQUEST, getQueryItem),
    takeLatest(CREATE_NEW_BOARD.REQUEST, createNewBoard),
  ]);
}
