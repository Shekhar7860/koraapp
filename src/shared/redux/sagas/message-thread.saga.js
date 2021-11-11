import {
  call,
  put,
  takeLatest,
  all,
  select,
  takeEvery,
} from 'redux-saga/effects';
import * as Type from '../constants/message-thread.constants';
import {invokeAPICall} from '../../utils/invoke-api';
import API_CONST from '../../utils/api-constants';
import {goBack} from '../../../native/navigation/NavigationService';
import * as RootType from '../constants/message-board.constants';
import * as MessageDao from '../../../dao/updateMessages';
import * as MessagesDao from '../../../dao/MessagesDao';
import * as UsersDao from '../../../dao/UsersDao';
import * as BoardsDao from '../../../dao/BoardsDao';
import * as PostsDao from '../../../dao/PostsDao';
import {store} from '../store';
import {setNativeLoader} from '../actions/native.action';
import {LOADING_MORE_MESSAGES} from '../constants/native.constants';

let messagesRef = null;

function* getBoardFiles(action) {
  try {
    let response = [];
    if (action.payload !== null) {
      response = yield call(invokeAPICall, {
        url: `api/1.1/ka/boards/${action._params.boardId}/files?provider=kore&thumbnail=big`,
        method: API_CONST.POST,
        data: action.payload,
      });
    } else {
      yield put({
        type: Type.GetBoardFiles_LOADING,
        payload: true,
      });

      response = yield call(invokeAPICall, {
        url: action._params?.nextPageToken
          ? `api/1.1/ka/boards/${action._params.boardId}/files?provider=kore&thumbnail=big&nextPageToken=${action._params?.nextPageToken}`
          : `api/1.1/ka/boards/${action._params.boardId}/files?provider=kore&thumbnail=big`,
        method: API_CONST.GET,
      });
    }

    yield put({
      type: Type.GetBoardFiles_LOADING,
      payload: false,
    });

    yield put({
      type: Type.GetBoardFiles_SUCCESSFUL,
      payload: {...response.data, reset: action.payload !== null},
    });
  } catch (e) {
    yield put({
      type: Type.GetBoardFiles_LOADING,
      payload: false,
    });

    yield put({
      type: Type.GetBoardFiles_FAILURE,
      payload: 'error' + Date.now(),
    });
  }
}

function* sendMessage(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/1.1/ka/boards/' + action.id + '/messages',
      method: API_CONST.POST,
      data: action.message,
    });
    if (response) {
      yield BoardsDao.updateLastActivity(response.data.message);
    }
    yield put({
      type: Type.SEND_MESSAGE_TO_THREAD_SUCCESS,
      payload: response.data,
    });
  } catch (e) {
    yield put({
      type: Type.SEND_MESSAGE_TO_THREAD_FAILURE,
      payload: e.message,
    });
  }
}

function* getThreadList(action) {
  try {
    yield put({type: Type.MessageThreadListLoading});
    const queryParam = action._params.queryParam;
    const offset = action._params?.offset || 0;
    const response = yield call(() =>
      invokeAPICall({
        url:
          '/api/1.1/ka/boards?' +
          queryParam +
          '&offset=' +
          offset +
          '&limit=' +
          action._params.limit,
        method: API_CONST.GET,
      }),
    );
    if (response?.data?.boards && response.data.boards?.length > 0) {
      let laMods = response.data.boards
        .filter((board) => board.laMod != null)
        .map((board) => new Date(board.laMod));
      let arr = Math.min(...laMods);
      let minLaMod = new Date(arr);
      let type;
      if (action._params.boardKey === 'all') {
        type = 'everything';
      } else if (action._params.boardKey === 'chat') {
        type = 'chats';
      } else {
        type = action._params.boardKey;
      }

      let queryItem = {
        id: type,
        moreAvailable: response?.data?.moreAvailable || false,
        lastBoardSortTime: response?.data?.lastBoardSortTime || minLaMod,
      };

      yield call(() => BoardsDao.updateBoards(response.data, queryItem));
    }
    yield put({
      type: Type.MessageThreadList_SUCCESSFUL,
      moreThreadsAvailable: response?.data?.moreAvailable,
      _params: action._params,
    });
    yield put({type: Type.MessageThreadListLoaded});
  } catch (e) {
    yield put({type: Type.MessageThreadListLoaded});
    yield put({
      type: Type.MessageThreadList_FAILURE,
      payload: e?.message,
    });
  }
}

