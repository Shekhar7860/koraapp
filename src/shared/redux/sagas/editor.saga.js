import {all, call, put, takeLatest} from 'redux-saga/effects';
import * as Type from '../constants/editor.constants';
import {invokeAPICall} from '../../utils/invoke-api';
import API_CONST from '../../utils/api-constants';

function* saveDocument(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/1.1//ka/users/:userId/knowledge',
      method: API_CONST.POST,
      data: action.payload
    });
    yield put({
      type: Type.SAVE_DOCUMENT_SUCCESSFUL,
      payload: response.data,
    });
  } catch (e) {
    yield put({
      type: Type.SAVE_DOCUMENT_FAILURE,
      payload: e.message,
    });
  }
}

function* getDocument(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/1.1//ka/users/:userId/knowledge/' + action.kId,
      method: API_CONST.GET,
    });
    yield put({
      type: Type.GET_DOCUMENT_SUCCESSFUL,
      payload: response.data,
    });
  } catch (e) {
    yield put({
      type: Type.GET_DOCUMENT_FAILURE,
      payload: e.message,
    });
  }
}

function* updateDocument(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/1.1//ka/users/:userId/knowledge/' + action.kId + '/edit?autoSave=true',
      method: API_CONST.POST,
      data: action.payload
    });
    yield put({
      type: Type.UPDATE_DOCUMENT_SUCCESSFUL,
      payload: response.data,
    });
  } catch (e) {
    yield put({
      type: Type.UPDATE_DOCUMENT_FAILURE,
      payload: e.message,
    });
  }
}

function* updateComponents(action) {
  yield put({
    type: Type.UPDATE_COMPONENTS,
    components: components,
  });
}

export function* editorSaga() {
  yield all([
        takeLatest(Type.SAVE_DOCUMENT, saveDocument),
        takeLatest(Type.GET_DOCUMENT, getDocument),
        takeLatest(Type.UPDATE_DOCUMENT, updateDocument)
    ]);
}
