const REQUEST = 'REQUEST';
const SUCCESS = 'SUCCESS';
const FAILURE = 'FAILURE';
const defaultTypes = [REQUEST, SUCCESS, FAILURE];

function createRequestTypes(base, types = defaultTypes) {
  const res = {};
  types.forEach((type) => (res[type] = `${base}_${type}`));
  return res;
}

export const LOGIN = createRequestTypes('LOGIN', [...defaultTypes]);
export const ACCOUNT = createRequestTypes('ACCOUNT', [...defaultTypes]);
export const APP = createRequestTypes('APP', ['START', 'READY', 'INIT']);
export const USERS_TYPING = createRequestTypes('USERS_TYPING', [
  'ADD',
  'REMOVE',
  'CLEAR',
]);
export const SETTINGS = createRequestTypes('SETTINGS', ['CLEAR', 'ADD']);
export const APP_STATE = createRequestTypes('APP_STATE', [
  'FOREGROUND',
  'BACKGROUND',
]);
export const MARK_MSGS_READ = createRequestTypes('MARK_MSGS_READ', [
  ...defaultTypes,
]);
export const MARK_POSTS_READ = createRequestTypes('MARK_POSTS_READ', [
  ...defaultTypes,
]);
export const QUERY_ITEM = createRequestTypes('QUERY_ITEM', [
  ...defaultTypes,
]);
export const CREATE_NEW_BOARD = createRequestTypes('CREATE_NEW_BOARD', [
  ...defaultTypes,
]);