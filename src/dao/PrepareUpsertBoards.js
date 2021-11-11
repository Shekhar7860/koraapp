import {sanitizedRaw} from '@nozbe/watermelondb/RawRecord';
import {Q} from '@nozbe/watermelondb';
import database from '../native/realm';
import * as Entity from '../native/realm/dbconstants';
import {prepareUpsertMessages} from './PrepareUpsertMessages';
import {prepareUpsertPosts} from './PrepareUpsertPosts';
import {prepareUpsertBoardMembers} from './PrepareUpsertBoardMembers';

export async function prepareUpsertBoards(boards) {
  let records = [];
  const db = database.active;
  try {
    const boardsCollection = db.collections.get(Entity.Boards);
    const boardIds = boards.map((b) => {
      return b.clientId || b.id;
    });

    if (boardIds?.length > 0) {
      const existingBoards = await boardsCollection
        .query(Q.where('id', Q.oneOf(boardIds)))
        .fetch();
      const boardsToCreate = boards.filter(
        (b1) =>
          !existingBoards.find((b2) => {
            let boardId = b1.clientId || b1.id;
            return boardId === b2.id;
          }),
      );
      const boardsToUpdate = existingBoards.filter((b1) =>
        boards.find((b2) => {
          let boardId = b2.clientId || b2.id;
          return b1.id === boardId;
        }),
      );

      for (const board of boardsToCreate) {
        let objects = await prepareUpsertBoard({board: board, update: false});
        records.push(...objects);
      }

      for (const record of boardsToUpdate) {
        if (record._hasPendingUpdate) {
          console.log(record);
          return record;
        }
        const board = boards.find((b) => {
          let boardId = b?.clientId || b?.id;
          return boardId === record.id;
        });
        let objects = await prepareUpsertBoard({
          board: board,
          record: record,
          update: true,
        });
        records.push(...objects);
      }
    }
  } catch (e) {
    console.log('error in updateBoards', e);
  }
  return records;
}

export async function prepareUpsertBoard({board, record, update}) {
  let records = [];
  try {
    const db = database.active;
    const boardsCollection = db.collections.get(Entity.Boards);
    const activitiesCollection = db.collections.get(Entity.Activities);
    const membersCollection = db.collections.get(Entity.BoardMembers);

    let boardOwner, boardCreator;
    let boardId = board?.clientId || board?.id;
    switch (board?.type) {
      case 'directChat':
      case 'groupChat': {
        var messages = board?.messages || [];
        let lastMessage = board?.lastActivity;
        if (lastMessage) {
          let message = messages?.find(
            (message) => message?.messageId === lastMessage?.messageId,
          );
          if (!message) {
            messages?.push(lastMessage);
          }
        }
        const msgRecords = await prepareUpsertMessages({
          boardId: boardId,
          messages: messages,
        });
        records.push(...msgRecords);
        break;
      }
      case 'document':
      case 'table':
      case 'discussion':
      case 'embeddedweb':
      case 'file': {
        var posts = board?.posts || [];
        let lastPost = board?.lastActivity;
        if (lastPost) {
          let post = posts?.find((post) => post?.postId === lastPost?.postId);
          if (!post) {
            posts?.push(lastPost);
          }
        }
        const postRecords = await prepareUpsertPosts({
          boardId: boardId,
          posts: posts,
        });
        records.push(...postRecords);
        break;
      }
      default:
        break;
    }

    if (update) {
      let activity = await record.lastActivity.fetch();
      let lastActivity = activity.prepareUpdate((activity) => {
        switch (board?.type) {
          case 'directChat':
          case 'groupChat': {
            let lastMessage = board?.lastActivity;
            if (lastMessage) {
              activity.message.id =
                lastMessage.clientId || lastMessage?.messageId;
            }
            break;
          }
          case 'document':
          case 'table':
          case 'discussion':
          case 'embeddedweb':
          case 'file': {
            let lastPost = board?.lastActivity;
            if (lastPost) {
              activity.post.id = lastPost?.clientId || lastPost?.postId;
            }
            break;
          }
          default:
            break;
        }
        return activity;
      });
      records.push(lastActivity);

      let uRecord = record.prepareUpdate((uRecord) => {
        prepareBoard(uRecord, board);
      });
      records.push(uRecord);
    } else {
      if (board?.owner) {
        let owner = board?.owner;
        if (typeof owner === 'string') {
          owner = {
            id: owner,
          };
        }
        boardOwner = membersCollection.prepareCreate((m) => {
          m.ownerOfBoard.id = boardId;
          m.contact.id = owner.id;
        });
        records.push(boardOwner);
      }
      if (board?.creator) {
        let creator = board?.creator;
        if (typeof creator === 'string') {
          creator = {
            id: creator,
          };
        }
        boardCreator = membersCollection.prepareCreate((m) => {
          m.creatorOfBoard.id = boardId;
          m.contact.id = creator.id;
        });
        records.push(boardCreator);
      }
      let lastActivity = activitiesCollection.prepareCreate((activity) => {
        activity.board.id = boardId;
        switch (board?.type) {
          case 'directChat':
          case 'groupChat': {
            let lastMessage = board?.lastActivity;
            if (lastMessage) {
              activity.message.id =
                lastMessage.clientId || lastMessage?.messageId;
            }
            break;
          }
          case 'document':
          case 'table':
          case 'discussion':
          case 'embeddedweb':
          case 'file': {
            let lastPost = board?.lastActivity;
            if (lastPost) {
              activity.post.id = lastPost?.clientId || lastPost?.postId;
            }
            break;
          }
          default:
            break;
        }
        return activity;
      });
      records.push(lastActivity);

      const members = await prepareUpsertBoardMembers({
        boardId: boardId,
        members: board?.members,
        recentMembers: board?.recentMembers,
      });
      records.push(...members);

      let nRecord = boardsCollection.prepareCreate((nRecord) => {
        let boardId = board.clientId || board.id;
        nRecord._raw = sanitizedRaw({id: boardId}, boardsCollection.schema);
        prepareBoard(nRecord, board);
        if (boardOwner) {
          nRecord.owner.id = boardOwner.id;
        }
        if (boardCreator) {
          nRecord.creator.id = boardCreator.id;
        }
        if (lastActivity) {
          nRecord.lastActivity.id = lastActivity.id;
        }
      });
      records.push(nRecord);
    }
  } catch (e) {
    console.log('error in prepareUpsertBoard', e);
  }
  return records;
}

