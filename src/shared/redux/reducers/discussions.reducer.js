import * as Type from '../constants/discussions.constants';
import {cloneDeep} from 'lodash';
import {SHOW_LOADER} from '../constants/home.constants';

export default (state = {discDraftArray: []}, action) => {
  switch (action.type) {
    case Type.CREATE_DISCUSSION_SUCCESSFUL:
      return {...state, newDiscussion: action.payload};
    case Type.CREATE_DISCUSSION_FAILURE:
      return state;

    case Type.GET_DISCUSSIONS_SUCCESSFUL:
      let firstBoardInTheList = action.payload.boards[0];
      return {
        ...state,
        activeWsId: action.payload.wsId,
        allDiscussions: action.payload,
        selectedDisc: firstBoardInTheList,
        activeDiscId: firstBoardInTheList?.id,
        activeDiscIndex: 0,
      };
    case Type.GET_DISCUSSIONS_FAILURE:
      let allDiscussionsKey = {
        boards: [],
      };
      return {...state, allDiscussions: allDiscussionsKey};

    case Type.CREATE_POST_SUCCESSFUL:
      if (action.payload) {
        let posts = {
          posts: action.payload,
        };
        return {
          ...state,
          allPosts: posts,
          edited: false,
          boardId: action.boardId,
        };
      }
      break;

    case Type.CREATE_POST_FAILURE:
      return {...state, isPostCreated: false};
    case SHOW_LOADER:
      return {...state, showLoader: action.payload};
    case Type.ACTIVE_WORKSPACE:
      return {...state, selectedWs: action.payload};
    case Type.ACTIVE_DISCUSSION_SUCCESSFUL:
      let activeDiscIndex = state.allDiscussions?.boards?.findIndex(
        (bd) => bd.id === action.payload.boardId,
      );
      return {
        ...state,
        selectedDisc: cloneDeep(action.payload),
        activeDiscId: action.payload.boardId,
        activeDiscIndex,
      };
    case Type.DISC_TITLE_SUCCESSFUL:
      return {...state, discTitle: action.payload};
    case Type.DISCUSSION_STATUS_SUCCESSFUL:
      let allowedForPost;
      if (action.payload) {
        allowedForPost = {
          members: [],
          isAllMembers: true,
        };
      } else {
        allowedForPost = {};
      }
      return {
        ...state,
        newDisc: action.payload,
        excepContacts: allowedForPost,
        isAllWorkspaceMembers: true,
      };
    case Type.ADD_NEW_MESSAGE_TO_PROP: {
      let allPosts = state.allPosts;
      allPosts.posts.unshift(action.payload);
      return {...state, allPosts: allPosts};
    }
    case Type.GET_POSTS_SUCCESSFUL:
      // if (action.loadMore) {
      //   if (
      //     Array.isArray(state.allPosts.posts) &&
      //     Array.isArray(action.payload?.posts)
      //   ) {
      //     action.payload.posts = [
      //       ...state.allPosts.posts,
      //       ...action.payload.posts,
      //     ];
      //   }
      // }
      return {...state, allPosts: action.payload, edited: false};
    case Type.GET_POSTS_FAILURE:
      return state;
    case Type.DISC_CONTACTS_SUCCESSFUL:
      return {...state, discContacts: action.payload};
    case Type.EXCEPTION_CONTACTS_SUCCESSFUL:
      return {...state, excepContacts: action.payload};
    case Type.WORKSPACE_MEMBERS_SUCCESSFUL:
      return {...state, isAllWorkspaceMembers: action.payload};
    case Type.EDIT_DISCUSSION_SUCCESSFUL:
      return state;
    case Type.EDIT_DISCUSSION_FAILURE:
      return state;
    case Type.POST_VIA_EMAIL_SUCCESSFUL:
      return {...state, postViaEmailId: action.payload};
    case Type.POST_VIA_EMAIL_FAILURE:
      return state;
    case Type.DISCUSSION_ICON_SUCCESSFUL:
      return state;
    case Type.DISCUSSION_ICON_FAILURE:
      return state;
    case Type.CHECK_EMAIL_AVAILABILITY_SUCCESSFUL:
      return {
        ...state,
        checkEmailAvailable: cloneDeep(action.payload.checkEmailAvailable),
      };
    case Type.CHECK_EMAIL_AVAILABILITY_FAILURE:
      return state;
    case Type.LEAVE_DISCUSSION_SUCCESSFUL:
      return state;
    case Type.DELETE_DISCUSSION_SUCCESSFUL:
      return state;
    case Type.DELETE_DISCUSSION_FAILURE:
      return state;
    case Type.CLEAR_POSTS_SUCCESSFUL:
      return {...state, allPosts: action.payload, edited: false};
    case Type.DISC_DRAFT_SUCCESSFUL:
      return {...state, discDraftArray: action.payload};
    case Type.ACTIVE_WORKSPACE_ID_SUCCESSFUL:
      return {...state, activeWsId: action.payload};
    case Type.DELETE_POST_SUCCESSFUL:
      let deletedPostId = action.payload.postId;
      const allPostClone = cloneDeep(state.allPosts);
      let index = allPostClone.posts?.findIndex(
        (post) => post.postId === deletedPostId,
      );
      allPostClone.posts?.splice(index, 1);
      return {...state, allPosts: allPostClone, edited: false};
    case Type.DELETE_POST_FAILURE:
      return state;
    case Type.STAR_BOARD_SUCCESSFUL:
      return {
        ...state,
      };
    case Type.STAR_BOARD_FAILURE:
      return state;
    case Type.POST_TRACE_INFO_SUCCESSFUL:
      return {...state, posttraceInfo: action.payload};
    case Type.POST_TRACE_INFO_FAILURE:
      return state;
    case Type.MUTE_UN_MUTE_SUCCESSFUL:
      let _allDiscussions = state.allDiscussions.boards;
      let boards = state.allDiscussions.boards;
      const i = boards.findIndex((a) => a.id === action.payload.boardId);
      boards[i].settings.mute = action.payload.muteObj;
      _allDiscussions.boards = boards;
      return {
        ...state,
        muteDiscussionRoom: action.payload.muteDiscussionRoom,
        allDiscussions: _allDiscussions,
      };
    case Type.POST_LOADER_SUCCESSFUL:
      let allPosts = cloneDeep(state.allPosts);
      allPosts.posts = action.payload;
      return {...state, allPosts, edited: false};
    case Type.EDIT_POST_SUCCESSFUL:
      const allPost = cloneDeep(state.allPosts);
      let editedPostIndex = state.allPosts?.posts.findIndex(
        (post) => post.postId === action.payload.postId,
      );
      action.payload.author = allPost.posts[editedPostIndex].author;
      allPost.posts[editedPostIndex] = action.payload;
      if (
        new Date(action.payload.lastModified).getTime() >
        new Date(action.payload.createdOn).getTime()
      ) {
        allPost.posts[editedPostIndex].edited = true;
      }
      // if (editedPostIndex == allPost.posts.length - 1) {
      //   let discIndex = allDiscussions?.boards?.findIndex(
      //     (disc) => disc.boardId === action.payload.parentId,
      //   );
      //   //disc.length ? disc[0].lastPost = action.payload : disc
      //   allDiscussions.boards[discIndex].lastPost = action.payload;
      //   return {...state, allPosts: allPost, edited: true, allDiscussions};
      // }
      return {...state, allPosts: allPost, edited: true};
    case Type.EDIT_POST_FAILURE:
      return state;
    case Type.DISC_WORKSPACES_SUCCESSFUL:
      return {...state, discWorkspaces: action.payload};
    case Type.DISC_WORKSPACES_FAILURE:
      return state;
    case Type.REPLY_POST_SUCCESSFUL:
      return {...state, postReply: action.payload};
    case Type.REPLY_POST_FAILURE:
      return state;
    case Type.GET_COMMENTS_SUCCESSFUL:
      return {
        ...state,
        comments: action.payload.allComments?.comments,
        loaded: new Date().getTime(),
        react: false,
        edited: false,
      };
    case Type.GET_COMMENTS_FAILURE:
      return state;
    case Type.GET_REPLIES_SUCCESSFUL:
      return {
        ...state,
        replies: action?.payload?.replies?.replies,
        loaded: new Date().getTime(),
        react: false,
        edited: false,
      };
    case Type.REACT_POST_SUCCESSFUL:
      return state;
    case Type.CREATE_REMINDER_SUCCESSFUL:
      return state;
    case Type.DELETE_REMINDER_SUCCESSFUL:
      return state;;
    case Type.ADD_MEMBER_ACCESS_SUCCESSFUL:
      let allDisc = cloneDeep(state.allDiscussions);
      const indexValue = allDisc.boards.findIndex(
        (a) => a.id === action.boardId,
      );
      const memberIndex = state.allDiscussions?.boards[
        indexValue
      ].members?.findIndex((disc) => disc.id === action.payload.userId);

      allDisc.boards[indexValue].members[memberIndex] = {
        ...allDisc.boards[indexValue].members[memberIndex],
        ...action.accessVal,
      };
      let allBoardMembers = state.boardMembers;
      allBoardMembers.members[memberIndex] = {
        ...allDisc.boards[indexValue].members[memberIndex],
        ...action.accessVal,
      };
      return {
        ...state,
        allDiscussions: allDisc,
        boardMembers: allBoardMembers,
      };
    case Type.ADD_MEMBER_ACCESS_FAILURE:
      return state;
    case Type.GET_MEMBERS_SUCCESSFUL:
      return {
        ...state,
        boardMembers: action.payload.boardMembers,
        checkEmailAvailable: false,
      };
    case Type.GET_MEMBERS_FAILURE:
      return state;
    case Type.REACT_COMMENT_SUCCESSFUL:
      let cTotalPosts = cloneDeep(state.allPosts);
      let pIndex = cTotalPosts?.posts?.findIndex(
        (p) => p.postId === action.payload.pId,
      );
      let cIndex = cTotalPosts?.posts[pIndex]?.comments?.findIndex(
        (c) => c.postId === action.payload.cId,
      );
      cTotalPosts.posts[pIndex].comments[cIndex] = action.payload.comment[0];
      if (action.payload.reaction) {
        cTotalPosts.posts[pIndex].comments[cIndex].currentReaction =
          action.payload.reaction;
      } else {
        delete cTotalPosts.posts[pIndex].comments[cIndex].currentReaction;
      }
      return {...state, allPosts: cTotalPosts, react: true, edited: false};
    case Type.SHOW_FORWARDPOSTANDMSG:
      return {...state, showForwardPopup: action.payload};
    case Type.REFRESH_PROPS:
      return {
        ...state,
        excepContacts: {},
        isAllWorkspaceMembers: false,
        discTitle: '',
        discContacts: [],
        groupIcon: '',
      };
    case Type.FORWARD_POST_SUCCESSFUL:
      return {...state, forwardPost: action.payload};
    case Type.GET_EXISTING_CONTACT_SUCCESSFUL:
      return {...state, boardsAvailability: action.payload};
    case Type.RESOLVED_BOARD_SUCCESSFUL:
      return {...state, resolveBoard: action.payload};
    //return {...state, existingContact: action.payload.response};
    case Type.SHOW_VIEWFILESMODAL:
      return {...state, showViewFilesPopup: action.payload};
    case Type.BOARD_AVAILABLE:
      return {...state, discussionAvailability: action.payload};
    case Type.FORWARD_BOARD:
      return {...state, forwardAvailability: action.payload};
    case Type.NO_BOARDS:
      return {...state, noBoards: action.payload};
    case Type.SORT_BOARDS:
      return state;
    default:
      return state;
  }
};
