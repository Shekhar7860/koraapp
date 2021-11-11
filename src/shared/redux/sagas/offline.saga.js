import {all, call, put, select, takeLatest} from 'redux-saga/effects';
import {ADD_TO_OFFLINE_QUEUE, IS_OFFLINE} from '../constants/offline.const';
import {removeFromOfflineQueue} from '../actions/offline.action';
import {invokeAPICall} from '../../utils/invoke-api';

function* runQueue(action) {
  const storedQueue = yield select((state) => state.offline.actionQueue);
  if (!action.payload && storedQueue.length) {
    // console.log(storedQueue.length, [...storedQueue]);
    for (const request of [...storedQueue]) {
      yield call(runSingleRequest, request);
    }
  }
}
function* runSingleRequest(request) {
  try {
    // const copiedParams = {...request.params};
    yield put(request.action);
    yield put(removeFromOfflineQueue(request.offlineId));
  } catch (error) {
    console.log('Error: ', error);
  }
}
export const offlineApiCall = function* (action, args) {
  const isOffline = yield select((state) => state.offline.isOffline);
  if (!isOffline) {
    return yield call(invokeAPICall, args);
  }
  return yield put({
    type: ADD_TO_OFFLINE_QUEUE,
    payload: {
      offlineId: new Date().getTime(),
      action,
      callOnDemand: args.callOnDemand,
    },
  });
};

export function* offlineSaga() {
  yield all([takeLatest(IS_OFFLINE, runQueue)]);
}
