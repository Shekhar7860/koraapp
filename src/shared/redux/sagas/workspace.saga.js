import {
  all,
  call,
  put,
  select,
  takeEvery,
  takeLatest,
} from 'redux-saga/effects';
import * as TYPE from '../constants/workspace.constants';
import {GET_ACTIVE_WS_MEMBERS} from '../constants/workspace.constants';
import {invokeAPICall} from '../../utils/invoke-api';
import API_CONST from '../../utils/api-constants';
import {SHOW_LOADER} from '../constants/home.constants';
import {TOAST_MESSAGE} from '../constants/common.constants';
import {
  EDIT_DISCUSSION_SUCCESSFUL,
  UPDATE_DISCUSSION_BOARD,
} from '../constants/discussions.constants';
import {setNativeLoader} from '../actions/native.action';
import {LOADING_MORE_WS, INITIAL_SYNC} from '../constants/native.constants';
import * as WorkspacesDao from '../../../dao/WorkspacesDao';
import {showError} from '../../../native/core/ErrorMessages';
import {store} from '../store';

import {
  getWorkspace,
  getWorkspacePromisified,
  upsertWorkspaces,
} from '../../../dao/WorkspacesDao';
import {
  getDiscussionBoardsByWsId,
  getSingleBoardPromisified,
} from '../../../dao/BoardsDao';

import {getCurrentScreenName} from '../../../native/navigation/NavigationService';
import {ROUTE_NAMES} from '../../../native/navigation/RouteNames';
import * as UsersDao from '../../../dao/UsersDao';

import {debounce} from 'lodash/function';
let wsRef = null;
let firstTimeWSLoaded = false;

const updateWsList = debounce((data) => {
  store.dispatch({
    type: TYPE.GET_WORKSPACE_LIST_SUCCESSFUL,
    payload: data,
  });
}, 500);

import {starUnstarWs} from '../../../dao/WorkspacesDao';
function* workspaceList(action) {
  try {
    yield put({
      type: SHOW_LOADER,
      payload: true,
    });
    let response = {
      data: {
        ws: [],
      },
    };
    if (wsRef && wsRef?.removeAllListeners) {
      wsRef.removeAllListeners();
    }

    const ws = yield call(() => WorkspacesDao.getWorkspaces());

    // ws.addListener((w, {insertions, deletions,...remaining}) => {
    //   if (!firstTimeWSLoaded ||  Number(insertions?.length) + Number(deletions?.length) > 0) {
    //     response.data.ws = w;
    //     updateWsList(response.data);
    //     store.dispatch({
    //       type: TYPE.GET_WORKSPACE_LIST_SUCCESSFUL,
    //       payload: response.data,
    //     });
    //   }
    //   firstTimeWSLoaded = true;
    // });
    wsRef = ws;
    yield put({
      type: SHOW_LOADER,
      payload: false,
    });
    // yield put({
    //   type: TYPE.GET_WORKSPACE_LIST_SUCCESSFUL,
    //   payload: response.data,
    // });
    yield put({
      type: SHOW_LOADER,
      payload: false,
    });
  } catch (e) {
    console.error('ERROR', e?.message);
    yield put({
      type: SHOW_LOADER,
      payload: false,
    });
    yield put({
      type: TYPE.GET_WORKSPACE_LIST_FAILURE,
      payload: e.message,
    });
  }
}

function getRealmObjectPromise(obj) {
  return obj;
  try {
    if (typeof obj === 'string') {
      if (obj[0] === 'i') {
        return getSingleBoardPromisified(obj).then((o) => o[0]);
      }
      return getWorkspacePromisified(obj, true);
    }
    if (obj.type === 'board' || obj.type === 'group') {
      obj.id = obj.id + '';
      return getSingleBoardPromisified(obj.id).then((o) => o[0]);
    }
    if (obj.id) {
      return getWorkspacePromisified(obj.id, true);
    }
  } catch (e) {
    console.log('ERROR getRealmObjectPromise', e.message);
  }
  return new Promise.resolve({});
}

