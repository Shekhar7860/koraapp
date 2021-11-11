import {all, call, put, takeLatest} from 'redux-saga/effects';
import {invokeAPICall} from '../../../utils/invoke-api';
import API_CONST from '../../../utils/api-constants';
import * as Type from '../../constants/discussions.constants';
import {SHOW_LOADER} from '../../constants/home.constants';
import {goBack} from '../../../../native/navigation/NavigationService';
import {TOAST_MESSAGE} from '../../constants/common.constants';
import {markAsRead} from '../../actions/discussions.action';
import {setCommentId, setNativeLoader} from '../../actions/native.action';
import {LOADING_MORE_POSTS} from '../../constants/native.constants';
import * as UsersDao from '../../../../dao/UsersDao';
import * as PostsDao from '../../../../dao/PostsDao';
import * as PostDao from '../../../../dao/updatePosts';
import * as BoardsDao from '../../../../dao/BoardsDao';
import {store} from '../../store';
import {postPayload} from '../../../../helpers';
import MessageUploadQueue from '../../../../native/screens/FileUploader/MessageUploadQueue';
import {updatePostReactions} from '../../../../../src/dao/updatePosts';
const LOADER = 'asdasdasd';
const _ = require('lodash');
let repliesRef = null;
let commentsRef = null;

export function* showLoader() {
  yield put({
    type: SHOW_LOADER,
    payload: true,
  });
}

export function* hideLoader() {
  yield put({
    type: SHOW_LOADER,
    payload: false,
  });
}

function* createDiscussion(action) {
  try {
    yield showLoader();

    const response = yield call(invokeAPICall, {
      url: `api/1.1/ka/ws/${action._params.wsId}/boards`,
      method: API_CONST.POST,
      data: action.payload1,
    });

    let boards = response?.data?.boards;
    if (boards?.length > 0) {
      let board = boards[0];
      let _params = action._params;
      _params.rId = board?.id;
      _params.wsId = board?.wsId;
      BoardsDao.updateBoard(board, true)
        .then((record) => {
          let composebarData = action.payload;
          if (record) {
            action.success(record);
          }
          postPayload(
            {
              toList: [],
              boardId: board.id,
              mediaList: [],
              data: composebarData,
              board_id: record.id,
            },
            (payload) => {
              if (action.status && typeof action.status === 'function') {
                action.status('success', board?.id);
              }
              PostDao.upsertNewPost(payload)
                .then((nPost) => {
                  MessageUploadQueue.addPost(nPost, record);
                  BoardsDao.upsertLastActivity({board: record, post: nPost});
                })
                .catch((error) => {
                  console.log('exception in upsertNewPost : ', error);
                });
            },
          );
        })
        .catch((e) => {
          console.log('exception in createDiscussion : ', e);
        });
    }
    yield hideLoader();
  } catch (e) {
    console.error(e);
    if (action.status && typeof action.status === 'function') {
      action.status('failure', e.message);
    }
    yield put({
      type: Type.CREATE_DISCUSSION_FAILURE,
      payload: e.message,
    });
    yield put({
      type: SHOW_LOADER,
      payload: false,
    });
  }
}

export function* appendPostToPostsList(action, isSending = true, t = '') {
  let payload = isSending
    ? {
        ...action.payload,
        createdOn: new Date(),
        author: UsersDao.getUser(),
        loading: true,
      }
    : action.payload;
  let post = null;
  try {
    let updateUnreadCount =
      t === 'm' || t === 'p'
        ? action.payload?.from !== UsersDao.getUserId()
        : false;
    post = yield PostsDao.updatePostWithWrite(
      action.payload,
      updateUnreadCount,
    );
    if (action.payload?.postId) {
      // yield BoardsDao.updateLastActivity(
      //   action.payload,
      //   true,
      //   t === 'm' || t === 'p'
      //     ? action.payload?.from !== UsersDao.getUserId()
      //     : false,
      // );
    }
  } catch (e) {
    console.log('POST ', e);
  }
}

export function* checkWsIdAndReloadBoards(wsId) {}

export function* loadComments(id) {
  if (commentsRef && commentsRef?.removeAllListeners) {
    commentsRef.removeAllListeners();
  }
  let comments = yield call(() => PostsDao.getComments(id));
  // comments.addListener((c) => {
  //   store.dispatch({
  //     type: Type.GET_COMMENTS_SUCCESSFUL,
  //     payload: {
  //       allComments: {comments: c.map((s) => s)},
  //       params: {},
  //       newComment: false,
  //     },
  //   });
  // });
  // commentsRef = comments;
}

export function* checkPostIdAndReloadComments(postId) {}

export function* checkBoardIdAndReloadPosts(boardId) {}

export function* checkCommentIdAndReloadReplies(commentId) {}

