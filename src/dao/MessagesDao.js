import {sanitizedRaw} from '@nozbe/watermelondb/RawRecord';
import {Q} from '@nozbe/watermelondb';
import database from '../native/realm';
import * as Entity from '../native/realm/dbconstants';
import {prepareComponent} from './PrepareUpsertComponents';
import {prepareUpsertContacts} from './PrepareUpsertContacts';
import {prepareUpsertMessages} from './PrepareUpsertMessages';

export function getMessages(boardId, boardClientId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let message = null;
      resolve(message);
    }, 100);
  });
}

export function deleteAllMessages(boardId, boardClientId, dbId) {
  return new Promise(async (resolve, reject) => {
    // Delete message
    console.log('delete board called', boardId, dbId);

    try {
      const db = database.active;
      // const whereClause = [
      //   Q.where('board_id', dbId),
      //   Q.experimentalSortBy('sentOn', Q.desc),
      // ];
      const boardCollection = db.collections.get(Entity.Boards);

      const messageCollection = db.collections.get(Entity.Messages);

      await db.write(async () => {
        const board = await boardCollection
          .query(Q.where('_id', Q.eq(boardId)))
          .fetch();
        // console.log("board", board[0].id);
        if (board?.length > 0) {
          const messages = await messageCollection
            .query(Q.where('board_id', Q.eq(board[0]?.id)))
            .fetch();
          let messagesToDelete = messages.map((message) =>
            message.prepareDestroyPermanently(),
          );
          await db.batch(...messagesToDelete);
        }
      });
    } catch (e) {
      console.log('catch error', e);
      // Do nothing
    }
    resolve(true);
  });
}

export function updateMessage(message) {
  let components = message?.components;
  if (components?.length > 0) {
    let component = components[0];
    if (component?.componentData?.eventType === 'board_clear_history') {
      deleteAllMessages(message?.boardId);
    }
  }
  return new Promise((resolve, reject) => {
    let realmMessage = null;
    resolve(realmMessage);
  });
}

export function updateRemindMessage(remind) {
  return new Promise((resolve, reject) => {
    resolve(true);
  });
}

export function updateReactMessage(react, msgId) {
  return new Promise((resolve, reject) => {
    resolve(true);
  });
}

export function updateReact(react) {
  let realmPost = [];
  return realmPost;
}

export function updateRemind(remind) {
  let realmPost = [];
  return realmPost;
}

export function updateDeleteMessage(msgId) {
  return new Promise((resolve, reject) => {
    reject(false);
  });
}

export function updateMessages(messages) {
  return new Promise(async (resolve, reject) => {
    let objects = [];
    const db = database.active;
    let boardsCollection = db.collections.get(Entity.Boards);

    await db.write(async () => {
      try {
        let contacts = [];
        messages.forEach((message) => {
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
        if (contacts.length > 0) {
          let contactRecords = await prepareUpsertContacts(contacts);
          objects.push(...contactRecords);
        }

        for (const message of messages) {
          let [record] = await boardsCollection
            .query(Q.where('_id', Q.eq(message?.boardId)))
            .fetch();
          if (record) {
            const records = await prepareUpsertMessages({
              boardId: record?.id,
              messages: [message],
            });
            objects.push(...records);
          }
        }
        await db.batch(...objects);
        resolve();
      } catch (error) {
        console.log('error in updateMessages : \n ', error);
        reject(error);
      }
    });
  });
}

export function updateMessageEntity(message) {
  let realmMessage = {};
  return realmMessage;
}

export function upsertLink(value) {
  return null;
}

export function deleteMessageObject(mId) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = database.active;
      const messageCollection = db.collections.get(Entity.Messages);
      await db.write(async () => {
        const messages = await messageCollection
          .query(Q.where('messageId', Q.eq(mId)))
          .fetch();
        let messagesToDelete = messages.map((message) =>
          message.prepareDestroyPermanently(),
        );
        await db.batch(...messagesToDelete);
      });
      resolve(true);
    } catch (e) {
      console.log('error in deleteMessageObject :', e);
      reject(false);
    }
  });
}

export function deleteMessage(message) {
  console.log('recalled one', message?.id);
  return new Promise(async (resolve, reject) => {
    try {
      const db = database.active;
      const messageCollection = db.collections.get(Entity.Messages);
      await db.write(async () => {
        const msg = await messageCollection.find(message.id);
        let record = msg.prepareUpdate((m) => {
          m.deepRecalled = message?.deepRecalled;
          m.state = 'recalled';
        });
        await db.batch(record);
      });
      resolve(true);
    } catch (e) {
      console.log('error in deleteMessage :', e);
      reject(false);
    }
  });
}

export function deleteMessageViaMid(message) {}

export function upsertWSSettingsEntity(wsId, settings) {
  let realmWSSettings = {};
  return realmWSSettings;
}

export function upsertWSUserSettingsEntity(userSettings) {
  let realmWSUserSettings = {};
  return realmWSUserSettings;
}

export function createNewMessage(message) {
  return new Promise((resolve, reject) => {
    reject(true);
  });
}

export function upsertNewComponent(component) {
  return new Promise(async (resolve, reject) => {
    let records = [];
    try {
      const db = database.active;
      const fileMetaCollection = db.collections.get(Entity.FileMetas);
      const componentCollection = db.collections.get(Entity.Components);

      await db.write(async () => {
        let fm;
        if (component.fileMeta) {
          const file = component.fileMeta;
          fm = fileMetaCollection.prepareCreate((f) => {
            f.fileName = file?.fileName;
            f.fileSize = file?.fileSize;
            f.fileType = file?.fileType;
            f.fileCopyUri = file?.fileCopyUri;
            f.filePath = file?.filePath;
            f.uri = file?.uri;
          });
          records.push(fm);
        }
        let nComponent = componentCollection.prepareCreate((c) => {
          if (fm) {
            c.fileMeta.id = fm.id;
          }
          prepareComponent(c, component);
        });
        records.push(nComponent);

        await db.batch(...records);
        resolve(nComponent);
      });
    } catch (e) {
      console.log('error in upsertNewComponent', e);
      reject({message: 'error in upsertNewComponent'});
    }
  });
}
