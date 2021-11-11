import * as Type from '../constants/message-preview.constants';
import {all, call, put, takeLatest} from 'redux-saga/effects';
import {invokeAPICall} from '../../utils/invoke-api';
import API_CONST from '../../utils/api-constants';
import {goBack, navigate} from '../../../native/navigation/NavigationService';
import {ROUTE_NAMES} from '../../../native/navigation/RouteNames';
import * as UsersDao from '../../../dao/UsersDao';
import * as BoardsDao from '../../../dao/BoardsDao';
import * as MessagesDao from '../../../dao/MessagesDao';
import * as PostsDao from '../../../dao/PostsDao';
import {updateMessage, updateReminder} from '../../../dao/updateMessages';

function* createNewThread(action) {
  if (action._params.isOneToOne) {
    try {
      const response = yield call(invokeAPICall, {
        url:
          '/api/1.1/ka/ws/:orgId/find_threads?pid=' +
          action._params.contact +
          '&pid=' +
          UsersDao.getUserId(),
        method: API_CONST.GET,
      });
      if (response.data.id) {
        let boardId = response.data.id;

        const createResp = yield call(invokeAPICall, {
          url: '/api/1.1/ka/boards/' + boardId + '/messages',
          method: API_CONST.POST,
          data: action._params.message,
        });

        if (createResp) {
          yield updateMessage(createResp.data.message);
          var threadResponse = yield call(invokeAPICall, {
            url: '/api/1.1/ka/boards/' + createResp.data.message.boardId,
            method: API_CONST.GET,
          });
          threadResponse.data.lastActivity = createResp.data.message;
          yield BoardsDao.updateBoard(threadResponse.data);
          if (action?.onCreateNewThread) {
            action.onCreateNewThread('success');
          }
          yield put({
            type: Type.CREATE_NEW_THREAD_SUCCESSFUL,
            payload: threadResponse.data,
          });
        }
      } else {
        try {
          const response = yield call(invokeAPICall, {
            url: '/api/1.1/ka/ws/:orgId/boards',
            method: API_CONST.POST,
            data: action._params.thread,
          });

          let boards = response.data?.boards;
          if (boards?.length > 0) {
            const msgResp = yield call(invokeAPICall, {
              url: '/api/1.1/ka/boards/' + boards[0]?.id + '/messages',
              method: API_CONST.POST,
              data: action._params.message,
            });

            if (msgResp.data && msgResp.data.message) {
              yield updateMessage(msgResp.data.message);
              var threadResponse = yield call(invokeAPICall, {
                url: '/api/1.1/ka/boards/' + msgResp.data.message?.boardId,
                method: API_CONST.GET,
              });
              threadResponse.data.lastActivity = msgResp.data.message;
              yield BoardsDao.updateBoard(threadResponse.data);
              if (action?.onCreateNewThread) {
                action.onCreateNewThread('success');
              }
              yield put({
                type: Type.CREATE_NEW_THREAD_SUCCESSFUL,
                payload: threadResponse.data,
              });
            }
          }
        } catch (e) {
          if (action?.onCreateNewThread) {
            action.onCreateNewThread('failure');
          }
          yield put({
            type: Type.CREATE_NEW_THREAD_FAILURE,
            payload: e.message,
          });
        }
      }
    } catch (e) {
      if (action?.onCreateNewThread) {
        action.onCreateNewThread('failure');
      }
      yield put({
        type: Type.CREATE_NEW_THREAD_FAILURE,
        payload: e.message,
      });
    }
  } else {
    try {
      const response = yield call(invokeAPICall, {
        url: '/api/1.1/ka/ws/:orgId/boards',
        method: API_CONST.POST,
        data: action._params.thread,
      });

      let boards = response.data?.boards;
      if (boards?.length > 0) {
        const msgResp = yield call(invokeAPICall, {
          url: '/api/1.1/ka/boards/' + boards[0]?.id + '/messages',
          method: API_CONST.POST,
          data: action._params.message,
        });

        if (msgResp.data && msgResp.data.message) {
          yield updateMessage(msgResp.data.message);
          var threadResponse = yield call(invokeAPICall, {
            url: '/api/1.1/ka/boards/' + msgResp.data.message?.boardId,
            method: API_CONST.GET,
          });
          threadResponse.data.lastActivity = msgResp.data.message;
          yield BoardsDao.updateBoard(threadResponse.data);
          if (action?.onCreateNewThread) {
            action.onCreateNewThread('success');
          }
          yield put({
            type: Type.CREATE_NEW_THREAD_SUCCESSFUL,
            payload: threadResponse.data,
          });
        }
      }
    } catch (e) {
      if (action?.onCreateNewThread) {
        action.onCreateNewThread('failure');
      }
      yield put({
        type: Type.CREATE_NEW_THREAD_FAILURE,
        payload: e.message,
      });
    }
  }
}

