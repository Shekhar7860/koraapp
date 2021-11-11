import {Platform} from 'react-native';
import uuid from 'react-native-uuid';

import BotClient from '../../bot-sdk/rtm/BotClient';
import * as UsersDao from '../../dao/UsersDao';

class KoraBotClient {
  constructor() {
    this.botClient = new BotClient();
    this.messages = [];
    this.botInfo = [];
  }

  initializeBotClient(result, applicationControl, reconnectTime) {
    let reconnect = false;
    if (reconnectTime) {
      const msgTime = new Date(reconnectTime);
      const currTime = new Date();
      let res = (currTime.getTime() - msgTime.getTime()) / 1000;
      res = res / 60;
      res = Math.abs(Math.round(res));
      if (res > 15) {
        reconnect = false;
      } else {
        reconnect = true;
      }
    } else {
      reconnect = false;
    }

    if (result !== null && result?.customData) {
      let customData = {
        ...result?.customData,
        reconnect: true,
        channelClient: Platform.OS,
        version: 'v2',
      };
      this.botInfo = {
        chatBot: 'May 20',
        taskBotId: 'st-5f74f719-84ba-5da7-8e76-fe6bd1c6c926',
        client: Platform.OS,
        linkedBotCustomData: customData,
      };

      this.botClient.initialize(this.botInfo, null, null);
      this.botClient.connectWithJwToken(result.jwt);
    }
  }

  disconnect() {}

  reconnect() {}

  getBotHistory() {
    this.botClient.getBotHistory();
  }

