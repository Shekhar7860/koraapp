import * as Type from '../constants/discussions.constants';
// import {REMOVE_FROM_WORKSPACES} from '../constants/root-structure.const';

export function getDiscussions(_params, payload) {
  return {
    type: Type.GET_DISCUSSIONS,
    _params,
    payload,
  };
}

export function createDiscussion(
  payload,
  payload1,
  _params,
  success = () => {},
  failure = (status, message = '') => {},
) {
  return {
    type: Type.CREATE_DISCUSSION,
    payload,
    payload1,
    _params,
    success,
    failure,
  };
}

export function createPost(
  payload,
  _params,
  goBack = false,
  onPostStatus = () => {},
) {
  return {
    type: Type.CREATE_POST,
    payload,
    _params,
    goBack,
    onPostStatus,
  };
}

export function selectedWorkspace(payload) {
  return {
    type: Type.ACTIVE_WORKSPACE,
    payload,
  };
}

export function selectedDiscussion(payload) {
  return {
    type: Type.ACTIVE_DISCUSSION,
    payload,
  };
}

export function getTitle(payload) {
  return {
    type: Type.DISC_TITLE,
    payload,
  };
}

export function saveDiscDraft(payload) {
  return {
    type: Type.DISC_DRAFT,
    payload,
  };
}

export function discussionStatus(payload) {
  return {
    type: Type.DISCUSSION_STATUS,
    payload,
  };
}

export function getAllPosts(_params) {
  return {
    type: Type.GET_POSTS,
    _params,
  };
}

export function discussionContacts(payload) {
  return {
    type: Type.DISC_CONTACTS,
    payload,
  };
}

export function allWorkspaceMembers(payload) {
  return {
    type: Type.WORKSPACE_MEMBERS,
    payload,
  };
}

export function exceptionContacts(payload) {
  return {
    type: Type.EXCEPTION_CONTACTS,
    payload,
  };
}
export function updateDiscussion(
  _params,
  payload,
  updataDiscData,
  isPostViaEmail = false,
) {
  return {
    type: Type.EDIT_DISCUSSION,
    _params: _params,
    payload: payload,
    updataDiscData,
    isPostViaEmail,
  };
}

export function postViaEmail(_params, payload, index) {
  return {
    type: Type.POST_VIA_EMAIL,
    _params,
    payload,
    index,
  };
}

export function muteUnmute(_params, payload, updataDiscData) {
  return {
    type: Type.MUTE_UN_MUTE,
    _params: _params,
    payload: payload,
    updataDiscData,
  };
}
export function leaveDiscussion(_params, payload, onSuccessCB = () => {}) {
  return {
    type: Type.LEAVE_DISCUSSION,
    _params: _params,
    payload: payload,
    onSuccessCB,
  };
}

export function deleteDiscussion(_params) {
  return {
    type: Type.DELETE_DISCUSSION,
    _params: _params,
  };
}

export function clearAllPosts(payload) {
  return {
    type: Type.CLEAR_POSTS,
    payload,
  };
}

export function storeWsId(payload) {
  return {
    type: Type.ACTIVE_WORKSPACE_ID,
    payload,
  };
}

export function addMember(_params, payload, extraParams = {}) {
  return {
    type: Type.ADD_MEMBER_DISCUSSION,
    _params: _params,
    payload: payload,
    ...extraParams,
  };
}
export function deletePost(_params) {
  return {
    type: Type.DELETE_POST,
    _params,
  };
}
export function markBoardAsStar(_params, payload, updataDiscData = null) {
  return {
    type: Type.STAR_BOARD,
    _params: _params,
    payload: payload,
    updataDiscData,
  };
}

export function postSendingLoader(payload) {
  return {
    type: Type.POST_LOADER,
    payload,
  };
}

export function getDiscWorkspaces() {
  return {
    type: Type.DISC_WORKSPACES,
  };
}

export function editPost(_params, payload, extraParams = {}) {
  return {
    type: Type.EDIT_POST,
    _params,
    payload,
    ...extraParams,
  };
}
export function showPostTraceInfo(_params) {
  return {
    type: Type.POST_TRACE_INFO,
    _params: _params,
  };
}

export function replyPost(payload, _params, onSuccessCB = () => {}) {
  return {
    type: Type.REPLY_POST,
    _params,
    payload,
    onSuccessCB,
  };
}

export function getComments(_params) {
  return {
    type: Type.GET_COMMENTS,
    _params,
  };
}

export function discussionIcon(_params, payload, updataDiscData) {
  return {
    type: Type.DISCUSSION_ICON,
    _params: _params,
    payload: payload,
    updataDiscData,
  };
}

