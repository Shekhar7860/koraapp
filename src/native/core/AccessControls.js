import {getUserId} from '../../dao/UsersDao';

export function discussionsACL(boardObj = {}) {
  const {access = 0, memberAccess = 0, wsMembersAccess = 0} = boardObj;
  return {
    canSendPost: access >= 30,
    canAddMember: access >= 40,
    canEditDescription: access >= 40,
    canEditName: access >= 40,
    canEditBoardLogo: access >= 40,
    canSeePostViaEmail: access >= 30,
    canEditPostViaEmail: access === 50,
    canDeleteBoard: access === 50,
    canSeeAllowWorkspaceMembers: access === 50,
    canEditUserAccessRight: access >= 40,
    canRemoveMember: access >= 40,
    canEditAccessLink: access >= 40,
    canCopyAccessLink: true,
    wsMemberCanAddPost: wsMembersAccess >= 30,
  };
}

export function workspaceACL(wsObj = {}, userId) {
  if (!userId) {
    userId = getUserId();
  }
  const {userStatus = '', settings = {}} = wsObj;
  const {whoCanInviteUsers = {}, whoCanCreateBoard = {}} = settings;

  const isOwner = userStatus === 'wsowner';
  const isAdmin = userStatus === 'wsadmin';
  let canCreateBoard = isOwner;
  if (whoCanCreateBoard?.all) {
    canCreateBoard = isOwner || isAdmin;
  }
  return {
    editWsName: isOwner,
    editWsDescription: isOwner,
    editWsPic: isOwner,
    canDeleteWs: isOwner,
    viewMembers: true,
    removeMembers: isOwner,
    inviteMembers:
      isOwner ||
      whoCanInviteUsers?.all ||
      whoCanInviteUsers?.members?.find((id) => id === userId),
    copyLink: true,
    changeAccessLevel:
      isOwner ||
      (isAdmin && whoCanInviteUsers.all) ||
      whoCanInviteUsers?.members?.find((id) => id === userId),
    changeSettings: isOwner,
    canCreateBoard,
  };
}