function* loadReplies(cId) {
  const replies = yield PostsDao.getReplies(cId);

  if (repliesRef && repliesRef?.removeAllListeners) {
    repliesRef.removeAllListeners();
  }

  replies.addListener((r) => {
    let mockResponse = {
      data: {
        moreAvailable: false,
        replies: r.map((s) => s),
      },
    };
    store.dispatch({
      type: Type.GET_REPLIES_SUCCESSFUL,
      payload: {
        replies: mockResponse.data,
        params: {},
        newReply: false,
      },
    });
  });

  repliesRef = replies;
}

function* createPost(action) {
  try {
    if (action.goBack) {
      goBack();
    }
    const response = yield call(() =>
      invokeAPICall({
        url: 'api/1.1/ka/boards/' + action._params.rId + '/posts',
        method: API_CONST.POST,
        data: action.payload,
      }),
    );

    let post = response?.data;
    if (post?.boardId) {
      const boardId = post?.boardId;
      yield call(PostDao.updatePosts, boardId, [post]);
    }
    if (action?.onPostStatus && response.data) {
      action.onPostStatus('success', response.data?.boardId);
    }
    //yield call(() => PostsDao.updatePostWithWrite(response.data));

    yield put({
      type: SHOW_LOADER,
      payload: false,
    });
  } catch (e) {
    if (action?.onPostStatus) {
      action.onPostStatus('fail', null);
    }
    yield put({
      type: Type.CREATE_POST_FAILURE,
      payload: e.message,
    });
    yield put({
      type: SHOW_LOADER,
      payload: false,
    });
  }
}

function* getTitle(action) {
  yield put({
    type: Type.DISC_TITLE_SUCCESSFUL,
    payload: action.payload,
  });
}

function* saveDiscDraft(action) {
  yield put({
    type: Type.DISC_DRAFT_SUCCESSFUL,
    payload: action.payload,
  });
}

function* markAsReadHelper(params, p) {
  yield put(markAsRead(params, p));
}

function* getAllPosts(action, _showLoader = true) {
  let showLoader = true;
  let _moreAvailable = true;
  const isLoadMore = Boolean(action?._params?.offset);
  try {
    if (_showLoader && !isLoadMore) {
      yield put({
        type: SHOW_LOADER,
        payload: true,
      });
    }
    if (isLoadMore) {
      yield put(setNativeLoader(LOADING_MORE_POSTS, true));
    }

    if (action._params?.offset > 0) {
      const postResp = yield call(() =>
        invokeAPICall({
          url: `api/1.1/ka/boards/${action._params.rId}/posts?offset=${action._params.offset}&limit=${action._params.limit}`,
          method: API_CONST.GET,
        }),
      );
      if (postResp?.data?.posts.length > 0) {
        _moreAvailable = postResp.data.moreAvailable;
        yield call(() =>
          PostDao.updatePosts(action._params.rId, postResp.data.posts),
        );
      } else {
        _moreAvailable = false;
      }
    }

    store.dispatch({
      type: Type.GET_POSTS_SUCCESSFUL,
      loadMore: isLoadMore,
    });
    if (showLoader) {
      if (isLoadMore) {
        store.dispatch(setNativeLoader(LOADING_MORE_POSTS, false));
      }
      if (_showLoader && !isLoadMore) {
        store.dispatch({
          type: SHOW_LOADER,
          payload: false,
        });
      }
    }
    showLoader = false;
  } catch (e) {
    if (isLoadMore) {
      yield put(setNativeLoader(LOADING_MORE_POSTS, false));
    }

    if (_showLoader && !isLoadMore) {
      yield put({
        type: SHOW_LOADER,
        payload: false,
      });
    }

    yield put({
      type: Type.GET_POSTS_FAILURE,
      payload: e?.message,
    });
  }
}

function* discussionContacts(action) {
  yield put({
    type: Type.DISC_CONTACTS_SUCCESSFUL,
    payload: action.payload,
  });
}

function* exceptionContacts(action) {
  yield put({
    type: Type.EXCEPTION_CONTACTS_SUCCESSFUL,
    payload: action.payload,
  });
}

function* allWorkspaceMembers(action) {
  yield put({
    type: Type.WORKSPACE_MEMBERS_SUCCESSFUL,
    payload: action.payload,
  });
}

function* clearAllPosts(action) {
  yield put({
    type: Type.CLEAR_POSTS_SUCCESSFUL,
    payload: action.payload,
  });
}

