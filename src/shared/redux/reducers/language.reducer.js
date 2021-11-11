import {SELECTED_LANG_SUCCESSFUL} from '../constants/language.const';
import {REDUX_FLUSH} from '../constants/auth.constants';

const initState = {selectedLang: 'en'};
export default (state = initState, action) => {
  switch (action.type) {
    case REDUX_FLUSH:
      return initState;
    case SELECTED_LANG_SUCCESSFUL:
      return {...state, selectedLang: action.payload};
    default:
      return state;
  }
};
