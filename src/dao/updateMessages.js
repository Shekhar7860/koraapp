import {sanitizedRaw} from '@nozbe/watermelondb/RawRecord';
import {Q} from '@nozbe/watermelondb';
import uuid from 'react-native-uuid';
import database from '../native/realm';
import * as Entity from '../native/realm/dbconstants';
import {prepareMessageComponents} from './PrepareUpsertComponents';
import {prepareMembers} from './PrepareUpsertMembers';
import * as ContactsDao from './ContactsDao';
import {prepareUpsertMessages} from './PrepareUpsertMessages';
import * as MessagesDao from './MessagesDao';
import {prepareUpsertContacts} from './PrepareUpsertContacts';

export function updateMessages(board_id, messages) {
  console.log('Updating messages');
  return new Promise(async (resolve, reject) => {
    try {
      let contacts = [];
      if (messages?.length > 0) {
        messages?.forEach((message) => {
          if (message?.to?.length > 0) {
            contacts.push(...message?.to);
          }
          if (message?.author) {
            contacts.push(message?.author);
          }
          if (message?.from) {
            contacts.push(message?.from);
          }
        });
      }
      const db = database.active;
      await db.write(async () => {
        let objects = [];
        if (contacts.length > 0) {
          let contactRecords = await prepareUpsertContacts(contacts);
          objects.push(...contactRecords);
        }
        let records = await prepareUpsertMessages({
          boardId: board_id,
          messages: messages,
        });
        await db.batch(...objects, ...records);
      });
      resolve();
    } catch (error) {
      console.log('error in updateMessages : \n ', error);
      reject(error);
    }
  });
}

export function updateMessage(message, increaseUnreadCount = false) {
  let components = message?.components;
  if (components?.length > 0) {
    let component = components[0];
    if (component?.componentData?.eventType === 'board_clear_history') {
      MessagesDao.deleteAllMessages(message?.boardId);
    }
  }
  return new Promise(async (resolve, reject) => {
    const db = database.active;
    let contacts = [];
    if (message?.to?.length > 0) {
      contacts.push(...message?.to);
    }
    if (message?.author) {
      contacts.push(message?.author);
    }
    if (message?.from) {
      contacts.push(message?.from);
    }
    await db.write(async () => {
      try {
        let objects = [];
        let boardsCollection = db.collections.get(Entity.Boards);
        let [record] = await boardsCollection
          .query(Q.where('_id', Q.eq(message?.boardId)))
          .fetch();
        if (record) {
          if (contacts.length > 0) {
            let contactRecords = await prepareUpsertContacts(contacts);
            objects.push(...contactRecords);
          }

          const records = await prepareUpsertMessages({
            boardId: record?.id,
            messages: [message],
          });
          objects.push(...records);

          let activity = await record.lastActivity.fetch();
          let mLastActivity = activity.prepareUpdate((activity) => {
            if (message) {
              let id = message?.clientId || message?.messageId;
              activity.message.id = id;
            }
            return activity;
          });
          let mBoardRecord = record.prepareUpdate((board) => {
            if (message?.deliveredOn) {
              board.sortTime = message?.deliveredOn;
              if (increaseUnreadCount)
                board.unreadCount = board.unreadCount + 1;
            }
            return board;
          });
          objects.push(mLastActivity, mBoardRecord);
        }

        await db.batch(...objects);
        resolve();
      } catch (error) {
        console.log('error in updateMessage : \n ', error);
        reject(error);
      }
    });
  });
}

export async function prepareUpsertNewMessage(message) {
  let uniqueId = uuid.v1();
  let nMessage = {
    clientId: message?.clientId || uniqueId,
    boardClientId: message?.boardClientId,
    messageId: message?.clientId || uniqueId,
    from: ContactsDao.updateContact(message?.from),
    to: message.to?.map((value) => {
      let member = {};
      if (typeof value === 'string') {
        member = {
          id: value,
        };
      } else {
        member = value;
      }
      return member;
    }),
    author: ContactsDao.updateContact(message?.author),
    boardId: message?.boardId || message?.boardClientId,
    board_id: message?.board_id || message?.boardClientId,
    isSender: message?.isSender || true,
    state: message?.state,
    components: message?.components,
    messages: message?.messages,
    replyTo: message?.replyTo,
    linkPreviews: message?.linkPreviews,
    messageState: message?.messageState,
    everyoneMentioned: message?.everyoneMentioned,
    mentions: message?.mentions,
    sentOn: new Date(),
  };

  const db = database.active;
  const msgCollection = db.collections.get(Entity.Messages);
  const membersCollection = db.collections.get(Entity.Members);

  let messageRecord;
  let authorRecord;
  let fromRecord;
  let objects = [];

  let id = nMessage?.clientId;
  let results = await msgCollection.query(Q.where('id', Q.eq(id))).fetch();
  if (results?.length > 0) {
    messageRecord = results[0];
  } else {
    if (nMessage?.author) {
      authorRecord = membersCollection.prepareCreate((m) => {
        m.authorOfMessage.id = id;
        m.contact.id = nMessage?.author?.id;
      });
      objects.push(authorRecord);
    }
    if (nMessage?.from) {
      fromRecord = membersCollection.prepareCreate((m) => {
        m.fromOfMessage.id = id;
        m.contact.id = nMessage?.from?.id;
      });
      objects.push(fromRecord);
    }
    if (nMessage?.to?.length > 0) {
      const members = await prepareMembers({
        messageId: id,
        members: nMessage?.to,
      });
      objects.push(...members);
    }
    if (nMessage?.components?.length > 0) {
      const components = await prepareMessageComponents({
        messageId: id,
        components: nMessage?.components,
      });
      objects.push(...components);
    }
    messageRecord = await msgCollection.prepareCreate((m) => {
      m._raw = sanitizedRaw({id: id}, msgCollection.schema);
      m.clientId = nMessage.clientId;
      m.messageId = nMessage.messageId;
      m.board.id = nMessage.board_id;
      if (authorRecord) {
        m.author.id = authorRecord.id;
      }
      if (fromRecord) {
        m.from.id = fromRecord.id;
      }
      prepareMessage(m, message);
    });
  }

  const result = {messageRecord: messageRecord, objects: objects};
  return result;
}