function* getBoardMessages(action) {
  let moreMessages = true;
  try {
    if (action._params.offset > 0) {
      yield put(setNativeLoader(LOADING_MORE_MESSAGES, true));
      const msgResponse = yield call(() =>
        invokeAPICall({
          url:
            '/api/1.1/ka/boards/' +
            action._params._id +
            '/messages?offset=' +
            action._params.offset +
            '&limit=' +
            action._params.limit,
          method: API_CONST.GET,
        }),
      );
      if (msgResponse?.data?.messages?.length > 0) {
        yield call(
          MessageDao.updateMessages,
          action._params.id,
          msgResponse?.data?.messages,
        );
      }
      moreMessages = msgResponse?.data?.moreAvailable;
      yield put(setNativeLoader(LOADING_MORE_MESSAGES, false));
    }
    yield put({
      type: Type.GET_BOARD_MORE_MESSAGES,
      moreMessages: moreMessages,
    });
    let messages;
    try {
      messages = yield call(() =>
        MessagesDao.getMessages(action._params.id, action._params.clientId),
      );
    } catch (e) {}
    yield put({
      type: Type.GET_BOARD_MESSAGES_SUCCESSFUL,
      messages: messages,
    });
  } catch (e) {
    yield put(setNativeLoader(LOADING_MORE_MESSAGES, false));
    yield put({
      type: Type.GET_BOARD_MESSAGES_FAILURE,
      payload: e.message,
      _params: action._params,
    });
  }
}

function* universalSearchCall(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/1.1/ka/users/:userId/search/messages',
      method: API_CONST.POST,
      data: action.params,
    });
    yield put({
      type: Type.UNIVERSAL_SEARCH_SUCCESSFUL,
      payload: response.data,
    });
  } catch (e) {
    action.onSuccessCB();
    yield put({
      type: Type.UNIVERSAL_SEARCH_FAILURE,
      payload: e.message,
    });
  }
}

function* groupNameChange(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/1.1/ka/boards/' + action._params.id,
      method: API_CONST.PUT,
      data: action.payload,
    });
    yield BoardsDao.updateBoard(response.data);

    yield put({
      type: Type.CHANGE_GROUP_NAME_SUCCESSFUL,
      payload: {editGroupName: response.data},
    });
  } catch (e) {
    yield put({
      type: Type.CHANGE_GROUP_NAME_FAILURE,
      payload: e.message,
    });
  }
}

function* getNewChat(action) {
  let newChatId = 'chat_' + Math.floor(100000 + Math.random() * 900000);
  if (action._param === 'create') {
    yield put({
      type: Type.NEWCHAT_SUCCESSFUL,
      payload: newChatId,
    });
  } else if (action._param === 'close') {
    yield put({
      type: Type.NEWCHAT_FAILURE,
      payload: null,
    });
  }
}

function* setActiveBoard(action) {
  let boardId = action._param?.boardId;
  if (boardId?.length > 0) {
    yield put({
      type: Type.ACTIVE_BOARD_SUCCESSFUL,
      payload: action._param.boardId,
    });
  } else {
    yield put({
      type: Type.ACTIVE_BOARD_FAILURE,
      payload: null,
    });
  }
}

function* setDropdownEvent(action) {
  let url = action.param.url;
  let method;
  switch (action.param.method) {
    case 'GET':
      method = API_CONST.GET;
      break;
    case 'POST':
      method = API_CONST.POST;
      break;
    case 'PATCH':
      method = API_CONST.PATCH;
      break;
    case 'PUT':
      method = API_CONST.PUT;
      break;
    case 'DELETE':
      method = API_CONST.DELETE;
  }
  try {
    const response = yield call(invokeAPICall, {
      url: url,
      method: method,
      data: action.payload ? action.payload : {},
    });
    yield put({
      type: Type.DROPDOWNMESSAGE_SUCCESSFUL,
      payload: response.data,
    });
  } catch (e) {
    yield put({
      type: Type.DROPDOWNMESSAGE_FAILURE,
      payload: e.message,
    });
  }
}

