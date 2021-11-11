import {SAVE_DOCUMENT, GET_DOCUMENT, UPDATE_DOCUMENT, UPDATE_COMPONENTS} from '../constants/editor.constants';

export function saveDocument(payload) {
  return {
    type: SAVE_DOCUMENT,
    payload: payload,
  };
}

export function getDocument(kId) {
  return {
    type: GET_DOCUMENT,
    kId: kId,
  };
}

export function updateDocument(kId, payload) {
  return {
    type: UPDATE_DOCUMENT,
    kId: kId,
    payload: payload
  };
}

export function updateComponents(components) {
  return {
    type: UPDATE_COMPONENTS,
    components: components
  }
}