function* deletePost(action) {
  try {
    const response = yield call(() =>
      invokeAPICall({
        url: `api/1.1/ka/boards/${action._params.rId}/posts/${action._params.postId}`,
        method: API_CONST.DELETE,
      }),
    );
  PostsDao.deletePost(action._params.postId) ;

    yield put({
      type: Type.DELETE_POST_SUCCESSFUL,
     // payload: null,//response.data,
    });
  } catch (e) {
    console.log("deletePost response error ----->:", e);
    // if(e?.status && e?.status === 403){
    //   PostsDao.deletePost(action._params.postId);
    // }
    yield put({
      type: Type.DELETE_POST_FAILURE,
      payload: e.message,
    });
  }
}

function* loader(action) {
  yield put({
    type: LOADER,
    payload: action.payload,
  });
}

function* showPostTraceInfo(action) {
  try {
    const response = yield call(() =>
      invokeAPICall({
        url: `api/1.1/ka/boards/${action._params.rId}/posts/${action._params.postId}/trace`,
        method: API_CONST.GET,
      }),
    );
    yield put({
      type: Type.POST_TRACE_INFO_SUCCESSFUL,
      payload: response.data,
    });
  } catch (e) {
    yield put({
      type: Type.POST_TRACE_INFO_FAILURE,
      payload: e.message,
    });
  }
}

function* postSendingLoader(action) {
  yield put({
    type: Type.POST_LOADER_SUCCESSFUL,
    payload: action.payload,
  });
}

function* editPost(action) {
  try {
    yield showLoader();
    const response = yield call(invokeAPICall, {
      url: `api/1.1/ka/boards/${action._params.rId}/posts/${action._params.postId}`,
      method: API_CONST.PUT,
      data: action.payload,
    });
    yield PostsDao.updatePostWithWrite(response.data);
    yield hideLoader();
    action.onSuccessCB && action.onSuccessCB();
    goBack();
  } catch (e) {
    yield hideLoader();
    yield put({
      type: Type.EDIT_POST_FAILURE,
      payload: e.message,
    });
  }
}

function* replyPost(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: `api/1.1/ka/boards/${action._params.rId}/posts/${action._params.postId}/comments`,
      method: API_CONST.POST,
      data: action.payload,
    });
    yield PostsDao.updatePostWithWrite(response.data);
    action?.onSuccessCB &&
      (typeof action.onSuccessCB === 'function') === action.onSuccessCB();
  } catch (e) {
    yield put({
      type: Type.REPLY_POST_FAILURE,
      payload: e.message,
    });
  }
}

function* getComments(action) {
  try {
    yield loadComments(action._params.postId);
    const response = yield call(() =>
      invokeAPICall({
        url: `api/1.1/ka/boards/${action._params.rId}/posts/${action._params.postId}/comments?offset=${action._params.offset}&limit=${action._params.limit}`,
        method: API_CONST.GET,
      }),
    );
    yield call(() => PostsDao.updatePosts(response.data.comments));
  } catch (e) {
    yield put({
      type: Type.GET_COMMENTS_FAILURE,
      payload: e.message,
    });
  }
}

function* replyComment(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: `api/1.1/ka/boards/${action._params.rId}/posts/${action._params.postId}/comments/${action._params.cId}/replies`,
      method: API_CONST.POST,
      data: action.payload,
    });

    if (response.data) {
      action.replied = true;
      const payload = yield PostsDao.updatePostWithWrite(response.data);
      action?.onSuccessCB &&
        (typeof action.onSuccessCB === 'function') === action.onSuccessCB();
    }
  } catch (e) {
    yield call(errorToast);
  }
}

function* getReplies(action) {
  yield put(setCommentId(action._params.cId));
  try {
    yield loadReplies(action._params.cId);
    const response = yield call(invokeAPICall, {
      url: `api/1.1/ka/boards/${action._params.rId}/posts/${action._params.postId}/comments/${action._params.cId}/replies?offset=${action._params.offset}&limit=${action._params.limit}`,
      method: API_CONST.GET,
    });
    yield PostsDao.updatePosts(response.data.comments);
  } catch (e) {
    yield call(errorToast);
  }
}

function* reactPost(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: `api/1.1/ka/boards/${action._params.rId}/posts/${action._params.postId}/actions`,
      method: API_CONST.PUT,
      data: action.payload,
    });
    console.log('The post reaction resp', response.data);
    if (response && response.data && response.data.emotion) {
      yield call(() =>
        updatePostReactions(action._params.postId, response.data.emotion),
      );
    }
  } catch (e) {
    yield put({
      type: Type.REACT_POST_FAILURE,
      payload: e.message,
    });
  }
}

