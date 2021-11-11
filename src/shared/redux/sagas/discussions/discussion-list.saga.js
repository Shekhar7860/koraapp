import {all, call, put, takeLatest, select} from 'redux-saga/effects';
import {invokeAPICall} from '../../../utils/invoke-api';
import API_CONST from '../../../utils/api-constants';
import * as Type from '../../constants/discussions.constants';
import {SHOW_LOADER} from '../../constants/home.constants';
import {goBack} from '../../../../native/navigation/NavigationService';
import {setNativeLoader} from '../../actions/native.action';
import {
  CHECK_EMAIL_AVAILABILITY_LOADER,
  LOADING_MORE_BOARDS,
} from '../../constants/native.constants';
import {showError} from '../../../../native/core/ErrorMessages';
import * as RootType from '../../constants/message-board.constants';
import * as UsersDao from '../../../../dao/UsersDao';
import * as BoardsDao from '../../../../dao/BoardsDao';
import {checkWsIdAndReloadBoards} from './preview.saga';
import {store} from '../../store';
import Post from '../../../../native/components/PostsComponent/Post';
import * as PostsDao from '../../../../dao/PostsDao';
import {updatePostReminder} from '../../../../dao/updatePosts';

export let boardsRef = null;

function* getDiscussions(action) {
  const isLoadMore = Boolean(action?._params?.offset);
  const showLoader = action?._params?.showLoader;
  try {
    if (showLoader) {
      if (isLoadMore) {
        yield put(setNativeLoader(LOADING_MORE_BOARDS, true));
      } else {
        yield put({
          type: SHOW_LOADER,
          payload: 'loading discussions',
        });
      }
    }
    let response = {
      data: {
        moreAvailable: false,
        boards: [],
      },
    };
    if (response.data) {
      response.data.wsId = action._params.wsId;
    }

    response.data.boards = yield call(
      BoardsDao.getDiscussionBoardsByWsIdPromisify,
      action._params.wsId,
    );
    if (response?.data?.boards?.length == 0) {
      const boardResp = yield call(invokeAPICall, {
        url: `api/1.1/ka/ws/${action._params.wsId}/boards?type=discussion&offset=${action._params.offset}&limit=${action._params.limit}`,
        method: API_CONST.GET,
      });
      if (boardResp?.data?.boards?.length > 0) {
        yield call(BoardsDao.updateBoards, boardResp.data.boards);
        response.data.boards = yield call(
          BoardsDao.getDiscussionBoardsByWsIdPromisify,
          action._params.wsId,
        );
        console.log('Here is the boards resp', boardResp.data);
      }
    }
    if (boardsRef && boardsRef?.removeAllListeners) {
      boardsRef.removeAllListeners();
    }

    response.data.boards.addListener((b) => {
      response.data.boards = b.map((s) => s);
      store.dispatch({
        type: Type.GET_DISCUSSIONS_SUCCESSFUL,
        payload: response.data,
        isLoadMore,
      });
      if (isLoadMore) {
        store.dispatch(setNativeLoader(LOADING_MORE_BOARDS, false));
      } else {
        store.dispatch({
          type: SHOW_LOADER,
          payload: false,
        });
      }
    });

    boardsRef = response.data.boards;
    // if (isLoadMore) {
    //   yield put(setNativeLoader(LOADING_MORE_BOARDS, false));
    // } else {
    //   yield put({
    //     type: SHOW_LOADER,
    //     payload: false,
    //   });
    // }
  } catch (e) {
    yield put({
      type: Type.GET_DISCUSSIONS_FAILURE,
      payload: e.message,
    });
    if (isLoadMore) {
      yield put(setNativeLoader(LOADING_MORE_BOARDS, false));
    } else {
      yield put({
        type: SHOW_LOADER,
        payload: false,
      });
    }
  }
}
function* selectedWorksapce(action) {
  try {
    yield put({
      type: action.type,
      payload: action.payload,
    });
  } catch (e) {
    yield put({
      type: action.type,
      error: e.message,
    });
  }
}
function* selectedDiscussion(action) {
  try {
    yield put({
      type: Type.ACTIVE_DISCUSSION_SUCCESSFUL,
      payload: action.payload,
    });
  } catch (e) {
    yield put({
      type: action.type,
      error: e.message,
    });
  }
}