function* markThreadAsStar(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/1.1/ka/boards/' + action._params.id + '/star',
      method: API_CONST.PUT,
      data: action.payload,
    });
    yield BoardsDao.updateStarStatus(
      action._params.id,
      action.payload.markAsStar,
    );
    yield put({
      type: Type.STAR_MESSAGE_SUCCESSFUL,
      payload: action.payload,
    });
  } catch (e) {
    yield put({
      type: Type.STAR_MESSAGE_FAILURE,
      payload: e.message,
    });
  }
}

function* setThreadList(action) {
  yield put({
    type: Type.SET_THREAD_LIST_SUCCESSFUL,
    payload: action.payload,
  });
}

function* setThreadMessage(action) {
  yield put({
    type: Type.SET_THREAD_MESSAGE_SUCCESSFUL,
    payload: action.payload,
  });
}

function* clearUserChatHistory(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/1.1/ka/boards/' + action.payload.id + '/history',
      method: API_CONST.DELETE,
    });

    // store.dispatch({
    //   type: Type.UPDATE_BOARD_MESSAGES,
    //   messages: []
    // });

    // yield MessagesDao.deleteAllMessages(
    //   action.payload.id,
    //   action.payload.clientId,
    //   action.payload.dbId,
    // );
    // if (action.fromGroupDetails === true) {
    //   goBack();
    //   goBack();
    // }

    yield put({
      type: Type.CLEAR_USER_CHAT_HISTORY_SUCCESSFUL,
      payload: response.data,
      boardId: action.payload.id,
    });
  } catch (e) {
    yield put({
      type: Type.CLEAR_USER_CHAT_HISTORY_FAILURE,
      payload: e.message,
    });
  }
}

function* deleteUserChtHistry(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/1.1/ka/boards/' + action.param,
      method: API_CONST.DELETE,
    });

    if (action.fromGroupDetails === true) {
      goBack();
      goBack();
    }

    yield put({
      type: Type.DELETE_USER_CHAT_MESSAGE_SUCCESSFUL,
      payload: response.data,
      boardId: action.param,
    });
  } catch (e) {
    yield put({
      type: Type.DELETE_USER_CHAT_MESSAGE_FAILURE,
      payload: e.message,
    });
  }
}

function* deleteThreadChat(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/1.1/ka/boards/' + action.boardId + '?forceDelete=true',
      method: API_CONST.DELETE,
    });

    if (action.fromGroupDetails === true) {
      goBack();
      goBack();
    } else {
      goBack();
    }

    yield put({
      type: Type.DELETE_USER_CHAT_MESSAGE_SUCCESSFUL,
      payload: response.data,
      boardId: action.boardId,
    });
  } catch (e) {
    yield put({
      type: Type.DELETE_USER_CHAT_MESSAGE_FAILURE,
      payload: e.message,
    });
  }
}

function* deleteGroupChat(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/1.1/ka/boards/' + action.boardId + '?forceDelete=true',
      method: API_CONST.DELETE,
    });
    yield BoardsDao.deleteThread(action.boardId);

    yield put({
      type: Type.DELETE_GROUP_CHAT_SUCCESSFUL,
      boardId: action.boardId,
    });
  } catch (e) {
    yield put({
      type: Type.DELETE_GROUP_CHAT_FAILURE,
      payload: e.message,
    });
  }
}

function* deleteMessageNew(action) {
  // console.log("deleteMessage  action------> :",action);
  try {
    let response = yield call(invokeAPICall, {
      url:
        '/api/1.1/ka/boards/' +
        action._params.boardId +
        '/messages/' +
        action._params.messageId,
      method: API_CONST.DELETE,
    });
    //console.log("deleteMessage  response------> :",response);
    if (response && action._params.index) {
      response.data = new Date().getTime();
    }

    response = {
      ...response,
      action,
    };
    // console.log("deleteMessage  response------> :",response);
    yield put({
      type: Type.DELETE_MESSAGE_SUCCESSFUL,
      payload: response,
    });
    if (action.callback) {
      action.callback();
    }
    //yield MessagesDao.deleteMessageObject(action._params.messageId);
  } catch (e) {
    // console.log("deleteMessage  response error------> :",e);
    yield put({
      type: Type.DELETE_MESSAGE_FAILURE,
      payload: e.message,
    });
  }
}