function* reactComment(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: `api/1.1/ka/boards/${action._params.rId}/posts/${action._params.postId}/comments/${action._params.cId}/actions`,
      method: API_CONST.PUT,
      data: action.payload,
    });
    if (response && response.data && response.data.emotion) {
      yield call(() =>
        updatePostReactions(action._params.cId, response.data.emotion),
      );
    }

    // if (response.data) {
    //   let updateComment = yield call(invokeAPICall, {
    //     url: `api/1.1/ka/boards/${action._params.rId}/posts/${action._params.postId}/comments/${action._params.cId}`,
    //     method: API_CONST.GET,
    //   });
    // }
  } catch (e) {
    yield put({
      type: Type.REACT_COMMENT_FAILURE,
      payload: e.message,
    });
  }
}

function* errorToast() {
  yield put({
    type: TOAST_MESSAGE,
    payload: {
      severity: 'failure',
      detail: 'Something went wrong. Please try again later',
      life: 5000,
    },
  });
}

function* getMediaUrl(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: `/api/1.1/ka/users/:userId/${action._params.messageId}/${action._params.componentFileId}/signedMediaURL`,
      method: API_CONST.GET,
    });
    yield put({
      type: Type.MEDIA_URL_SUCCESSFUL,
      payload: {mediaType: action._params.componentType, media: response.data},
    });
  } catch (e) {
    yield call(errorToast);
  }
}

function* getPostingType(action) {
  yield put({
    type: Type.POST_TYPE_SUCCESSFUL,
    payload: action.payload,
  });
}

function* showPostControlNote(action) {
  yield put({
    type: Type.SHOW_NOTE_SUCCESSFUL,
    payload: action.payload,
  });
}

function* updatePost({payload: {response, action, flag, t = ''}}) {
  let boardId = action._params.rId;
  let wsId = action._params.wsId;
  let boardObj = {};
  let replies = [];
  try {
    switch (flag) {
      case 'addPost':
        yield appendPostToPostsList(
          {
            payload: response,
          },
          true,
          t,
        );
        yield put({
          type: SHOW_LOADER,
          payload: false,
        });
        break;
      case 'updatePost':
        yield PostsDao.updatePostWithWrite(response);
        break;
      case 'addComment':
        yield PostsDao.updatePostWithWrite(response, true);
        break;
      case 'comments':
        if (response.comments.length) {
          for (let j = 0; j < response.comments.length; j++) {}
        }
        yield put({
          type: Type.GET_COMMENTS_SUCCESSFUL,
        });
        break;
      case 'replies':
        yield put({
          type: Type.GET_REPLIES_SUCCESSFUL,
        });
        break;
      case 'addReply':
        yield PostsDao.updatePostWithWrite(response);
        break;
      case 'reactComment':
        yield PostsDao.updatePostWithWrite(response);
        break;
      case 'deletePost':
        break;
      case 'editPost':
        yield PostsDao.updatePostWithWrite(response);
        break;
      case 'reminder':
        delete boardObj.boardData[action._params.postId].remind;
        yield put({
          type: Type.REACT_POST_SUCCESSFUL,
        });
        break;
      case 'reactPost':
        yield PostsDao.updatePostWithWrite(response);
        yield put({
          type: Type.REACT_POST_SUCCESSFUL,
        });
        break;
      case 'newBoard':
        break;
    }
  } catch (e) {
    console.log('Error', e);
  }
}

//watcher function
export function* previewSaga() {
  yield all([
    takeLatest(Type.CREATE_DISCUSSION, createDiscussion),
    takeLatest(Type.CREATE_POST, createPost),
    takeLatest(Type.DISC_TITLE, getTitle),
    takeLatest(Type.DISC_DRAFT, saveDiscDraft),
    takeLatest(Type.GET_POSTS, getAllPosts),
    takeLatest(Type.DISC_CONTACTS, discussionContacts),
    takeLatest(Type.EXCEPTION_CONTACTS, exceptionContacts),
    takeLatest(Type.WORKSPACE_MEMBERS, allWorkspaceMembers),
    takeLatest(Type.CLEAR_POSTS, clearAllPosts),
    takeLatest(Type.DELETE_POST, deletePost),
    takeLatest(LOADER, loader),
    takeLatest(Type.POST_TRACE_INFO, showPostTraceInfo),
    takeLatest(Type.POST_LOADER, postSendingLoader),
    takeLatest(Type.EDIT_POST, editPost),
    takeLatest(Type.REPLY_POST, replyPost),
    takeLatest(Type.GET_COMMENTS, getComments),
    takeLatest(Type.REPLY_COMMENT, replyComment),
    takeLatest(Type.GET_REPLIES, getReplies),
    takeLatest(Type.REACT_POST, reactPost),
    takeLatest(Type.REACT_COMMENT, reactComment),
    takeLatest(Type.MEDIA_URL, getMediaUrl),
    takeLatest(Type.POST_TYPE, getPostingType),
    takeLatest(Type.SHOW_NOTE, showPostControlNote),
    takeLatest(Type.UPDATE_POST, updatePost),
  ]);
}