function* getWsLayloadResolved(layout) {
  let newLayout = [];
  try {
    if (layout && Object.keys(layout).length > 0) {
      for (let key of Object.keys(layout)) {
        let title = key;
        let modifiedData = null;
        try {
          let wsObjs = layout[key].all || layout[key].so;
          modifiedData = yield Promise.all(
            wsObjs.map((obj) => {
              return getRealmObjectPromise(obj);
            }),
          );
        } catch (e) {
          console.log('ERROR E', e.message);
        }

        if (modifiedData?.length > 0) {
          let groups = [];
          if (
            layout[key]?.groups &&
            Object.keys(layout[key]?.groups)?.length > 0
          ) {
            for (let groupKey of Object.keys(layout[key].groups)) {
              let name = layout[key].groups[groupKey].name;
              let data = {};
              for (let obj of layout[key].groups[groupKey].so) {
                data[obj?.id || obj] = true;
              }
              groups.push({
                title: name,
                data: data,
                id: groupKey,
              });
            }
          }
          if (groups.length > 0) {
            groups = [
              {
                title: 'All Workspaces',
                id: 'all',
                data: {},
              },
              ...groups,
            ];
          }
          newLayout.push({
            title,
            data: modifiedData,
            groups,
          });
        }
      }
    }
    const sortOrder = {
      sharedBoards: 3,
      starred: 1,
      teamWS: 2,
    };
    newLayout.sort((a, b) => {
      return sortOrder[a.title] > sortOrder[b.title];
    });
    if (newLayout && newLayout[0]) {
      newLayout[0].data = newLayout[0].data.filter((obj) => {
        return obj?.logo !== null;
      });
    }
    // let temp = newLayout[0];
    // newLayout[0] = newLayout[1];
    // newLayout[1] = temp;

    yield put({
      type: TYPE.WS_LIST_LAYOUT,
      payload: {
        modifiedLayout: newLayout,
        layout: layout,
      },
    });
  } catch (e) {
    console.error('ERROR', e.message);
    console.error('ERROR OCCURED', e?.message);
  }
}

export function* checkAndUpdateWSLayout() {
  try {
    if (ROUTE_NAMES.WORKSPACE_LIST === getCurrentScreenName()) {
      yield put(setNativeLoader(INITIAL_SYNC, true));

      const response = yield call(invokeAPICall, {
        url: `/api/1.1/ka/users/:userId/ws/layout`,
        method: API_CONST.GET,
      });
      yield put(setNativeLoader(INITIAL_SYNC, false));

      yield getWsLayloadResolved(response?.data?.ws);
    }
  } catch (e) {
    yield put(setNativeLoader(INITIAL_SYNC, false));
  }
}

function* getWsListLayout(action) {
  console.log('--------------ACTIONS', action);
  try {
    const response = yield call(() =>
      invokeAPICall({
        url: '/api/1.1/ka/users/:userId/ws/layout',
        method: API_CONST.GET,
      }),
    );
    // const response = yield call(() =>
    //   invokeAPICall({
    //     url: '/api/1.1/ka/users/:userId/ws/layout',
    //     method: API_CONST.GET,
    //   }),
    // );
    yield getWsLayloadResolved(response?.data?.ws);
    yield workspaceList();
  } catch (e) {
    console.error('ERROR OCCURED', e?.message);
  }
}

