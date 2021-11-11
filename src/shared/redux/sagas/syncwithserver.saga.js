import {all, call, put, takeLatest} from 'redux-saga/effects';
import * as BoardsDao from '../../../dao/BoardsDao';
import * as WorkspacesDao from '../../../dao/WorkspacesDao';
import * as Type from '../constants/syncwithserver.constants';
import {invokeAPICall} from '../../utils/invoke-api';
import API_CONST from '../../utils/api-constants';
import {setNativeLoader} from '../actions/native.action';
import {initialSync} from '../../../dao/Sync';

import {INITIAL_SYNC, SET_MESSAGE_BOARDS} from '../constants/native.constants';
import {getWsListLayout} from '../actions/workspace.action';

function* startInitialSync() {
  yield put(setNativeLoader(INITIAL_SYNC, true));
  yield put({
    type: Type.WS_INITIAL_LOADED,
    payload: false,
  });
  try {
    const [msgBoardsInitialSync, wsSync, wsBoardsSync] = yield all([
      call(() =>
        invokeAPICall({
          url: '/api/1.1/ka/users/:userId/message_boards?limit=20',
          method: API_CONST.GET,
        }),
      ),
      call(() =>
        invokeAPICall({
          url: '/api/1.1/ka/users/:userId/ws/all',
          method: API_CONST.GET,
        }),
      ),
      call(() =>
        invokeAPICall({
          url: '/api/1.1/ka/users/:userId/ws_boards/',
          method: API_CONST.GET,
        }),
      ),
    ]);
    let msgBoardsData = msgBoardsInitialSync?.data;
    let wsData = wsSync?.data;
    let wsBoardsData = wsBoardsSync?.data;

    yield call(initialSync, {
      msgBoardsData: msgBoardsData,
      wsData: wsData,
      wsBoardsData: wsBoardsData,
    });
    yield put(getWsListLayout());
    yield put({
      type: SET_MESSAGE_BOARDS,
      payload: msgBoardsInitialSync?.data,
    });

    yield put({
      type: Type.WS_INITIAL_LOADED,
      payload: true,
    });
    yield put(setNativeLoader(INITIAL_SYNC, false));
  } catch (e) {
    yield put(setNativeLoader(INITIAL_SYNC, false));
    console.error('startInitialSync', e);
  }
}

function* startLaterSync(action) {
  let isInitHappened = false;
  const lModified = yield call(BoardsDao.getLatestModified);
  var qpm;
  if (lModified) {
    qpm = '?since=' + lModified.toISOString();
  } else {
    isInitHappened = true;
    qpm = '?limit=20';
  }

  const wsLModified = yield call(WorkspacesDao.getWSLastModified);
  let wsqpm;
  if (wsLModified) {
    wsqpm = '?since=' + wsLModified.toISOString();
  } else {
    wsqpm = '';
  }

  try {
    const [msgBoardsInitialSync, wsSync, wsBoardsSync] = yield all([
      call(() =>
        invokeAPICall({
          url: '/api/1.1/ka/users/:userId/message_boards' + qpm,
          method: API_CONST.GET,
        }),
      ),
      call(() =>
        invokeAPICall({
          url: '/api/1.1/ka/users/:userId/ws/all',
          method: API_CONST.GET,
        }),
      ),
      call(() =>
        invokeAPICall({
          url: '/api/1.1/ka/users/:userId/ws_boards' + wsqpm,
          method: API_CONST.GET,
        }),
      ),
    ]);

    let msgBoardsData = msgBoardsInitialSync?.data;
    let wsData = wsSync?.data;
    let wsBoardsData = wsBoardsSync?.data;

    yield call(initialSync, {
      msgBoardsData: msgBoardsData,
      wsData: wsData,
      wsBoardsData: wsBoardsData,
    });
    yield put({
      type: SET_MESSAGE_BOARDS,
      payload: msgBoardsInitialSync?.data,
    });
  } catch (e) {
    console.error('startInitialSync', e);
  }

  if (action.params.shouldSendUpdate) {
    yield put({
      type: Type.WS_INITIAL_LOADED,
      payload: true,
    });
    yield put(getWsListLayout());
  }
  yield put(setNativeLoader(INITIAL_SYNC, false));
}

export function* syncWithServer() {
  yield all([
    takeLatest(Type.GET_INITSYNC_RESULTS, startInitialSync),
    takeLatest(Type.GET_LATERSYNC_RESULTS, startLaterSync),
  ]);
}
