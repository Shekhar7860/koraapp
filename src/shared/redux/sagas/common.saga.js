import {all, call, put, takeLatest} from 'redux-saga/effects';
import {invokeAPICall} from '../../utils/invoke-api';
import API_CONST from '../../utils/api-constants';
import {
  PROCESS_IMAGE_URL,
  PROCESSED_IMAGE_URL,
} from '../constants/common.constants';

function* processLinkImage(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/1.1/ka/users/:userId/link/upload',
      method: API_CONST.POST,
      data: action.payload,
    });
    console.log('Common');
    yield put({
      type: PROCESSED_IMAGE_URL,
      payload: response.data,
    });
  } catch (e) {
    yield put({
      type: PROCESSED_IMAGE_URL,
      payload: e,
    });
  }
}

export function* commonSaga() {
  yield all([takeLatest(PROCESS_IMAGE_URL, processLinkImage)]);
}