function* createWorkspace(action) {
  try {
    yield put({
      type: SHOW_LOADER,
      payload: 'Creating Workspace...',
    });
    const userId = UsersDao.getUserId();
    //   console.log('createWorkspace userId  ------->:', userId);
    action.payload.members.push({memberId: userId, role: 'wsadmin'});
    yield put({
      type: TYPE.CREATE_WORKSPACE_STATUS,
      payload: 'creating',
    });
    const response = yield call(invokeAPICall, {
      url: '/api/1.1/ka/ws',
      method: API_CONST.POST,
      data: action.payload,
    });
    // yield put({
    //   type: TYPE.CREATE_WORKSPACE_STATUS,
    //   payload: {
    //     status: 'created',
    //     id: response.data.id,
    //   },
    // });
    // yield put({type: TYPE.GET_WORKSPACE_LIST, payload: {}});
    const wsResponse = yield call(invokeAPICall, {
      url: `/api/1.1/ka/ws/${response.data.id}`,
      method: API_CONST.GET,
    });
    yield put({type: TYPE.SET_ACTIVE_WORKSPACE_ID, payload: response.data.id});
    yield call(() => WorkspacesDao.upsertWorkspaces([wsResponse.data]));

    action.onSuccessCB();
    yield put({
      type: SHOW_LOADER,
      payload: false,
    });
  } catch (e) {
    console.log('createWorkspace error :', e);
    action.onFailureCB();
    yield put({
      type: TYPE.CREATE_WORKSPACE_STATUS,
      payload: {
        status: 'failed',
        error: e.message,
      },
    });
    yield put({
      type: SHOW_LOADER,
      payload: false,
    });
  }
}
function* getWSTableData(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: `/api/1.1/ka/boards/${action.payload.boardId}/tables/${action.payload.tableId}/rows/${action.payload.rowId}`,
      method: API_CONST.GET,
    });

    action.onSuccess('success', response.data);
  } catch (e) {
    console.log(e);
  }
}

function* getTableHeaderData(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: `/api/1.1/ka/boards/${action.payload.boardId}/tables/${action.payload.tableId}`,
      method: API_CONST.GET,
    });

    action.onSuccess('success', response.data);
  } catch (e) {
    console.log(e);
  }
}

function* editTableRow(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: `/api/1.1/ka/boards/${action.payload.params.boardId}/tables/${action.payload.params.tableId}/rows/${action.payload.params.rowId}`,
      method: API_CONST.PUT,
      data: action.payload.data,
    });

    yield put({type: TYPE.EDIT_TABLE_ROW_SUCCESS, payload: response.data});

    action.onSuccess('success', response.data);
  } catch (e) {
    console.log(e);
  }
}

function* getWSBoards(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: `/api/1.1/ka/ws/${action.payload}/topics`,
      method: API_CONST.GET,
    });
    yield put({
      type: TYPE.GET_WS_BOARDS_SUCCESS,
      payload: response.data,
    });
  } catch (e) {
    console.log(e);
  }
}

function* starWorkspace(action) {
  try {
    starUnstarWs(action.payload.wsId, action.payload.value);

    const response = yield call(invokeAPICall, {
      url: `/api/1.1/ka/users/:userId/ws/${action.payload.wsId}/star`,
      method: API_CONST.PUT,
      data: {
        markAsStar: action.payload.value,
      },
    });
    yield checkAndUpdateWSLayout();
  } catch (e) {
    console.log(e);
    yield put({
      type: SHOW_LOADER,
      payload: false,
    });
  }
}

function* starAndSortWorkspace(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: `/api/1.1/ka/users/:userId/ws/${action.payload.wsId}/star`,
      method: API_CONST.PUT,
      data: {
        markAsStar: action.payload.value,
      },
    });
    action.payload.isStarring = true;
    if (action.payload.value) {
      yield call(sortStarred, action);
    } else {
      yield call(sortWorkspace, action);
    }
  } catch (e) {
    console.log(e);
  }
}

function* getBrowsedWorkspace(action) {
  yield put(setNativeLoader(LOADING_MORE_WS, true));
  try {
    const params = new URLSearchParams();
    params.append('limit', 10);
    if (action.payload?.skip) {
      params.append('skip', action.payload.skip);
    }
    if (action.payload?.q) {
      params.append('q', action.payload.q);
    }
    const response = yield call(invokeAPICall, {
      url: `/api/1.1/ka/ws/?${params.toString()}`,
      method: API_CONST.GET,
    });
    yield put({
      type: TYPE.BROWSE_WORKSPACE_SUCCESSFUL,
      payload: {
        ...response.data,
        is_append: Boolean(action.payload?.skip),
        // isFirstTimeLoaded: action.payload.isFirstTimeLoaded,
      },
    });
  } catch (e) {
    console.log('getBrowsedWorkspace', e);
    yield put({
      type: TYPE.BROWSE_WORKSPACE_FAILURE,
      payload: e.message,
    });
  }
  yield put(setNativeLoader(LOADING_MORE_WS, false));
}

