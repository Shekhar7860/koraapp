import uuid from 'react-native-uuid';
import {createThumbnail} from 'react-native-create-thumbnail';
import ImageResizer from 'react-native-image-resizer';
import * as UsersDao from '../dao/UsersDao';
import {ResourceState} from '../native/realm/dbconstants';
import {getTimeline} from '../native/utils/helpers';
import userAuth from '../shared/utils/userAuth';

export function groupMessages(messages) {
  // if (unreadCount === 0) {
  //   unreadCount = -1;
  // }
  if (!Array.isArray(messages)) {
    return [];
  }
  if (messages?.length === 0) {
    return [];
  }
  let newPosts = [];
  let lastDate = null;
  for (let i = 0; i < messages.length; i++) {
    const oldDate = new Date(lastDate);
    const newDate = new Date(messages[i].deliveredOn);
    let oldDateString =
      oldDate.getDate() + '' + oldDate.getMonth() + '' + oldDate.getFullYear();
    let newDateString =
      newDate.getDate() + '' + newDate.getMonth() + '' + newDate.getFullYear();

    if (lastDate && oldDateString !== newDateString) {
      newPosts.push({
        id: userAuth.generateId(),
        postId: userAuth.generateId(),
        type: 'clientSideTimeline',
        deliveredOn: lastDate,
        components: messages[i].components,
      });
    }
    newPosts.push(messages[i]);
    lastDate = messages[i]?.deliveredOn || messages[i]?.sentOn;
  }

  newPosts.push({
    id: userAuth.generateId(),
    postId: userAuth.generateId(),
    type: 'clientSideTimeline',
    deliveredOn: lastDate,
  });
  return newPosts;

  // let newObject = {};
  // messages.forEach((message) => {
  //   const {sentOn} = message;
  //   let sentOnDate = new Date(sentOn);
  //   let key = sentOnDate.toDateString();
  //   if (newObject[key]) {
  //     newObject[key].push(message);
  //   } else {
  //     newObject[key] = [message];
  //   }
  // });
  // let finalMessagesObject = [];
  // Object.entries(newObject).forEach(([title, data]) =>
  //   finalMessagesObject.push({title, data}),
  // );
  // return finalMessagesObject;
}

export function modifyThreadMessages(messages) {
  const l = messages.length;
  let prevId = null;
  let prevTime = null;
  let udpatedMessages = [];

  for (let i = l - 1; i >= 0; i--) {
    let message = messages[i];
    // const fromId =
    //   typeof message.from === 'string' ? message.from : message.from?.id;
    // if (!fromId) {
    //   prevId = null;
    //   prevTime = null;
    // }
    // if (fromId === UsersDao.getUserId()) {
    //   message._isSender = true;
    // } else {
    //   message._isSender = false;
    // }
    message.showSenderTime = true;
    message.showSenderName = true;
    const prettifiedTime = getTimeline(message.sentOn, 'time');
    message.prettifiedTime = prettifiedTime;
    // if (fromId === prevId) {
    // message.showSenderName = false;
    // if (prettifiedTime === prevTime) {
    // message.showSenderTime = false;
    // }
    // }
    udpatedMessages[i] = message;

    if (message?.components?.length > 0) {
      const timelineevent =
        message?.components[0]?.componentType === 'timeline';
      // if (!timelineevent) {
      //   prevId = fromId;
      //   prevTime = prettifiedTime;
      // } else {
      //   prevId = null;
      //   prevTime = null;
      // }
    }
  }
  prevId = null;
  prevTime = null;
  //Handles Time Display logic
  for (let i = 0; i < l; i++) {
    let message = udpatedMessages[i];
    if (typeof message?.isValid === 'function') {
      if (!message?.isValid()) {
        continue;
      }
    }

    // const fromId =
    //   typeof message.from === 'string' ? message?.from : message?.from?.id;

    // if (!message?.from?.id) {
    //   prevId = null;
    //   prevTime = null;
    // }

    // if (fromId === UsersDao.getUserId()) {
    //   message._isSender = true;
    // } else {
    //   message._isSender = false;
    // }
    // message.showSenderName = true;
    const prettifiedTime = getTimeline(message.sentOn, 'time');
    message.prettifiedTime = prettifiedTime;
    // if (fromId === prevId) {
    //   // message.showSenderName = false;
    //   if (prettifiedTime === prevTime) {
    //     if (message.messageState === ResourceState.FAILED) {
    //       message.showSenderTime = true;
    //     } else {
    //       message.showSenderTime = false;
    //     }
    //   }
    // }
    udpatedMessages[i] = message;

    if (message?.components?.length > 0) {
      // const timelineevent =
      //   message?.components[0]?.componentType === 'timeline';
      // if (!timelineevent) {
      //   prevId = fromId;
      //   prevTime = prettifiedTime;
      // } else {
      //   prevId = null;
      //   prevTime = null;
      // }
    }
  }
  return udpatedMessages;
}