function* deleteMessageForEveryoneNew(action) {
  //console.log("deleteMessageForEveryone   action-------->:",action)
  try {
    let response = yield call(invokeAPICall, {
      url: '/api/1.1/ka/boards/' + action._params.id + '/messages/',
      method: API_CONST.PUT,
      data: action._params.payload,
    });
    response = {
      ...response,
      action,
    };
    // console.log("deleteMessageForEveryone response-------->:",response)
    if (action.callback) {
      action.callback();
    }
    //yield MessagesDao.deleteMessage(action._params.message);
    yield put({
      type: Type.DELETE_MESSAGE_EVERYONE_SUCCESSFUL,
      payload: response,
    });
  } catch (e) {
    yield put({
      type: Type.DELETE_MESSAGE_EVERYONE_FAILURE,
      payload: e.message,
    });
  }
}

function* MuteUnmute(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/1.1/ka/boards/' + action._params.id + '/usersettings',
      method: API_CONST.PUT,
      data: action.payload,
    });
    yield put(BoardsDao.updateMuteStatus(action._params.id, response?.data));
    yield put({
      type: Type.MUTE_UNMUTE_THREAD_SUCCESSFUL,
      payload: {...response.data, threadId: action._params.id},
    });
  } catch (e) {
    yield put({
      type: Type.MUTE_UNMUTE_THREAD_FAILURE,
      payload: e.message,
    });
  }
}

function* markBoardAsSeen(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/1.1/ka/boards/' + action._params.boardId + '/messages',
      method: API_CONST.PUT,
      data: action.payload,
    });
    BoardsDao.updateUnreadCount(action._params.boardId, true);

    yield put({
      type: Type.MARK_BOARD_AS_READ_SUCCESSFUL,
      payload: response.data,
      boardId: action._params.boardId,
    });
  } catch (e) {
    yield put({
      type: Type.MARK_BOARD_AS_READ_FAILURE,
      payload: e.message,
    });
  }
}

function* deleteUserFromGrup(action) {
  console.log('Delete user from group called', action);
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/1.1/ka/boards/' + action._params.id + '/members',
      method: API_CONST.PUT,
      data: action.payload,
    });

   // console.log('response  -------->: ', response.data);
    yield BoardsDao.deleteUserFromThread(
      action.payload.removeMembers[0],
      response.data,
    );
    let currentUserId = UsersDao.getUserId();
    if (currentUserId && currentUserId === action?.payload?.removeMembers[0]) {
      yield BoardsDao.updateIsMemberStatus(currentUserId, false);
    }

    if (action?.onSuccess) {
      action.onSuccess(response.data);
    }
    yield put({
      type: Type.DELETE_USER_FROM_GROUP_SUCCESSFUL,
      payload: response.data,
    });
  } catch (e) {
    yield put({
      type: Type.DELETE_USER_FROM_GROUP_FAILURE,
      payload: e.message,
    });
  }
}

function* markUnreadThread(action) {
  //console.log('markUnreadThread  action----------->:', action);
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/1.1/ka/boards/' + action._params.id + '/messages',
      method: API_CONST.PUT,
      data: action.payload,
    });
   // console.log('markUnreadThread  response----------->:', response.data);
    BoardsDao.updateUnreadCount(action._params.id, action.payload.unreadTemp);

    yield put({
      type: Type.MARK_UNREAD_THREAD_SUCCESSFUL,
      payload: action.payload,
    });
  } catch (e) {
    console.log('markUnreadThread error ----------->:', e);
    yield put({
      type: Type.MARK_UNREAD_THREAD_FAILURE,
      payload: e.message,
    });
  }
}

