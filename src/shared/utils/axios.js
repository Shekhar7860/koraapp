import Axios from 'axios';

import API_URL from '../../../env.constants.js';
import * as UsersDao from '../../dao/UsersDao';
import {SESSION_EXPIRED} from '../redux/constants/login.constants';
import {TOAST_MESSAGE} from "../redux/constants/common.constants";
const app = API_URL.appServer;
const presence = API_URL.presenceServer;
const bot = API_URL.botServer;
import {store} from '../redux/store';
const axios = Axios.create({
  baseURL: app,
});

const isIntercepted = (config = {}) => {
  return !(config.hasOwnProperty('intercepted') && !config.intercepted);
};


const resolveUrl = (toResolveUrl, values, deleteProp) => {
  const _regExToParamName = /\:([a-zA-Z]+)/g;
  return toResolveUrl.replace(_regExToParamName, function (matchStr, valName) {
    const r = values[valName];
    if (typeof r !== 'undefined' && typeof r !== null) {
      if (deleteProp) {
        delete values[valName];
      }
      return r;
    }
    return matchStr;
  });
};

const requestHandler = (request) => {
  if (isIntercepted(request)) {
    // Modify request here and play around the request.
    const authToken = UsersDao.getAccessToken();
    if (authToken) {
      const _bearer = 'bearer ' + authToken;
      // const _analyticsData =
      //   'channel=web;version=' +
      //   environment.VERSION +
      //   ';tz=' +
      //   window.jstz.determine().name() +
      //   ';';
      request.headers.Authorization = _bearer;
      // request.headers['X-KORA-Client'] = _analyticsData;
      let url = resolveUrl(
        request.url,
        {userId: UsersDao.getUserId()},
        false,
    );
    url = resolveUrl(url, {orgId: UsersDao.getOrgId()}, false);
    request.url = url;
    }
  }
  return request;
};

const errorHandler = (err) => {
  console.log('ERROR',err)
  if (err.status === 401 || err.status === 410) {
    if (err.error.errors[0].code == 61) {
      alert(
        'Change in Permissions \n Changes to your account permissions by the administrator require you to re-login. You will be logged out.',
      );
    } else {
      alert('Session expired \n To continue, please sign in again.');
    }
  }
  if (err.status === 403) {
    if (err.error.errors[0].code == 240) {
      alert(
        'Your system administrator has disabled logging in via "Desktop App" for your account. Please login on an authorized channel.',
      );
    }
  }
};

// Attaching interceptors
axios.interceptors.request.use(
  (request) => requestHandler(request),
  (error) => {},
);

axios.interceptors.response.use(
  (response) => {
      return response;
  },
  ({response}) => {
      if (response?.status === 401 || response?.status === 410) {
          if (response?.data?.errors[0]?.code == 61) {
              store.dispatch({
                  type: SESSION_EXPIRED,
                  payload:
                      "'Change in Permissions \\n Changes to your account permissions by the administrator require you to re-login. You will be logged out.'",
              });
          } else {
              store.dispatch({
                  type: SESSION_EXPIRED,
                  payload:
                      'Session expired. \nTo continue, please sign in again.',
              });
          }
      }
      if (response?.status === 403) {
          if (response?.data?.errors[0]?.code == 240) {
              store.dispatch({
                  type: SESSION_EXPIRED,
                  payload:
                      'Your system administrator has disabled logging in via "Desktop App" for your account. Please login on an authorized channel.',
              });
          }
      }
      if (!response) {
          store.dispatch({
              type: TOAST_MESSAGE,
              payload: {
                  severity: 'error',
                  detail: 'Operation failed due to network failure.',
                  life: 5000,
                  align: 'center',
              },
          });
      }
      throw response;
  },
);

export default axios;