function* refreshWorkspaceList() {
  yield put(setNativeLoader(LOADING_MORE_WS, true));
  try {
    let browsedWorkspace = yield select(
      (state) => state.workspace.browsedWorkspace,
    );
    if (browsedWorkspace) {
      const {ws = []} = browsedWorkspace;
      const response = yield call(invokeAPICall, {
        url: `/api/1.1/ka/ws/?skip=0&limit=${ws.length}`,
        method: API_CONST.GET,
      });
      yield put({
        type: TYPE.BROWSE_WORKSPACE_SUCCESSFUL,
        payload: {
          ...response.data,
          is_append: false,
          // isFirstTimeLoaded: action.payload.isFirstTimeLoaded,
        },
      });
    }
  } catch (e) {}
  yield put(setNativeLoader(LOADING_MORE_WS, false));
}

function* requestToJoinWorkSpace(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: `/api/1.1/ka/ws/${action.payload.wId}/members/requesttojoin`,
      method: API_CONST.POST,
    });

    yield put({
      type: TYPE.BROWSE_WORKSPACE,
      payload: action.payload,
    });
    action.onSuccessCB();
    yield refreshWorkspaceList();
  } catch (e) {
    yield put({
      type: TYPE.REQUEST_TO_JOIN_WORKSPACE_FAILURE,
      payload: e.message,
    });
  }
}

function* getWorkspaceData(action) {
  try {
    yield put({
      type: SHOW_LOADER,
      payload: 'Loading Workspace Boards...',
    });
    const response = yield call(invokeAPICall, {
      url: `/api/1.1/ka/ws/${action.payload}/boards`,
      method: API_CONST.GET,
    });
    yield put({
      type: TYPE.GET_WORKSPACE_BOARDS_SUCCESS,
      payload: response.data,
    });
    yield put({
      type: SHOW_LOADER,
      payload: false,
    });
  } catch (e) {
    console.log(e);
    // yield put({
    //     type: TYPE.WORKSPACE_STATUS_FLAG,
    //     payload: 'deleted',
    // });
    yield put({
      type: SHOW_LOADER,
      payload: false,
    });
  }
}

function* getSpecificBoardData(action) {
  try {
    yield put({
      type: SHOW_LOADER,
      payload: 'Loading Board...',
    });
    const response = yield call(invokeAPICall, {
      url: `/api/1.1/ka/ws/${action.payload.wsId}/boards/${action.payload.boardId}`,
      method: API_CONST.GET,
    });
    yield put({
      type: TYPE.GET_SPECIFIC_BOARD_SUCCESS,
      payload: response.data,
    });
    yield put({
      type: SHOW_LOADER,
      payload: false,
    });
  } catch (e) {
    console.log(e);
    // yield put({
    //     type: TYPE.WORKSPACE_STATUS_FLAG,
    //     payload: 'deleted',
    // });
    yield put({
      type: SHOW_LOADER,
      payload: false,
    });
  }
}

function* sortWorkspace(action) {
  try {
    yield put({
      type: TYPE.WORKSPACE_STATUS_FLAG,
      payload: '',
    });
    yield call(invokeAPICall, {
      url: '/api/1.1/ka/users/:userId/ws',
      method: API_CONST.PUT,
      data: {workspaces: action.payload.order},
    });
    yield put({
      type: TYPE.WORKSPACE_STATUS_FLAG,
      payload: action.payload.isStarring ? 'starred' : 'sortingDone',
    });
  } catch (e) {
    console.log(e);
  }
}

function* sortStarred(action) {
  try {
    yield put({
      type: TYPE.WORKSPACE_STATUS_FLAG,
      payload: '',
    });
    yield call(invokeAPICall, {
      url: '/api/1.1/ka/users/:userId/ws/sortstarredws',
      method: API_CONST.POST,
      data: {sortedWS: action.payload.order},
    });
    yield put({
      type: TYPE.WORKSPACE_STATUS_FLAG,
      payload: action.payload.isStarring ? 'starred' : 'sortingDone',
    });
  } catch (e) {
    console.log(e);
  }
}