function* discussionStatus(action) {
  try {
    yield put({
      type: Type.DISCUSSION_STATUS_SUCCESSFUL,
      payload: action.payload,
    });
  } catch (e) {
    yield put({
      type: action.type,
      error: e.message,
    });
  }
}
function* updateDiscussion(action) {
  try {
    if (action.isPostViaEmail) {
      if (!action.payload?.settings?.friendlyAliasEmailId) {
        const response = yield call(invokeAPICall, {
          url: `api/1.1/ka/boards/${action._params.rId}/generateEmailId?isEmailEnabled=true`,
          method: API_CONST.GET,
        });
        const extraSettings = response.data;
        let settings = action?.payload || {};
        settings = {...extraSettings, ...settings};
        action.payload = settings;
      }
    }
    yield BoardsDao.editBoard(action._params.rId, action.payload);
    yield checkWsIdAndReloadBoards(action._params.wsId);
    yield call(invokeAPICall, {
      url:
        'api/1.1/ka/ws/' +
        action._params.wsId +
        '/boards/' +
        action._params.rId,
      method: API_CONST.PUT,
      data: action.payload,
    });

    yield put({
      type: Type.EDIT_DISCUSSION_SUCCESSFUL,
      payload: {
        updataDiscData: action.updataDiscData,
        boardId: action._params.rId,
        reqObj: action.payload,
      },
    });
    // goBack();
  } catch (e) {
    console.log('ERROR', e);
    yield put({
      type: Type.EDIT_DISCUSSION_FAILURE,
      error: e.message,
    });
  }
}

function* postViaEmail(action) {
  try {
    yield put({
      type: Type.POST_VIA_EMAIL_SUCCESSFUL,
      payload: null,
    });
    const response = yield call(invokeAPICall, {
      url: `api/1.1/ka/ws/${action._params.wsId}/generateboardEmailId?isEmailEnabled=true&boardId=${action._params.rId}`,
      method: API_CONST.GET,
    });
    yield put({
      type: Type.POST_VIA_EMAIL_SUCCESSFUL,
      payload: response.data,
    });
  } catch (e) {
    yield put({
      type: Type.POST_VIA_EMAIL_FAILURE,
      payload: e.message,
    });
  }
}

function* discussionIcon(action) {
  try {
    if (action.payload.logo.type === 'emoji') {
      const response = yield call(invokeAPICall, {
        url: `api/1.1/ka/ws/${action._params.wsId}/boards/${action._params.rId}`,
        method: API_CONST.PUT,
        data: action.payload,
      });

      const board = response.data;
      yield BoardsDao.editBoard(board.id, {logo: board.logo});

      // yield put({
      //   type: Type.DISCUSSION_ICON_SUCCESSFUL,
      //   payload: {
      //     showDiscussionIcon: response.data,
      //     boardId: action._params.rId,
      //     icon: action.payload,
      //   },
      // });
    } else {
      const response1 = yield call(invokeAPICall, {
        url: '/api/1.1/ka/users/:userId/link/upload',
        method: API_CONST.POST,
        data: action.payload.imageUrl,
      });
      // console.log('Payload', response1.data.thumbnails);

      const response = yield call(invokeAPICall, {
        url: `api/1.1/ka/ws/${action._params.wsId}/boards/${action._params.rId}`,
        method: API_CONST.PUT,
        data: {
          logo: {
            type: 'link',
            val: {
              thumbnails: response1.data.thumbnails || [],
            },
          },
        },
      });

      yield put({
        type: Type.DISCUSSION_ICON_SUCCESSFUL,
      });
    }
  } catch (e) {
    console.log('Saga', e.message);
    yield put({
      type: Type.DISCUSSION_ICON_FAILURE,
      error: e.message,
    });
  }
}

