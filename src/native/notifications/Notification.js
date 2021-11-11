import React from 'react';
import {View} from 'react-native';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';

import {
  updateMessageBoard,
  markMessagesAsRead,
  markPostsAsRead,
} from '../../shared/redux/actions/message-board.action';
import {
  updateMessage,
  deleteMessage,
  setActiveBoard,
} from '../../shared/redux/actions/message-thread.action';
import {eventsChanged} from '../../shared/redux/actions/meetings.action';
import {
  // getAllPosts,
  // getDiscussions,
  updatePost,
  updateBoard,
  selectedDiscussion,
  getComments,
  removeBoard,
} from '../../shared/redux/actions/discussions.action';
import {
  setActiveWsId,
  setActiveTab,
} from '../../shared/redux/actions/common.action';
import * as BoardsDao from '../../dao/BoardsDao';
import * as MessagesDao from '../../dao/MessagesDao';
import {updateWorkspace} from '../../shared/redux/actions/workspace.action';

class Notification extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {}

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.notificationResp !== this.props.notificationResp) {
      const customdata = this.props.notificationResp.customdata;
      let action = {
          _params: {
            wsId: customdata.ed?.nsId,
            rId: customdata.ed?.boardId,
          },
        },
        data = {};
      switch (customdata.t) {
        case 'wsc':
          this.props.updateWorkspace(this.props.notificationResp.payload.ws);
          break;
        case 'wen':
          this.props.updateWorkspace(this.props.notificationResp.payload.ws);
          break;
        case 'wu':
          this.props.updateWorkspace(this.props.notificationResp.payload.ws);
          break;
        case 'wus':
          this.props.updateWorkspace(this.props.notificationResp.payload.ws);
          break;
        case 'wac':
          this.props.updateWorkspace(this.props.notificationResp.payload.ws);
          break;
        case 'p':
          data = {
            response: this.props.notificationResp.payload.post,
            action,
            flag: 'addPost',
            t: customdata.t,
          };
          this.props.updatePost(data);
          break;
        case 'pm':
          data = {
            response: this.props.notificationResp.payload.post,
            action,
            flag: 'addPost',
          };
          this.props.updatePost(data);
          break;
        case 'kur':
          action._params.postId = customdata.ed?.id;
          data = {
            response: this.props.notificationResp.payload.post,
            action,
            flag: 'reminder',
          };
          this.props.updatePost(data);
          break;
        case 'bam':
          action._params = {
            ...action._params,
            rId: this.props.notificationResp.payload.board.id,
          };

          if (
            this.props.notificationResp?.payload?.board?.type === 'groupChat'
          ) {
            data = {
              response: this.props.notificationResp.payload.board,
              action,
              flag: 'updateBoard',
            };

            this.props.updateBoard(data);
          } else {
            data = {
              response: this.props.notificationResp.payload.board,
              action,
              flag: '',
            };
            this.props.updateBoard(data);
            //this.props.updatePost(data);
          }

          // this.props.updatePost(data);
          break;
        case 'bc':
          action._params = {
            ...action._params,
            rId: this.props.notificationResp.payload.board.id,
          };
          if (
            this.props.notificationResp?.payload?.board?.type === 'groupChat' ||
            this.props.notificationResp?.payload?.board?.type === 'discussion'
          ) {
            data = {
              response: this.props.notificationResp.payload.board,
              action,
              flag: 'updateBoard',
            };

            this.props.updateBoard(data);
          } else {
            data = {
              response: this.props.notificationResp.payload.board,
              action,
              flag: '',
            };
            this.props.updatePost(data);
          }
          break;
        case 'bd':
          if (this.props.notificationResp.payload.board.type === 'discussion') {
            this.props.removeBoard(action);
          } else {
          }
          break;
        case 'bar':
        case 'bne':
          data = {
            response: this.props.notificationResp.payload.board,
            flag: 'updateBoard',
          };
          this.props.updateBoard(data);
          break;
        case 'baa':
        case 'bu':
          if (this.props.notificationResp.payload.board.type === 'discussion') {
            action.boardObj = this.props.notificationResp.payload.board;
            data = {
              response: this.props.notificationResp.payload.board,
              action,
              flag: 'updateDiscussion',
            };
            this.props.updateBoard(data);
          } else {
            this.props.updateMessageBoard(
              this.props.notificationResp?.payload?.board,
            );
          }
          break;
        case 'bms':
        case 'bsu':
          if (this.props.notificationResp?.payload?.board) {
            let board = this.props.notificationResp?.payload?.board;
            this.props.updateBoard(board);
          }
          break;
        case 'pem':
        case 'pc':
          data = {
            response: this.props.notificationResp.payload.post,
            action,
            flag: 'addComment',
          };
          this.props.updatePost(data);
          break;
        case 'pt':
          data = {
            response: this.props.notificationResp.payload.post,
            action,
            flag: 'addPost',
          };

          this.props.updatePost(data);
          break;
        case 'pr':
          let prParams = this.props.notificationResp.payload;
          this.props.markPostsAsRead(prParams);
          break;
        case 'pe':
          action._params.postId = customdata.ed?.id;

          if (customdata.event === 'ka_post_emotion') {
            action._params.event = 'emotion';
          }
          data = {
            response: this.props.notificationResp.payload.post,
            action,
          };
          data.flag =
            data.response.postType === 'default' ? 'reactPost' : 'reactComment';
          this.props.updatePost(data);
          break;
        case 'pd':
          action._params = {
            ...action._params,
            postId: customdata.ed?.id,
          };
          data = {
            response: this.props.notificationResp.payload.post,
            action,
            flag: 'deletePost',
          };
          this.props.updatePost(data);
          break;
        case 'pcr':
          data = {
            response: this.props.notificationResp.payload.post,
            action,
            flag: 'addReply',
          };
          this.props.updatePost(data);
          break;
        case 'med':
          let medParams = this.props.notificationResp.payload;
          this.props.markMessagesAsRead(medParams);
          break;
        case 'm':
        case 'mm':
        case 'me':
        case 'mt':
          let msg = this.props.notificationResp?.payload?.message;
          this.props.updateMessage(msg, customdata.t);
          break;
        case 'md':
          if (this.props.notificationResp?.payload?.message) {
            let message = this.props.notificationResp?.payload?.message;
            MessagesDao.updateDeleteMessage(message.messageId);
            // var msgRec = this.props.notificationResp?.payload?.message;
            // msgRec['state'] = 'recalled'
            // this.props.updateMessage(msgRec, customdata.t);
          }
          break;
        case 'msd':
          if (this.props.notificationResp?.payload?.message) {
            let message = this.props.notificationResp?.payload?.message;
            MessagesDao.deleteMessageObject(message.messageId);
            // let msg = this.props.notificationResp?.payload?.message;
            // this.props.updateMessage(msg, customdata.t);
          }
          break;
        case 'emu':
          // console.log(
          //   'Create meeting',
          //   JSON.stringify(this.props.notificationResp),
          // );
          this.props.eventsChanged(this.props.notificationResp?.payload);
          break;
        case 'emd':
          this.props.eventsChanged(this.props.notificationResp?.payload);
          break;
      }
      if (this.props.notificationResp?.channels?.length) {
        this.notify(
          this.props.notificationResp?.notification?.title,
          this.props.notificationResp?.notification?.body,
          this.props.notificationResp,
        );
      }
    }
    if (prevProps.notificationStatus !== this.props.notificationStatus) {
      this.updatePresenseStatus(this.props.notificationStatus);
    }
    if (prevProps.typingSubscribe !== this.props.typingSubscribe) {
      console.log('Typing Subscription Change notification called:');
    }
    if (prevProps.typing !== this.props.typing) {
      if (this.props.typing) {
        if (
          !this.props.newMessageChatFlag &&
          !this.props.newDisc &&
          this.props.typing.resourceId === this.props.activeBoardId &&
          this.props.typing?.userId !== this.props.currentUser?.userInfo?.id
        ) {
          let participantsName = [];
          if (!this.props.contacts[this.props.typing?.userId]?.fN.length)
            return;
          participantsName.push(
            this.props.contacts[this.props.typing?.userId]?.fN +
              ' ' +
              this.props.contacts[this.props.typing?.userId]?.lN,
          );
          let res = '';
          theseAreTyping = () => {
            return res;
          };
          this.showTypingIndicator(theseAreTyping);
        } else if (
          !this.props.newMessageChatFlag &&
          !this.props.newDisc &&
          this.props.typing.resourceId === this.props.activeDiscId &&
          this.props.typing.userId &&
          this.props.typing.userId !== this.props.currentUser?.userInfo?.id
        ) {
          let participantsName = [];
          let typingUserId = this.props.typing.userId;
          let filterDiscussion = this.props.boards?.filter(
            (record) => record.id === this.props.activeDiscId,
          );
          let recentMembers = [];
          let user = recentMembers.filter(
            (member) => member._id === typingUserId,
          );
          let userName = user[0]?.fN + ' ' + user[0]?.lN;
          if (!user[0]?.fN) return;
          participantsName.push(userName);
          let res;
          theseAreTyping = () => {
            return res;
          };
          this.showTypingIndicator(theseAreTyping);
        }
      }
    }
  }
  notify = (title, desc, notiDetail) => {
    let sound = 'None';
    let isAllowed = false;
    isAllowed =
      notiDetail?.channels?.length && notiDetail?.channels?.includes('push');
    if (notiDetail?.sound) {
      sound = notiDetail?.sound;
    }
    if (!isAllowed) {
      return;
    }
    if (!('Notification' in window)) {
      return;
    }
    Notification.requestPermission((permission) => {
      if (permission === 'granted') {
        const notification = new Notification(title, {
          body: desc,
          icon: Favicon,
          dir: 'auto',
        });
        notification.addEventListener(
          'show',
          function () {
            const soundVal = document.getElementById('notify_sound');
            soundVal.src = defultSound;
            soundVal.play();
          },
          false,
        );
        const timerNotification = setTimeout(() => {
          notification.close();
        }, 10000);
        notification.onclick = () => {
          this.redirectOnObject(notiDetail);
          notification.close();
          parent.focus();
          window.focus();
          clearTimeout(timerNotification);
        };
      }
    });
  };

  showTypingIndicator = (theseAreTyping) => {
    console.log('m typing');
  };

  findIndexByKeyValue = (_array, key, value) => {
    for (var i = 0; i < _array.threads.length; i++) {
      if (_array.threads[i][key] == value) {
        return i;
      }
    }
    return -1;
  };

  redirectOnObject = (obj) => {
    if (obj?.customdata) {
      if (['m', 'mt', 'med', 'me'].indexOf(obj.customdata.t) > -1) {
        if (this.props.activeTab !== 'chat') {
          this.props.setActiveTab('chat');
        }
        if (this.props.activeDiscId !== obj.customdata?.ed?.boardId) {
          this.props.selectedDiscussion({
            id: obj.customdata?.ed?.boardId,
            wsId: '',
            type: 'chat',
          });
        }
        if (this.props.activeBoardId !== obj.customdata?.ed?.boardId) {
          this.props.setActiveBoard({boardId: obj.customdata?.ed?.boardId});
        }
      } else if (
        ['p', 'pm', 'pt', 'pe', 'pem', 'pc', 'pcr'].indexOf(obj.customdata.t) >
          -1 ||
        (['bam', 'baa', 'bu', 'bc'].indexOf(obj.customdata.t) > -1 &&
          obj.payload.board.type === 'discussion')
      ) {
        if (this.props.activeTab !== 'discussion') {
          this.props.setActiveTab('discussion');
        }
        if (this.props.activeWsId !== obj.customdata?.ed?.nsId) {
          this.props.setActiveWsId(obj.customdata?.ed?.nsId);
        }
        if (this.props.activeDiscId !== obj.customdata?.ed?.boardId) {
          this.props.selectedDiscussion({
            id: obj.customdata?.ed?.boardId,
            wsId: obj.customdata?.ed?.nsId,
            type: 'discussion',
          });
        }
      }
    }
  };

  updatePresenseStatus = (obj) => {};

  render() {
    return <View />;
  }
}

const mapStateToProps = (state) => {
  // console.log('====================================Notification==============================');
  const {notification} = state;
  return {
    notificationResp: notification?.notificationResp,
    notificationStatus: notification?.notificationStatus,
    typing: notification?.typing,
    typingSubscribe: notification?.typingSubscribe,
  };
};
export default connect(mapStateToProps, {
  // getAllPosts,
  // getDiscussions,
  updatePost,
  updateBoard,
  selectedDiscussion,
  updateMessage,
  getComments,
  removeBoard,
  updateMessageBoard,
  markMessagesAsRead,
  markPostsAsRead,
  eventsChanged,
  deleteMessage,
  setActiveWsId,
  setActiveTab,
  setActiveBoard,
  updateWorkspace,
})(withTranslation()(Notification));
