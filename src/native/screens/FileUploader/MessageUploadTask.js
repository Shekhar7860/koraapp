import PropTypes from 'prop-types';

import API_CONST from '../../../shared/utils/api-constants';
import {invokeAPICall} from '../../../shared/utils/invoke-api';
import * as BoardsDao from '../../../dao/BoardsDao';
import * as UsersDao from '../../../dao/UsersDao';
import FileUploadTask from './FileUploadTask';
import {ResourceState} from '../../realm/dbconstants';
import {isEmpty} from 'lodash';
import {updateBoardId, updateMessageStatus} from '../../../dao/updateMessages';

class MessageUploadTask {
  constructor(props) {
    this.uploadItem = props.uploadItem;
    this.message = props.uploadItem?.message;
    this.board = props.uploadItem?.board;
    this.onSuccess = props.onSuccess;
    this.onFailure = props.onFailure;
    this.retryCount = 0;
    this.toMembers = [];
    this.loader = false;
    this.boardData = props.boardData;
    this.uploadProgress = null;
    this.uploadPreogressMap = {};
    this.boardId = props.boardId;
    this.isSendButtonDisabled = false;
    this.newThreadData = props.newThreadData;
    this.uploadTasks = [];
  }

  async sendAction() {
    let boardState = this.board?.boardState;
    try {
      this.components = await this.message.components.fetch();
    } catch (e) {
      this.components = [];
      console.log('error in sendAction', e);
    }
  
    if (boardState && boardState === ResourceState.DRAFT) {
      this.findOneToOne();
    } else {
      this.start();
    }
  }

  async findOneToOne() {
    let self = this;
    try {
      this.toMembers = await this.message?.to?.fetch();
    } catch (e) {
      this.toMembers = [];
      console.log('error in findOneToOne toMembers', e);
    }
    this.findBoard(this.toMembers)
      .then((boardId) => {
        self.start();
      })
      .catch((error) => {
        console.log('findOneToOne: failure: ', error);
        if (error) {
          self.messageDidFailToSend();
          return;
        }
        console.log('createNewBoard: ', error);
        self
          .createNewBoard()
          .then((board) => {
            self.start();
          })
          .catch((error) => {
            self.messageDidFailToSend(error);
          });
      });
  }