function* getBoardMembers(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: `api/1.1/ka/boards/${action._params.rId}/members`,
      method: API_CONST.GET,
    });
    //console.log('getBoardMembers', JSON.stringify(response.data));
    let isDisc = false;
    if (action._params?.boardType === 'disc') {
      isDisc = action._params.rId;
    }
    let currentUser = yield select((state) => state.auth.profile);
    let sortedMembers = sortBoardsMembers(response.data.members);
    yield put({
      type: Type.GET_MEMBERS_SUCCESSFUL,
      payload: {
        boardMembers: {members: sortedMembers},
      },
    });
  } catch (e) {
    yield put({
      type: Type.GET_MEMBERS_FAILURE,
      error: e.message,
    });
  }
}

function sortBoardsMembers(participants) {
  var sortedList = [...participants];
  const compareObjects = (a, b) => a.fN > b.fN;
  sortedList.sort(compareObjects);
  const userId = UsersDao.getUserId();
  let userList = sortedList.filter(function (currentElement) {
    // the current value is an object, so you can check on its properties
    return currentElement.id === userId;
  });
  var withoutUser = sortedList.filter(function (currentElement) {
    // the current value is an object, so you can check on its properties
    return currentElement.id !== userId;
  });
  if (userList.length !== 0) {
    withoutUser.unshift(userList[0]);
  }
  return withoutUser;
}

function* checkEmailAvailability(action) {
  yield put(setNativeLoader(CHECK_EMAIL_AVAILABILITY_LOADER, true));
  try {
    const response = yield call(invokeAPICall, {
      url: `api/1.1/ka/boards/${action._params.rId}/checkAliasEmail/${action._params.emailId}`,
      method: API_CONST.GET,
    });
    yield put(setNativeLoader(CHECK_EMAIL_AVAILABILITY_LOADER, false));
    yield put({
      type: Type.CHECK_EMAIL_AVAILABILITY_SUCCESSFUL,
      payload: {checkEmailAvailable: response.data},
    });
  } catch (e) {
    yield put(setNativeLoader(CHECK_EMAIL_AVAILABILITY_LOADER, false));
    //console.log('ERROR', e.message);
    yield put({
      type: Type.CHECK_EMAIL_AVAILABILITY_FAILURE,
      payload: e.message,
    });
  }
}

function* leaveDiscussion(action) {
  console.log('leaveDiscussion action--------->:', action);
  try {
    // console.log('Leave discussion');
    const response = yield call(invokeAPICall, {
      url: 'api/1.1/ka/boards/' + action._params.rId + '/members',
      method: API_CONST.PUT,
      data: action.payload,
    });
    // const response = {};
    console.log(
      'leaveDiscussion response.data  ------------->: ',
      response.data,
    );
    let resp = {...response.data};
    if (action?.payload?.removeMembers) {
      resp.removeMembers = true;
    }
    // if (action.payload?.addMembers || action.payload?.invitedMembers) {
    //   resp.addedMembers = true;
    // }
    if (action.onSuccessCB && typeof action.onSuccessCB === 'function') {
      action.onSuccessCB();
    }

    if (action?.payload?.removeMembers) {
      yield getBoardMembers(action);

      yield put({
        type: Type.LEAVE_DISCUSSION_SUCCESSFUL,
        boardId: action._params.rId,
      });
    } else {
      yield put({
        type: Type.DELETE_DISCUSSION_SUCCESSFUL,
      });
      yield BoardsDao.deleteBoardById(action._params.rId);
    }
  } catch (e) {
    showError(e);

    console.log('MESSAGE Leave discussion', e.message);
    yield put({
      type: Type.LEAVE_DISCUSSION_SUCCESSFUL,
      error: e.message,
    });
  }
}