function* createThread(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/1.1/ka/ws/:orgId/boards',
      method: API_CONST.POST,
      data: action.message,
    });
    const threadResponse = yield call(invokeAPICall, {
      url: '/api/1.1/ka/boards/' + response.data.message.threadId,
      method: API_CONST.GET,
      data: action.message,
    });

    yield put({
      type: Type.CREATE_THREAD_SUCCESSFUL,
      payload: threadResponse.data,
    });
  } catch (e) {
    yield put({
      type: Type.CREATE_THREAD_FAILURE,
      payload: e.message,
    });
  }
}

function* saveThread(action) {
  try {
    yield put({
      type: Type.SAVE_THREAD_SENDING,
      payload: 'sending',
    });
    const response = yield call(invokeAPICall, {
      url: '/api/1.1/ka/boards/' + action.id + '/messages',
      method: API_CONST.POST,
      data: action.message,
    });
    if (response) {
      yield BoardsDao.updateLastActivity(response.data.message);
    }
    yield put({
      type: Type.SAVE_THREAD_SUCCESSFUL,
      payload: response.data,
    });
    if (action?.onSaveThreadStatus) {
      action.onSaveThreadStatus('success', response.data.message.boardId);
    }
  } catch (e) {
    if (action?.onSaveThreadStatus) {
      action.onSaveThreadStatus('fail', null);
    }
    yield put({
      type: Type.SAVE_THREAD_FAILURE,
      payload: e.message,
    });
  }
}
function* downloadAtatchment(action) {
  try {
    const response = yield call(invokeAPICall, {
      url:
        '/api/1.1/ka/users/:userId/' +
        action._params.messageId +
        '/' +
        action._params.componentFileId +
        '/signedMediaURL',
      method: API_CONST.GET,
    });
    if (action?.callBack) {
      action.callBack(response.data);
    }
    yield put({
      type: Type.DOWNLOAD_ATTACHMENT_SUCCESSFUL,
      payload: response.data,
    });
  } catch (e) {
    yield put({
      type: Type.DOWNLOAD_ATTACHMENT_FAILURE,
      payload: e.message,
    });
  }
}
function* showMsgTraceInfo(action) {
  try {
    const response = yield call(invokeAPICall, {
      url:
        '/api/1.1/ka/boards/' +
        action._params.boardId +
        '/messages/' +
        action._params.messageId +
        '/trace',
      method: API_CONST.GET,
    });
    yield put({
      type: Type.MESSAGETRACE_INFO_SUCCESSFUL,
      payload: response.data,
    });
  } catch (e) {
    yield put({
      type: Type.MESSAGETRACE_INFO_FAILURE,
      payload: e.message,
    });
  }
}
function* addParticipants(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/1.1/ka/boards/' + action._params + '/members',
      method: API_CONST.PUT,
      data: action.payload,
    });
    yield BoardsDao.updateBoardMembers(action._params, action.contacts);
    yield put({
      type: Type.ADD_PARTICIPANTS_SUCCESSFUL,
      payload: action.contacts,
    });
    if (action.goBack) {
      goBack();
    }
  } catch (e) {
    yield put({
      type: Type.ADD_PARTICIPANTS_FAILURE,
      payload: e.message,
    });
  }
}

function* recallMessage(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/1.1/ka/users/:userId/messages',
      method: API_CONST.PUT,
      data: action._params,
    });
    yield put({
      type: Type.RECALLMESSAGE_SUCCESSFUL,
      payload: response.data,
    });
  } catch (e) {
    yield put({
      type: Type.RECALLMESSAGE_FAILURE,
      payload: e.message,
    });
  }
}

function* forwardMessage(action) {
  try {
    const response = yield call(() =>
      invokeAPICall({
        url: '/api/1.1/ka/users/:userId/forward',
        method: API_CONST.POST,
        data: action.payload,
      }),
    );
    let isPost = false;
    action.onSuccessCB(Type.FORWARD_MESSAGE_SUCCESSFUL);
    if (response && response.data) {
      let messages = response.data.map((name) => {
        return name.message;
      });
      messages = messages.filter((item) => item !== null && item !== undefined);

      if (messages.length < 1 && response.data.length > 0) {
        isPost = true;
        messages = response.data;
      }

      if (messages && messages.length > 0) {
        let poppedElement = messages.pop();
        if (isPost) {
          console.log('PostsDao.updatePosts(messages)');
          yield call(() => PostsDao.updatePosts(messages));
        } else {
          console.log('MessagesDao.updateMessages(messages))');
          yield call(() => MessagesDao.updateMessages(messages));
        }

        yield call(() => BoardsDao.updateLastActivity(poppedElement, isPost));
      }
    }
    yield put({
      type: Type.FORWARD_MESSAGE_SUCCESSFUL,
      payload: response,
    });
  } catch (e) {
    yield put({
      type: Type.FORWARD_MESSAGE_FAILURE,
      payload: e,
    });
    action.onSuccessCB(Type.FORWARD_MESSAGE_FAILURE);
  }
}

