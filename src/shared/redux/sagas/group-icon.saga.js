import {
  call,
  put,
  take,
  takeEvery,
  takeLatest,
  all,
  select,
} from 'redux-saga/effects';
import * as Type from '../constants/group-icon.constants';
import {invokeAPICall} from '../../utils/invoke-api';
import API_CONST from '../../utils/api-constants';

import {store} from '../../../shared/redux/store.js';
import {
  navigate,
  navigateAndReset,
  goBack,
} from '../../../native/navigation/NavigationService';
import {ROUTE_NAMES} from '../../../native/navigation/RouteNames';

//worker functions

function* groupIconUpdate(action) {
  try {
    const response = yield call(invokeAPICall, {
      url:
        '/api/1.1/ka/users/:userId/threads/' +
        action._params.threadId +
        '/settings',
      method: API_CONST.PUT,
      data: action.payload,
    });
    // console.log("---------------------------------------------------------------");
    // console.log("response.data : ",response.data);
    // console.log("---------------------------------------------------------------");

    yield put({
      type: Type.GROUP_ICON_UPDATE_SUCCESSFUL,
      payload: response.data,
    });
  } catch (e) {
    yield put({
      type: Type.GROUP_ICON_UPDATE_FAILURE,
      payload: e.message,
    });
  }
}



export function* groupIconUpdateSaga() {
  yield all([
    takeLatest(Type.GROUP_ICON_UPDATE, groupIconUpdate)
  ])
}