function* getOnlyThreadList(action) {
  try {
    let response;
    if (action._params.starred === false) {
      response = yield call(invokeAPICall, {
        url:
          '/api/1.1/ka/boards?type=chat&offset=' +
          action._params.offset +
          '&limit=' +
          action._params.limit,
        method: API_CONST.GET,
      });
    } else {
      response = yield call(invokeAPICall, {
        url:
          '/api/1.1/ka/boards?type=chat&star=true&offset=' +
          action._params.offset +
          '&limit=' +
          action._params.limit,
        method: API_CONST.GET,
      });
    }
  } catch (e) {
    yield put({
      type: Type.OnlyThreadList_FAILURE,
      payload: e.message,
    });
  }
}

function* messageResolve(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: 'api/_resolve/message?id=' + action._params.messageId,
      method: API_CONST.GET,
    });

    let messages = response?.data;
    if (messages?.length > 0) {
      MessagesDao.updateMessages(messages);
    }

    if (action?.callback) {
      action.callback();
    }
    yield put({
      type: Type.MESSAGE_RESOLVE_SUCCESSFUL,
      payload: response.data,
    });
  } catch (e) {
    yield put({
      type: Type.MESSAGE_RESOLVE_FAILURE,
      payload: e.message,
    });
    if (action?.callback) {
      action.callback();
    }
  }
}

function* threadResolve(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: 'api/1.1/_resolve/thread?id=' + action._params.threadId,
      method: API_CONST.GET,
    });
    yield put({
      type: Type.THREAD_RESOLVE_SUCCESSFUL,
      payload: response.data,
    });
  } catch (e) {
    yield put({
      type: Type.THREAD_RESOLVE_FAILURE,
      payload: e.message,
    });
  }
}

function* updateMessage(action) {
  /*Note : The isBoard available check is for some times we may get one message 
  and the thread may not be in the database */
  let increaseUnreadCount =
    action?.t === 'm' ? action.payload.from !== UsersDao.getUserId() : false;
  try {
    let isBoard = yield call(
      BoardsDao.isBoardAvailable,
      action.payload?.boardId,
    );
    if (isBoard) {
      yield call(() =>
        MessageDao.updateMessage(action.payload, increaseUnreadCount),
      );
    } else {
      let threadResponse = yield call(invokeAPICall, {
        url: '/api/1.1/ka/boards/' + action.payload?.boardId,
        method: API_CONST.GET,
      });
      yield call(BoardsDao.updateBoard, threadResponse.data);
      yield call(() =>
        MessageDao.updateMessage(action.payload, increaseUnreadCount),
      );
    }
  } catch (e) {
    console.log('Unable to update message: ' + e);
  }
}

function* setForwardSelectedMessageID(action) {
  try {
    yield put({
      type: Type.SET_FORWARD_MESSAGE_ID_SUCCESSFUL,
      payload: action.payload,
    });
  } catch (e) {
    console.log('Unable to Set selected message Id: ' + e);
  }
}

function* getGoToPost(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: `api/1.1/ka/boards/${action.payload.rId}/posts?postId=${action.payload.postId}&offset=${action.payload.offset}&limit=${action.payload.limit}`,
      method: API_CONST.GET,
    });
    yield put({
      type: Type.GET_GO_TO_POST_SUCCESSFUL,
      payload: response.data,
      gotoPostId: action.payload.postId,
    });
  } catch (e) {
    yield put({
      type: Type.GET_GO_TO_POST_FAILURE,
      payload: action.payload,
    });
  }
}

function* getGoToMessage(action) {
  try {
    const response = yield call(invokeAPICall, {
      url:
        'api/1.1/ka/boards/' +
        action.payload.id +
        '/messages?msgId=' +
        action.payload.msgId +
        '&offset=-4&limit=10',
      method: API_CONST.GET,
    });
    yield put({
      type: Type.GET_GO_TO_MESSAGE_SUCCESSFUL,
      payload: response.data,
      gotoMessageId: action.payload.msgId,
    });
  } catch (e) {
    console.log('Unable to get go to message list: ' + e);
    yield put({
      type: Type.GET_GO_TO_MESSAGE_FAILURE,
      payload: action.payload,
    });
  }
}

