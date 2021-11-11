import {
  CONTACT_LIST,
  RECENT_CONTACT_LIST,
  FAVOURITE_CONTACT_LIST,
  SELECTED_CONTACT_LIST,
  GROUP_NAME,
  DRAFT_ARRAY,
  THREAD_FIND,
  CURRENT_DRAFT_ID,
  SET_TOPIC_NAME,
} from '../constants/create-message.constant';

export function getContactList(payload) {
  return {
    type: CONTACT_LIST,
    payload,
  };
}
export function getFavouriteContactList() {
  return {
    type: FAVOURITE_CONTACT_LIST,
  };
}
export function getRecentContactList() {
  return {
    type: RECENT_CONTACT_LIST,
  };
}

export function selectedContactList(contacts) {
  return {
    type: SELECTED_CONTACT_LIST,
    contacts,
  };
}

export function saveGroupName(grpName) {
  return {
    type: GROUP_NAME,
    grpName,
  };
}
export function threadFind(contact, onSuccessCB = () => {}) {
  return {
    type: THREAD_FIND,
    contact,
    onSuccessCB,
  };
}

export function saveDraftArray(draftArray) {
  return {
    type: DRAFT_ARRAY,
    draftArray,
  };
}

export function getCurrentDraftId(draftId) {
  return {
    type: CURRENT_DRAFT_ID,
    draftId,
  };
}

export function setTopicName(payload) {
  return {
    type: SET_TOPIC_NAME,
    payload,
  };
}