  async start() {
    let self = this;
    let allPromises = [];
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
          self.messageDidFailToSend();
        } else {
          self.sendMessage();
        }
      })
      .catch((e) => {
        self.messageDidFailToSend();
        console.log('messageDidFailToSend error', e);
      });
  }

  findBoard(participants) {
    let self = this;
    return new Promise((resolve, reject) => {
      let toParticipants = [];
      let isOneToOne = false;
      let oneToOneContact = null;
      participants?.forEach((contact) => {
        toParticipants.push({userId: contact.id});
        if (contact.id !== UsersDao.getUserId()) {
          oneToOneContact = contact;
        }
      });
      console.log('findBoard participants :', participants);
      isOneToOne = toParticipants?.length == 1;
      if (isOneToOne) {
        invokeAPICall({
          url:
            '/api/1.1/ka/ws/:orgId/find_threads?pid=' +
            oneToOneContact?.id +
            '&pid=' +
            UsersDao.getUserId(),
          method: API_CONST.GET,
        })
          .then((responseJson) => {
            let boardId = responseJson?.data?.id;
            if (boardId) {
              let uploadItem = self.uploadItem;
              console.log('Board Id :', responseJson?.data?.id);
              updateBoardId({
                board: uploadItem?.board,
                message: uploadItem?.message,
                data: responseJson?.data,
              })
                .then(() => {
                  resolve(boardId);
                })
                .catch((error) => {
                  resolve(boardId);
                });
            } else {
              reject(false);
            }
          })
          .catch((error) => {
            console.log('findBoard task :', error);
            reject(error);
          });
      } else {
        reject(false);
      }
    });
  }

  createNewBoard() {
    let self = this;
    return new Promise((resolve, reject) => {
      let toParticipants = [];
      self.toMembers?.forEach((contact) => {
        toParticipants.push({userId: contact.id});
      });
      const boardPayload = {
        members: toParticipants,
        listRecepients: [],
        type: self.board?.type,
        clientId: self.board?.clientId,
        ...(self.board?.name && {name: self.board?.name}),
      };
      console.log('createNewBoard :', boardPayload);
      invokeAPICall({
        url: '/api/1.1/ka/ws/:orgId/boards',
        method: API_CONST.POST,
        data: boardPayload,
      })
        .then((responseJson) => {
          console.log(responseJson?.data?.boards);
          let boards = responseJson?.data?.boards;
          if (boards?.length > 0) {
            let board = boards[0];
            let uploadItem = self.uploadItem;
            updateBoardId({
              board: uploadItem?.board,
              message: uploadItem?.message,
              data: board,
            })
              .then(() => {
                // BoardsDao.updateBoardEntity(board);
                resolve(uploadItem?.board);
              })
              .catch((error) => {
                resolve(boardId);
              });
          } else {
            reject();
          }
        })
        .catch((error) => {
          console.log('createNewBoard task :', error);
          reject(error);
        });
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
          this.messageDidFailToSend();
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

  async sendMessage() {
    if (this.message?.boardId?.length > 0) {
      let uploadItem = this.uploadItem;
      let boardId = this.message?.boardId;

      let components = [];
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

      var payload = {
        clientId: this.message?.clientId,
        linkPreviews: isEmpty(this.message?.linkPreviews)
          ? undefined
          : this.message.linkPreviews,
        components: components,
      };
      if (this.message?.replyTo) {
        let replyTo = {
          type: this.message?.replyTo?.type,
          messageId: this.message?.replyTo?.messageId,
          boardId: this.message?.replyTo?.boardId,
        };
        payload = {...payload, replyTo: replyTo};
      }

      if (this.message?.everyoneMentioned) {
        let everyoneMentioned = this.message?.everyoneMentioned;
        payload = {...payload, everyoneMentioned: everyoneMentioned};
      }

      if (this.message?.mentions?.length > 0) {
        /* let mentions = this.message?.mentions.map((value) => {
          return value?.id;
        }); */
        payload = {...payload, mentions: this.message?.mentions};
      }
      await invokeAPICall({
        url: '/api/1.1/ka/boards/' + boardId + '/messages',
        method: API_CONST.POST,
        data: payload,
      })
        .then((responseJson) => {
          console.log('success in addMessage', responseJson.data);
          if (responseJson) {
            BoardsDao.updateLastActivity(responseJson.data.message);
            updateMessageStatus({
              message: uploadItem?.message,
              status: ResourceState.SENT,
              data: responseJson.data,
            })
              .then(() => {
                this.onSuccess();
              })
              .catch((error) => {
                this.messageDidFailToSend();
              });
          }
        })
        .catch((error) => {
          this.messageDidFailToSend();
          console.log('MessageUploadTask :', error);
        });
    } else {
      this.messageDidFailToSend();
    }
  }

  messageDidFailToSend(error) {
    let self = this;
    let uploadItem = this.uploadItem;
    updateMessageStatus({
      message: uploadItem?.message,
      status: ResourceState.FAILED,
    })
      .then(() => {
        self.onFailure(error);
      })
      .catch((error) => {
        self.onFailure(error);
      });
  }
}

MessageUploadTask.defaultProps = {
  onSuccess: () => {},
  onFailure: () => {},
  uploadItem: null,
  reply: [],
  replyPrivate: [],
  activeBoardId: null,
};

MessageUploadTask.propTypes = {
  onSuccess: PropTypes.func,
  onFailure: PropTypes.func,
  reply: PropTypes.object,
  replyPrivate: PropTypes.object,
  uploadItem: PropTypes.object,
  activeBoardId: PropTypes.string,
};

export default MessageUploadTask;
