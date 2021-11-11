import {sanitizedRaw} from '@nozbe/watermelondb/RawRecord';
import {Q} from '@nozbe/watermelondb';
import database from '../native/realm';
import * as Entity from '../native/realm/dbconstants';
import * as ContactsDao from '../dao/ContactsDao';
import {prepareUpsertNewMessage} from './updateMessages';
import {prepareUpsertContacts} from './PrepareUpsertContacts';
import {prepareUpdateQueryItem} from './updateQueryItems';
import {
  prepareUpsertBoards,
  prepareBoard,
  prepareUpsertBoard,
} from './PrepareUpsertBoards';
import {prepareUpsertBoardMembers} from './PrepareUpsertBoardMembers';
import AccountManager from '../shared/utils/AccountManager';

export function updateBoards(msgBoardsData, item) {
  return new Promise(async (resolve, reject) => {
    if (!msgBoardsData || !msgBoardsData.boards) {
      reject({message: '!msgBoardsData || !msgBoardsData.boards'});
    }
    try {
      let records = [];
      let contacts = [];

      for (const board of msgBoardsData?.boards) {
        let recentMembers = board?.recentMembers || [];
        let members = board?.members || [];
        contacts.push(...recentMembers);
        contacts.push(...members);
        if (board?.owner) {
          let owner = board?.owner;
          contacts.push(owner);
        }
        if (board?.creator) {
          let creator = board?.creator;
          contacts.push(creator);
        }
        if (board?.lastModifiedBy) {
          let lastModifiedBy = board?.lastModifiedBy;
          contacts.push(lastModifiedBy);
        }

        if (board?.lastActivity) {
          let lastActivity = board?.lastActivity;
          if (lastActivity?.to?.length > 0) {
            contacts.push(...lastActivity?.to);
          }
          if (lastActivity?.author) {
            contacts.push(lastActivity?.author);
          }
          if (lastActivity?.from) {
            contacts.push(lastActivity?.from);
          }
        }
        let results = board?.messages || board?.posts;
        if (results?.length > 0) {
          result?.forEach((result) => {
            if (result?.to?.length > 0) {
              contacts.push(...result?.to);
            }
            if (result?.author) {
              contacts.push(result?.author);
            }
            if (result?.from) {
              contacts.push(result?.from);
            }
          });
        }
      }

      let db = database.active;
      await db.write(async () => {
        if (contacts.length > 0) {
          let contactRecords = await prepareUpsertContacts(contacts);
          records.push(...contactRecords);
        }
        // query items
        if (item && msgBoardsData?.boards?.length > 0) {
          let [queryItem] = await prepareUpdateQueryItem(item);
          records.push(queryItem);
        }
        let allBoards = msgBoardsData?.boards || [];
        const boardIds = allBoards.map((b) => b.id);
        const boards = allBoards.filter(
          ({id}, index) => !boardIds.includes(id, index + 1),
        );

        if (boards.length > 0) {
          let boardRecords = await prepareUpsertBoards(boards);
          records.push(...boardRecords);
        }

        await db.batch(...records);
      });
      return resolve();
    } catch (e) {
      console.log('error in updateBoards', e);
      reject({message: 'error in updateBoards'});
    }
  });
}

export async function isBoardAvailable(boardId) {
  try {
    const db = database.active;
    const boardsCollection = db.collections.get(Entity.Boards);

    let board = await boardsCollection
      .query(Q.where('_id', Q.eq(boardId)))
      .fetchCount();
    if (board && board > 0) return true;
    else return false;
  } catch (e) {
    console.log('error in finding board', e);
    return false;
  }
}

