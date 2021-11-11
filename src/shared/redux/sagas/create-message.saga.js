import {call, put, take, takeEvery, takeLatest, all} from 'redux-saga/effects';
import * as Type from '../constants/create-message.constant';
import {invokeAPICall} from '../../utils/invoke-api';
import API_CONST from '../../utils/api-constants';
import * as UsersDao from '../../../dao/UsersDao';

//worker functions
function* getContactList(action) {
  try {
    const response = yield call(invokeAPICall, {
      url:
        '/api/1.1/ka/users/:userId/entities/contacts?q=' +
        action.payload +
        '&rnd=kd0oap',
      method: API_CONST.GET,
    });
    yield put({
      type: Type.CONTACT_LIST_SUCCESSFUL,
      payload: response.data,
    });
  } catch (e) {
    yield put({
      type: Type.CONTACT_LIST_FAILURE,
      payload: e.message,
    });
  }
}
function* getFavouriteContactList() {
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/1.1/ka/users/:userId/contacts/favourites?rnd=kd0oap',
      method: API_CONST.GET,
    });
    yield put({
      type: Type.FAVOURITE_CONTACT_LIST_SUCCESSFUL,
      payload: response.data,
    });
  } catch (e) {
    yield put({
      type: Type.FAVOURITE_CONTACT_LIST_FAILURE,
      payload: e.message,
    });
  }
}
function* getRecentContactList() {
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/1.1/ka/users/:userId/contacts/recent?rnd=kd0oap',
      method: API_CONST.GET,
    });
    yield put({
      type: Type.RECENT_CONTACT_LIST_SUCCESSFUL,
      payload:
        response.data?.contacts
          .map((obj) => ({...obj, id: obj._id, type: 'recent'}))
          .filter((obj) => obj.id !== undefined) || [],
    });
  } catch (e) {
    yield put({
      type: Type.RECENT_CONTACT_LIST_FAILURE,
      payload: e.message,
    });
  }
}

function* getSelectedContactList(action) {
  try {
    yield put({
      type: Type.SELECTED_CONTACT_LIST_SUCCESSFUL,
      payload: action.contacts,
    });
  } catch (e) {
    yield put({
      type: Type.SELECTED_CONTACT_LIST_FAILURE,
      payload: e.message,
    });
  }
}

function* getGroupName(action) {
  try {
    yield put({
      type: Type.GROUP_NAME_SUCCESSFUL,
      payload: action.grpName,
    });
  } catch (e) {
    yield put({
      type: Type.GROUP_NAME_FAILURE,
      payload: e.message,
    });
  }
}
function* getThreadFind(action) {
  try {
    const response = yield call(invokeAPICall, {
      url:
        '/api/1.1/ka/ws/:orgId/find_threads?pid=' +
        action.contact +
        '&pid=' +
        UsersDao.getUserId(),
      method: API_CONST.GET,
    });
    if (response.data.id) {
      let threadId = response.data.id;
      try {
        // const responseMessage = yield call(invokeAPICall, {
        //   url:
        //     '/api/1.1/ka/users/:userId/threads/' +
        //     threadId +
        //     '/messages/?offset=0&limit=10',
        //   method: API_CONST.GET,
        // });
        const threadResponse = yield call(invokeAPICall, {
          url: '/api/1.1/ka/boards/' + response.data.id,
          method: API_CONST.GET,
          // data: action.message,
        });
        yield put({
          type: Type.THREAD_FIND_SUCCESSFUL,
          payload: {thread: threadResponse.data},
        });
        action.onSuccessCB(Type.THREAD_FIND_SUCCESSFUL);
      } catch (e) {
        yield put({
          type: Type.GET_BOARD_MESSAGES_FAILURE,
          payload: e.message,
        });
      }
    }
    // if threadFind Data not exists, save as emty objects
    else if (response && response.data && !response.data.threadId) {
      yield put({
        type: Type.THREAD_FIND_SUCCESSFUL,
        payload: {messages: [], thread: ''},
      });
    }
  } catch (e) {
    yield put({
      type: Type.THREAD_FIND_FAILURE,
      payload: e.message,
    });
  }
}

function* getDraftArray(action) {
  try {
    yield put({
      type: Type.DRAFT_ARRAY_SUCCESSFUL,
      payload: action.draftArray,
    });
  } catch (e) {
    yield put({
      type: Type.DRAFT_ARRAY_FAILURE,
      payload: e.message,
    });
  }
}
function* getCurrentDraftId(action) {
  try {
    yield put({
      type: Type.CURRENT_DRAFT_ID_SUCCESSFUL,
      payload: action.draftId,
    });
  } catch (e) {
    yield put({
      type: Type.CURRENT_DRAFT_ID_FAILURE,
      payload: e.message,
    });
  }
}

//watcher function
export function* createMessageSaga() {
  yield all([
    takeLatest(Type.CONTACT_LIST, getContactList),
    takeLatest(Type.FAVOURITE_CONTACT_LIST, getFavouriteContactList),
    takeLatest(Type.RECENT_CONTACT_LIST, getRecentContactList),
    takeLatest(Type.SELECTED_CONTACT_LIST, getSelectedContactList),
    takeLatest(Type.GROUP_NAME, getGroupName),
    takeLatest(Type.DRAFT_ARRAY, getDraftArray),
    takeLatest(Type.THREAD_FIND, getThreadFind),
    takeLatest(Type.CURRENT_DRAFT_ID, getCurrentDraftId),
  ]);
}
