import PushNotification from 'react-native-push-notification';
import NotificationHandler from './NotificationHandler';
import {store} from '../../shared/redux/store';
import uuid from 'react-native-uuid';

import {
  resolveNotification,
  resolvePostNotification,
  refreshChatScreen,
} from '../../shared/redux/actions/message-thread.action';

import {ROUTE_NAMES} from '../navigation/RouteNames';
import {navigate, navigateAndReset} from '../navigation/NavigationService';
import {emptyObject} from '../../shared/redux/constants/common.constants';
import {isAndroid} from '../utils/PlatformCheck';
import {NativeModules} from 'react-native';

const DISCUSSION_CHANNEL = 'DISCUSSION_CHANNEL_ID';
const MESSAGE_CHANNEL = 'MESSAGE_CHANNEL_ID';

import db from '../realm';
import * as Entity from '../realm/dbconstants';
import {decode} from 'html-entities';
import {Q} from '@nozbe/watermelondb';
import AccountManager from '../../shared/utils/AccountManager';

import * as UsersDao from '../../dao/UsersDao';

import {messageResolve} from '../../shared/redux/actions/message-thread.action';

export default class NotificationService {
  constructor(
    onRegister,
    onNotification,
    cb = () => {
      // console.warn('-------------> Init cb null <--------------------');
    },
  ) {
    this.lastId = 0;
    this.lastChannelCounter = 0;
    this.cb = cb;

    this.createDefaultChannels();
    this.notificationHandler = new NotificationHandler();
    this.notificationHandler.attachRegister(onRegister);
    this.notificationHandler.attachNotification(onNotification);
    this.notificationHandler.configure();

    // Clear badge number at start
    PushNotification.getApplicationIconBadgeNumber(function (number) {
      if (number > 0) {
        PushNotification.setApplicationIconBadgeNumber(0);
      }
    });

    PushNotification.getChannels(function (channels) {
      console.log(channels);
    });
  }

  createDefaultChannels() {
    PushNotification.createChannel(
      {
        channelId: DISCUSSION_CHANNEL,
        channelName: 'DISCUSSION_CHANNEL',
        channelDescription: 'A DISCUSSION channel',
        soundName: 'default',
        importance: 2,
        vibrate: false,
      },
      (created) =>
        console.log(`createChannel 'DISCUSSION_CHANNEL' returned '${created}'`),
    );
    PushNotification.createChannel(
      {
        channelId: MESSAGE_CHANNEL,
        channelName: 'MESSAGE_CHANNEL',
        channelDescription: 'A MESSAGE channel',
        soundName: 'default',
        importance: 4,
        vibrate: false,
      },
      (created) =>
        console.log(`createChannel 'MESSAGE_CHANNE' returned '${created}'`),
    );
  }

  createOrUpdateChannel() {
    this.lastChannelCounter++;
    PushNotification.createChannel(
      {
        channelId: 'custom-channel-id',
        channelName: `Custom channel - Counter: ${this.lastChannelCounter}`,
        channelDescription: `A custom channel to categorise your custom notifications. Updated at: ${Date.now()}`,
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`createChannel returned '${created}'`),
    );
  }

  clearNotification = (boardData) => {
    if (isAndroid && boardData && NativeModules?.AndroidNotif) {
      try {
        //let data = boardData?.id || boardData?.boardId ||
        let data = boardData?._raw?._id;
        console.log('clearNotification  data :', data);
        if (data) {
          let nid = uuid.parse(data);
          let id = nid[0] + nid[1] + nid[2];
          // console.log('+++++++++++++++++++++++++++++++++++');
          // console.log('boardData  ----------> ', boardData);
          // console.log('boardId  ----------> ', data);
          // console.log('clear notification id:', id);
          // console.log('+++++++++++++++++++++++++++++++++++');
          NativeModules?.AndroidNotif?.clearNotification(id);
        }
      } catch (e) {
        console.log('Error clearNotification ===> : ', e);
      }
    }
  };

  threadCB = (type, boardData, jsonObj) => {
    setTimeout(() => {
      this.clearNotification(boardData);
    }, 1000);

    if (!type || !(type === 'SUCCESS')) {
      return;
    }
    this.navigateToScreen(jsonObj?.t, boardData, jsonObj);
  };