function* deleteDiscussion(action) {
  // console.log('deleteDiscussion action :', action);
  try {
    const response = yield call(invokeAPICall, {
      url: 'api/1.1/ka/boards/' + action._params.rId,
      method: API_CONST.DELETE,
    });
    if (action._params.fromManageDiscussion === true) {
      goBack();
      goBack();
    }

    yield put({
      type: Type.DELETE_DISCUSSION_SUCCESSFUL,
      payload: response.data,
      deletedBoardId: action._params.rId,
    });
    yield BoardsDao.deleteBoardById(action._params.rId);
  } catch (e) {
    showError(e);
    // SimpleToast.show('TEST');
    console.log('deleteDiscussion error :', e);
    yield put({
      type: Type.DELETE_DISCUSSION_FAILURE,
      error: e.message,
    });
  }
}

function* muteUnmute(action) {
  try {
    yield BoardsDao.deepUpdate({
      id: action._params.boardId,
      notifications: {mute: {till: action.payload.mute}},
    });
    const response = yield call(invokeAPICall, {
      url: `api/1.1/ka/boards/${action._params.boardId}/usersettings`,
      method: API_CONST.PUT,
      data: action.payload,
    });
    //console.log('muteUnmute payload', JSON.stringifyresponse);
  } catch (e) {
    console.log('Message', e.message);
    yield put({
      type: Type.MUTE_UN_MUTE_FAILURE,
      payload: e.message,
    });
  }
}

function* storeWsId(action) {
  yield put({
    type: Type.ACTIVE_WORKSPACE_ID_SUCCESSFUL,
    payload: action.payload,
  });
}

function* addMember(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: 'api/1.1/ka/boards/' + action._params.rId + '/members',
      method: API_CONST.PUT,
      data: action.payload,
    });
    // yield put(getDiscussionsAction(action._params));
    yield getBoardMembers(action);
    let resp = {...response.data};
    if (action.payload.addMembers) {
      resp.addMembers = true;
    }
    if (action.payload.invitedMembers) {
      resp.invitedMembers = true;
    }
    if (typeof action.onSuccess === 'function') {
      action.onSuccess();
    }
    yield put({
      type: Type.LEAVE_DISCUSSION_SUCCESSFUL,
      payload: resp,
    });
  } catch (e) {
    console.log(e);
    yield put({
      type: Type.LEAVE_DISCUSSION_FAILURE,
      error: e.message,
    });
  }
}

function* markBoardAsStar(action) {
  try {
    yield BoardsDao.updateStarStatus(
      action._params.rId,
      action.payload.markAsStar,
    );
    const response = yield call(invokeAPICall, {
      url:
        'api/1.1/ka/ws/' +
        action._params.wsId +
        '/boards/' +
        action._params.rId +
        '/star',
      method: API_CONST.PUT,
      data: action.payload,
    });
    yield put({
      type: Type.STAR_BOARD_SUCCESSFUL,
      payload: {
        starABoard: response.data,
        starValue: action.payload.markAsStar,
        updataDiscData: action?.updataDiscData,
      },
    });
  } catch (e) {
    yield put({
      type: Type.STAR_BOARD_FAILURE,
      error: e.message,
    });
  }
}

function* getDiscWorkspaces(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: 'api/1.1/ka/users/:userId/ws?hasboard=discussion',
      method: API_CONST.GET,
    });
    yield put({
      type: Type.DISC_WORKSPACES_SUCCESSFUL,
      payload: response.data,
    });
  } catch (e) {
    yield put({
      type: Type.DISC_WORKSPACES_FAILURE,
      error: e.message,
    });
  }
}

function* markAsUnread(action) {
  try {
    yield BoardsDao.updateUnreadCount(action._params.rId, false);

    const response = yield call(invokeAPICall, {
      url: `api/1.1/ka/boards/${action._params.rId}/posts`,
      method: API_CONST.PUT,
      data: action.payload,
    });
  } catch (e) {
    yield put({
      type: Type.MARK_AS_UNREAD_FAILURE,
      payload: e.message,
    });
  }
}

export function* markAsRead(action) {
  try {
    yield BoardsDao.updateUnreadCount(action._params.rId, true);

    const response = yield call(invokeAPICall, {
      url: `api/1.1/ka/boards/${action._params.rId}/posts`,
      method: API_CONST.PUT,
      data: action.payload,
    });
    // yield put({
    //   type: Type.EDIT_DISCUSSION_SUCCESSFUL,
    //   payload: {
    //     // updataDiscData: action.updataDiscData,
    //     boardId: action._params.rId,
    //     reqObj: {unreadCount: 0},
    //   },
    // });
  } catch (e) {
    console.log(e.message);
    yield call(errorToast);
  }
}