export function upsertNewMessage(message) {
  console.log('Updating new message');
  return new Promise(async (resolve, reject) => {
    try {
      let record;
      const db = database.active;
      await db.write(async () => {
        let {messageRecord, objects} = await prepareUpsertNewMessage(message);
        await db.batch(messageRecord, ...objects);
        record = messageRecord;
      });
      resolve(record);
    } catch (error) {
      console.log('error in upsertNewMessage : \n ', error);
      reject(error);
    }
  });
}

export function prepareMessage(record, message) {
  record.clientId = message?.clientId;
  record.encrypted = message?.encrypted;
  record.messageId = message?.messageId;
  // from: ContactsDao.updateContact(message?.from);
  // author: ContactsDao.updateContact(message?.author);
  record.highImportance = message?.highImportance;
  record.name = message?.name;
  record.desc = message?.desc;
  record.logo = JSON.stringify(message?.logo);
  record.boardId = message?.boardId;
  record.views = message?.views;
  record.sentOn = message?.sentOn;
  record.deliveredOn = message?.deliveredOn;
  record.isSender = message?.isSender;
  record.secureEmail = message?.secureEmail;
  record.forward = message?.forward;
  record.memo = message?.memo;
  record.deepRecalled = message?.deepRecalled;
  record.state = message?.state;
  record.unread = message?.unread;
  record.groupMessage = message?.groupMessage;
  record.componentsCount = message?.componentsCount;
  record.namespaceId = message?.namespaceId;
  record.isPolicySet = message?.isPolicySet;
  record.retentionState = message?.retentionState;
  record.remind = message?.remind;
  record.sad = message?.sad;
  record.shock = message?.shock;
  record.like = message?.like;
  record.laugh = message?.laugh;
  record.anger = message?.anger;
  record.unlike = message?.unlike;
  record.likeCount = message?.likeCount;
  record.unlikeCount = message?.unlikeCount;
  record.sadCount = message?.sadCount;
  record.laughCount = message?.laughCount;
  record.angerCount = message?.angerCount;
  record.shockCount = message?.shockCount;
  record.replyTo = message?.replyTo;
  record.msgNo = message?.msgNo;
  record.isEdited = message?.isEdited;
  record.linkPreviews = message?.linkPreviews;
  record.everyoneMentioned = message?.everyoneMentioned;
  record.messageState = message?.messageState || Entity.ResourceState.SENT;
  record.mentions=message?.mentions;
}

export function updateMessageStatus({message, status}) {
  console.log('Updating new message status');
  return new Promise(async (resolve, reject) => {
    try {
      const db = database.active;
      await db.write(async () => {
        await message.update((m) => {
          m.messageState = status;
          if (m) {
            prepareMessage(message, m);
          }
        });
      });
      resolve();
    } catch (e) {
      console.log('error in updateMessageStatus', e);
      reject(e);
    }
  });
}

export function updateBoardId({board, message, data}) {
  console.log('Updating board ID');
  return new Promise(async (resolve, reject) => {
    try {
      let boardId = data?.id;
      const db = database.active;
      await db.write(async () => {
        await board.update((b) => {
          b._id = boardId;
          b.boardState = Entity.ResourceState.SENT;
        });
        await message.update((m) => {
          m.boardId = boardId;
        });
      });
      resolve();
    } catch (e) {
      console.log('error in updateBoardId', e);
      reject(e);
    }
  });
}

export function updateReactions(reaction, messageId) {
  console.log('Updating reactions ');
  return new Promise(async (resolve, reject) => {
    try {
      const db = database.active;
      const msgCollection = db.collections.get(Entity.Messages);
      const [msgToUpdate] = await msgCollection
        .query(Q.where('messageId', Q.eq(messageId)))
        .fetch();
      await db.write(async () => {
        await msgToUpdate.update((m) => {
          // m.messageState = status;
          m.likeCount = reaction.likeCount;
          m.unlikeCount = reaction.unlikeCount;
          m.sadCount = reaction.sadCount;
          m.laughCount = reaction.laughCount;
          m.angerCount = reaction.angerCount;
          m.shockCount = reaction.shockCount;

          m.like = reaction.like;
          m.unlike = reaction.unlike;
          m.sad = reaction.sad;
          m.laugh = reaction.laugh;
          m.anger = reaction.anger;
          m.shock = reaction.shock;
        });
      });
      resolve();
    } catch (e) {
      console.log('error in update reactions', e);
      reject(e);
    }
  });
}

export function updateReminder(reminder, messageId) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = database.active;
      const msgCollection = db.collections.get(Entity.Messages);
      const [msgToUpdate] = await msgCollection
        .query(Q.where('messageId', Q.eq(messageId)))
        .fetch();
      await db.write(async () => {
        await msgToUpdate.update((m) => {
          m.remind = [
            {
              userId: reminder.userId,
              remindAt: reminder.scheduledOn,
            },
          ];
        });
      });
      resolve();
    } catch (e) {
      console.log('error in update reminder', e);
      reject(e);
    }
  });
}
