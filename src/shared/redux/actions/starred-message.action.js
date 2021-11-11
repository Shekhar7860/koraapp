import {GET_STARRED_MESSAGE, DELETE_USER_FROM_STARRED_GROUP} from '../constants/starred-message.constants';

export function getStarredMessageList(_params) {
  return {
    type: GET_STARRED_MESSAGE,
    _params: _params
  }
}

export function deleteUserFromStarredGrup(_params, payload ){
  return {
    type: DELETE_USER_FROM_STARRED_GROUP,
    payload: payload,
    _params: _params
  }
}