function* copyMail(action) {
  yield put({
    type: Type.COPY_EMAIL_SUCCESSFUL,
    payload: action.payload,
  });
}

function* createReminder(action) {
  try {
    // yield showLoader();
    const response = yield call(invokeAPICall, {
      url: 'api/1.1/ka/users/:userId/notifications/remind',
      method: API_CONST.POST,
      data: action.payloads,
    });
    yield call(() =>
      updatePostReminder(action.payloads.resourceId, response.data),
    );

    action.onFinish();
    yield put({
      type: Type.CREATE_REMINDER_SUCCESSFUL,
      payload: response.data,
      userId: UsersDao.getUserId(),
    });
  } catch (e) {
    action.onFinish();
    console.log('CREATE REMINDER', e);
    yield put({
      type: Type.CREATE_REMINDER_FAILURE,
      error: e.message,
    });
  }
}

function* deleteReminder(action) {
  try {
    // yield showLoader();
    yield call(invokeAPICall, {
      url: `api/1.1/ka/users/:userId/notifications/remind?resourceId=${action.payload.postId}`,
      method: API_CONST.DELETE,
    });
    // yield hideLoader();
    action.onFinish();

    yield put({
      type: Type.DELETE_REMINDER_SUCCESSFUL,
      payload: action.payload.postId,
      userId: UsersDao.getUserId(),
    });
  } catch (e) {
    console.log('DELETE REMINDER ERROR', e);
    action.onFinish();
    yield put({
      type: Type.DELETE_REMINDER_FAILURE,
      error: e.message,
    });
  }
}

function* getReminders(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: `api/1.1/ka/users/${action.params.userId}/notifications/remind`,
      method: API_CONST.GET,
    });
    yield put({
      type: Type.GET_REMINDERS_SUCCESSFUL,
      payload: {reminders: response.data},
    });
  } catch (e) {
    yield put({
      type: Type.GET_REMINDERS_FAILURE,
      payload: e.message,
    });
  }
}

function* getRemindersOnPost(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: `api/1.1/ka/users/${action._params.userId}/notifications/remind/${action._params.postId}`,
      method: API_CONST.GET,
    });
    yield put({
      type: Type.GET_REMINDERS_SUCCESSFUL,
      payload: {reminders: response.data},
    });
  } catch (e) {
    yield put({
      type: Type.GET_REMINDERS_FAILURE,
      payload: e.message,
    });
  }
}

function* addMemberAccess(action) {
  try {
    yield call(invokeAPICall, {
      url: `api/1.1/ka/ws/${action._params.wsId}/boards/${action._params.rId}/access`,
      method: API_CONST.PUT,
      data: action.payload,
    });
    //console.log('Saga', action.payload.members[0].access);
    // yield put({
    //   type: Type.ADD_MEMBER_ACCESS_SUCCESSFUL,
    //   payload: action.payload.members[0],
    //   accessVal: {access: action.payload.members[0].access},
    //   boardId: action._params.rId,
    // });
    yield getBoardMembers(action);
  } catch (e) {
    //console.log('Add member access ERROR', e.message);
    yield put({
      type: Type.ADD_MEMBER_ACCESS_FAILURE,
      error: e.message,
    });
  }
}

function* forwardPost(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: `api/1.1/ka/users/${action._params.userId}/forward`,
      method: API_CONST.POST,
      data: action.payload,
    });
    action.onSuccessCB();
  } catch (e) {
    console.log(e);
    action.onFailureCB();
    showError(e);
  }
}

function* getExistingContact(action) {
  try {
    const response = yield call(invokeAPICall, {
      //boards?type=chat&offset=' + action._params.offset + '&limit=' + action._params.limit
      url: `api/1.1/ka/boards?type=message&offset=${action._params.offset}&limit=${action._params.limit}`,
      method: API_CONST.GET,
    });
  } catch (e) {
    console.log(e);
  }
}