export function updateBoard(board, flag = false) {
  console.log('Updating board BoardsDao');
  return new Promise(async (resolve, reject) => {
    try {
      if (!board) {
        reject({message: 'NO BOARD'});
      }

      const db = database.active;
      const boardsCollection = db.collections.get(Entity.Boards);

      let records = [];
      await db.write(async () => {
        try {
          let id = board?.clientId || board?.id;
          const record = await boardsCollection.find(id);

          const members = await prepareUpsertBoardMembers({
            boardId: id,
            members: board?.members,
            recentMembers: board?.recentMembers,
          });
          records.push(...members);

          let uRecord = record.prepareUpdate((uRecord) => {
            prepareBoard(uRecord, board);
          });
          records.push(uRecord);
        } catch (e) {
          let objects = await prepareUpsertBoard({board, update: false});
          records.push(...objects);
        }

        await db.batch(...records);
      });
      let results = records.filter(
        (r) => r.clientId == board?.clientId || r._id == board?.id,
      );
      if (flag && results?.length > 0) {
        let uRecord = results[0];
        resolve(uRecord);
      } else {
        resolve();
      }
    } catch (e) {
      console.log('error in updateBoard', e);
      reject({message: 'error in updateBoard'});
    }
  });
}

export function updateStar(board) {}
export function deepUpdate(board) {}

export function editBoard(boardId, body = {}) {
  console.log('Edit board BoardsDao');
  return new Promise(async (resolve, reject) => {
    try {
      const db = database.active;
      const boardsCollection = db.collections.get(Entity.Boards);

      const board = await boardsCollection.find(boardId);
      if (board) {
        await db.write(async () => {
          await board.update((b) => {
            if(body?.isEmailEnabled!==undefined)
            {
              b.isEmailEnabled=body?.isEmailEnabled;
            } 
            if(body?.friendlyAliasEmailId)
            { 
             

              if(b.emailId){
              b.emailId=body?.friendlyAliasEmailId;
              }
              else if(b.friendlyAliasEmailId)
              {
                b.friendlyAliasEmailId=body?.friendlyAliasEmailId;
              }
            }
            if(body.name){
            b.name = body.name;
            }
            if(body.desc){
            b.desc = body.desc;
            }
          });
        });
        resolve(true);
      } else {
        console.log('error in updateStarStatus', boardId);
        reject(false);
      }
    } catch (err) {
      console.log('exception updating last activity ' + err);
      reject(false);
    }
  });
}

export function deleteBoardById(id) {
  return new Promise(async (resolve, reject) => {
    // Delete message
    console.log('delete board called', id);
    let deleteMessage;
    try {
      const db = database.active;
      const boardsCollection = db.collections.get(Entity.Boards);
      const board = await boardsCollection.find(id);
      deleteMessage = board.prepareDestroyPermanently();
      console.log('delete board deleteMessage', deleteMessage);
      await db.write(async () => {
        await db.batch(deleteMessage);
      });
    } catch (e) {
      // Do nothing
    }
    resolve(true);
  });
}

