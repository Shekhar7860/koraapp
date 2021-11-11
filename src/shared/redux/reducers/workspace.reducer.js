import {REDUX_FLUSH} from '../constants/auth.constants';
import * as TYPE from '../constants/workspace.constants';
import {cloneDeep} from 'lodash';
import * as ROOT_TYPES from '../constants/home.constants.js';

const initState = {
  showJoin: false,
  workspacelist: {ws: [], starredObjects: [], isInitialLoaded: true},
  browsedWorkspace: {ws: [], isFirstTimeLoaded: true},
  showLoader: false,
  wsView: 'tab',
  wsMemberRoles: [],
};
export default (state = initState, action) => {
  switch (action.type) {
    case REDUX_FLUSH:
      return initState;
    case TYPE.GET_WORKSPACE_LIST_SUCCESSFUL:
      let extraData = {};
      // if (!state?.activeWsId) {
      //   if (action.payload?.ws[0]?.id) {
      //     extraData.activeWsId = action.payload?.ws[0].id;
      //   }
      // }

      return {
        ...state,
        ...extraData,
        workspacelist: {...action.payload, isInitialLoaded: false},
      };
    case TYPE.GET_WORKSPACE_LIST_FAILURE:
      return {
        ...state,
        workspacelist: {...state.workspacelist, isInitialLoaded: false},
      };
    case TYPE.CREATE_WORKSPACE_STATUS:
      return {...state, createWsStatus: action.payload};

    case TYPE.EDIT_TABLE_ROW_SUCCESS:
      return {...state, editRowSuccess: action.payload};
    case TYPE.GET_BN_AVAILABILITY_SUCCESS:
      return {...state, isAvailableBN: action.payload};
    case TYPE.GET_BN_AVAILABILITY_FAILURE:
      return {
        ...state,
      };
    case TYPE.RENAME_BOARD_SUCCESS:
      return {...state, bnRenamed: action.payload};
    case TYPE.GET_WS_BOARDS_SUCCESS:
      return {...state, wsBoards: action.payload};

    case TYPE.SET_ACTIVE_WORKSPACE_ID:
      return {...state, activeWsId: action.payload};
    case TYPE.SHOW_JOIN_DIALOGUE:
      return {...state, showJoin: action.payload};
    case TYPE.WORKSPACE_STATUS_FLAG:
      return {...state, wsStatusFlag: action.payload};
    case TYPE.BROWSE_WORKSPACE_SUCCESSFUL:
      if (action.payload.is_append) {
        let ws = [...state.browsedWorkspace.ws, ...action.payload.ws];
        return {
          ...state,
          browsedWorkspace: {...action.payload, ws: ws},
        };
      } else {
        return {...state, browsedWorkspace: {...action.payload}};
      }

    case TYPE.REQUEST_TO_JOIN_WORKSPACE_FAILURE:
      return state;

    case TYPE.GET_WORKSPACE_BOARDS_SUCCESS:
      return {...state, activeWorkspaceBoards: action.payload};
    case TYPE.GET_SPECIFIC_BOARD_SUCCESS:
      const bIndex = state.activeWorkspaceBoards.boards.findIndex(
        (r) => action.payload.boardId === r.boardId,
      );
      if (bIndex > -1) {
        state.activeWorkspaceBoards.boards[bIndex] = action.payload;
      }
      return state;
    case TYPE.WS_SHOW_LOADER:
      return {...state, showLoader: action.payload};
    case TYPE.WS_NAME_STATUS:
      return {...state, nameAvailability: action.payload};
    case TYPE.ACTIVE_WS_MEMBERS:
      return {...state, activeWsMembers: action.payload};
    case TYPE.ACCEPT_TO_JOIN_WORKSPACE_FAILURE:
      return state;
    case TYPE.CHANGE_WS_VIEW:
      return {...state, wsView: action.payload};
    case TYPE.EDIT_WORKSPACE_SUCCESS:
      return state;
    case TYPE.GET_ALL_ROLES_SUCCESS:
      action.payload?.teamRoles?.map((r) => {
        r.roleName = r.role === 'wsadmin' ? 'Admin' : 'Member';
      });
      return {...state, wsMemberRoles: action.payload?.teamRoles};
    case TYPE.WS_LIST_LAYOUT:
      return {
        ...state,
        sectionListLayout: action.payload?.modifiedLayout,
        wsLayout: action.payload?.layout?.ws,
        sections: {
          groups: action.payload?.layout?.teamWS?.groups,
          so: action.payload?.ws?.layout?.teamWS?.so,
        },
      };
    default:
      return state;
  }
};
