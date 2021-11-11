import {combineReducers} from 'redux';
import homeReducer from './home.reducer.js';
import loginReducer from './login.reducer.js';
import languageReducer from './language.reducer.js';
import authReducer from './auth.reducer.js';
import userLogReducer from './userLog.reducer';
import messageThreadReducer from './message-thread.reducer';
import offlineReducer from './offline.reducer.js';
import createMessageReducer from './create-message-reducer.js';
import messagePreviewReducer from './message-preview.reducer.js';
import notificationReducer from './notification.reducer';
import starredMessageReducer from './starred-message-reducer.js';
import workspaceReducer from './workspace.reducer.js';
import editorReducer from './editor.reducer.js';
import bottomTabReducer from './bottom-tab.reducer';
import groupIconReducer from './group-icon.reducer';
import discussionReducer from './discussions.reducer.js';
import nativeReducer from './native.reducer.js';
import commonReducer from './common.reducer.js';
import messageBoards from './message-boards.reducer.js';
import meetingsReducer from './meetings.reducer.js';
import knowledgeReducer from './knowledge.reducer.js';
import findly_notification from './findly_notifications.reducer.js';
import syncwithserver from './syncwithserver.reducer';

const rootReducer = combineReducers({
  createMessage: createMessageReducer,
  home: homeReducer,
  login: loginReducer,
  language: languageReducer,
  auth: authReducer,
  userLogStatus: userLogReducer,
  offline: offlineReducer,
  messageThreadList: messageThreadReducer,
  preview: messagePreviewReducer,
  notification: notificationReducer,
  starredMessage: starredMessageReducer,
  workspace: workspaceReducer,
  editor: editorReducer,
  bottomTab: bottomTabReducer,
  groupIconUpdate: groupIconReducer,
  common: commonReducer,
  discussion: discussionReducer,
  native: nativeReducer,
  messageBoards: messageBoards,
  meetingsReducer: meetingsReducer,
  knowledge: knowledgeReducer,
  findlyNotifications: findly_notification,
  sync: syncwithserver,
});

export default rootReducer;
