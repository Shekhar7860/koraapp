import {all, put, takeLatest} from 'redux-saga/effects';
import * as Type from '../constants/language.const';

function* langChange(action) {
  // console.log(action)
  yield put({
    type: Type.SELECTED_LANG_SUCCESSFUL,
    payload: action.payload,
  });
}

export function* languageSaga() {
  yield all([takeLatest(Type.SELECTED_LANG, langChange)]);
}