function* sendWsInvite(action) {
  try {
    yield call(invokeAPICall, {
      url: `/api/1.1/ka/ws/${action.payload.wsId}/members/invite`,
      method: API_CONST.POST,
      data: {members: action.payload.members},
    });
    yield put({
      type: TYPE.GET_ACTIVE_WS_MEMBERS,
      payload: action.payload.wsId,
    });
    action?.onSuccessCB();
  } catch (e) {
    console.log(e);
  }
}

function* acceptToJoinWorkSpace(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: `/api/1.1/ka/users/:userId/ws/${action.payload.wId}/acceptwsinvite`,
      method: API_CONST.PUT,
    });
    yield put({
      type: TYPE.BROWSE_WORKSPACE,
      payload: action.payload,
    });
    action.onSuccessCB();
    yield refreshWorkspaceList();
  } catch (e) {
    yield put({
      type: TYPE.ACCEPT_TO_JOIN_WORKSPACE_FAILURE,
      payload: e.message,
    });
  }
}
function* editBoard(action) {
  try {
    yield put({
      type: TYPE.RENAME_BOARD_SUCCESS,
      payload: '',
    });
    const response = yield call(invokeAPICall, {
      url: `/api/1.1/ka/ws/${action.payload.wsId}/boards/${action.payload.boardId}`,
      method: API_CONST.PUT,
      data: action.payload.data,
    });
    yield put({
      type: TYPE.RENAME_BOARD_SUCCESS,
      payload: 'boardEdited',
    });
    yield put({
      type: TYPE.GET_SPECIFIC_BOARD_DATA,
      payload: action.payload,
    });

    yield put({
      type: TOAST_MESSAGE,
      payload: {
        severity: 'success',
        detail: 'Board edited successfully.',
        life: 5000,
      },
    });
  } catch (e) {
    console.log(e);
  }
}
function* requestedMemberAction(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: `/api/1.1/ka/ws/${action.payload.wsId}/members/${
        action.payload.approve ? 'acceptrequest' : 'rejectrequest'
      }`,
      method: API_CONST.PUT,
      data: {members: [action.payload.uId]},
    });
    yield put({
      type: TYPE.GET_ACTIVE_WS_MEMBERS,
      payload: action.payload.wsId,
    });

    yield put({
      type: TOAST_MESSAGE,
      payload: {
        severity: 'success',
        detail: `Invite request ${
          action.payload.approve ? 'approved' : 'rejected'
        }`,
        life: 5000,
      },
    });
  } catch (e) {
    console.log(e);
  }
}
function* editWorkspace(action) {
  try {
    yield call(invokeAPICall, {
      url: `/api/1.1/ka/ws/${action.wsId}`,
      method: API_CONST.PUT,
      data: action.payload,
    });
    yield put({
      type: TYPE.EDIT_WORKSPACE_SUCCESS,
      payload: action.payload,
    });
  } catch (e) {
    console.log(e);
  }
}
function* deleteWS(action) {
  try {
    yield put({
      type: SHOW_LOADER,
      payload: 'Deleting Workspace...',
    });
    yield put({
      type: TYPE.WORKSPACE_STATUS_FLAG,
      payload: '',
    });
    const response = yield call(invokeAPICall, {
      url: `/api/1.1/ka/ws/${action.payload}`,
      method: API_CONST.DELETE,
    });
    yield put({
      type: TYPE.GET_WORKSPACE_LIST,
      payload: {_initiator: 'afterDelete', id: action.payload},
    });
    yield put({
      type: SHOW_LOADER,
      payload: false,
    });
  } catch (e) {
    console.log(e);
    yield put({
      type: SHOW_LOADER,
      payload: false,
    });
  }
}
function* deleteBoard(action) {
  try {
    yield put({
      type: SHOW_LOADER,
      payload: 'Deleting Board...',
    });
    yield put({
      type: TYPE.WORKSPACE_STATUS_FLAG,
      payload: '',
    });
    const response = yield call(invokeAPICall, {
      url: `/api/1.1/ka/ws/${action.payload.wsId}/boards/${action.payload.boardId}`,
      method: API_CONST.DELETE,
    });
    yield put({
      type: TYPE.GET_WORKSPACE_DATA,
      payload: action.payload.wsId,
    });
    yield put({
      type: TYPE.WORKSPACE_STATUS_FLAG,
      payload: 'boardDeleted',
    });
    yield put({
      type: SHOW_LOADER,
      payload: false,
    });
  } catch (e) {
    console.log(e);
    yield put({
      type: SHOW_LOADER,
      payload: false,
    });
  }
}