  showNotifiction(data, type = '', mid = null) {
    // console.log('--------> showNotifiction called  <------------');
    let title = null;
    let message = null;
    try {
      let contentObj = JSON.parse(data?.content);
      title = contentObj.title;
      message = contentObj.body;
    } catch (e) {
      title = 'Kora-V2';
      message = data?.content;
    }

    let POPUP_CHANNEL_ID = MESSAGE_CHANNEL;
    let id = this.lastId++;
    let importance = 2;
    let groupId = 1122;
    let customdata = null;

    try {
      customdata = JSON.parse(data?.customdata);
      if (customdata?.ed?.boardId) {
        let nid = uuid.parse(customdata?.ed?.boardId);
        id = nid[0] + nid[1] + nid[2];
        POPUP_CHANNEL_ID = id + '_CHANNEL';
        importance = 5;
        groupId = id;
      }
    } catch (e) {}

    let POPUP_CHANNEL_NAME = 'kora_' + POPUP_CHANNEL_ID;
    // console.log('POPUP_CHANNEL_NAME -------------->>: ', POPUP_CHANNEL_NAME);
    // console.log('showNotifiction id ==================> : ', groupId);

    if (!(title && message)) {
      return;
    }
    let soundName = 'default';
    this.lastId++;

    PushNotification.createChannel(
      {
        channelId: POPUP_CHANNEL_ID,
        channelName: POPUP_CHANNEL_NAME,
        channelDescription: 'Kora v2 ',
        soundName: 'default',
        importance: importance, // <- POPUP NOTIFICATION CHANNEL
        vibrate: false,
      },
      (created) =>
        console.log(
          ` '${POPUP_CHANNEL_ID}' createChannel returned '${created}'`,
        ),
    );

    //let nid = uuid.parse(customdata?.ed?.boardId);

    // console.log('%%%%%%%%%%%  %%%%%%%%%%%%  %%%%%%%%');
    // console.log('boardId  ----------> ', customdata?.ed?.boardId);
    // console.log('id ---->: ', id);
    // console.log('%%%%%%%%%%%  %%%%%%%%%%%%  %%%%%%%%');
    const notifObj = {
      /* Android Only Properties */
      channelId: POPUP_CHANNEL_ID, //soundName ? 'sound-channel-id' : 'default-channel-id',
      //ticker: 'My Notification Ticker', // (optional)
      autoCancel: true, // (optional) default: true
      largeIcon: 'ic_notification', //'ic_launcher', // (optional) default: "ic_launcher"
      smallIcon: 'ic_status_bar', //'ic_stat_ic_status_bar',//'ic_notification', // (optional) default: "ic_notification" with fallback for "ic_launcher"
      // bigText: 'My big text that will be shown when notification is expanded', // (optional) default: "message" prop
      subText: customdata?.accountInfo?.name, // (optional) default: none
      // color: 'red', // (optional) default: system default
      vibrate: false, // (optional) default: true
      vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
      //tag: 'some_tag', // (optional) add tag to message
      group: groupId + '_group', // (optional) add group to message
      groupSummary: true, // (optional) set this notification to be the group summary for a group of notifications, default: false
      ongoing: false, // (optional) set whether this is an "ongoing" notification
      // actions: ['Yes', 'No'], // (Android only) See the doc for notification actions to know more
      invokeApp: true, // (optional) This enable click on actions to bring back the application to foreground or stay in background, default: true
      messageId: uuid.v1(),
      onlyAlertOnce: true,
      showWhen:true,
      when: new Date().getTime(), // (optionnal) Add a timestamp pertaining to the notification (usually the time the event occurred). For apps targeting Build.VERSION_CODES.N and above, this time is not shown anymore by default and must be opted into by using `showWhen`, default: null.
      usesChronometer: false, // (optional) Show the `when` field as a stopwatch. Instead of presenting `when` as a timestamp, the notification will show an automatically updating display of the minutes and seconds since when. Useful when showing an elapsed time (like an ongoing phone call), default: false.
      timeoutAfter: null, // (optional) Specifies a duration in milliseconds after which this notification should be canceled, if it is not already canceled, default: null
      priority: 'max', // (optional) set notification priority, default: high
      importance: 'max', // (optional) set notification importance, default: high
      nfid: customdata?.nfid,

      /* iOS only properties */
      alertAction: 'view', // (optional) default: view
      category: '', // (optional) default: empty string
      nfbid: customdata?.ed?.boardId,

      /* iOS and Android properties */
      id: id, //parseInt(customdata?.nfid), // this.lastId, // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
      title: title, //'Local Notification', // (optional)
      message: message, // (required)
      userInfo: data, // (optional) default: {} (using null throws a JSON value '<null>' error)
      //userInfo: { objType: objType ? objType : 'empty', screen: boardData ? { boardData } : data },
      playSound: !!soundName, // (optional) default: true
      soundName: soundName ? soundName : 'default', // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
      number: 10, // (optional) Valid 32 bit integer specified as string. default: none (Cannot be zero)
    };

    if (isAndroid && NativeModules?.AndroidNotif) {
      // const flag = true;
      // if (flag) {
      //   PushNotification.localNotification(notifObj);
      //   return;
      // }

      let details = PushNotification._transformNotificationObject(notifObj);
      //start
      if (details && typeof details.id === 'number') {
        if (isNaN(details.id)) {
          console.warn('NaN value has been passed as id');
          delete details.id;
        } else {
          details.id = '' + details.id;
        }
      }

      // if (details.userInfo) {
      //   details.userInfo.id = details.userInfo.id || details.id;
      // } else {
      //   details.userInfo = {id: details.id};
      // }

      details.userInfo = data;

      if (details && typeof details.number === 'number') {
        if (isNaN(details.number)) {
          console.warn('NaN value has been passed as number');
          delete details.number;
        } else {
          details.number = '' + details.number;
        }
      }

      if (details && typeof details.shortcutId === 'number') {
        if (isNaN(details.shortcutId)) {
          console.warn('NaN value has been passed as shortcutId');
          delete details.shortcutId;
        } else {
          details.shortcutId = '' + details.shortcutId;
        }
      }

      if (details && Array.isArray(details.actions)) {
        details.actions = JSON.stringify(details.actions);
      }

      if (details.userInfo) {
        details.userInfo = JSON.stringify(details.userInfo);
      }

      //end

      NativeModules?.AndroidNotif?.setNotification(details);
    } else {
      PushNotification.localNotification(notifObj);
    }
  }

