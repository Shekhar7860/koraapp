import {all, call, put, takeLatest, select} from 'redux-saga/effects';
import {invokeAPICall} from '../../utils/invoke-api';
import API_CONST from '../../utils/api-constants';
import * as Type from '../constants/meetings.constants';
import * as UsersDao from '../../../dao/UsersDao';
import {SHOW_LOADER} from '../constants/home.constants';
import {Alert} from 'react-native';

function* eventsChanged(action) {
  try {
    yield put({
      type: Type.EVENT_CHANGED_SUCCESSFUL,
      payload: action.payload,
    });
  } catch (e) {
    console.log('Events changed', e.message);
    yield put({
      type: Type.EVENT_CHANGED_FAILURE,
      error: e.message,
    });
  }
}

function* getAllTasks(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: 'api/1.1/ka/users/:userId/tasks?meta=true',
      method: API_CONST.GET,
    });
    yield put({
      type: Type.GET_ALL_TASKS_SUCCESSFUL,
      payload: response.data,
    });
  } catch (e) {
    console.log('Get all tasks', e.message);
    yield put({
      type: Type.GET_ALL_TASKS_FAILURE,
      error: e.message,
    });
  }
}

function* getAllEvents(action) {
  try {
    yield put({
      type: SHOW_LOADER,
      payload: true,
    });
    const response = yield call(invokeAPICall, {
      url: 'api/1.1/ka/users/' + UsersDao.getUserId() + '/getCalendars',
      method: API_CONST.POST,
      data: action.payload,
    });
    yield put({
      type: Type.GET_ALL_EVENTS_SUCCESSFUL,
      payload: response.data.calendars[0],
    });
    yield put({
      type: SHOW_LOADER,
      payload: false,
    });
  } catch (e) {
    console.log('Get all events', e.message);
    yield put({
      type: Type.GET_ALL_EVENTS_FAILURE,
      error: e.message,
    });
  }
}

function* updateEvent(action) {
  try {
    yield put({
      type: Type.UPDATE_EVENT_SUCCESSFUL,
      payload: false,
    });
    const response = yield call(invokeAPICall, {
      url: `api/1.1/ka/users/:userId/calendar/updateEvent`,
      method: API_CONST.POST,
      data: action.payload,
    });
    yield put({
      type: Type.UPDATE_EVENT_SUCCESSFUL,
      payload: true,
    });
  } catch (e) {
    console.log(e.message);
  }
}

function* deleteEvent(action) {
  try {
    yield put({
      type: Type.EVENT_DELETED,
      payload: false,
    });
    const response = yield call(invokeAPICall, {
      url: `api/1.1/ka/users/:userId/calendar/cancelEvents`,
      method: API_CONST.POST,
      data: action.payload,
    });
    yield put({
      type: Type.EVENT_DELETED,
      payload: true,
    });
  } catch (e) {
    console.log(e);
  }
}

function* sendReminder(action) {
  try {
    yield put({
      type: Type.REMINDER,
      payload: false,
    });
    console.log(action);
    const response = yield call(invokeAPICall, {
      url: `api/1.1/ka/users/:userId/meetingrequest/${action.payload.mrId}/reminder`,
      method: API_CONST.POST,
    });
    yield put({
      type: Type.REMINDER,
      payload: true,
    });
  } catch (e) {
    console.log(e);
  }
}

function* getMemAvailability(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: `api/1.1/ka/users/:userId/calendar/availability`,
      method: API_CONST.POST,
      data: action.payload,
    });
    yield put({
      type: Type.MEMBER_AVAILABLE_STATUS,
      payload: response.data.availability,
    });
  } catch (e) {
    console.log(e.message);
  }
}

function* getAttendeeContact(action) {
  try {
    const response = yield call(invokeAPICall, {
      url: '/api/1.1/ka/users/:userId/search/contacts?q=' + action.payload,
      method: API_CONST.GET,
    });
    yield put({
      type: Type.ATTENDEE_LIST_SUCCESSFUL,
      payload: response.data,
    });
  } catch (e) {
    yield put({
      type: Type.ATTENDEE_LIST_FAILURE,
      payload: e.message,
    });
  }
}

function* createEvent(action) {
  try {
    yield put({
      type: Type.GET_CALENDAR_EVENT,
      payload: {
        created: false,
        newEvent: null,
      },
    });
    const response = yield call(invokeAPICall, {
      url: `api/1.1/ka/users/:userId/calendar/createEvents`,
      method: API_CONST.POST,
      data: action.payload,
    });
    yield put({
      type: Type.GET_CALENDAR_EVENT,
      payload: {
        created: true,
        newEvent: response.data,
      },
    });
  } catch (e) {
    console.log(e);
  }
}

function* getRoomList(action) {
  try {
    const response = yield call(invokeAPICall, {
      url:
        'api/1.1/ka/users/:userId/profile/meetingType/rooms/search?q=' +
        action.payload,
      method: API_CONST.GET,
    });
    //console.log('Saga', JSON.stringify(response));
    yield put({
      type: Type.ROOMS_LIST,
      payload: response.data.data,
    });
  } catch (e) {
    console.log(e.message);
  }
}

function* rescheduleEvent(action) {
  try {
    yield put({
      type: Type.RESCHEDULE_EVENT_SUCCESSFUL,
      payload: {
        edited: false,
        event: null,
      },
    });
    const response = yield call(invokeAPICall, {
      url: `api/1.1/ka/users/:userId/calendar/rescheduleEvent`,
      method: API_CONST.POST,
      data: action.payload,
    });
    yield put({
      type: Type.RESCHEDULE_EVENT_SUCCESSFUL,
      payload: {
        edited: true,
        event: response.data,
      },
    });
  } catch (e) {
    console.log(e.message);
  }
}

export function* meetingSaga() {
  yield all([takeLatest(Type.GET_ALL_EVENTS, getAllEvents)]);
  yield all([takeLatest(Type.GET_ALL_TASKS, getAllTasks)]);
  yield all([takeLatest(Type.EVENT_CHANGED, eventsChanged)]);
  yield all([takeLatest(Type.UPDATE_EVENT, updateEvent)]);
  yield all([takeLatest(Type.DELETE_EVENT, deleteEvent)]);
  yield all([takeLatest(Type.SEND_EVENT_REMINDER, sendReminder)]);
  yield all([takeLatest(Type.CREATE_CALENDAR_EVENT, createEvent)]);
  yield all([takeLatest(Type.ATTENDEE_LIST, getAttendeeContact)]);
  yield all([takeLatest(Type.GET_MEMBER_AVAILABILITY, getMemAvailability)]);
  yield all([takeLatest(Type.GET_ROOMS, getRoomList)]);
  yield all([takeLatest(Type.RESCHEDULE_EVENT, rescheduleEvent)]);
}
