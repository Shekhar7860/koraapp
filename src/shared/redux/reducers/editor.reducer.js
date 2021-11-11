import {REDUX_FLUSH} from '../constants/auth.constants';
import * as Type from '../constants/editor.constants';

const initState = {};
export default (state = initState, action) => {
    switch (action.type) {
        case REDUX_FLUSH:
            return initState;

        case Type.GET_DOCUMENT_SUCCESSFUL:
            return {...state, model: action.payload};
        case Type.GET_DOCUMENT_FAILURE:
            return state;

        case Type.SAVE_DOCUMENT_SUCCESSFUL:
            return {...state, model: {...state.model, ...action.payload}};
        case Type.SAVE_DOCUMENT_FAILURE:
            return state;

        case Type.UPDATE_DOCUMENT_SUCCESSFUL:
            return {...state, model: {...state.model, ...action.payload}};
        case Type.UPDATE_DOCUMENT_FAILURE:
            return state;

        case Type.UPDATE_COMPONENTS:
            return {...state, model: {...state.model, components: action.components}}

        default:
            return state;
    }
};
