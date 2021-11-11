import axios from './axios.js';
import API_CONST from './api-constants';

export function invokeAPICall(callOptions) {
  const {url, data, method, contentType, useAuth, accept, session} =
    callOptions;

  // Adding headers to the API calls.
  const headers = {};
  if (useAuth) {
    headers.Authorization = useAuth || '';
  }
  if (session) {
    headers.session = session || '';
  }
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  if (accept) {
    headers.Accept = accept;
  }

  switch (method) {
    case API_CONST.GET:
      return axios.get(url, {headers, handlerEnabled: false});

    case API_CONST.POST:
      return axios.post(url, data, {headers, handlerEnabled: false});

    case API_CONST.PATCH:
      return axios.patch(url, data, {headers, handlerEnabled: false});

    case API_CONST.PUT:
      return axios.put(url, data, {headers, handlerEnabled: false});

    case API_CONST.DELETE:
      return axios.delete(url, {headers, handlerEnabled: false});

    default:
  }
}
