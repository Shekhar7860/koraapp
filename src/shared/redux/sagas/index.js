import {all} from 'redux-saga/effects';
import {homeSaga} from './home.saga';
import {authSaga} from './auth.saga';
import {loginSaga} from './login.saga';
import {offlineSaga} from './offline.saga';
import {userLogSaga} from './userLog.saga';
import {languageSaga} from './language.saga';
import {createMessageSaga} from './create-message.saga';
import {getThreadListSaga} from './message-thread.saga';
import {MessagePreviewSaga} from './message-preview.saga';
import {NotificationSaga} from './notification.saga';
import {starredMessageSaga} from './starred-message.saga';
import {workspaceSaga} from './workspace.saga';
import {editorSaga} from './editor.saga';
import {groupIconUpdateSaga} from './group-icon.saga';
import discussionSaga from './discussions';
import {meetingSaga} from './meetings.saga';
import {commonSaga} from './common.saga';
import {knowledgeSaga} from './knowledge.saga';
import {createMessageBoardsSaga} from './message-boards.saga';
import {findlyNotificationsSaga} from './findly_notifications.saga';
import {syncWithServer} from './syncwithserver.saga';
import {pre_loginSaga} from './pre-login.saga';
//root saga
//single entry point to start sagas at once
export default function* rootSaga() {
  yield all([
    homeSaga(),
    syncWithServer(),
    authSaga(),
    loginSaga(),
    offlineSaga(),
    userLogSaga(),
    languageSaga(),
    createMessageSaga(),
    getThreadListSaga(),
    MessagePreviewSaga(),
    NotificationSaga(),
    starredMessageSaga(),
    workspaceSaga(),
    editorSaga(),
    groupIconUpdateSaga(),
    discussionSaga(),
    meetingSaga(),
    commonSaga(),
    knowledgeSaga(),
    createMessageBoardsSaga(),
    findlyNotificationsSaga(),
    pre_loginSaga(),
  ]);
}
