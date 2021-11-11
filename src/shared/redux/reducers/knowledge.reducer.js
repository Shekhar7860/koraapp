import * as Type from '../constants/knowledge.constants';
import {cloneDeep} from 'lodash';
import * as UsersDao from '../../../dao/UsersDao';

export default (state = {}, action) => {
  switch (action.type) {
    case Type.UPDATE_KNOWLEDGE:
      return {...state, documents: action.payload};
    case Type.GET_DOC_COMMENTS_SUCCESSFUL:
      return {...state, docComments: action.payload};
    case Type.GET_DOC_REPLY_SUCCESSFUL:
      return {...state, docCommentReply: action.payload};
    case Type.RESOLVE_POST_SUCCESSFUL:
      let docComment = state.docComments;
      let index = docComment?.posts?.findIndex(
        (item) => item.postId === action.payload?._id,
      );
      docComment.posts[index].status = action.payload.status;
      return {...state, docComments: cloneDeep(docComment)};
    case Type.ADD_REPLY_SUCCESSFUL:
      let docReplies = state.docCommentReply;
      let object = action.payload;
      const profile = UsersDao.getUser();
      object.author = profile || object.author;
      docReplies.comments.push(object);
      return {...state, docCommentReply: cloneDeep(docReplies)};
    default:
      return state;
  }
};
