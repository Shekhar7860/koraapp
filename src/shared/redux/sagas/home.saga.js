import {all, call, put, takeLatest} from 'redux-saga/effects';
import * as Type from '../constants/home.constants';
import {invokeAPICall} from '../../utils/invoke-api';
import API_CONST from '../../utils/api-constants';
import {msgBoards, discussionBoards} from '../../../native/utils/helpers';
import {generateUUID} from '../../../helpers';

function* getJWTToken(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/1.1/ka/users/:userId/bot/token',
      method: API_CONST.GET,
    });
    
    let params = {
      clientId: 'cs-aa97f39d-dec6-515c-9eb5-f2f32eb2691b',
      clientSecret: 'OfzmtEMbMNvlhBdK48xMVNx74uvaIhfdCDAKMnvk+xM=',
      identity: generateUUID(),
      isAnonymous: false,
    };
    const jwtResponse = yield call(invokeAPICall, {
      url: 'https://mk2r2rmj21.execute-api.us-east-1.amazonaws.com/dev/users/sts',
      method: API_CONST.POST,
      data: params,
    });

    let data = response.data;
    let res = {
      ...data,
      jwt: jwtResponse.data.jwt,
    };

    yield put({
      type: Type.JWT_TOKEN_SUCCESSFUL,
      payload: res,
    });
  } catch (e) {
    yield put({
      type: Type.JWT_TOKEN_FAILURE,
      payload: e.message,
    });
  }
}

function* presenceStart(action) {
  console.log('start presence called');
  try {
    const response = yield call(() =>
      invokeAPICall({
        url: '/api/1.1/presence/start',
        method: API_CONST.POST,
      }),
    );
    if (response) {
      // console.log('Here is the start presence response');
    }
    yield put({
      type: Type.PRESENCE_START_SUCCESSFUL,
      payload: response.data,
    });
  } catch (e) {
    console.log('Error in start presence', e);
    yield put({
      type: Type.PRESENCE_START_FAILURE,
      // payload: e.message,
    });
  }
}

// function formStructureFromMeta(data) {
//   const workspaces = {};
//   if (data.length) {
//     cloneDeep(data).map((r, i) => {
//       for (let i = 0; i < r.members?.length; i++) {
//         if (typeof r.members[i] === 'string') {
//           r.members[i] = {id: r.members[i]};
//         }
//       }
//       if (r.messages || r.posts) {
//         const _boardData = r.messages || r.posts;
//         delete r.messages;
//         delete r.posts;
//         r.boardData = {};
//         _boardData?.map((s) => {
//           r.boardData[s.messageId || s.postId] = s;
//         });
//       }
//       if (r.type === 'ws') {
//         r.type = r.wsType;
//         r.logo = r.icon;
//         delete r.wsType;
//         delete r.icon;
//         if (!workspaces.hasOwnProperty(r.id)) {
//           workspaces[r.id] = {...r, boards: {}};
//         } else {
//           if (!workspaces[r.id].hasOwnProperty('boards')) {
//             workspaces[r.id].boards = {};
//           }
//           workspaces[r.id] = {...workspaces[r.id], ...r};
//         }
//       } else if (r.type === 'directChat' || r.type === 'groupChat') {
//         if (!workspaces.hasOwnProperty('messageWorkspace')) {
//           workspaces.messageWorkspace = {boards: {}};
//           workspaces.messageWorkspace.boards[r.id] = r;
//         } else {
//           workspaces.messageWorkspace.boards =
//             workspaces.messageWorkspace.boards || {};
//           workspaces.messageWorkspace.boards[r.id] = {
//             ...r,
//             ...(workspaces.messageWorkspace.boards[r.id] || {}),
//           };
//         }
//       } else {
//         if (r.wsId && !workspaces.hasOwnProperty(r.wsId)) {
//           workspaces[r.wsId] = {boards: {}, boardsSync: true};
//           workspaces[r.wsId].boards[r.id] = r;
//         } else if (workspaces.hasOwnProperty(r.wsId)) {
//           workspaces[r.wsId].boardsSync = true;
//           workspaces[r.wsId].boards = workspaces[r.wsId].boards || {};
//           workspaces[r.wsId].boards[r.id] = {
//             ...r,
//             ...(workspaces[r.wsId].boards[r.id] || {}),
//           };
//         }
//       }
//     });
//   }
//   return workspaces;
// }