export function boardPayload(params) {
  const {toList, topicName, message} = params;
  const uniqueId = message?.clientId || uuid.v1();
  let members = [...toList, UsersDao.getUser()];
  let date = new Date();
  const payload = {
    id: uniqueId,
    name: topicName || '',
    message: message,
    clientId: uniqueId,
    members: members,
    groupChat: toList.length > 1,
    lastModified: date,
    type: toList.length > 1 ? 'groupChat' : 'directChat',
    membersCount: members?.length,
    boardState: ResourceState.DRAFT,
    createdOn: date,
    isMember: true,
  };
  return payload;
}

export async function postPayload(params, block = () => {}) {
  messagePayload(params, (payload) => {
    payload.postId = payload.messageId;
    //Handle comment case
    payload.parentId = params.postId || payload.postId;
    payload.deliveredOn = payload.sentOn;
    payload.createdOn = payload.sentOn;
    payload.postType =
      payload.parentId === payload.postId ? 'default' : 'comment';
    payload.isEdited = params.isEdited || false;
    block(payload);
  });
}

export async function messagePayload(params, block = () => {}) {
  let {
    toList,
    boardId,
    boardClientId,
    mediaList,
    data,
    replyObj,
    board_id,
  } = params;
  if (data?.mediaList && data?.mediaList?.length > 0) {
    mediaList = data?.mediaList;
  }
  const {text, everyoneMentioned, mentions} = data;
  const messages = replyObj ? [replyObj] : [];
  const uniqueId = uuid.v1();
  const replyTo = replyObj ? replyObj : null;
  var components = [];
  if (mediaList?.length > 0) {
    const promisesArray = mediaList.map((media) => {
      return new Promise((resolve) => {
        if (
          media.thumbnailURL ||
          media.type === undefined ||
          media.type === null
        ) {
          return resolve(media);
        }
        generateThumbnail(media.uri, media.type, (response) => {
          return resolve(response);
        });
      });
    });
    let thumbnails = await Promise.all(promisesArray);
    components = mediaList.map((file, index) => {
      if (file.componentThumbnails?.length > 0) {
        return file;
      }
      let componenetID = file.componentId || userAuth.generateId(6);
      let componentThumbnails = [
        {
          width: 320,
          height: 240,
          size: 'smaller',
          url: file?.thumbnailURL,
          localFilePath: thumbnails[index].uri,
          localMainUri: thumbnails[index].mainUri
        },
      ];
      let duration = '';
      let componentType = 'image';
      if (file?.type?.includes('audio')) {
        componentType = 'audio';
        duration = file.duration;
      } else if (file?.type?.includes('image')) {
        componentType = 'image';
      } else if (file?.type?.includes('video')) {
        componentType = 'video';
        duration = file.duration;
      } else {
        componentType = 'attachment';
        if (file.componentSize && file.componentSize > 0) {
          return file;
        }
      }
      return {
        componentId: componenetID,
        componentType: componentType,
        componentFileId: file.fileId,
        componentSize: file.size + '',
        componentData: {filename: file.name},
        componentThumbnails: componentThumbnails,
        componentLength: duration,
        fileMeta: {
          id: uuid.v4(),
          fileName: file?.name,
          fileSize: file?.size,
          fileType: file?.type,
          fileCopyUri: file?.fileCopyUri,
          filePath: file?.path,
          uri: file?.uri,
        },
      };
    });
  }
  const linkPreviews = [];
  if (data.type === 'link') {
    let linkPreview = {
      title: data.title,
      description: data.description,
      source: data.site,
      url: data.url,
      type: data.previewType,
      site: data.site,
      image: data.image,
      video: data.video,
    };
    linkPreviews[0] = linkPreview;
  }
  if (data.type === 'audio') {
    let componenetId = userAuth.generateId(6);
    let component = {
      componentId: componenetId,
      componentType: 'audio',
      componentSize: data.size + '',
      componentData: {filename: data.name},
      componentLength: data?.duration,
      fileMeta: {
        id: uuid.v4(),
        fileName: data?.name,
        fileSize: data?.size,
        fileType: data?.type,
        fileCopyUri: data?.fileCopyUri,
        filePath: data?.path,
        uri: data?.uri,
      },
    };
    components.push(component);
  }
  if (text?.length > 0) {
    components.push({
      componentId: userAuth.generateId(6),
      componentType: 'text',
      componentBody: text,
    });
  }

  let payload = {
    components: components,
    messageId: uniqueId,
    encrypted: false,
    to: toList,
    messages: messages,
    listRecepients: [],
    topicName: '',
    author: UsersDao.getUser(),
    from: UsersDao.getUser(),
    clientId: uniqueId,
    boardId: boardId,
    boardClientId: boardClientId,
    board_id: board_id,
    sentOn: new Date(),
    messageState: ResourceState.SENDING,
    replyTo: replyTo,
    linkPreviews: linkPreviews,
    isSender: true,
  };
  if (mentions?.length > 0) {
    payload = {...payload, mentions: mentions};
  }
  if (everyoneMentioned) {
    payload = {...payload, everyoneMentioned: true};
  }
  if (replyTo && boardId) {
    payload = {
      ...payload,
      replyTo: replyTo,
    };
  }
  block(payload);
}

