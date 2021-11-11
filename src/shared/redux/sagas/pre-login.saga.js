import {all, call, put, takeLatest} from 'redux-saga/effects';
import {invokeAPICall} from '../../utils/invoke-api';
import API_CONST from '../../utils/api-constants';
import * as Type from '../constants/login.constants';
import * as UsersDao from '../../../dao/UsersDao';
import * as InviteeType from '../constants/create-message.constant';
import {ACCOUNT} from '../actions/actionTypes';

function* signup(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/ka/open/signup_',
      method: API_CONST.POST,
      data: action.payload,
    });

    // console.log('signup response  --------->: ', response);
    if (action.callback) {
      action.callback({
        status: true,
        data: response.data,
      });
    }
    yield put({
      type: Type.SIGNUP_SUCCESSFUL,
      payload: response.data,
    });
  } catch (e) {
    //  console.log('signup response error  --------->: ', JSON.stringify(e?.data));
    if (action.callback) {
      action.callback({
        status: false,
        data: e?.data,
      });
    }
    yield put({
      type: Type.SIGNUP_FAILURE,
      payload: e.message,
    });
  }
}

function* createTokenForAccount(action) {
  try {
    let accId = action.payload.accountId;
    const response = yield call(invokeAPICall, {
      url: '/api/ka/accounts/' + accId + '/token',
      method: API_CONST.GET,
      // data: action.payload,
      session: action.payload.session,
    });

    //console.log('response :', response.data);
    if (response && response.data) {
      //Start
      let user = null;
      if (response.data.userInfo) {
        user = yield call(UsersDao.insertUserInfo, response.data.userInfo);
      }
      let authorization = null;
      if (response.data.authorization) {
        authorization = yield call(
          UsersDao.insertAuthorization,
          response.data.authorization,
        );
      }
      //End

      yield put({
        type: ACCOUNT.SUCCESS,
        user: user,
        authorization: authorization,
        //loginResponse: response?.data,
        //emailId: action.payload?.emailId,
        loginResponse: {
          ...response?.data,
          emailId: action.payload?.emailId,
        },
      });
    }
  } catch (e) {
    console.log('createTokenForAccount error :', e);
    yield put({
      type: Type.SSO_LOGIN_FAILURE,
      payload: e.message,
    });
  }
}

function* SSOLogin(action) {
  // console.log('SSOLogin action called  :', action);
  try {
    //api call
    const response = yield call(() =>
      invokeAPICall({
        url: '/api/sso/login',
        method: API_CONST.POST,
        data: action.payload,
      }),
    );
    // console.log(
    //   'SSOLogin response  ----> :',
    //   JSON.stringify(response?.data),
    // );
    if (response && response.data) {
      //Start
      let user = null;
      if (response.data.userInfo) {
        user = yield call(UsersDao.insertUserInfo, response.data.userInfo);
      }
      let authorization = null;
      if (response.data.authorization) {
        authorization = yield call(
          UsersDao.insertAuthorization,
          response.data.authorization,
        );
      }
      //End
      yield put({
        type: ACCOUNT.SUCCESS,
        user: user,
        authorization: authorization,
        //loginResponse: response?.data,
        //emailId: action.payload?.emailId
        loginResponse: {
          ...response?.data,
          emailId: action.payload?.emailId,
        },
      });
    }
  } catch (e) {
    console.log('error :', e);
    yield put({
      type: Type.SSO_LOGIN_FAILURE,
      payload: e.message,
    });
  }
}

function* PasswordLogin(action) {
  console.log('PasswordLogin action called  :', action);
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/ka/oAuth/token',
      method: API_CONST.POST,
      data: action.payload,
    });
    console.log(
      'passwordLogin response  ----> :',
      JSON.stringify(response?.data),
    );
    if (response && response.data) {
      //Start
      let user = null;
      if (response.data.userInfo) {
        user = yield call(UsersDao.insertUserInfo, response.data.userInfo);
      }
      let authorization = null;
      if (response.data.authorization) {
        authorization = yield call(
          UsersDao.insertAuthorization,
          response.data.authorization,
        );
      }
      //End

      yield put({
        type: ACCOUNT.SUCCESS,
        // user: response.data.userInfo,
        // authorization: response.data.authorization,
        user: user,
        authorization: authorization,
        loginResponse: {
          ...response?.data,
          emailId: action.payload?.username,
        },
      });
    }
  } catch (e) {
    console.log('passwordLogin error ----> :', e);
    yield put({
      type: Type.PWD_LOGIN_FAILURE,
      payload: e?.data,
    });
  }
}