function* addNewBoard(action) {
  try {
    yield put({
      type: TYPE.WORKSPACE_STATUS_FLAG,
      payload: '',
    });
    yield put({
      type: SHOW_LOADER,
      payload: 'Adding New Board ...',
    });
    yield call(invokeAPICall, {
      url: `/api/1.1/ka/ws/${action.payload.wsId}/boards`,
      method: API_CONST.POST,
      data: {
        boards: action.payload.boards,
      },
    });
    yield put({
      type: TYPE.WORKSPACE_STATUS_FLAG,
      payload: 'boardAdded',
    });
    yield put({
      type: SHOW_LOADER,
      payload: false,
    });
  } catch (e) {
    yield put({
      type: SHOW_LOADER,
      payload: false,
    });
    console.log(e);
  }
}

function* checkWSAvailability(action) {
  try {
    yield put({
      type: TYPE.WS_NAME_STATUS,
      payload: {status: ''},
    });
    yield put({
      type: SHOW_LOADER,
      payload: 'Checking name availability...',
    });
    const response = yield call(invokeAPICall, {
      url: `/api/1.1/ka/ws/${action.payload}/checkavailability`,
      method: API_CONST.GET,
    });
    if (response?.data?.status === 'unavailable') {
      throw 'Unavailable';
    }
    action.onSuccessCB();
    yield put({
      type: TYPE.WS_NAME_STATUS,
      payload: response.data,
    });
    yield put({
      type: SHOW_LOADER,
      payload: false,
    });
  } catch (e) {
    action.onFailureCB();
    yield put({
      type: SHOW_LOADER,
      payload: false,
    });
    console.log(e);
  }
}
function* cbnAvailability(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: `/api/1.1/ka/ws/${action.payload.wsId}/boards/check?name=${action.payload.name}`,
      method: API_CONST.GET,
    });
    yield put({
      type: TYPE.GET_BN_AVAILABILITY_SUCCESS,
      payload: response.data,
    });
  } catch (e) {
    yield put({
      type: TOAST_MESSAGE,
      payload: {
        severity: 'failure',
        detail: 'The current name is not available.',
        life: 5000,
      },
    });
  }
}

function* getAllWSMembers(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: `/api/1.1/ka/ws/${action.payload}/members/`,
      method: API_CONST.GET,
    });
    let members = response.data.members;
    function sortOrder(role) {
      const _sortOrder = {
        wsowner: 10,
      };
      return _sortOrder[role] || 0;
    }
    // const i = members.findIndex((m) => m.role?.name === 'wsowner');
    // if (i !== -1) {
    //   const owner = members[i];
    //   members.splice(i, 1);
    //   members = [owner, ...members];
    //   response.data.members = members;
    // }

    try {
      members = members.sort((a, b) => {
        return sortOrder(a?.role?.name) < sortOrder(b?.role?.name);
      });
      response.data.members = members;
    } catch (e) {
      console.log('E', e);
    }

    yield put({
      type: TYPE.ACTIVE_WS_MEMBERS,
      payload: response.data,
    });
  } catch (e) {
    console.log(e);
  }
}

function* changeBoardLinkScope(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: `/api/1.1/ka/boards/${action.payload.boardId}/link`,
      method: API_CONST.PUT,
      data: action.payload.data,
    });

    yield put({
      type: EDIT_DISCUSSION_SUCCESSFUL,
      payload: {
        boardId: action.payload.boardId,
        reqObj: {link: {...action.link, ...action.payload.data}},
      },
    });
  } catch (e) {
    console.log(e);
  }
}

