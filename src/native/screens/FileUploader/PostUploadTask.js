import API_CONST from '../../../shared/utils/api-constants';
import {invokeAPICall} from '../../../shared/utils/invoke-api';
import * as BoardsDao from '../../../dao/BoardsDao';
import * as UsersDao from '../../../dao/UsersDao';
import FileUploadTask from './FileUploadTask';
import * as Entity from '../../realm/dbconstants';
import {isEmpty} from 'lodash';
import {updatePostStatus} from '../../../dao/updatePosts';
import {ResourceState} from '../../realm/dbconstants';

class PostUploadTask {
  constructor(props) {
    this.uploadItem = props.uploadItem;
    this.post = props.uploadItem?.post;
    this.board = props.uploadItem?.board;
    this.onSuccess = props.onSuccess;
    this.onFailure = props.onFailure;
    this.retryCount = 0;
    this.loader = false;
    this.boardData = props.boardData;
    this.uploadProgress = null;
    this.uploadPreogressMap = {};
    this.boardId = props.boardId;
    this.isSendButtonDisabled = false;
    this.newThreadData = props.newThreadData;
    this.uploadTasks = [];
    this.entity = Entity.Post;
    this.urlPostText = 'posts';
  }

  async sendAction() {
    try {
      this.components = await this.post.components.fetch();
    } catch (e) {
      this.components = [];
      console.log('error in sendAction', e);
    }
    this.start();
  }

  async start() {
    let allPromises = [];
    let self = this;
    this.components?.map((component) => {
      switch (component?.componentType) {
        case 'text':
          break;
        default:
          let promise = this.uploadFileComponent(component);
          allPromises.push(promise);
      }
    });
    Promise.all(allPromises)
      .then((values) => {
        console.log('values promise: ', values);
        if (values.includes(false)) {
          self.postDidFailToSend();
        } else {
          self.sendPost();
        }
      })
      .catch((e) => {
        self.sendPost();
        console.log('postDidFailToSend error', e);
      });
  }

  uploadFileComponent = (component) => {
    let self = this;
    return new Promise((resolve, reject) => {
      let userId = UsersDao.getUserId();
      let userAccessToken = UsersDao.getAccessToken();
      let tokenType = UsersDao.getTokenType();
      let uploadTask = new FileUploadTask({
        onSuccess: () => {
          resolve(true);
        },
        onProgress: () => {},
        onFailure: () => {
          reject(false);
        },
        userId: userId,
        accessToken: userAccessToken,
        tokenType: tokenType,
        component: component,
      });
      uploadTask.sendComponent();
      self.uploadTasks.push(uploadTask);
    });
  };

  async sendPost() {
    try {
      if (this.post?.boardId?.length > 0) {
        let components = [];
        let boardId = this.post?.boardId;
        for (const component of this.components) {
          let componentThumbnails = [];
          let fileMeta;
          try {
            fileMeta = await component.fileMeta.fetch();
            if (fileMeta?.thumbnailURL) {
              componentThumbnails = [
                {
                  width: 320,
                  height: 240,
                  size: 'smaller',
                  url: fileMeta?.thumbnailURL,
                },
              ];
            }
          } catch (e) {
            console.log('No fileMeta bcz of : ', component?.componentType);
          }
          switch (component?.componentType) {
            case 'text':
              components.push({
                componentId: component?.componentId,
                componentType: component?.componentType,
                componentBody: component?.componentBody,
              });
              break;
            case 'video':
              components.push({
                componentId: component?.componentId,
                componentType: component?.componentType,
                componentFileId: fileMeta?.fileId,
                componentSize: fileMeta?.fileSize + '',
                componentData: {
                  filename: fileMeta?.fileName,
                },
                componentThumbnails: {
                  url: fileMeta.thumbnailURL,
                  width: 320,
                  height: 240,
                  size: 'smaller',
                },
              });
              break;
            case 'audio':
              let comp = {
                componentId: component?.componentId,
                componentType: component?.componentType,
                componentFileId: fileMeta?.fileId,
                componentSize: fileMeta?.fileSize + '',
                componentData: {filename: fileMeta?.fileName},
                componentThumbnails: componentThumbnails,
              };
              if (component?.componentLength)
                components.push({
                  ...comp,
                  componentLength: component?.componentLength,
                });
              else components.push(comp);
              break;
            case 'image':
            case 'attachment':
              components.push({
                componentId: component?.componentId,
                componentType: component?.componentType,
                componentFileId: fileMeta?.fileId,
                componentSize: fileMeta?.fileSize + '',
                componentData: {filename: fileMeta?.fileName},
                componentThumbnails: componentThumbnails,
              });
              break;
            default:
              break;
          }
        }

        let post = this.post;
        let payload = {
          clientId: post?.clientId,
          linkPreviews: isEmpty(post?.linkPreviews)
            ? undefined
            : post.linkPreviews,
          components: components,
        };
        if (post?.everyoneMentioned) {
          let everyoneMentioned = post?.everyoneMentioned;
          payload = {...payload, everyoneMentioned: everyoneMentioned};
        }
        if (post?.mentions?.length > 0) {
    
          /* let mentions = this.post?.mentions.map((value) => {
            return value?.id;
          }); */
          payload = {...payload, mentions: post?.mentions};
        }
        let updateLastActivity = false;
        let url = '';
        let method = API_CONST.POST;
        if (
          post.postType !== 'comment' ||
          !post.parentId ||
          post.postId === post.parentId
        ) {
          url = '/api/1.1/ka/boards/' + boardId + `/${this.urlPostText}`;
          updateLastActivity = true;
        } else {
          url = `api/1.1/ka/boards/${boardId}/posts/${post.parentId}/comments`;
        }
        if (post.isEdited) {
          url = `api/1.1/ka/boards/${boardId}/posts/${post.postId}`;
          method = API_CONST.PUT;
          payload.classification = 'POSTS';
        }
        invokeAPICall({
          url: url,
          method: method,
          data: payload,
        })
          .then((responseJson) => {
            console.log('success in sendPost : ', responseJson.data);
            if (responseJson && updateLastActivity && !post.edited) {
              BoardsDao.updateLastActivity(responseJson.data, true);
              updatePostStatus({
                post: post,
                status: ResourceState.SENT,
                data: responseJson.data,
              })
                .then(() => {
                  this.onSuccess();
                })
                .catch((error) => {
                  this.postDidFailToSend(error);
                });
            }
          })
          .catch((error) => {
            this.postDidFailToSend();
            console.log('error in PostUploadTask api :', error);
          });
      } else {
        console.log('error in PostUploadTask : no boardId', this.post);
        this.postDidFailToSend();
      }
    } catch (e) {
      console.log('ERROR this.postDidFailToSend();', e.message);
    }
  }

  postDidFailToSend(error) {
    this.onFailure(error);
  }
}

export default PostUploadTask;