export function getUID(pattern) {
  var _pattern = pattern || 'xxxxyx';
  _pattern = _pattern.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  return _pattern;
}

export function generateThumbnail(uri, type, block = () => {}) {
  try {
    const index = type.indexOf('/');
    let fileType = type.substring(0, index);

    switch (fileType) {
      case 'image':
        ImageResizer.createResizedImage(
          uri,
          320,
          240,
          'JPEG',
          100,
          0,
          null,
          false,
          {mode: 'cover', onlyScaleDown: false},
        )
          .then((image) => {
            block({...image,mainUri:uri});
          })
          .catch((error) => {
            console.log(error);
          });
        break;
      case 'video':
        createThumbnail({
          url: uri,
          timeStamp: 10000,
        })
          .then((image) => {
            ImageResizer.createResizedImage(
              image.path,
              320,
              240,
              'JPEG',
              100,
              0,
              null,
              false,
              {mode: 'cover', onlyScaleDown: false},
            )
              .then((resizedImage) => {
                block({...resizedImage,mainUri:uri});
              })
              .catch((error) => {
                console.log(error);
              });
          })
          .catch((err) => console.log({err}));
        break;
      default:
        let log = {
          uri: uri,
          type: type,
          mainUri:uri,
        };
        block(log);
        return;
    }
  } catch (e) {
    console.error('Error e', e.message);
  }
}

export function loadMessagesToState(messages) {
  let elements = modifyThreadMessages(messages);
  return groupMessages(elements);
}

export function generateUUID() {
  var d = new Date().getTime();
  if (window.performance && typeof window.performance.now === 'function') {
    d += performance.now(); //use high-precision timer if available
  }
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
    },
  );
  return uuid;
}