  resolveMessage = async (type, obj, callback) => {
    if (!type || !obj || !obj?.id) {
      callback();
      return;
    }
    switch (type) {
      case 'm':
      case 'mm':
      case 'me':
      case 'mt':
        store.dispatch(messageResolve({messageId: obj?.id}, null, callback));
        break;

      case 'pm':
      case 'p':
      case 'pc':
        let _params = {
          postId: obj?.id,
          boardId: obj?.boardId,
          isUserInteraction: true,
        };

        store.dispatch(
          resolvePostNotification(_params, (type, boardData) => {
            callback();
          }),
        );
        // callback();
        break;
      default:
        callback();
    }
    callback();
  };

  resolveNotifictionDataForAndroid = async (
    customdata,
    isUserInteraction = false,
    data = null,
    isFromPromise = false,
  ) => {
    let database = db.active;

    if (!database && !isFromPromise) {
      let account = AccountManager.getCurrentAccount();
      if (account) {
        db.setActiveDB(customdata?.userId);
        database = db.active;
      } else {
        let user = await UsersDao.getUserInfo();
        let auth = await UsersDao.getAuthorization();
        if (user && auth) {
          AccountManager.prepareAccount(user, auth);
          this.resolveNotifictionDataForAndroid(
            customdata,
            isUserInteraction,
            data,
            true,
          );
          return;
        }
        return;
      }
    }

    if (!customdata) {
      return;
    }
    let jsonObj = null;

    try {
      jsonObj = JSON.parse(customdata);
    } catch (e) {
      console.log('Error : ', e);
      return;
    }
    if (!jsonObj) {
      return;
    }

    switch (jsonObj?.t) {
      case 'mt':
      case 'med':
      case 'me':
      case 'md':
      case 'pm':
      case 'bam':
      case 'bc':
      case 'pem':
      case 'bar':
      case 'baa':
      case 'bne':
      case 'p':
      case 'm':
        if (jsonObj?.ed?.boardId) {
          let _params = {
            boardId: jsonObj?.ed?.boardId,
            isUserInteraction: isUserInteraction,
          };

          let boardId = jsonObj?.ed?.boardId;
          //start
          let boardsCollection = database?.collections.get(Entity.Boards);
          // console.log('boardsCollection ---------------->>:', boardsCollection);
          const results = await boardsCollection
            .query(Q.where('_id', Q.eq(boardId)))
            .fetch();
          if (results?.length > 0) {
            let board = results[0];

            // console.log('from notif board DB ---------------->>:', board);
            if (isUserInteraction) {
              this.threadCB('SUCCESS', board, jsonObj);
            } else {
              this.resolveMessage(jsonObj?.t, jsonObj?.ed, () => {
                this.showNotifiction(data);
              });
            }
          } else {
            store.dispatch(
              resolveNotification(_params, (type, board) => {
                if (!type || !(type === 'SUCCESS')) {
                  return;
                }
                if (isUserInteraction) {
                  this.threadCB(type, board, jsonObj);
                } else {
                  this.resolveMessage(jsonObj?.t, jsonObj?.ed, () => {
                    this.showNotifiction(data);
                  });
                }
              }),
            );
          }
          //end
        }
        break;
      case 'pc':
        if (jsonObj?.ed?.postId && jsonObj?.ed?.boardId) {
          let _params = {
            postId: jsonObj?.ed?.postId,
            boardId: jsonObj?.ed?.boardId,
            isUserInteraction: isUserInteraction,
          };

          let postId = jsonObj?.ed?.postId;
          let postsCollection = database?.collections.get(Entity.Posts);
          const posts = await postsCollection
            .query(Q.where('postId', Q.eq(postId)))
            .fetch();
          if (posts && posts.length > 0) {
            if (isUserInteraction) {
              this.threadCB('SUCCESS', posts[0], jsonObj);
            } else {
              this.resolveMessage(jsonObj?.t, jsonObj?.ed, () => {
                this.showNotifiction(data);
              });
            }
          } else {
            store.dispatch(
              resolvePostNotification(_params, (type, boardData) => {
                if (!type || !(type === 'SUCCESS')) {
                  return;
                }
                if (isUserInteraction) {
                  this.threadCB(type, boardData, jsonObj);
                } else {
                  this.resolveMessage(jsonObj?.t, jsonObj?.ed, () => {
                    this.showNotifiction(data);
                  });
                }
              }),
            );
          }
        }

        break;
      // case 'bar':
      //   let type = 'SUCCESS';
      //   this.threadCB(type, data, null, jsonObj.t);
      //   break;

      // case 'p':
      // case 'm':
      //   if (isUserInteraction) {
      //     this.threadCB('SUCCESS', null, jsonObj);
      //   } else {
      //     this.showNotifiction(data);
      //   }
      //   break;
      default:
        return;
    }
  };

