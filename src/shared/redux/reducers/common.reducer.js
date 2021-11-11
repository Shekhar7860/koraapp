import {
  PROCESSED_IMAGE_URL,
  TOAST_MESSAGE,
} from '../constants/common.constants';

const initState = {};
export default (state = initState, action) => {
  switch (action.type) {
    case PROCESSED_IMAGE_URL:
      return {...state, processedImage: action.payload};
    case TOAST_MESSAGE:
      return {...state, toastMessage: action.payload};
    default:
      return state;
  }
};
