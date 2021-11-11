import { all, call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import * as Type from '../constants/findly_notification.constants';
import { invokeAPICall } from '../../utils/invoke-api';
import API_CONST from '../../utils/api-constants';
import * as UsersDao from '../../../dao/UsersDao';


function* getFindlyNotifications(action) {
  // console.log("action --------> :", action);
  try {
    const response = yield call(invokeAPICall, {
      url:
        'api/1.1/ka/users/' +
        UsersDao.getUserId() +
        '/notifications' +
        (action?.payload?.params ? action?.payload?.params : ''),
      method: API_CONST.GET,
    });
    //console.log("response --------> :", response);
    if (response && response.data) {
      yield put({
        type: Type.FINDLY_NOTIFICATIONS_SUCCESSFUL,
        payload: response.data,
      });
    }
  } catch (e) {
    console.log("response  error--------> :", e);
    // yield put({
    //   type: Type.FINDLY_NOTIFICATIONS_FAILURE,
    //   payload: e.message,
    // });
  }
}



export function* findlyNotificationsSaga() {
  yield all([
    takeLatest(Type.FINDLY_NOTIFICATIONS, getFindlyNotifications),
  ]);
}