  resolveNotifictionDataForiOS = async (data, isUserInteraction = false) => {
    let customdata = data?.customdata;
    if (!customdata) {
      return;
    }
    let jsonObj = null;

    try {
      jsonObj = JSON.parse(customdata);
    } catch (e) {
      console.log('Error : ', e);
      return;
    }

    if (!jsonObj) {
      return;
    }

    let database = db?.active;
    if (!database) {
      return;
    }

    switch (jsonObj?.t) {
      case 'mt':
      case 'med':
      case 'me':
      case 'md':
      case 'pm':
      case 'bam':
      case 'bc':
      case 'pem':
      case 'bar':
      case 'p':
      case 'm':
      case 'baa':
      case 'bne':
        if (jsonObj?.ed?.boardId) {
          let _params = {
            boardId: jsonObj?.ed?.boardId,
            isUserInteraction: isUserInteraction,
          };
          let boardId = jsonObj?.ed?.boardId;
          //start
          let boardsCollection = database?.collections.get(Entity.Boards);
          console.log('boardsCollection ---------------->>:', boardsCollection);
          const results = await boardsCollection
            .query(Q.where('_id', Q.eq(boardId)))
            .fetch();
          if (results?.length > 0) {
            let board = results[0];
            if (isUserInteraction) {
              this.threadCB('SUCCESS', board, jsonObj);
            } else {
              this.showNotifiction(data);
            }
          } else {
            store.dispatch(
              resolveNotification(_params, (type, board) => {
                if (!type || !(type === 'SUCCESS')) {
                  return;
                }
                if (isUserInteraction) {
                  this.threadCB(type, board, jsonObj);
                } else {
                  this.showNotifiction(data);
                }
              }),
            );
          }
          //end
          // store.dispatch(
          //   resolveNotification(_params, (type, boardData) => {
          //     if (isUserInteraction) {
          //       this.threadCB(type, boardData, jsonObj);
          //     } else {
          //       this.showNotifiction(data);
          //     }
          //   }),
          // );
        }
        break;
      case 'pc':
        if (jsonObj?.ed?.postId && jsonObj?.ed?.boardId) {
          let _params = {
            postId: jsonObj?.ed?.postId,
            boardId: jsonObj?.ed?.boardId,
          };

          let postId = jsonObj?.ed?.postId;
          let postsCollection = database?.collections.get(Entity.Posts);
          const posts = await postsCollection
            .query(Q.where('postId', Q.eq(postId)))
            .fetch();
          if (posts && posts.length > 0) {
            if (isUserInteraction) {
              this.threadCB('SUCCESS', posts[0], jsonObj);
            } else {
              this.showNotifiction(data);
            }
          } else {
            store.dispatch(
              resolvePostNotification(_params, (type, boardData) => {
                if (!type || !(type === 'SUCCESS')) {
                  return;
                }
                if (isUserInteraction) {
                  this.threadCB(type, boardData, jsonObj);
                } else {
                  this.showNotifiction(data);
                }
              }),
            );
          }
          // if (isUserInteraction) {
          //   // this.threadCB(type, boardData, jsonObj);
          // } else {
          //   this.showNotifiction(data);
          // }
          // store.dispatch(
          //   resolvePostNotification(_params, (type, boardData) => {
          //     if (isUserInteraction) {
          //       this.threadCB(type, boardData, jsonObj);
          //     } else {
          //       this.showNotifiction(data);
          //     }
          //   }),
          // );
        }

        break;
      // case 'bar':
      //   let type = 'SUCCESS';
      //   this.threadCB(type, data, null, jsonObj.t);
      //   break;
      default:
        return;
    }
  };