function* setGoToMessage(action) {
  try {
    yield put({
      type: Type.GET_GO_TO_MESSAGE_SUCCESSFUL,
      payload: {},
    });
  } catch (e) {
    console.log('Unable to Set go to message list: ' + e);
    yield put({
      type: Type.GET_GO_TO_MESSAGE_FAILURE,
      payload: {},
    });
  }
}

function* deleteConversation(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/1.1/ka/boards/' + action.payload.id,
      method: API_CONST.DELETE,
    });
    let existingBoards = yield select(
      (state) =>
        state.accounts[state.activeAccount].workspaces.messageWorkspace,
    );
    delete existingBoards.boards[action.payload.id];
    yield put({
      type: RootType.UPDATE_WORKSPACE,
      payload: {
        wsId: 'messageWorkspace',
        data: {boards: existingBoards.boards},
      },
    });
  } catch (e) {
    console.log('Unable to delete the conversation:' + e);
    yield put({
      type: Type.DELETE_CONVERSATION_FAILURE,
      payload: e.message,
    });
  }
}

function* getBoardFromDb(action) {
  let boardId = action._params.boardId;

  try {
    const board = yield call(BoardsDao.getSingleBoard, boardId);
    if (board !== null) {
      action.onBoardLoadSuccess(true, board);
    } else {
      action.onBoardLoadSuccess(false, null);
    }
  } catch (e) {
    action.onBoardLoadSuccess(false, null);
  }
}

function* resolveNotification(action) {
  // console.log('resolveNotification action  -----> ', action);
  //dasdsa
  const SUCCESS = 'SUCCESS';
  const FAILURE='FAILURE';
  let boardId = action._params.boardId;
  const isUserInteraction = action._params.isUserInteraction || false;
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/1.1/ka/boards/' + boardId,
      method: API_CONST.GET,
    });
    board = response?.data;
    if (board) {
      BoardsDao.updateBoard(board, true)
        .then((record) => {
          if (action.onThreadStatus && record) {
            action.onThreadStatus(SUCCESS, record);
          }
        })
        .catch((error) => {});
    }

    if (board && isUserInteraction) {
      yield put({
        type: Type.RESOLVE_NOTIFICATION_THREAD_SUCCESS,
        payload: board,
      });
    } else {
      yield put({
        type: Type.RESOLVE_NOTIFICATION_THREAD_SUCCESS,
        payload: board,
      });
    }
  } catch (e) {
    if (action.onThreadStatus) {
      action.onThreadStatus(FAILURE, null);
    }
    console.log('Resolve notification error :', e);
  }
}

function* resolvePostNotification(action) {
  //console.log('resolvePostNotification action : ', action);
  const SUCCESS = 'SUCCESS';
  const FAILURE='FAILURE';
  let postId = action._params.postId;
  let boardId = action._params.boardId;
  try {
    // const daoPost = yield call(PostsDao.getSinglePost, postId);

    let post = null;
    // if (daoPost && daoPost.length > 0) {
    //   post = daoPost[0];
    // }

    // if (!post) {
    const response = yield call(invokeAPICall, {
      url: '/api/1.1/ka/boards/' + boardId + '/posts/' + postId,
      method: API_CONST.GET,
    });
    post = response?.data?.[0];
    // console.log('resolvePostNotification post : ', post);
    if (post) {
      PostsDao.updatePost(post);
    }
     
     const daoPost = yield call(() =>
     PostsDao.getSinglePost(postId),
      );
    // }

    if (action?.onPostStatus && daoPost) {
      action.onPostStatus(SUCCESS, daoPost);
    }
    yield put({
      type: Type.RESOLVE_NOTIFICATION_POST_SUCCESS,
      payload: post,
    });
  } catch (e) {
    if(action?.onPostStatus){
    action.onPostStatus(FAILURE, null);
    }
    console.log('Resolve notification error :', e);
  }
}