function* forgotPassword(action) {
  try {
    //api call
    const response = yield call(invokeAPICall, {
      url: '/api/ka/passwordReset',
      method: API_CONST.POST,
      data: action.payload,
    });
    // console.log(
    //   'passwordLogin response  ----> :',
    //   JSON.stringify(response?.data),
    // );
    if (action.callback) {
      action.callback({
        status: true,
        data: response.data,
      });
    }
    yield put({
      type: Type.FORGOT_PWD_SUCCESSFUL,
      payload: response?.data,
    });
  } catch (e) {
    console.log('resetPassword response error  --------->: ', e);
    if (action.callback) {
      action.callback({
        status: false,
        data: e?.data,
      });
    }
    yield put({
      type: Type.FORGOT_PWD_FAILURE,
      payload: e?.data,
    });
  }
}

function* resetPassword(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: 'api/ka/passwordReset/:token',
      method: API_CONST.GET,
    });

    if (action.callback) {
      action.callback({
        status: true,
        data: response.data,
      });
    }
    yield put({
      type: Type.PWD_RESET_SUCCESSFUL,
      payload: response?.data,
    });
  } catch (e) {
    if (action.callback) {
      action.callback({
        status: false,
        data: e?.data,
      });
    }
    yield put({
      type: Type.PWD_RESET_FAILURE,
      payload: e?.data,
    });
  }
}

function* setProfilePreference(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/ka/accounts/profilepref',
      method: API_CONST.PUT,
      data: action.payload.payload,
      session: action.payload.session,
    });

    //console.log('setProfilePreference response  --------->: ', response);
    if (action.callback) {
      action.callback({
        status: true,
        data: response.data,
      });
    }
  } catch (e) {
    console.log('setProfilePreference response  error --------->: ', e);
    if (action.callback) {
      action.callback({
        status: false,
        data: e?.data,
      });
    }
  }
}

function* createAccount(action) {
  //  console.log('createAccount action  --------->: ', action);
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/ka/accounts',
      method: API_CONST.POST,
      data: action.payload.payload,
      session: action.payload.session,
    });

    //console.log('createAccount response  --------->: ', response);
    if (action.callback) {
      action.callback({
        status: true,
        data: response.data,
        // session: action.payload.session,
      });
    }
  } catch (e) {
    console.log('createAccount response error  --------->: ', e);
    if (action.callback) {
      action.callback({
        status: false,
        data: e?.data,
      });
    }
  }
}

function* resendVerificationLink(action) {
  // console.log('resendVerificationLink action  --------->: ', action);
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/ka/open/resend',
      method: API_CONST.POST,
      data: action.payload,
    });

    // console.log('resendVerificationLink response  --------->: ', response.data);
    if (action.callback) {
      action.callback({
        status: true,
        data: response.data,
      });
    }
  } catch (e) {
    // console.log(
    //   'resendVerificationLink response error  --------->: ',
    //   JSON.stringify(e),
    // );
    if (action.callback) {
      action.callback({
        status: false,
        data: e?.data,
      });
    }
  }
}
// /ka/accounts/:accId/join

function* joinAccount(action) {
  console.log('joinAccount action  --------->: ', action);
  try {
    let accId = action.payload.accountId;
    const response = yield call(invokeAPICall, {
      url: '/api/ka/accounts/' + accId + '/join',
      method: API_CONST.POST,
      // data: action.payload,
      session: action.payload.session,
    });

    console.log(
      'joinAccount response  ----> :',
      JSON.stringify(response?.data),
    );
    if (response && response.data) {
      //Start
      let user = null;
      if (response.data.userInfo) {
        user = yield call(UsersDao.insertUserInfo, response.data.userInfo);
      }
      let authorization = null;
      if (response.data.authorization) {
        authorization = yield call(
          UsersDao.insertAuthorization,
          response.data.authorization,
        );
      }
      //End
      yield put({
        type: ACCOUNT.SUCCESS,
        user: user,
        authorization: authorization,
        loginResponse: {
          ...response?.data,
          emailId: action.payload?.emailId,
        },
      });
    }
  } catch (e) {
    // console.log('joinAccount error ----> :', e);
    if (action.callback) {
      action.callback({
        status: false,
        data: e?.data,
      });
    }
    yield put({
      type: Type.JOIN_ACCOUNT_FAILURE,
      payload: e?.data,
    });
  }
}