  // getMessages = (boardId) => {
  //   let _params = {id: threadId, offset: this.state.offset, limit: 10};
  //   // this.props.getThreadMessage(_params);
  //   store.dispatch(getThreadMessage(_params));
  // };

  checkAction(notification) {
    if (!notification || !notification.alertAction) {
      return;
    }

    // let data = {
    //   isNewChat: false,
    //   item: null,// thread obj,
    //   replyPrivate: false,

    // }

    //navigate(ROUTE_NAMES.CHAT, data);
  }

  localNotif(notification) {
    // console.log(
    //   '-------->Local Notif notification  ------------>:',
    //   notification,
    // );
    if (
      notification?.userInteraction
      // && notification?.data?.objType && notification?.data?.screen
    ) {
      if (isAndroid) {
        this.resolveNotifictionDataForAndroid(
          notification.data?.customdata,
          true,
          notification.data,
        );
      } else {
        this.resolveNotifictionDataForiOS(notification.data, true);
      }

      return;
    }

    if (!notification || !notification.data) {
      this.checkAction(notification);
      return;
    }

    if (!notification.data.content) {
      this.checkAction(notification);
      return;
    }
    if (isAndroid)
      this.resolveNotifictionDataForAndroid(
        notification.data?.customdata,
        false,
        notification.data,
      );
    else this.resolveNotifictionDataForiOS(notification.data, false);
    // this.showNotifiction(notification.data);
  }

