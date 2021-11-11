import {Q} from '@nozbe/watermelondb';
import {sanitizedRaw} from '@nozbe/watermelondb/RawRecord';
import database from '../native/realm';
import * as Entity from '../native/realm/dbconstants';
import {prepareMessageComponents} from './PrepareUpsertComponents';
import {prepareMembers} from './PrepareUpsertMembers';

export async function prepareUpsertMessages({boardId, messages = []}) {
  let records = [];
  try {
    if (!(messages && messages.length)) {
      return records;
    }
    let uniqueMessages = findUniqueMessages({messages});
    const db = database.active;
    const msgCollection = db.collections.get(Entity.Messages);
    const membersCollection = db.collections.get(Entity.Members);

    const messagesIds = uniqueMessages.map((m) => {
      return m.clientId || m.messageId;
    });
    const allMessagesRecords = await msgCollection
      .query(Q.where('id', Q.oneOf(messagesIds)))
      .fetch();

    let msgsToCreate = uniqueMessages.filter(
      (m1) =>
        !allMessagesRecords.find((m2) => {
          let clientId = m1.clientId || m1.messageId;
          return clientId === m2.id;
        }),
    );
    let msgsToUpdate = allMessagesRecords.filter((m1) =>
      uniqueMessages.find((m2) => {
        let clientId = m2.clientId || m2.messageId;
        return m1.id === clientId;
      }),
    );

    for (const message of msgsToCreate) {
      const id = message?.clientId || message?.messageId;
      let authorRecord, fromRecord;
      if (message?.author) {
        let author = message?.author;
        if (typeof author === 'string') {
          author = {
            id: author,
          };
        }
        authorRecord = membersCollection.prepareCreate((m) => {
          m.authorOfMessage.id = id;
          m.contact.id = author.id;
        });
        records.push(authorRecord);
      }
      if (message?.from) {
        let from = message?.from;
        if (typeof from === 'string') {
          from = {
            id: from,
          };
        }
        fromRecord = membersCollection.prepareCreate((m) => {
          m.fromOfMessage.id = id;
          m.contact.id = from.id;
        });
        records.push(fromRecord);
      }
    
      if (message?.to) {
        let _to = message.to.map((member) => {
          let contact = {};
          if (typeof member === 'string') {
            contact = {
              id: member,
            };
          } else {
            contact = member;
          }
          return contact;
        });
        const members = await prepareMembers({
          messageId: id,
          members: _to,
        });
        records.push(...members);
      }

      if (message?.components?.length > 0) {
        const components = await prepareMessageComponents({
          messageId: id,
          components: message?.components,
        });
        records.push(...components);
      }
    
      let record = msgCollection.prepareCreate((m) => {
        let id = message.clientId || message.messageId;
        m._raw = sanitizedRaw({id: id}, msgCollection.schema);
        m.board.id = boardId;
        if (authorRecord) {
          m.author.id = authorRecord.id;
        }
        if (fromRecord) {
          m.from.id = fromRecord.id;
        }
        prepareMessage(m, message);
      });
      records.push(record);
    }

    msgsToUpdate = msgsToUpdate.map((message) => {
      const updatedMessage = uniqueMessages.find((m) => {
        let id = m.clientId || m.messageId;
        return id === message.id;
      });
      if (message._hasPendingUpdate) {
        console.log(message);
        return message;
      }
      return message.prepareUpdate((m) => {
        prepareMessage(m, updatedMessage);
      });
    });

    records.push(...msgsToUpdate);
  } catch (e) {
    console.log('error in prepareUpsertMessages', e);
  }
  return records;
}

export function prepareMessage(record, message) {
  record.clientId = message?.clientId;
  record.encrypted = message?.encrypted;
  record.messageId = message?.messageId;
  record.highImportance = message?.highImportance;
  record.name = message?.name;
  record.desc = message?.desc;
  record.logo = JSON.stringify(message?.logo);
  record.boardId = message?.boardId;
  record.views = message?.views;
  record.sentOn = message?.sentOn;
  record.sortTime = message?.sortTime;
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
  record.mentions=message?.mentions;
  record.everyoneMentioned = message?.everyoneMentioned;
  record.messageState = message?.messageState || Entity.ResourceState.SENT;
}

function findUniqueMessages({messages}) {
  const completeMessages = [].concat(messages).reverse();
  const uniqueMessages = completeMessages.reduce((acc, current) => {
    const x = acc.find((item) => {
      let id1 = item.clientId || item.messageId;
      let id2 = current.clientId || current.messageId;
      return id1 === id2;
    });
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);
  return uniqueMessages;
}
