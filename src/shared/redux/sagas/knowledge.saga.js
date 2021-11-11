import {all, call, put, takeLatest, select} from 'redux-saga/effects';
import {invokeAPICall} from '../../utils/invoke-api';
import API_CONST from '../../utils/api-constants';
import * as Type from '../constants/knowledge.constants';
import UsersDao from '../../../dao/UsersDao';
import {SHOW_LOADER} from '../constants/home.constants';
import {Alert} from 'react-native';

function* getDocumentsList() {
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/1.1/ka/boards?type=document',
      method: API_CONST.GET,
    });
    yield put({
      type: Type.UPDATE_KNOWLEDGE,
      payload: response.data.boards,
    });
  } catch (e) {
    console.error(e);
  }
}

function* getComments(action) {
  console.log('Action', action);
  try {
    const response = yield call(invokeAPICall, {
      url: `api/1.1/ka/boards/${action._params}/posts`,
      method: API_CONST.GET,
    });
    yield put({
      type: Type.GET_DOC_COMMENTS_SUCCESSFUL,
      payload: response.data,
    });
  } catch (e) {
    console.error(e);
  }
}

function* getReplies(action) {
  try {
    const response = yield call(invokeAPICall, {
      url:
        '/api/1.1/ka/boards/' +
        action._params.boardId +
        '/posts/' +
        action._params.postId +
        '/comments',
      method: API_CONST.GET,
    });
    yield put({
      type: Type.GET_DOC_REPLY_SUCCESSFUL,
      payload: response.data,
    });
  } catch (e) {
    console.error(e);
  }
}

function* addReply(action) {
  try {
    const response = yield call(invokeAPICall, {
      url:
        '/api/1.1/ka/boards/' +
        action._params.boardId +
        '/posts/' +
        action._params.postId +
        '/comments',
      method: API_CONST.POST,
      data: action.payload,
    });
    yield put({
      type: Type.ADD_REPLY_SUCCESSFUL,
      payload: response.data,
    });
  } catch (e) {
    console.error(e);
  }
}

function* resolvePost(action) {
  try {
    const response = yield call(invokeAPICall, {
      url:
        '/api/1.1/ka/boards/' +
        action._params.boardId +
        '/posts/' +
        action._params.postId +
        '/comments',
      method: API_CONST.POST,
      data: action.payload,
    });
    if (response.data) {
      yield put({
        type: Type.RESOLVE_POST_SUCCESSFUL,
        payload: response.data,
      });
    }
  } catch (e) {
    console.log(e);
  }
}

export function* knowledgeSaga() {
  yield all([takeLatest(Type.GET_KNOWLEDGE_LIST, getDocumentsList)]);
  yield all([takeLatest(Type.GET_DOC_COMMENTS, getComments)]);
  yield all([takeLatest(Type.GET_DOC_COMMENT_REPLY, getReplies)]);
  yield all([takeLatest(Type.ADD_REPLY, addReply)]);
  yield all([takeLatest(Type.KNOWLEDGE_RESOLVE_POST, resolvePost)]);
}