function* resolveBoard(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: `api/1.1/ka/boards/resolve`,
      method: API_CONST.POST,
      data: action.payload,
    });
    let wsObj = yield select(
      (state) => state.accounts[state.activeAccount].workspaces,
    );
    let messageObj = yield select(
      (state) =>
        state.accounts[state.activeAccount].workspaces.messageWorkspace,
    );
    console.log(wsObj);
    let boards = {};
    response.data.boards.map((board) => {
      if (wsObj[board.wsId]) {
        if (board.type == 'discussion') {
          wsObj[board.wsId].boards[board.id] = merge(
            board,
            wsObj[board.wsId].boards[board.id],
          );
        } else {
          messageObj.boards[board.id] = boards;
        }
      }
    });
    // wsObj.boards = merge(wsObj.boards, boards);
    console.log(wsObj);
    yield put({
      type: RootType.UPDATE_WORKSPACE,
      payload: {
        data: wsObj,
      },
    });

    yield put({
      type: RootType.UPDATE_WORKSPACE,
      payload: {
        wsId: 'messageWorkspace',
        data: {boards: messageObj.boards},
      },
    });
    yield put({
      type: Type.RESOLVED_BOARD_SUCCESSFUL,
      payload: {resolveBoard: response.data},
    });
  } catch (e) {
    yield call(errorToast);
  }
}

function* errorToast() {}

function* updateBoard({payload}) {
  try {
    if (payload?.response) {
      yield call(BoardsDao.updateBoard, payload?.response);
    } else {
      yield call(BoardsDao.updateBoard, payload);
    }
  } catch (e) {
    console.log('UPDATE BOARD', e);
  }
}

//watcher function
export function* discussionListSaga() {
  yield all([
    takeLatest(Type.GET_DISCUSSIONS, getDiscussions),
    takeLatest(Type.ACTIVE_WORKSPACE, selectedWorksapce),
    takeLatest(Type.ACTIVE_DISCUSSION, selectedDiscussion),
    takeLatest(Type.DISCUSSION_STATUS, discussionStatus),
    takeLatest(Type.EDIT_DISCUSSION, updateDiscussion),
    takeLatest(Type.POST_VIA_EMAIL, postViaEmail),
    takeLatest(Type.MUTE_UN_MUTE, muteUnmute),
    takeLatest(Type.LEAVE_DISCUSSION, leaveDiscussion),
    takeLatest(Type.DELETE_DISCUSSION, deleteDiscussion),
    takeLatest(Type.ACTIVE_WORKSPACE_ID, storeWsId),
    takeLatest(Type.ADD_MEMBER_DISCUSSION, addMember),
    takeLatest(Type.STAR_BOARD, markBoardAsStar),
    takeLatest(Type.DISC_WORKSPACES, getDiscWorkspaces),
    takeLatest(Type.MARK_AS_UNREAD, markAsUnread),
    takeLatest(Type.MARK_AS_READ, markAsRead),
    takeLatest(Type.DISCUSSION_ICON, discussionIcon),
    takeLatest(Type.COPY_EMAIL, copyMail),
    takeLatest(Type.CREATE_REMINDER, createReminder),
    takeLatest(Type.DELETE_REMINDER, deleteReminder),
    takeLatest(Type.GET_MEMBERS, getBoardMembers),
    takeLatest(Type.CHECK_EMAIL_AVAILABILITY, checkEmailAvailability),
    takeLatest(Type.GET_REMINDERS, getReminders),
    takeLatest(Type.GET_REMINDERS_ON_POST, getRemindersOnPost),
    takeLatest(Type.ADD_MEMBER_ACCESS, addMemberAccess),
    takeLatest(Type.FORWARD_POST, forwardPost),
    takeLatest(Type.GET_EXISTING_CONTACT, getExistingContact),
    takeLatest(Type.UPDATE_DISCUSSION_BOARD, updateBoard),
    takeLatest(Type.RESOLVED_BOARD, resolveBoard),
  ]);
}