export async function prepareUpdateBoard(board) {
  console.log('prepare Update boards BoardsDao');
  try {
    let lastActivity = {};
    if (board?.lastActivity) {
      switch (board?.type) {
        case 'directChat':
        case 'groupChat':
          // let message = prepareUpsertMessages(board?.lastActivity);
          // lastActivity = {message: message};
          break;
        case 'document':
        case 'table':
        case 'discussion':
        case 'embeddedweb':
          // let post = PostsDao.updatePost(board?.lastActivity);
          // lastActivity = {post: post};
          break;
        default:
          break;
      }
    }
    if (board.logo) {
      if (!board.logo?.val) {
        if (!board.logo.val.thumbnails) {
          board.logo.val.thumbnails = [];
        }
      }
    }
    let nBoard = {
      id: board?.id,
      clientId: board?.clientId || board?.id,
      name: board?.name,
      meta: board?.meta,
      desc: board?.desc,
      logo: board?.logo,
      link: board?.link,
      isAllMembers: board?.isAllMembers,
      creator: ContactsDao.updateContact(board?.creator),
      owner: ContactsDao.updateContact(board?.owner),
      lastModifiedBy: ContactsDao.updateContact(board?.lastModifiedBy),
      wsId: board?.wsId,
      namespaceId: board?.namespaceId,
      isActive: board?.isActive,
      // lastActivity: lastActivity,
      allMembers: board?.allMembers?.map((value) => {
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
      recentMembers: board?.recentMembers?.map((value) => {
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
      membersCount: board?.membersCount,
      laMod: board?.laMod,
      members: board?.members?.map((value) => {
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
      memberLastModified: board?.memberLastModified,
      isEmailEnabled: board?.isEmailEnabled,
      emailId: board?.emailId,
      friendlyAliasEmailId: board?.friendlyAliasEmailId,
      lastModified: board?.lastModified,
      createdOn: board?.createdOn,
      type: board?.type,
      allEmailIds: board?.allEmailIds?.filter(function (email) {
        return email != null;
      }),
      access: board?.access,
      isTopicMember: board?.isTopicMember,
      notifications: board?.notifications,
      unreadCount: board?.unreadCount,
      lastReadId: board?.lastReadId,
      firstUnreadTimestamp: board?.firstUnreadTimestamp,
      hasDraftPost: board?.hasDraftPost,
      isNew: board?.isNew,
      payload: board?.payload,
      wsMembersAccess: board?.wsMembersAccess,
      star: board?.star,
      moreAvailable: false,
      workspace: WorkspacesDao.getWorkspace(board?.wsId),
      boardState: Entity.ResourceState.SENT,
    };
    let boardRecord;
    let clientId = nBoard.clientId || nBoard.id;
    let ownerRecord = membersCollection.prepareCreate((m) => {
      m.ownerOfBoard.id = clientId;
      m.contact.id = nBoard?.owner?.id;
    });
    let creatorRecord = membersCollection.prepareCreate((m) => {
      m.creatorOfBoard.id = clientId;
      m.contact.id = nBoard?.creator?.id;
    });
    let {messageRecord, objects} = await prepareUpsertNewMessage(message);
    let results = await boardsCollection
      .query(Q.where('clientId', Q.eq(nBoard.clientId)))
      .fetch();
    if (results?.length > 0) {
      boardRecord = results[0];
    } else {
      boardRecord = boardsCollection.prepareCreate((record) => {
        record._raw = sanitizedRaw({id: clientId}, boardsCollection.schema);
        if (ownerRecord) {
          record.owner.id = ownerRecord.id;
        }
        if (creatorRecord) {
          record.creator.id = creatorRecord.id;
        }
        prepareBoard(record, nBoard);
      });
      lastActivity = activitiesCollection.prepareCreate((record) => {
        let clientId = board.clientId || board.id;
        record.board.id = clientId;
        if (messageRecord) {
          record.message.id = messageRecord.id;
        }
        return record;
      });
      objects.push(boardRecord, lastActivity);
    }

    await db.write(async () => {
      await db.batch(creatorRecord, ownerRecord, ...objects);
    });

    resolve({nMessage: messageRecord, nBoard: boardRecord});
  } catch (error) {
    console.log('error prepareUpdateBoard : \n ', err);
    reject(error);
  }
}

// export function updateBoardEntity(board) {
//   return new Promise(async (resolve, reject) => {
//     // Delete message
//     console.log('delete board called', id);
//     let deleteMessage;
//     try {
//       const db = database.active;
//       const boardsCollection = db.collections.get(Entity.Boards);
//       const board = await boardsCollection.find(id);
//       deleteMessage = board.prepareDestroyPermanently();
//       console.log('delete board deleteMessage', deleteMessage);
//       await db.write(async () => {
//         await db.batch(deleteMessage);
//       });
//     } catch (e) {
//       // Do nothing
//     }
//     resolve(true);
//   });
// }

export function updateBoardMembers(boardId, contact) {
  return new Promise((resolve, reject) => {
    resolve(true);
  });
}

export function getLatestModified() {
  return new Promise(async (resolve, reject) => {
    const db = database.active;
    try {
      const boardsCollection = db.collections.get(Entity.Boards);
      const whereClause = [Q.experimentalSortBy('laMod', Q.desc)];
      const boards = await boardsCollection.query(...whereClause).fetch();
      if (boards && boards.length > 0) {
        resolve(boards[0].laMod);
      } else {
        resolve(false);
      }
    } catch (e) {
      console.log('error in getLatestModified', e);
    }
  });
}

export function getChatBoards() {
  let messageRealmBoards = [];
  return messageRealmBoards;
}

export function getSingleBoardPromisified(boardId) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = database.active;
      const boardsCollection = db.collections.get(Entity.Boards);
      const results = await boardsCollection
        .query(Q.where('_id', Q.eq(boardId)))
        .fetch();
      if (results?.length > 0) {
        let board = results[0];
        resolve(board);
      }
    } catch (e) {
      console.log('error in getSingleBoardPromisified :', e.message);
      reject(null);
    }
  });
}

export function getSingleBoard(boardId) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = database.active;
      const boardsCollection = db.collections.get(Entity.Boards);
      const results = await boardsCollection
        .query(Q.where('_id', Q.eq(boardId)))
        .fetch();
      // console.log('Hey the result',results);
      if (results?.length > 0) {
        let board = results[0];
        resolve(board);
      } else resolve(null);
    } catch (e) {
      console.log('error in getSingleBoard :', e.message);
      resolve(null);
    }
  });
}