  navigateToScreen(type, boardData, jsonObj) {
    let subType = jsonObj?.ed?.type;
    switch (type) {
      // case 'm':
      //   navigate(ROUTE_NAMES.CHAT, {
      //     boardId: jsonObj?.ed?.boardId,
      //     isFromNotificationMsz: true,
      //     isNewChat: false,
      //     isFromNotification: true,
      //   });
      //   break;

      case 'mt':
      case 'm':
      case 'med':
      case 'me':
      case 'md':
        navigate(ROUTE_NAMES.CHAT, {
          // thread: boardData,
          // isNewChat: false,
          // isFromNotification: true,

          board_id: boardData?.id,
          isNewChat: false,
          isFromNotification: true,
        });
        this.refreshChatScreen(boardData?.id);
        break;
      // case 'p':
      //   if (jsonObj?.ed?.boardId) {
      //     let _params = {boardId: jsonObj?.ed?.boardId};
      //     store.dispatch(
      //       resolveNotification(_params, (type, boardData) => {
      //         navigate(ROUTE_NAMES.DISCUSSION, {
      //           board: boardData || emptyObject,
      //         });
      //       }),
      //     );
      //   }
      //   break;
      case 'p':
      case 'pm':
      case 'discussion':
      case 'pem':
        navigate(ROUTE_NAMES.DISCUSSION, {
          board: boardData || emptyObject,
          isFromNotification: true,
        });
        break;
      case 'bam':
      case 'bc':
      case 'bar':
      case 'baa':
      case 'bne':
        if (subType === 'groupChat') {
          navigate(ROUTE_NAMES.CHAT, {
            // thread: boardData,
            // isNewChat: false,
            // isFromNotification: true,

            board_id: boardData?.id,
            isNewChat: false,
            isFromNotification: true,
          });
          this.refreshChatScreen(boardData?.id);
        } else {
          navigate(ROUTE_NAMES.DISCUSSION, {
            board: boardData || emptyObject,
            isFromNotification: true,
          });
        }
        break;
      case 'pc':
        navigate(ROUTE_NAMES.COMMENT_SECTION, {
          post: boardData || emptyObject,
          boardId: jsonObj?.ed?.boardId,
          isFromNotification: true,
        });
        break;

      default:
        return;
    }
  }

  refreshChatScreen(boardId) {
    store.dispatch(refreshChatScreen(boardId));
  }

  popInitialNotification() {
    PushNotification.popInitialNotification((notification) =>
      console.log('InitialNotication:', notification),
    );
  }

  localNotification(soundName) {
    this.lastId++;
    PushNotification.localNotification({
      // Android Only Properties
      channelId: soundName ? 'sound-channel-id' : 'default-channel-id',
      ticker: 'My Notification Ticker',
      autoCancel: true,
      largeIcon: 'ic_launcher',
      smallIcon: 'ic_notification',
      bigText: 'My big text that will be shown when notification is expanded',
      subText: 'This is a subText',
      color: 'red',
      vibrate: true,
      vibration: 300,
      tag: 'some_tag',
      group: 'group',
      groupSummary: false,
      ongoing: false,
      actions: ['Yes', 'No'],
      //invokeApp: false,
      when: null,
      usesChronometer: false,
      timeoutAfter: null,

      // iOS only properties
      alertAction: 'view',
      category: '',

      // iOS and Android properties
      id: this.lastId,
      title: 'Local Notification',
      message: 'My Notification Message',
      userInfo: {screen: 'home'},
      playSound: !!soundName,
      soundName: soundName ? soundName : 'default',
      number: 10,
    });
  }

  scheduleNotification(soundName) {
    this.lastId++;
    PushNotification.localNotificationSchedule({
      date: new Date(Date.now() + 30 * 1000),

      // Android Only Properties
      channelId: soundName ? 'sound-channel-id' : 'default-channel-id',
      ticker: 'My Notification Ticker',
      autoCancel: true,
      largeIcon: 'ic_launcher',
      smallIcon: 'ic_notification',
      bigText: 'My big text that will be shown when notification is expanded',
      subText: 'This is a subText',
      color: 'blue',
      vibrate: true,
      vibration: 300,
      tag: 'some_tag',
      group: 'group',
      groupSummary: false,
      ongoing: false,
      actions: ['Yes', 'No'],
      // invokeApp: false,
      when: null,
      usesChronometer: false,
      timeoutAfter: null,

      // iOS only properties
      alertAction: 'view',
      category: '',

      // iOS and Android properties
      id: this.lastId,
      title: 'Scheduled Notification',
      message: 'My Notification Message',
      userInfo: {sceen: 'home'},
      playSound: !!soundName,
      soundName: soundName ? soundName : 'default',
      number: 10,
    });
  }

  checkPermission(cbk) {
    return PushNotification.checkPermissions(cbk);
  }

  requestPermissions() {
    return PushNotification.requestPermissions();
  }

  cancelNotifications() {
    PushNotification.cancelLocalNotifications({id: '' + this.lastId});
  }

  cancelAll() {
    PushNotification.cancelAllLocalNotifications();
  }

  abandonPermissions() {
    PushNotification.abandonPermissions();
  }

  getScheduledLocalNotifications(callback) {
    PushNotification.getScheduledLocalNotifications(callback);
  }
}
