import * as Type from '../constants/group-icon.constants';

export default (state = {}, action) => {
  switch (action.type) {
  
    case Type.GROUP_ICON_UPDATE_SUCCESSFUL:
      return {...state, groupIconResponse: action.payload};
    
    default:
      return state;
  }
};
