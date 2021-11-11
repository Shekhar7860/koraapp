import * as Type from '../constants/knowledge.constants';

export function getDocumentsList(payload) {
  return {
    type: Type.GET_KNOWLEDGE_LIST,
    payload,
  };
}

export function getComments(_params) {
  return {
    type: Type.GET_DOC_COMMENTS,
    _params,
  };
}

export function getReplies(_params) {
  return {
    type: Type.GET_DOC_COMMENT_REPLY,
    _params,
  };
}

export function addReply(_params, payload) {
  return {
    type: Type.ADD_REPLY,
    _params,
    payload,
  };
}

export function resolvePost(_params, payload) {
  return {
    type: Type.KNOWLEDGE_RESOLVE_POST,
    _params,
    payload,
  };
}