export function reactPost(_params, payload) {
  return {
    type: Type.REACT_POST,
    _params,
    payload,
  };
}

export function reactComment(_params, payload) {
  return {
    type: Type.REACT_COMMENT,
    _params,
    payload,
  };
}

export function markAsUnread(_params, payload) {
  return {
    type: Type.MARK_AS_UNREAD,
    _params,
    payload,
  };
}

export function storeGroupIcon(payload) {
  return {
    type: Type.GROUP_ICON,
    payload,
  };
}

export function replyComment(_params, payload, onSuccessCB = () => {}) {
  return {
    type: Type.REPLY_COMMENT,
    _params,
    payload,
    onSuccessCB,
  };
}

export function getReplies(_params) {
  return {
    type: Type.GET_REPLIES,
    _params,
  };
}

export function getMediaUrl(_params) {
  return {
    type: Type.MEDIA_URL,
    _params,
  };
}

export function copyMail(payload) {
  return {
    type: Type.COPY_EMAIL,
    payload,
  };
}

export function getEditPreview(payload) {
  return {
    type: Type.EDIT_PREVIEW,
    payload,
  };
}

export function getPostingType(payload) {
  return {
    type: Type.POST_TYPE,
    payload,
  };
}

export function createReminder(params, payloads, onFinish = () => {}) {
  return {
    type: Type.CREATE_REMINDER,
    payloads,
    params,
    onFinish,
  };
}

export function deleteReminder(params, payload, onFinish = () => {}) {
  return {
    type: Type.DELETE_REMINDER,
    payload,
    params,
    onFinish,
  };
}

export function checkEmailAvailability(_params) {
  return {
    type: Type.CHECK_EMAIL_AVAILABILITY,
    _params,
  };
}
export function showPostControlNote(payload) {
  return {
    type: Type.SHOW_NOTE,
    payload,
  };
}

export function getBoardMembers(_params) {
  return {
    type: Type.GET_MEMBERS,
    _params,
  };
}

export function getReminders(params) {
  return {
    type: Type.GET_REMINDERS,
    params,
  };
}

export function getRemindersOnPost(_params) {
  return {
    type: Type.GET_REMINDERS_ON_POST,
    _params,
  };
}

export function showEveryone(payload) {
  return {
    type: Type.SHOW_EVERYONE,
    payload,
  };
}

export function addMemberAccess(_params, payload, updataDiscData) {
  return {
    type: Type.ADD_MEMBER_ACCESS,
    payload,
    _params,
    updataDiscData,
  };
}

export function showForwardPostAndMsg(payload) {
  return {
    type: Type.SHOW_FORWARDPOSTANDMSG,
    payload,
  };
}

export function refreshProps() {
  return {
    type: Type.REFRESH_PROPS,
  };
}

export function markAsRead(_params, payload) {
  return {
    type: Type.MARK_AS_READ,
    _params,
    payload,
  };
}

export function forwardPost(
  _params,
  payload,
  onSuccessCB = () => {},
  onFailureCB = () => {},
) {
  return {
    type: Type.FORWARD_POST,
    payload,
    _params,
    onSuccessCB,
    onFailureCB,
  };
}
export function getExistingContact(_params) {
  return {
    type: Type.GET_EXISTING_CONTACT,
    _params,
  };
}

export function updatePost(payload) {
  return {
    type: Type.UPDATE_POST,
    payload,
  };
}

export function updateBoard(payload) {
  return {
    type: Type.UPDATE_DISCUSSION_BOARD,
    payload,
  };
}

export function getBoardAvailability(payload) {
  return {
    type: Type.GET_EXISTING_CONTACT_SUCCESSFUL,
    payload,
  };
}

export function removeBoard(action) {
  return {
    type: Type.REMOVE_FROM_WORKSPACES,
    payload: {boardId: action._params.rId, wsId: action._params.wsId},
  };
}

export function resolveBoard(payload) {
  return {
    type: Type.RESOLVED_BOARD,
    payload,
  };
}
export function showViewFilesModal(payload) {
  return {
    type: Type.SHOW_VIEWFILESMODAL,
    payload,
  };
}
export function getDiscussionsAvailability(payload) {
  return {
    type: Type.BOARD_AVAILABLE,
    payload,
  };
}

export function getForwardBoardAvailability(payload) {
  return {
    type: Type.FORWARD_BOARD,
    payload,
  };
}

export function noBoards(payload) {
  return {
    type: Type.NO_BOARDS,
    payload,
  };
}