function* updateWorkspace(action) {
  yield WorkspacesDao.editWorkspace(action.payload);
}

function* removeWsMember(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: `/api/1.1/ka/ws/${action._params.wsId}/members/${action._params.userId}`,
      method: API_CONST.DELETE,
    });
    yield put({
      type: GET_ACTIVE_WS_MEMBERS,
      payload: action._params.wsId,
    });
  } catch (e) {
    yield showError(e);
    console.log('removeWsMember', e);
  }
}

function* getAllRoles(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: `/api/1.1/ka/ws/${action.payload}/roles`,
      method: API_CONST.GET,
    });
    yield put({
      type: TYPE.GET_ALL_ROLES_SUCCESS,
      payload: response.data,
    });
  } catch (e) {
    console.log(e);
  }
}

function* changeMemberAccess(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: `/api/1.1/ka/ws/${action.payload.wsId}/roles/${action.payload.roleId}/users`,
      method: API_CONST.PUT,
      data: {userIds: [action.payload.memberId]},
    });
    yield put({
      type: TYPE.GET_ACTIVE_WS_MEMBERS,
      payload: action.payload.wsId,
    });
  } catch (e) {
    yield showError(e);
  }
}

export function* workspaceSaga() {
  yield all([
    takeLatest(TYPE.GET_WORKSPACE_LIST, workspaceList),
    takeLatest(TYPE.GET_WS_LIST_LAYOUT, getWsListLayout),
    takeLatest(TYPE.CREATE_WORKSPACE, createWorkspace),
    takeLatest(TYPE.GET_WS_BOARDS, getWSBoards),
    takeLatest(TYPE.STAR_WORKSPACE, starWorkspace),
    takeLatest(TYPE.SORT_WORKSPACE, sortWorkspace),
    takeLatest(TYPE.SORT_STARRED, sortStarred),
    takeLatest(TYPE.STAR_AND_SORT_WORKSPACE, starAndSortWorkspace),
    takeLatest(TYPE.BROWSE_WORKSPACE, getBrowsedWorkspace),
    takeLatest(TYPE.REQUEST_TO_JOIN_WORKSPACE, requestToJoinWorkSpace),
    takeLatest(TYPE.GET_WORKSPACE_DATA, getWorkspaceData),
    takeLatest(TYPE.SEND_WS_INVITE, sendWsInvite),
    takeLatest(TYPE.ACCEPT_TO_JOIN_WORKSPACE, acceptToJoinWorkSpace),
    takeLatest(TYPE.CHECK_NAME_AVAILABILITY, checkWSAvailability),
    takeLatest(TYPE.CHANGE_BOARD_LINK_SCOPE, changeBoardLinkScope),
    takeLatest(TYPE.GET_ACTIVE_WS_MEMBERS, getAllWSMembers),
    takeLatest(TYPE.DELETE_WS, deleteWS),
    takeLatest(TYPE.ADD_NEW_BOARD, addNewBoard),
    takeLatest(TYPE.GET_BN_AVAILABILITY, cbnAvailability),
    takeLatest(TYPE.EDIT_BOARD, editBoard),
    takeLatest(TYPE.DELETE_BOARD, deleteBoard),
    takeLatest(TYPE.GET_SPECIFIC_BOARD_DATA, getSpecificBoardData),
    takeLatest(TYPE.REQUESTED_MEMBER_ACTION, requestedMemberAction),
    takeLatest(TYPE.EDIT_WORKSPACE, editWorkspace),
    takeLatest(TYPE.UPDATE_WORKSPACE, updateWorkspace),
    takeLatest(TYPE.REMOVE_WS_MEMBER, removeWsMember),
    takeLatest(TYPE.GET_ALL_ROLES, getAllRoles),
    takeLatest(TYPE.CHANGE_MEMBER_ACCESS, changeMemberAccess),

    takeLatest(TYPE.GET_WORKSPACE_TABLE_DETAIL, getWSTableData),
    takeLatest(TYPE.GET_TABLE_HEADER_DETAIL, getTableHeaderData),
    takeLatest(TYPE.EDIT_TABLE_ROW, editTableRow),
  ]);
}
