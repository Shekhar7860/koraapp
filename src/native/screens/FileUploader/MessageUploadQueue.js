import uuid from 'react-native-uuid';
import MessageUploadTask from './MessageUploadTask';
import PostUploadTask from './PostUploadTask';

class MessageUploadQueue {
  addMessage(message, board) {
    var payload = {
      id: uuid.v1(),
      message: message,
      board: board,
    };

    let operation = new MessageUploadTask({
      uploadItem: payload,
      onSuccess: () => {},
      onFailure: () => {},
    });
    operation.sendAction();
  }

  addPost(post, board) {
    let payload = {
      id: uuid.v1(),
      post: post,
      board: board,
    };

    let operation = new PostUploadTask(
      {
        uploadItem: payload,
        onSuccess: () => {},
        onFailure: () => {},
      },
      'post',
    );
    operation.sendAction();
  }
}

MessageUploadQueue.defaultProps = {
  onSuccess: () => {},
  onFailure: () => {},
  uploadItem: null,
};

export default new MessageUploadQueue({});