export function getStarredBoards() {
  return [];
}

export function getUnreadBoards() {
  return [];
}

export function getMutedBoards() {
  return [];
}

export function getDiscussionBoardsByWsId(wsId) {
  return null;
}

export function getDiscussionBoardsByWsIdPromisify(wsId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve([]);
    }, 0);
  });
}

export function updateLastActivity(
  message,
  isPost = false,
  increaseUnread = false,
) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, 0);
  });
}

export function upsertLastActivity({board, message, post}) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = database.active;
      let activity = await board.lastActivity.fetch();
      await db.write(async () => {
        let lastActivity = activity.prepareUpdate((activity) => {
          if (message) {
            activity.message.id = message.clientId || message?.messageId;
          }
          if (post) {
            activity.post.id = post?.clientId || post?.postId;
          }
          return activity;
        });
        await db.batch(lastActivity);
      });
      resolve(true);
    } catch (e) {
      console.log('error in upsertLastActivity', e);
      reject(false);
    }
  });
}

export function updateStarStatus(boardId, star) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = database.active;
      const boardsCollection = db.collections.get(Entity.Boards);
      const results = await boardsCollection
        .query(Q.where('_id', Q.eq(boardId)))
        .fetch();
      if (results?.length > 0) {
        let board = results[0];
        await db.write(async () => {
          await board.update((b) => {
            b.star = star;
          });
        });
        resolve(true);
      } else {
        console.log('error in updateStarStatus', boardId);
        reject(false);
      }
    } catch (err) {
      console.log('error in updateStarStatus ' + err);
      reject(false);
    }
  });
}

export function updateUnreadCount(boardId, readUnread) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = database.active;
      const boardsCollection = db.collections.get(Entity.Boards);
      const results = await boardsCollection
        .query(Q.where('_id', Q.eq(boardId)))
        .fetch();
      if (results?.length > 0) {
        let board = results[0];
        await db.write(async () => {
          let records = [];
          let updatedBoard = board.prepareUpdate((b) => {
            b.unreadCount = readUnread ? 0 : 1;
          });
          records.push(updatedBoard);

          if (board.lastActivity?.post) {
            let post = board.lastActivity?.post.fetch();
            let updatedPost = post.prepareUpdate((p) => {
              p.unread = !p.unread;
            });
            records.push(updatedPost);
          } else if (board.lastActivity?.message) {
            let message = board.lastActivity?.message.fetch();
            let updatedMessage = message.prepareUpdate((m) => {
              m.unread = !m.unread;
            });
            records.push(updatedMessage);
          }
          await db.batch(...records);
        });
        resolve(true);
      } else {
        console.log('error in updateStarStatus', boardId);
        reject(false);
      }
    } catch (err) {
      console.log('exception updating last activity ' + err);
      reject(false);
    }
  });
}

export function getBoardByIdPromisfied(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, 0);
  });
}

export async function getBoardsShare(options) {
  const db = database.active;
  const types = ['directChat', 'groupChat', 'discussion'];
  const whereClause = [
    Q.where('type', Q.oneOf(types)),
    Q.experimentalSortBy('sortTime', Q.desc),
  ];
  const boardsCollection = db.collections.get(Entity.Boards);
  
  const boards = await boardsCollection
  .query(...whereClause)
    
    .fetch();
  return boards;
}