  sendMessage(message, data = null, data_type = '') {
    var clientMessageId = new Date().getTime();
    var msgData = {};
    var contactMsg = '';

    switch (data_type) {
      case 'contact_suggestion': {
        break;
      }
      case 'knowledge_data': {
        msgData = {
          type: 'user_message',
          message: [
            {
              type: 'text',
              cInfo: {
                body: 'Ok, I have added knowledge article.',
                params: data,
              },
              clientMessageId: clientMessageId,
            },
          ],
          createdOn: clientMessageId,
        };
        break;
      }
      case 'announcement_data': {
        msgData = {
          type: 'user_message',
          message: [
            {
              type: 'text',
              cInfo: {
                body: 'Ok, Announcement is made.',
                params: data,
              },
              clientMessageId: clientMessageId,
            },
          ],
          createdOn: clientMessageId,
        };
        break;
      }
      case ('meeting_request', 'meeting_info'): {
        msgData = {
          type: 'user_message',
          message: [
            {
              type: 'text',
              cInfo: {
                body: message,
                params: data,
              },
              clientMessageId: clientMessageId,
            },
          ],
          createdOn: clientMessageId,
        };
        break;
      }
      case 'data_discard': {
        msgData = {
          type: 'user_message',
          message: [
            {
              type: 'text',
              cInfo: {
                body: 'discard',
              },
              clientMessageId: clientMessageId,
            },
          ],
          createdOn: clientMessageId,
        };
        break;
      }
      case 'contact_suggestion': {
        msgData = {
          type: 'user_message',
          message: [
            {
              type: 'text',
              cInfo: {
                body: contactMsg,
                params: data,
              },
              clientMessageId: clientMessageId,
            },
          ],
          createdOn: clientMessageId,
        };
        break;
      }
      case 'sharing_data': {
        msgData = {
          type: 'user_message',
          message: [
            {
              type: 'text',
              cInfo: {
                body: 'Share Article',
                params: data,
              },
              clientMessageId: clientMessageId,
            },
          ],
          createdOn: clientMessageId,
        };
        break;
      }
      case 'paramsWithMsg': {
        msgData = {
          type: 'user_message',
          message: [
            {
              type: 'text',
              cInfo: {
                body: message,
                params: data,
              },
              clientMessageId: clientMessageId,
            },
          ],
          createdOn: clientMessageId,
        };
        break;
      }
      case 'onlyMessage': {
        msgData = {
          type: 'user_message',
          message: [
            {
              type: 'text',
              cInfo: {
                body: message,
                params: data,
              },
              clientMessageId: clientMessageId,
            },
          ],
          createdOn: clientMessageId,
        };
        break;
      }
      case 'cancel_meeting': {
        msgData = {
          type: 'user_message',
          message: [
            {
              type: 'text',
              component: {
                type: 'text',
                payload: {
                  text: message,
                },
              },
              cInfo: {
                body: message,
                params: data,
              },
              clientMessageId: clientMessageId,
            },
          ],
          createdOn: clientMessageId,
        };
        break;
      }

      case 'task_updation': {
        msgData = {
          type: 'user_message',
          message: [
            {
              type: 'text',
              component: {
                type: 'text',
                payload: {
                  text: message,
                },
              },
              cInfo: {
                body: message,
                params: data,
              },
              clientMessageId: clientMessageId,
            },
          ],
          createdOn: clientMessageId,
        };
        break;
      }
      case 'mappedEmail': {
        msgData = {
          type: 'user_message',
          message: [
            {
              type: 'text',
              cInfo: {
                body: message,
                params: data,
              },
              clientMessageId: clientMessageId,
            },
          ],
          createdOn: clientMessageId,
        };
        break;
      }
      case 'paramsWithMsgText': {
        msgData = {
          type: 'user_message',
          message: [
            {
              type: 'text',
              cInfo: {
                body: message,
                params: data,
              },
              clientMessageId: clientMessageId,
            },
          ],
          createdOn: clientMessageId,
        };
        break;
      }
      default: {
        msgData = {
          type: 'user_message',
          message: [
            {
              type: 'text',
              component: {
                type: 'text',
                payload: {
                  text: message,
                },
              },
              clientMessageId: clientMessageId,
            },
          ],
        };
        break;
      }
    }

    var messageToBot = {};
    messageToBot['clientMessageId'] = clientMessageId;
    switch (data_type) {
      case 'knowledge_data': {
        messageToBot['message'] = {
          body: 'Ok, I have added knowledge article.',
          params: data,
          customData: {
            botToken: this.botClient.getBotAccessToken(),
            kmToken: UsersDao.getAccessToken(),
            kmUId: UsersDao.getUserId(),
          },
        };
        break;
      }
      case 'announcement_data': {
        messageToBot['message'] = {
          body: 'Ok, Announcement is made.',
          params: data,
          customData: {
            botToken: this.botClient.getBotAccessToken(),
            kmToken: UsersDao.getAccessToken(),
            kmUId: UsersDao.getUserId(),
          },
        };
      }
      case ('meeting_request', 'meeting_info'): {
        messageToBot['message'] = {
          body: message,
          params: data,
          customData: {
            botToken: this.botClient.getBotAccessToken(),
            kmToken: UsersDao.getAccessToken(),
            kmUId: UsersDao.getUserId(),
          },
        };
        break;
      }
      case 'contact_suggestion': {
        messageToBot['message'] = {
          body: contactMsg,
          params: data,
          customData: {
            botToken: this.botClient.getBotAccessToken(),
            kmToken: UsersDao.getAccessToken(),
            kmUId: UsersDao.getUserId(),
          },
        };
      }
      case 'data_discard': {
        messageToBot['message'] = {
          body: 'discard',
          customData: {
            botToken: this.botClient.getBotAccessToken(),
            kmToken: UsersDao.getAccessToken(),
            kmUId: UsersDao.getUserId(),
          },
        };
        break;
      }
      case 'sharing_data': {
        messageToBot['message'] = {
          body: 'Share Article',
          params: data,
          customData: {
            botToken: this.botClient.getBotAccessToken(),
            kmToken: UsersDao.getAccessToken(),
            kmUId: UsersDao.getUserId(),
          },
        };
        break;
      }
      case 'paramsWithMsg': {
        messageToBot['message'] = {
          body: message,
          params: data,
          customData: {
            botToken: this.botClient.getBotAccessToken(),
            kmToken: UsersDao.getAccessToken(),
            kmUId: UsersDao.getUserId(),
          },
        };
        break;
      }
      case 'widgetHealth': {
        messageToBot['message'] = {
          body: message,
          params: {
            elements: data,
          },
          customData: {
            botToken: this.botClient.getBotAccessToken(),
            kmToken: UsersDao.getAccessToken(),
            kmUId: UsersDao.getUserId(),
          },
        };
        break;
      }
      case 'cancel_meeting': {
        messageToBot['message'] = {
          body: message,
          params: data,
          customData: {
            botToken: this.botClient.getBotAccessToken(),
            kmToken: UsersDao.getAccessToken(),
            kmUId: UsersDao.getUserId(),
          },
        };
        break;
      }
      case 'task_updation': {
        messageToBot['message'] = {
          body: message,
          params: data,
          customData: {
            botToken: this.botClient.getBotAccessToken(),
            kmToken: UsersDao.getAccessToken(),
            kmUId: UsersDao.getUserId(),
          },
        };
        break;
      }
      case 'task_change_due_date': {
        messageToBot['message'] = {
          body: message,
          params: data,
          customData: {
            botToken: this.botClient.getBotAccessToken(),
            kmToken: UsersDao.getAccessToken(),
            kmUId: UsersDao.getUserId(),
          },
          nlMeta: {entities: {ActionToDo: 'dueDateChange'}},
        };
        break;
      }
      case 'task_complete': {
        messageToBot['message'] = {
          body: message,
          params: data,
          customData: {
            botToken: this.botClient.getBotAccessToken(),
            kmToken: UsersDao.getAccessToken(),
            kmUId: UsersDao.getUserId(),
          },
          nlMeta: {entities: {ActionToDo: 'Complete'}},
        };
        break;
      }
      case 'task_assigneeChange': {
        messageToBot['message'] = {
          body: message,
          params: data,
          customData: {
            botToken: this.botClient.getBotAccessToken(),
            kmToken: UsersDao.getAccessToken(),
            kmUId: UsersDao.getUserId(),
          },
          nlMeta: {entities: {ActionToDo: 'assigneeChange'}},
        };
        break;
      }
      case 'skill_switch': {
        messageToBot['message'] = {
          body: message,
          params: data,
          customData: {
            botToken: this.botClient.getBotAccessToken(),
            kmToken: UsersDao.getAccessToken(),
            kmUId: UsersDao.getUserId(),
            skillId: data.skillId,
          },
        };
        break;
      }
      case 'onlyMessage': {
        messageToBot['message'] = {
          body: message,
          params: '',
          customData: {
            botToken: this.botClient.getBotAccessToken(),
            kmToken: UsersDao.getAccessToken(),
            kmUId: UsersDao.getUserId(),
          },
        };
        break;
      }
      case 'mappedEmail': {
        messageToBot['message'] = {
          body: message,
          params: data,
          customData: {
            botToken: this.botClient.getBotAccessToken(),
            kmToken: UsersDao.getAccessToken(),
            kmUId: UsersDao.getUserId(),
            source: 'actionemailmeeting',
          },
        };
        break;
      }
      case 'paramsWithMsgText': {
        messageToBot['message'] = {
          body: message,
          params: data,
          customData: {
            botToken: this.botClient.getBotAccessToken(),
            kmToken: UsersDao.getAccessToken(),
            kmUId: UsersDao.getUserId(),
          },
        };
        break;
      }
      default: {
        if (data) {
          messageToBot['message'] = {
            body: message,
            params: data,
            customData: {
              botToken: this.botClient.getBotAccessToken(),
              kmToken: UsersDao.getAccessToken(),
              kmUId: UsersDao.getUserId(),
            },
          };
        } else {
          messageToBot['message'] = {
            body: message,
            customData: {
              botToken: this.botClient.getBotAccessToken(),
              kmToken: UsersDao.getAccessToken(),
              kmUId: UsersDao.getUserId(),
            },
          };
        }
      }
    }

    messageToBot['resourceid'] = '/bot.message';
    messageToBot['botInfo'] = this.botInfo;

    let uniqueId = uuid.v4();
    messageToBot['id'] = uniqueId;
    messageToBot['clientMessageId'] = uniqueId;
    messageToBot['client'] = Platform.OS;
    this.botClient.send(messageToBot, function messageHandler(err) {
      if (err && err.message) {
      }
    });

    return msgData;
  }
}

export default new KoraBotClient();