function* getMetaDetail(action) {
  let response;
  try {
    response = yield call(() =>
      invokeAPICall({
        url: '/api/1.1/ka/users/:userId/metasearch',
        method: API_CONST.GET,
        data: action._params,
      }),
    );

    yield put({
      type: Type.GET_META_DETAIL_SUCCESSFUL,
      // payload: formStructureFromMeta(response.data),
    });

    // yield put({
    //   type: Type.SET_STARRED_OBJECTS,
    //   payload: getStarredFromMeta(response.data),
    // });
  } catch (e) {
    console.log('error in getMetaDetail', e);
    yield put({
      type: Type.GET_META_DETAIL_FAILURE,
      payload: response,
    });
  }
}
function* setMetaDetail(action) {
  try {
    yield put({
      type: Type.SET_META_DETAIL_SUCCESSFUL,
      payload: action._params,
    });
  } catch (e) {
    yield put({
      type: Type.SET_META_DETAIL_FAILURE,
      payload: action._params,
    });
  }
}
function* resolveUserDetail(action) {
  let response;
  try {
    response = yield call(invokeAPICall, {
      url: '/api/_resolve/user',
      method: API_CONST.POST,
      data: action._params,
    });
    yield put({
      type: Type.RESOLVE_USER_DETAIL_SUCCESSFUL,
      payload: response.data,
    });
  } catch (e) {
    yield put({
      type: Type.RESOLVE_USER_DETAIL_FAILURE,
      payload: response,
    });
  }
}

function getStarredFromMeta(data) {
  const starredObjects = [];
  if (data.length) {
    data.map((r, i) => {
      if (r.star) {
        starredObjects.push({
          type: r.type,
          wsId:
            r.type === 'ws'
              ? r.id
              : r.type === 'directChat' || r.type === 'groupChat'
              ? 'messageWorkspace'
              : r.wsId,
          boardId: r.type !== 'ws' ? r.id : '',
        });
      }
    });
  }
  return starredObjects;
}
function getMsgBordsData(data) {
  if (data && data.boards && data.chats.ids) {
    return msgBoards(data.boards, data.chats.ids);
  }
}

function getDiscussionBordsData(data) {
  if (data && data.boards && data.chats.ids) {
    return discussionBoards(data.boards, data.chats.ids);
  }
}

// function* getHelpThunderbolt(action) {
//   try {
//     const response = yield call(invokeAPICall, {
//       url: '/api/1.1/ka/users/:userId/kora/phrases?help=true',
//       method: API_CONST.GET,
//     });
//     let recents = {};
//     if(response.data.help.resources.length) {
//       for(let i=0; i<response.data.help.resources.length; i++) {
//         if(response.data.help.resources[i].id === "recents") {
//           recents = response.data.help.resources[i];
//           break;

//         }
//       }
//     }
//     yield put({
//       type: Type.GET_HELP_THUNDERBOLT_SUCCESS,
//       payload: {thunderbolt:response.data, thunderboltRecents:recents},
//     });
//   } catch (e) {
//     yield put({
//       type: Type.GET_HELP_THUNDERBOLT_FAILURE,
//       payload: e.message,
//     });
//   }
// }