export function getBoardsForDisplay(options) {
  return new Promise((resolve) => {
    resolve([]);
  });
}

export function updateMuteStatus(boardId, data) {
  console.log('Updating mute status BoardsDao');
  return new Promise(async (resolve, reject) => {
    try {
      const db = database.active;
      const boardsCollection = db.collections.get(Entity.Boards);
      const results = await boardsCollection
        .query(Q.where('_id', Q.eq(boardId)))
        .fetch();
      if (results?.length > 0) {
        let board = results[0];
        await db.write(async () => {
          await board.update((b) => {
            b.notifications = data;
          });
        });
        resolve(true);
      } else {
        console.log('error in updateStarStatus', boardId);
        reject(false);
      }
    } catch (err) {
      console.log('exception updating last activity ' + err);
      reject(false);
    }
  });
}

export function deleteUserFromThread(memberID, boardData) {
  return new Promise(async (resolve, reject) => {
    // Delete message
    console.log('delete board called', memberID);
    let deleteMessage;
    try {
      const db = database.active;
      const boardsCollection = db.collections.get(Entity.BoardMembers);
      const board = await boardsCollection.find(memberID);
      deleteMessage = board.prepareDestroyPermanently();
      console.log('delete board deleteMessage', deleteMessage);
      await db.write(async () => {
        await db.batch(deleteMessage);
      });
    } catch (e) {
      // Do nothing
    }
    resolve(true);
  });
}

export function updateIsMemberStatus(boardId, isMember) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = database.active;
      const boardsCollection = db.collections.get(Entity.Boards);
      const results = await boardsCollection
        .query(Q.where('_id', Q.eq(boardId)))
        .fetch();
      if (results?.length > 0) {
        let board = results[0];
        await db.write(async () => {
          await board.update((b) => {
            b.isMember = isMember;
          });
        });
        resolve(true);
      } else {
        console.log('error in updateIsMemberStatus', boardId);
        reject(false);
      }
    } catch (e) {
      console.log('exception in updateIsMemberStatus ' + e);
      reject(false);
    }
  });
}

export function deleteThread(boardId) {
  return new Promise((resolve, reject) => {
    resolve(true);
  });
}

export function doMarkMessagesAsRead(params) {
  return new Promise((resolve) => {
    resolve();
  });
}

export function doMarkPostsAsRead(params) {
  return new Promise((resolve) => {
    resolve();
  });
}