function* addMessageEventListener(action) {
  try {
    const messages = yield call(
      MessagesDao.getMessages,
      action.boardId,
      action.boardClientId,
    );
    if (messagesRef && messagesRef?.removeAllListeners) {
      messagesRef.removeAllListeners();
    }
    messagesRef = messages;
    let firstLoad = true;
    messages.addListener((m, {insertions, deletions, ...remaining}) => {
      store.dispatch({
        type: Type.UPDATE_BOARD_MESSAGES,
        messages: m,
        firstLoad: firstLoad,
      });
      if (Number(insertions?.length) + Number(deletions?.length) > 0) {
        firstLoad = false;
      }
    });
  } catch (e) {
    yield put({
      type: Type.GET_BOARD_MESSAGES_FAILURE,
      payload: e.message,
      _params: action._params,
    });
  }
}

function* removeMessageEventListener(action) {
  if (messagesRef && messagesRef?.removeAllListeners) {
    messagesRef.removeAllListeners();
  }
}

function* readNotidication(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/1.1/ka/users/:userId/notifications',
      method: API_CONST.PUT,
      data: action._params,
    });
    if(action?.onReadStatus&&response?.data?.SUCCESS)
    {
      action?.onReadStatus(true)
    }
  } catch (e) {
    console.log('-----Exception in read notification-----');
  }
}

export function* getThreadListSaga() {
  yield all([
    takeLatest(Type.READ_NOTIFICATION, readNotidication),
    takeLatest(Type.MessageThreadList, getThreadList),
    takeLatest(Type.GetBoardFiles, getBoardFiles),
    takeLatest(Type.GET_BOARD_MESSAGES, getBoardMessages),
    takeLatest(Type.NEWCHAT, getNewChat),
    takeLatest(Type.CHANGE_GROUP_NAME, groupNameChange),
    takeLatest(Type.ACTIVE_BOARD, setActiveBoard),
    takeLatest(Type.MUTE_UNMUTE_THREAD, MuteUnmute),
    takeLatest(Type.DROPDOWNMESSAGE, setDropdownEvent),
    takeLatest(Type.STAR_MESSAGE, markThreadAsStar),
    takeLatest(Type.SET_THREAD_LIST, setThreadList),
    takeLatest(Type.SET_THREAD_MESSAGE, setThreadMessage),
    takeLatest(Type.CLEAR_USER_CHAT_HISTORY, clearUserChatHistory),
    takeLatest(Type.DELETE_USER_CHAT_MESSAGE, deleteThreadChat),
    takeLatest(Type.DELETE_GROUP_CHAT, deleteGroupChat),
    takeLatest(Type.DELETE_USER_FROM_GROUP, deleteUserFromGrup),
    takeLatest(Type.MARK_BOARD_AS_READ, markBoardAsSeen),
    takeLatest(Type.MARK_UNREAD_THREAD, markUnreadThread),
    takeLatest(Type.OnlyThreadList, getOnlyThreadList),
    takeEvery(Type.MESSAGE_RESOLVE, messageResolve),
    takeLatest(Type.THREAD_RESOLVE, threadResolve),
    takeLatest(Type.UNIVERSAL_SEARCH, universalSearchCall),
    takeLatest(Type.DELETE_MESSAGE_NEW, deleteMessageNew),
    takeLatest(Type.DELETE_MESSAGE_EVERYONE_NEW, deleteMessageForEveryoneNew),
    takeLatest(Type.SEND_MESSAGE, sendMessage),
    takeLatest(Type.UPDATE_MESSAGE, updateMessage),
    takeLatest(Type.SET_FORWARD_MESSAGE_ID, setForwardSelectedMessageID),
    takeLatest(Type.GET_GO_TO_MESSAGE, getGoToMessage),
    takeLatest(Type.GET_GO_TO_POST, getGoToPost),
    takeLatest(Type.SET_GO_TO_MESSAGE, setGoToMessage),
    takeLatest(Type.DELETE_CONVERSATION, deleteConversation),
    takeLatest(Type.MessageThreadListResolve, resolveNotification),
    takeEvery(Type.NOTIFICATION_POST_RESOLVE, resolvePostNotification),
    takeLatest(Type.ADD_MESSAGES_LISTENER, addMessageEventListener),
    takeLatest(Type.REMOVE_MESSAGES_LISTENER, removeMessageEventListener),
    takeLatest(Type.GET_DB_BOARD, getBoardFromDb),
  ]);
}
