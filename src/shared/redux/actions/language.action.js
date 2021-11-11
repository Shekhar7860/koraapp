import {SELECTED_LANG} from '../constants/language.const';

export function changeLang(language) {
  return {
    type: SELECTED_LANG,
    payload: language,
  };
}
