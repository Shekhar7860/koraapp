import * as Type from '../constants/create-message.constant';

const initState = {
  draftArray: [],
  contactlistData: [],
  recentData: [],
  topicName: '',
};
export default (state = initState, action) => {
  switch (action.type) {
    case Type.SET_TOPIC_NAME:
      return {...state, topicName: action.payload};
    case Type.CONTACT_LIST_SUCCESSFUL:
      return {...state, contactlistData: action.payload};
    case Type.FAVOURITE_CONTACT_LIST_SUCCESSFUL:
      return {...state, favouriteData: action.payload};
    case Type.RECENT_CONTACT_LIST_SUCCESSFUL:
      return {...state, recentData: action.payload};
    case Type.SELECTED_CONTACT_LIST_SUCCESSFUL:
      return {...state, contactData: action.payload};
    case Type.SELECTED_CONTACT_LIST_FAILURE:
      return state;
    case Type.GROUP_NAME_FAILURE:
      return state;
    case Type.GROUP_NAME_SUCCESSFUL:
      return {...state, grpName: action.payload};
    case Type.DRAFT_ARRAY_FAILURE:
      return state;
    case Type.DRAFT_ARRAY_SUCCESSFUL:
      return {...state, draftArray: action.payload};
    case Type.THREAD_FIND_SUCCESSFUL:
      return {...state, threadFindData: action.payload};
    case Type.THREAD_FIND_FAILURE:
      return state;
    case Type.CURRENT_DRAFT_ID_SUCCESSFUL:
      return {...state, currentDraftId: action.payload};
    case Type.CURRENT_DRAFT_ID_FAILURE:
      return state;
    default:
      return state;
  }
};