function* reactMessage(action) {
  try {
    const response = yield call(invokeAPICall, {
      url:
        '/api/1.1/ka/boards/' +
        action._params.boardId +
        '/messages/' +
        action._params.messageId +
        '/actions',
      method: API_CONST.PUT,
      data: action.payload,
    });
    if (response && response.data && response.data.emotion) {
      console.log(
        'Here is the response for reaction',
        JSON.stringify(response.data),
      );
      yield call(() =>
        updateReactions(response.data.emotion, action._params.messageId),
      );
      // try {
      //   const response = yield call(invokeAPICall, {
      //     url:
      //       '/api/1.1/ka/boards/' +
      //       action._params.boardId +
      //       '/messages/' +
      //       action._params.messageId,
      //     method: API_CONST.GET,
      //   });
      //   yield put({
      //     type: Type.REACT_MESSAGE_SUCCESSFUL,
      //     payload: response.data,
      //   });
      // } catch (e) {
      //   yield put({
      //     type: Type.REACT_MESSAGE_FAILURE,
      //     payload: e.message,
      //   });
      // }
    }
    yield put({
      type: Type.REACT_MESSAGE_SUCCESSFUL,
      payload: response.data,
    });
  } catch (e) {
    yield put({
      type: Type.REACT_MESSAGE_FAILURE,
      payload: e.message,
    });
  }
}

function* setMessageReminder(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: 'api/1.1/ka/users/:userId/notifications/remind',
      method: API_CONST.POST,
      data: action.payload,
    });
    yield call(() => updateReminder(response.data, action.payload.resourceId));
    action.onSuccessCB();
    yield put({
      type: Type.SET_MESSAGE_REMINDER_SUCCESSFUL,
      payload: response.data,
    });
  } catch (e) {
    action.onSuccessCB();
    yield put({
      type: Type.SET_MESSAGE_REMINDER_FAILURE,
      payload: e,
    });
  }
}

function* deleteMessageReminder(action) {
  try {
    yield call(invokeAPICall, {
      url: `api/1.1/ka/users/:userId/notifications/remind?resourceId=${action.payload.resourceId}`,
      method: API_CONST.DELETE,
    });
    action.onSuccessCB();
  } catch (e) {
    console.log('deleteMessageReminder', e);
  }
}

function* replyToPrivate(action) {
  if (!action?.payload) {
    yield put({
      type: Type.REPLY_TO_PRIVATE,
      payload: null,
    });
    return;
  } else {
    yield put({
      type: Type.REPLY_TO_PRIVATE,
      payload: action.payload,
    });
  }
  try {
    const response = yield call(invokeAPICall, {
      url:
        '/api/1.1/ka/ws/:orgId/find_threads?pid=' +
        action.payload?.from?.id +
        '&pid=' +
        UsersDao.getUserId(),
      method: API_CONST.GET,
    });

    if (response?.data?.id) {
      let threadId = response.data.id;
      const response = yield call(invokeAPICall, {
        url: '/api/1.1/ka/boards/' + response.data.id,
        method: API_CONST.GET,
      });
    }
  } catch (e) {
    console.log('error in replyToPrivate : ', e);
  }
}

function* sendParticipantBack(action) {
  try {
    yield put({
      type: Type.SEND_PARTICIPANTS_BACK_SUCCESS,
      payload: action.payload,
    });
  } catch (e) {
    console.log('deleteMessageReminder', e);
  }
}

//watcher function
export function* MessagePreviewSaga() {
  yield all([
    takeLatest(Type.CREATE_THREAD, createThread),
    takeLatest(Type.SAVE_THREAD, saveThread),
    takeLatest(Type.DOWNLOAD_ATTACHMENT, downloadAtatchment),
    takeLatest(Type.MESSAGETRACE_INFO_ACTION, showMsgTraceInfo),
    takeLatest(Type.RECALLMESSAGE, recallMessage),
    takeLatest(Type.ADD_PARTICIPANTS, addParticipants),
    takeLatest(Type.FORWARD_MESSAGE, forwardMessage),
    takeLatest(Type.REACT_MESSAGE, reactMessage),
    takeLatest(Type.SET_MESSAGE_REMINDER, setMessageReminder),
    takeLatest(Type.DELETE_MESSAGE_REMINDER, deleteMessageReminder),
    takeLatest(Type.REPLY_TO_PRIVATE_ACTION, replyToPrivate),
    takeLatest(Type.CREATE_NEW_THREAD, createNewThread),
    takeLatest(Type.SEND_PARTICIPANTS_BACK, sendParticipantBack),
  ]);
}