function* getHelpThunderbolt(action) {
  let items = [],
    recents = {};
  try {
    let [thunderBoltResp, resultSkill] = yield all([
      call(invokeAPICall, {
        url: '/api/1.1/ka/users/:userId/kora/phrases?help=true',
        method: API_CONST.GET,
      }),
      call(invokeAPICall, {
        url: '/api/1.1/ka/users/:userId/skills/triggerphrase',
        method: API_CONST.GET,
      }),
    ]);
    thunderBoltResp = thunderBoltResp.data;
    resultSkill = resultSkill.data;
    if (thunderBoltResp && resultSkill) {
      for (let i = 0; i < thunderBoltResp['help'].resources.length; i++) {
        if (thunderBoltResp.help.resources[i].id === 'recents') {
          recents = thunderBoltResp.help.resources[i];
        }
        if (
          thunderBoltResp['help'].resources[i] &&
          thunderBoltResp['help'].resources[i].filters &&
          thunderBoltResp['help'].resources[i].filters.length
        ) {
          for (
            let j = 0;
            j < thunderBoltResp['help'].resources[i].filters.length;
            j++
          ) {
            for (
              let k = 0;
              k <
              thunderBoltResp['help'].resources[i].filters[j].utterances.length;
              k++
            ) {
              items.push(
                thunderBoltResp['help'].resources[i].filters[j].utterances[k],
              );
            }
          }
        } else {
          if (
            thunderBoltResp['help'].resources[i] &&
            thunderBoltResp['help'].resources[i].utterances
          ) {
            for (
              let l = 0;
              l < thunderBoltResp['help'].resources[i].utterances.length;
              l++
            ) {
              items.push(thunderBoltResp['help'].resources[i].utterances[l]);
            }
          }
        }
      }
      for (let m = 0; m < resultSkill.length; m++) {
        if (resultSkill && resultSkill[m]['utterances']) {
          for (let n = 0; n < resultSkill[m]['utterances'].length; n++) {
            items.push(resultSkill[m]['utterances'][n]);
          }
        }
      }
      // window['helpTemplate']['message'][0]['component']['payload']['elements'][0]['buttons'] = thunderBoltResp['quickHelp']["body"];
      // window['helpTemplate']['message'][0]['component']['payload']["elements"][0].text = thunderBoltResp['quickHelp']['title'];
      // window.$.jStorage.set('utterances', items);
      // window.$.jStorage.set('skillUtterence', resultSkill);
    }
    yield put({
      type: Type.GET_HELP_THUNDERBOLT_SUCCESS,
      payload: {thunderbolt: thunderBoltResp, thunderboltRecents: recents},
    });
  } catch (e) {
    yield put({
      type: Type.GET_HELP_THUNDERBOLT_FAILURE,
      payload: e.message,
    });
  }
}

function* getSkillSuggestion(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/1.1/ka/users/:userId/skills/triggerphrase',
      method: API_CONST.GET,
    });
    yield put({
      type: Type.HELP_SKILL_SUGGESTION_SUCCESS,
      payload: response.data,
    });
  } catch (e) {
    yield put({
      type: Type.HELP_SKILL_SUGGESTION_FAILURE,
      payload: e.message,
    });
  }
}

function* getAppPermissions() {
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/1.1/ka/users/:userId/AppControlPermissions',
      method: API_CONST.GET,
    });
    yield put({
      type: Type.APP_PERMISSIONS_SUCCESSFUL,
      payload: response.data,
    });
  } catch (e) {
    yield put({
      type: Type.APP_PERMISSIONS_FAILURE,
      payload: e.message,
    });
  }
}

function* subscribeForPushNotifications(action) {
  try {
    const response = yield call(() =>
      invokeAPICall({
        url: '/api/1.1/users/:userId/notifications/push/subscribe',
        method: API_CONST.POST,
        data: action._params,
      }),
    );
    yield put({
      type: Type.PUSH_NOTIFICATIONS_SUBSCRIBE_SUCCESSFUL,
      payload: response.data,
    });
  } catch (e) {
    yield put({
      type: Type.PUSH_NOTIFICATIONS_SUBSCRIBE_FAILURE,
      payload: e.message,
    });
  }
}

function* unsubscribeForPushNotifications() {
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/1.1/users/:userId/notifications/unsubscribe',
      method: API_CONST.DELETE,
      // data: action._params,
    });
    // yield put({
    //   type: Type.PUSH_NOTIFICATIONS_UNSUBSCRIBE_SUCCESSFUL,
    //   payload: response.data,
    // });
  } catch (e) {
    yield put({
      type: Type.PUSH_NOTIFICATIONS_UNSUBSCRIBE_FAILURE,
      payload: e.message,
    });
  }
}

//watcher function
export function* homeSaga() {
  yield all([
    takeLatest(Type.JWT_TOKEN, getJWTToken),
    takeLatest(Type.PRESENCE_START, presenceStart),
    takeLatest(Type.GET_HELP_THUNDERBOLT, getHelpThunderbolt),
    takeLatest(Type.HELP_SKILL_SUGGESTION, getSkillSuggestion),
    takeLatest(Type.GET_META_DETAIL, getMetaDetail),
    takeLatest(Type.SET_META_DETAIL, setMetaDetail),
    takeLatest(Type.RESOLVE_USER_DETAIL, resolveUserDetail),
    takeLatest(Type.APP_PERMISSIONS, getAppPermissions),
    takeLatest(
      Type.PUSH_NOTIFICATIONS_SUBSCRIBE,
      subscribeForPushNotifications,
    ),
    takeLatest(
      Type.PUSH_NOTIFICATIONS_UNSUBSCRIBE,
      unsubscribeForPushNotifications,
    ),
  ]);
}
