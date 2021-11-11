import {all} from 'redux-saga/effects';
import {discussionListSaga} from './discussion-list.saga';
import {previewSaga} from './preview.saga';

//root saga
//single entry point to start sagas at once
export default function* discussionSaga() {
  yield all([discussionListSaga(), previewSaga()]);
}
