import {all, call, put, takeLatest} from 'redux-saga/effects';
import {invokeAPICall} from '../../utils/invoke-api';
import API_CONST from '../../utils/api-constants';
import * as Type from '../constants/login.constants';
import * as UsersDao from '../../../dao/UsersDao';
import {ACCOUNT} from '../actions/actionTypes';

//worker functions
function* userLogin(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: 'api/1.1/check_id_status?emailId=' + action.emailId,
      method: API_CONST.GET,
    });

    yield put({
      type: Type.LOGIN_SUCCESSFUL,
      payload: response.data,
    });
  } catch (e) {
    yield put({
      type: Type.LOGIN_FAILURE,
      payload: e.message,
    });
  }
}

// function* ssoLogin(action) {
//   try {
//     //api call
//     const response = yield call(() =>
//       invokeAPICall({
//         url: '/api/1.1/sso/login',
//         method: API_CONST.POST,
//         data: action.payload,
//       }),
//     );
//     if (response && response.data) {
//       let user = yield call(UsersDao.insertUserInfo, response.data.userInfo);
//       let authorization = yield call(
//         UsersDao.insertAuthorization,
//         response.data.authorization,
//       );
//       yield put({
//         type: ACCOUNT.SUCCESS,
//         user: user,
//         authorization: authorization,
//       });
//     }
//   } catch (e) {
//     yield put({
//       type: Type.SSO_LOGIN_FAILURE,
//       payload: e.message,
//     });
//   }
// }

// function* passwordLogin(action) {
//   try {
//     //api call
//     const response = yield call(invokeAPICall, {
//       url: '/api/1.1/oAuth/token',
//       method: API_CONST.POST,
//       data: action.payload,
//     });
//     if (response && response.data) {
//       let user = yield call(UsersDao.insertUserInfo, response.data.userInfo);
//       let authorization = yield call(
//         UsersDao.insertAuthorization,
//         response.data.authorization,
//       );
//       yield put({
//         type: ACCOUNT.SUCCESS,
//         user: user,
//         authorization: authorization,
//       });
//     }
//   } catch (e) {
//     yield put({
//       type: Type.PWD_LOGIN_FAILURE,
//       payload: e.message,
//     });
//   }
// }

// function* resetPassword(action) {
//   try {
//     //api call
//     const response = yield call(invokeAPICall, {
//       url: '/api/1.1/passwordReset',
//       method: API_CONST.POST,
//       data: action.payload,
//     });
//     yield put({
//       type: Type.PWD_RESET_SUCCESSFUL,
//       payload: response.data,
//     });
//   } catch (e) {
//     yield put({
//       type: Type.PWD_RESET_FAILURE,
//       payload: e.message,
//     });
//   }
// }

//watcher function
export function* loginSaga() {
  yield all([
    takeLatest(Type.LOGIN, userLogin),
    // takeLatest(Type.SSO_LOGIN, ssoLogin),
    // takeLatest(Type.PWD_LOGIN, passwordLogin),
    // takeLatest(Type.PWD_RESET, resetPassword),
  ]);
}