export function prepareBoard(record, board) {
  if (!board) {
    return;
  }
  record._id = board?.id;
  record.clientId = board?.clientId || board?.id;
  record.name = board?.name;
  record.isMember = Object(board).hasOwnProperty('isMember')
    ? board.isMember
    : record.isMember;
  // record.meta = JSON.stringify(board?.meta);
  record.desc = board?.desc;
  record.logo = board?.logo;
  record.link = board?.link;
  record.isAllMembers = board?.isAllMembers;
  record.wsId = board?.wsId;
  record.namespaceId = board?.namespaceId;
  record.isActive = board?.isActive;
  // record.lastActivity = board?.lastActivity;
  record.membersCount = board?.membersCount;
  record.laMod = board?.laMod;
  record.sortTime = Object(board).hasOwnProperty('sortTime')
    ? board.sortTime
    : record.sortTime;
  record.memberLastModified = board?.memberLastModified;
  record.isEmailEnabled =
    board?.isEmailEnabled !== undefined && board?.isEmailEnabled !== null
      ? board?.isEmailEnabled
      : record.isEmailEnabled;
  record.emailId = board?.emailId;
  record.friendlyAliasEmailId = board?.friendlyAliasEmailId;
  record.lastModified = board?.lastModified;
  record.createdOn = board?.createdOn;
  // record.comments = [];
  record.type = board?.type;
  // record.allEmailIds = board?.allEmailIds?.filter(function (email) {
  //   return email != null;
  // });
  record.access =
    board?.access !== undefined && board?.access !== null
      ? board?.access
      : record?.access;
  record.isTopicMember = board?.isTopicMember;

  record.notifications =
    board?.notifications !== undefined && board?.notifications !== null
      ? board?.notifications
      : record?.notifications;

  record.unreadCount = board?.unreadCount;
  record.lastReadId = board?.lastReadId;
  record.firstUnreadTimestamp = board?.firstUnreadTimestamp;
  record.hasDraftPost = board?.hasDraftPost;
  record.isNew = board?.isNew;
  record.payload = board?.payload;
  record.wsMembersAccess = board?.wsMembersAccess;
  record.star =
    board?.star !== undefined && board?.star !== null
      ? board?.star
      : record?.star;
  record.moreAvailable = false;
  record.boardState = board?.boardState || Entity.ResourceState.SENT;
}
