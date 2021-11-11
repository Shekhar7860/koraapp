import { call, put, takeLatest, all } from 'redux-saga/effects';
import * as Type from '../constants/starred-message.constants';
import { invokeAPICall } from '../../utils/invoke-api';
import API_CONST from '../../utils/api-constants';

function* getStarredMessageList(action) {
    try {
        const response = yield call(invokeAPICall, {
            url: '/api/1.1/ka/boards?type=chat&star=true&offset=' + action._params.offset + '&limit=' + action._params.limit,
            method: API_CONST.GET,

        })
        yield put({
            type: Type.STARRED_MESSAGE_LIST_SUCCESSFUL,
            payload: response.data
        })
        

    } catch (e) {
        yield put({
            type: Type.STARRED_MESSAGE_LIST_FAILURE,
            payload: e.message
        })
    }

}

function* deleteUserFromStarredGrup(action) {
    
    // yield put({
    //     type: Type.DELETE_USER_FROM_STARRED_GROUP_SUCCESSFUL,
    //     payload: action,
    // });
    try {
        const response = yield call(invokeAPICall, {
            url: '/api/1.1/ka/users/:userId/threads/' + action._params.threadId + '/participants',
            method: API_CONST.POST,
            data: action.payload,
        });
        // if (response && response.data) {
        //     action.callback(response.data);
        // }
        yield put({
            type: Type.DELETE_USER_FROM_STARRED_GROUP_SUCCESSFUL,
            payload: action,
        });
    } catch (e) {
        yield put({
            type: Type.DELETE_USER_FROM_STARRED_GROUP_FAILURE,
            payload: e.message,
        });
    }
    
}

export function* starredMessageSaga() {
    yield all([
        takeLatest(Type.GET_STARRED_MESSAGE, getStarredMessageList),
        takeLatest(Type.DELETE_USER_FROM_STARRED_GROUP, deleteUserFromStarredGrup),
    ])
}