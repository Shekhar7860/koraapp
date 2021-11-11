import * as TYPE from '../constants/workspace.constants';

export function getWorkSpaceList(_params) {
  return {
    type: TYPE.GET_WORKSPACE_LIST,
    payload: _params,
  };
}

export function createWorkspace(
  payload,
  onSuccessCB = () => {},
  onFailureCB = () => {},
) {
  return {
    type: TYPE.CREATE_WORKSPACE,
    payload,
    onSuccessCB,
    onFailureCB,
  };
}

export function getWsListLayout(payload) {
  return {
    type: TYPE.GET_WS_LIST_LAYOUT,
    payload,
  };
}

export function resetWsStatus(payload) {
  return {
    type: TYPE.CREATE_WORKSPACE_STATUS,
    payload: false,
  };
}
export function getWSBoards(payload) {
  return {
    type: TYPE.GET_WS_BOARDS,
    payload,
  };
}
export function setActiveWsId(payload) {
  return {
    type: TYPE.SET_ACTIVE_WORKSPACE_ID,
    payload,
  };
}
export function showJoinDialogue(payload) {
  return {
    type: TYPE.SHOW_JOIN_DIALOGUE,
    payload,
  };
}

export function starWorkspace(payload) {
  return {
    type: TYPE.STAR_WORKSPACE,
    payload,
  };
}

export function starAndSortWorkspace(payload) {
  return {
    type: TYPE.STAR_AND_SORT_WORKSPACE,
    payload,
  };
}

export function sortStarred(payload) {
  return {
    type: TYPE.SORT_STARRED,
    payload,
  };
}
export function sortWorkspaces(payload) {
  return {
    type: TYPE.SORT_WORKSPACE,
    payload,
  };
}

export function getBrowsedWorkspace(payload) {
  return {
    type: TYPE.BROWSE_WORKSPACE,
    payload,
  };
}

export function requestToJoinWorkSpace(payload, onSuccessCB = () => {}) {
  return {
    type: TYPE.REQUEST_TO_JOIN_WORKSPACE,
    payload,
    onSuccessCB,
  };
}
export function getWorkSpaceData(payload) {
  return {
    type: TYPE.GET_WORKSPACE_DATA,
    payload,
  };
}
export function sendWsInvite(payload, onSuccessCB = () => {}) {
  return {
    type: TYPE.SEND_WS_INVITE,
    payload,
    onSuccessCB,
  };
}

export function acceptToJoinWorkSpace(payload, onSuccessCB = () => {}) {
  return {
    type: TYPE.ACCEPT_TO_JOIN_WORKSPACE,
    payload,
    onSuccessCB,
  };
}

export function deleteWS(payload) {
  return {
    type: TYPE.DELETE_WS,
    payload,
  };
}
export function checkWSAvailability(
  payload,
  onSuccessCB = () => {},
  onFailureCB = () => {},
) {
  return {
    type: TYPE.CHECK_NAME_AVAILABILITY,
    payload,
    onSuccessCB,
    onFailureCB,
  };
}
export function clearWSAvailability() {
  return {
    type: TYPE.WS_NAME_STATUS,
    payload: '',
  };
}
export function getAllWSMembers(wsId) {
  return {
    type: TYPE.GET_ACTIVE_WS_MEMBERS,
    payload: wsId,
  };
}

export function getTableDetail(payLoad, onSuccess = () => {}) {
  return {
    type: TYPE.GET_WORKSPACE_TABLE_DETAIL,
    payload: payLoad,
    onSuccess,
  };
}

export function getTableHeaderDetail(payLoad, onSuccess = () => {}) {
  return {
    type: TYPE.GET_TABLE_HEADER_DETAIL,
    payload: payLoad,
    onSuccess,
  };
}
export function editTableRow(payLoad, onSuccess = () => {}) {
  console.log('----------editTableRow action---------------------', payLoad);
  return {
    type: TYPE.EDIT_TABLE_ROW,
    payload: payLoad,
    onSuccess,
  };
}
export function cbnAvailability(payload) {
  return {
    type: TYPE.GET_BN_AVAILABILITY,
    payload,
  };
}
export function editBoard(payload) {
  return {
    type: TYPE.EDIT_BOARD,
    payload,
  };
}
export function addNewBoard(data) {
  return {
    type: TYPE.ADD_NEW_BOARD,
    payload: data,
  };
}
export function deleteBoard(data) {
  return {
    type: TYPE.DELETE_BOARD,
    payload: data,
  };
}
export function getSpecificBoardData(data) {
  return {
    type: TYPE.GET_SPECIFIC_BOARD_DATA,
    payload: data,
  };
}
export function requestedMemberAction(data) {
  return {
    type: TYPE.REQUESTED_MEMBER_ACTION,
    payload: data,
  };
}
export function changeView(data) {
  return {
    type: TYPE.CHANGE_WS_VIEW,
    payload: data,
  };
}
export function editWorkspace(wsId, data) {
  return {
    type: TYPE.EDIT_WORKSPACE,
    payload: data,
    wsId,
  };
}

export function changeBoardLinkScope(payload) {
  return {
    type: TYPE.CHANGE_BOARD_LINK_SCOPE,
    payload,
  };
}

export function clearWsData() {
  return {type: TYPE.BROWSE_WORKSPACE_SUCCESSFUL, payload: {}};
}

export function updateWorkspace(payload) {
  return {type: TYPE.UPDATE_WORKSPACE, payload};
}

export function removeWsMember({wsId, userId}) {
  return {type: TYPE.REMOVE_WS_MEMBER, _params: {wsId, userId}};
}

export function getAllRoles(wsId) {
  return {type: TYPE.GET_ALL_ROLES, payload: wsId};
}

export function changeMemberAccess({wsId, roleId, memberId}) {
  return {type: TYPE.CHANGE_MEMBER_ACCESS, payload: {wsId, roleId, memberId}};
}
