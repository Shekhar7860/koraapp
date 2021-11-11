import {all, call, put, takeLatest} from 'redux-saga/effects';
import * as Type from '../constants/auth.constants';
import {invokeAPICall} from '../../utils/invoke-api';
import API_CONST from '../../utils/api-constants';
import * as ProfileDao from '../../../dao/ProfileDao';
import * as UsersDao from '../../../dao/UsersDao';
import {ACCOUNT} from '../actions/actionTypes';

function* getKoraProfile() {
  try {
    const response = yield call(() =>
      invokeAPICall({
        url: '/api/1.1/ka/users/:userId/profile',
        method: API_CONST.GET,
      }),
    );
    let profile = yield call(ProfileDao.updateProfile, response.data);
    yield put({
      type: Type.KORA_PROFILE_SUCCESSFUL,
      payload: profile,
    });
  } catch (e) {
    yield put({
      type: Type.KORA_PROFILE_FAILURE,
      payload: e.message,
    });
  }
}

function* getAppUpdate(action) {
  const appId = action.payload.appId;
  const version = action.payload.version;
  try {
    const response = yield call(() =>
      invokeAPICall({
        url: `/api/1.1/appversionupgradestatus?appId=${appId}&version=${version}`,
        method: API_CONST.GET,
      }),
    );

    action?.updateStatus(response.data);
  } catch (e) {}
}

function* updateAppIcon(action) {
  try {
    const response = yield call(() =>
      invokeAPICall({
        url: '/api/1.1/ka/users/:userId/profile',
        method: API_CONST.PUT,
        data: action.payload,
      }),
    );

    yield call(() =>
      ProfileDao.updateIconProfile(action.profileId, action.payload.icon),
    );
    action.onSuccess('success', response.data);
  } catch (e) {
    action.onSuccess('fail', null);
  }
}

function* updateDNDProfile(action) {
  try {
    const response = yield call(() =>
      invokeAPICall({
        url: '/api/1.1/ka/users/:userId/profile',
        method: API_CONST.PUT,
        data: action.payload,
      }),
    );
    // console.log('Profile response ----->: ', JSON.stringify(response.data));
    //{"nPrefs":{"dndTill":-1}}
    ProfileDao.updateDNDProfile(
      action.profileId,
      action.payload.nPrefs.dndTill,
    );
    // ProfileDao.updateProfile(response.data);
    // yield put({
    //   type: Type.KORA_PROFILE_SUCCESSFUL,
    //   payload: response.data,
    // });
  } catch (e) {
    // yield put({
    //   type: Type.KORA_PROFILE_FAILURE,
    //   payload: e.message,
    // });
  }
}

function* getAccount() {
  const user = yield call(()=>UsersDao.getUserInfo());
  const authorization = yield call(()=>UsersDao.getAuthorization());
  if (user && authorization) {
    yield put({
      type: ACCOUNT.SUCCESS,
      user: user,
      authorization: authorization,
    });
  } else {
    yield put({
      type: ACCOUNT.FAILURE,
    });
  }
}

export function* authSaga() {
  yield all([
    takeLatest(ACCOUNT.REQUEST, getAccount),
    takeLatest(Type.KORA_PROFILE, getKoraProfile),
    takeLatest(Type.KORA_PROFILE_DND, updateDNDProfile),
    takeLatest(Type.KORA_PROFILE_ICON, updateAppIcon),
    takeLatest(Type.KORA_APP_UPDATE, getAppUpdate),
  ]);
}