function* browseAccount(action) {
  console.log('browseaccount action  --------->: ', action);
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/ka/users/:userId/browseaccount',
      method: API_CONST.GET,
    });

    console.log(
      'browseaccount response  ----> :',
      JSON.stringify(response?.data),
    );
    if (response && response.data) {
      if (action.callback) {
        action.callback({
          status: true,
          data: response.data,
        });
      }
      // yield put({
      //   type: Type.BROWSE_ACCOUNT_SUCCESSFUL,
      //   accounts: response?.data,
      // });
    }
  } catch (e) {
    console.log('joinAccount error ----> :', e);
    if (action.callback) {
      action.callback({
        status: false,
        data: e?.data,
      });
    }
    // yield put({
    //   type: Type.BROWSE_ACCOUNT_FAILURE,
    //   payload: e?.data,
    // });
  }
}

function* setDefaultAccount(action) {
  console.log('setDefaultAccount action  --------->: ', action);
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/ka/users/:userId/accountpref',
      method: API_CONST.PUT,
      data: action.payload,
    });

    console.log('setDefaultAccount response  --------->: ', response);
    if (action.callback) {
      action.callback({
        status: true,
        data: response.data,
      });
    }
  } catch (e) {
    console.log('setDefaultAccount response error  --------->: ', e);
    if (action.callback) {
      action.callback({
        status: false,
        data: e?.data,
      });
    }
  }
}

function* verifyAccount(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/ka/open/account/verify',
      method: API_CONST.PUT,
      data: action.payload,
    });

    console.log('verifyAccount response  --------->: ', response);
    if (action.callback) {
      action.callback({
        status: true,
        data: response.data,
      });
    }
  } catch (e) {
    console.log('verifyAccount response  error --------->: ', e);
    if (action.callback) {
      action.callback({
        status: false,
        data: e?.data,
      });
    }
  }
}

//worker functions
function* getInvitiesList(action) {
  try {
    let userId = 'u-caab71e7-c19d-5956-baeb-1603de701890';
    const response = yield call(invokeAPICall, {
      url:
        '/api/1.1/ka/users/' +
        userId +
        '/entities/contacts?q=' +
        action.payload +
        '&rnd=kd0oap',
      method: API_CONST.GET,
    });
    console.log('getInvitiesList response   ------>:', response.data);
    yield put({
      type: InviteeType.CONTACT_LIST_SUCCESSFUL,
      payload: response.data,
    });
  } catch (e) {
    console.log('getInvitiesList response error   ------>:', JSON.stringify(e));
    yield put({
      type: InviteeType.CONTACT_LIST_FAILURE,
      payload: e.message,
    });
  }
}

function* acceptInvitedAccount(action)
{
  console.log('joinAccount action  --------->: ', action);
  try {
    let accId = action.payload.accountId;
    const response = yield call(invokeAPICall, {
      url: '/api/ka/accounts/' + accId + '/accept',
      method: API_CONST.POST,
      //data: action.payload,
      session: action.payload.session,

    });

    console.log(
      'accept invited account response  ----> :',
      JSON.stringify(response?.data),
    );
    if (response && response.data) {
      //Start
     
    }
  } catch (e) {
    
    if (action.callback) {
      action.callback({
        status: false,
        data: e?.data,
      });
    }
    
  }
}

export function* pre_loginSaga() {
  yield all([
    takeLatest(Type.SIGNUP, signup),
    takeLatest(Type.SSO_LOGIN, SSOLogin),
    takeLatest(Type.PWD_LOGIN, PasswordLogin),
    takeLatest(Type.FORGOT_PWD, forgotPassword),
    takeLatest(Type.PWD_RESET, resetPassword),
    takeLatest(Type.PROFILE_PREFERENCE, setProfilePreference),
    takeLatest(Type.CREATE_ACCOUNT, createAccount),
    takeLatest(Type.RESEND_VERIFY_LINK, resendVerificationLink),
    takeLatest(Type.CREATE_TOKEN_FOR_ACCOUNT, createTokenForAccount),
    takeLatest(Type.JOIN_ACCOUNT, joinAccount),
    takeLatest(Type.BROWSE_ACCOUNT, browseAccount),
    takeLatest(Type.SET_DEFAULT_ACCOUNT, setDefaultAccount),
    takeLatest(Type.VERIFY_ACCOUNT, verifyAccount),
    takeLatest(Type.INVITES_LIST, getInvitiesList),
    takeLatest(Type.ACCEPT_INVITED_ACCOUNT,acceptInvitedAccount)
  ]);
}
