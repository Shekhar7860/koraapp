import {all, put, takeLatest} from 'redux-saga/effects';
import * as Type from '../constants/userLog.constants';

function* getUserLog(action) {
  yield put({
    type: Type.USER_LOG_SUCCESSFUL,
    payload: action.payload,
  });
}

function* getChatTimeStamp(action) {
  yield put({
    type: Type.CHAT_TIMESTAMP_SUCCESSFUL,
    payload: action.payload,
  });
}

export function* userLogSaga() {
  yield all([
    takeLatest(Type.USER_LOG, getUserLog),
    takeLatest(Type.CHAT_TIMESTAMP, getChatTimeStamp),
  ]);
}