export function upsertNewBoard(board) {
  return new Promise(async (resolve, reject) => {
    try {
      let records = [];
      const db = database.active;
      const boardsCollection = db.collections.get(Entity.Boards);
      const activitiesCollection = db.collections.get(Entity.Activities);
      const membersCollection = db.collections.get(Entity.BoardMembers);

      let message = {};
      if (board?.message) {
        let m = board?.message;
        message = {
          ...m,
          clientId: m?.clientId,
          boardClientId: board?.clientId,
          messageState: m?.messageState,
        };
      }
      switch (board?.type) {
        case 'directChat':
          let memberIds = board?.members?.map((member) => member.id);
          if (memberIds?.length === 2) {
            let account = AccountManager.getCurrentAccount();
            let userId = account?.user?.id;
            let [contactId] = memberIds.filter((member) => member !== userId);
            const boards = await boardsCollection
              .query(
                Q.unsafeSqlQuery(
                  'SELECT * from Boards b ' +
                    'left join BoardMembers bm on b.id == bm.member_board_id ' +
                    "where b.type='directChat' and bm.contact_id = ?",
                  [contactId],
                ),
              )
              .fetch();
            if (boards?.length > 0) {
              let oneToOneBoard = boards[0];
              message = {
                ...message,
                clientId: board?.message?.clientId,
                boardClientId: oneToOneBoard?.clientId,
                boardId: oneToOneBoard?._id,
              };
              board = {
                ...board,
                id: oneToOneBoard?._id,
                clientId: oneToOneBoard?.clientId,
                lastActivity: message,
                lastModified: board?.lastModified,
              };
            }
          }
          break;
        default:
          break;
      }

      let nBoard = {
        id: board?.clientId || board?.id,
        clientId: board?.clientId || board?.id,
        name: board?.name,
        creator: ContactsDao.updateContact(board?.creator),
        owner: ContactsDao.updateContact(board?.owner),
        membersCount: board?.membersCount,
        members: board?.members?.map((value) => {
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
        recentMembers: board?.members?.map((value) => {
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
        groupChat: board?.groupChat,
        lastActivity: message,
        isMember: board?.isMember,
        lastModified: board?.lastModified,
        type: board?.type,
        boardState: board?.boardState,
      };

      let rMessage, rBoard;
      await db.write(async () => {
        let boardRecord;
        let lastActivity;
        let clientId = nBoard.clientId || nBoard.id;
        let ownerRecord = membersCollection.prepareCreate((m) => {
          m.ownerOfBoard.id = clientId;
          m.contact.id = nBoard?.owner?.id;
        });
        let creatorRecord = membersCollection.prepareCreate((m) => {
          m.creatorOfBoard.id = clientId;
          m.contact.id = nBoard?.creator?.id;
        });
        let {messageRecord, objects} = await prepareUpsertNewMessage(message);
        let results = await boardsCollection
          .query(Q.where('clientId', Q.eq(nBoard.clientId)))
          .fetch();
        if (results?.length > 0) {
          boardRecord = results[0];
        } else {
          lastActivity = activitiesCollection.prepareCreate((record) => {
            record.board.id = clientId;
            if (messageRecord) {
              record.message.id = messageRecord.id;
            }
            return record;
          });
          boardRecord = boardsCollection.prepareCreate((record) => {
            record._raw = sanitizedRaw({id: clientId}, boardsCollection.schema);
            if (ownerRecord) {
              record.owner.id = ownerRecord.id;
            }
            if (creatorRecord) {
              record.creator.id = creatorRecord.id;
            }
            if (lastActivity) {
              record.lastActivity.id = lastActivity.id;
            }
            prepareBoard(record, nBoard);
          });
          records.push(boardRecord, messageRecord, lastActivity);

          const members = await prepareUpsertBoardMembers({
            boardId: clientId,
            members: nBoard?.members,
            recentMembers: nBoard?.recentMembers,
          });
          records.push(...members);
        }
        rMessage = messageRecord;
        rBoard = boardRecord;
        await db.batch(...records, creatorRecord, ownerRecord, ...objects);
      });
      resolve({nMessage: rMessage, nBoard: rBoard});
    } catch (error) {
      reject(error);
    }
  });
}

export function updateQueryItemsInitSync(data) {
  return new Promise((resolve) => {
    resolve(true);
  });
}

export function updateQueryItems(queryItems) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 10);
  });
}

export function getQueryItem(query) {
  return new Promise((resolve) => {
    let queryItem = null;
    resolve(queryItem);
  });
}

export function findOneToOneBoard({members, message}) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = database.active;
      const boardsCollection = db.collections.get(Entity.Boards);
      if (message) {
        let from = await message?.from.fetch();
        let member = await from.contact.fetch();
        members = [member];
      }
      let memberIds = members?.map((member) => member.id);
      if (memberIds?.length > 0 && memberIds?.length <= 2) {
        let account = AccountManager.getCurrentAccount();
        let userId = account?.user?.id;
        let from = members?.filter((m) => m.id !== userId);
        let contacts = from.map((c) => c._raw);
        let [contactId] = memberIds.filter((member) => member !== userId);
        const boards = await boardsCollection
          .query(
            Q.unsafeSqlQuery(
              'SELECT * from Boards b ' +
                'left join BoardMembers bm on b.id == bm.member_board_id ' +
                "where b.type='directChat' and bm.contact_id = ?",
              [contactId],
            ),
          )
          .fetch();
        if (boards?.length > 0) {
          let members = members?.map((member) => member.id);
          let oneToOneBoard = boards[0];
          resolve({board: oneToOneBoard, contacts: contacts});
        } else {
          resolve({contacts: contacts});
        }
      }
    } catch (error) {
      reject({message: 'error in findOneToOneBoard'});
    }
  });
}
