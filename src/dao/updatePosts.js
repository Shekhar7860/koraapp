import {sanitizedRaw} from '@nozbe/watermelondb/RawRecord';
import {Q} from '@nozbe/watermelondb';
import uuid from 'react-native-uuid';
import database from '../native/realm';
import {preparePost, prepareUpsertPosts} from './PrepareUpsertPosts';
import * as Entity from '../native/realm/dbconstants';
import * as ContactsDao from './ContactsDao';
import {preparePostComponents} from './PrepareUpsertComponents';

export function updatePosts(boardId, posts, updatePostCount = false) {
  return new Promise(async (resolve, reject) => {
    const db = database.active;
    if (posts?.length === 0) {
      reject({message: 'No Posts'});
      return;
    }
    await db.write(async () => {
      const orderedPosts = posts
        .slice()
        .sort((a, b) => b.sortTime - a.sortTime);
      let post = orderedPosts[0];

      try {
        let objects = [];
        let boardsCollection = db.collections.get(Entity.Boards);
        let [boardRecord] = await boardsCollection
          .query(Q.where('_id', Q.eq(boardId)))
          .fetch();
        if (boardRecord) {
          const records = await prepareUpsertPosts({
            boardId: boardRecord.id,
            posts: posts,
          });
          objects.push(...records);

          let mLastActivity;
          if (post?.postType !== 'comment') {
            let activity = await boardRecord.lastActivity.fetch();
            mLastActivity = activity.prepareUpdate((activity) => {
              if (post) {
                let id = post?.clientId || post?.postId;
                activity.post.id = id;
              }
              return activity;
            });
          }

          if (mLastActivity) {
            objects.push(mLastActivity);
          }
          let mBoardRecord = boardRecord.prepareUpdate((board) => {
            if (post?.deliveredOn) {
              board.sortTime = post?.deliveredOn;
              if (updatePostCount && post?.postType !== 'comment') {
                board.unreadCount = board.unreadCount + 1;
              }
            }
            return board;
          });
          objects.push(mBoardRecord);
        }
        await db.batch(...objects);
        resolve();
      } catch (error) {
        console.log('error in updatePosts : \n ', error);
        reject(error);
      }
    });
  });
}
export function updatePostReactions(postId, reaction) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = database.active;
      const postCollection = db.collections.get(Entity.Posts);
      const [postToUpdate] = await postCollection
        .query(Q.where('postId', Q.eq(postId)))
        .fetch();

      await db.write(async () => {
        await postToUpdate.update((p) => {
          if (p) {
            p.likeCount = reaction.likeCount;
            p.unlikeCount = reaction.unlikeCount;
            p.sadCount = reaction.sadCount;
            p.laughCount = reaction.laughCount;
            p.angerCount = reaction.angerCount;
            p.shockCount = reaction.shockCount;
            p.like = reaction.like;
            p.unlike = reaction.unlike;
            p.sad = reaction.sad;
            p.laugh = reaction.laugh;
            p.anger = reaction.anger;
            p.shock = reaction.shock;
          }
          resolve();
        });
      });
    } catch (e) {
      console.log('error in updateMessageStatus', e);
      reject(e);
    }
  });
}

export function updatePostReminder(postId, reminder) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = database.active;
      const postCollection = db.collections.get(Entity.Posts);
      const [postToUpdate] = await postCollection
        .query(Q.where('postId', Q.eq(postId)))
        .fetch();

      await db.write(async () => {
        await postToUpdate.update((p) => {
          if (p) {
            p.remind = [
              {
                userId: reminder.userId,
                remindAt: reminder.scheduledOn,
              },
            ];
          }
          resolve();
        });
      });
    } catch (e) {
      console.log('error in updateMessageStatus', e);
      reject(e);
    }
  });
}

export async function prepareUpsertNewPost(post) {
  const uniqueId = uuid.v1();
  let nPost = {
    postId: post?.postId || uniqueId,
    clientId: post?.clientId || uniqueId,
    postType: post?.postType,
    author: ContactsDao.updateContact(post?.author),
    from: ContactsDao.updateContact(post?.from),
    boardId: post?.boardId,
    board_id: post?.board_id,
    parentId: post?.parentId,
    namespaceId: post?.namespaceId,
    commentCount: post?.commentCount,
    like: post?.like || [],
    unlike: post?.unlike || [],
    laugh: post?.laugh || [],
    sad: post?.sad || [],
    shock: post?.shock || [],
    anger: post?.anger || [],
    isPostedAsTeam: post?.isPostedAsTeam,
    isEdited: post?.isEdited,
    messageState: post?.messageState || Entity.ResourceState.SENDING,
    linkPreviews: post.linkPreviews || [],
    policy: JSON.stringify(post?.policy),
    components: post?.components?.map((value) => {
      let component = value;
      if (value?.componentId === 'timelineevent') {
        component = {
          ...value,
          componentId: uuid.v4(),
        };
      }
      return component;
    }),
    location: JSON.stringify(post?.location),
    lastModified: post?.lastModified,
    lastModifiedBy: ContactsDao.updateContact(post?.lastModifiedBy),
    createdOn: post?.createdOn,
    deliveredOn: post?.deliveredOn,
    state: post?.state,
    metaType: post?.metaType,
    wsId: post?.wsId,
    orgId: post?.orgId,
    actionCount: post?.actionCount,
    encrypted: post?.encrypted,
    hasHistory: post?.hasHistory,
    disabledLike: post?.disabledLike,
    disabledComment: post?.disabledComment,
    disabledOptions: post?.disabledOptions,
    postNumber: post?.postNumber,
    retentionState: post?.retentionState,
    classification: post?.classification,
    likeCount: post?.likeCount,
    unlikeCount: post?.unlikeCount,
    sadCount: post?.sadCount,
    remind: post?.remind,
    laughCount: post?.laughCount,
    angerCount: post?.angerCount,
    shockCount: post?.shockCount,
    isFollowing: post?.isFollowing,
    readCount: post?.readCount,
    moreAvailable: false,
    mentions:post?.mentions,
    everyoneMentioned : post?.everyoneMentioned
  };

  const db = database.active;
  const postCollection = db.collections.get(Entity.Posts);
  const membersCollection = db.collections.get(Entity.Members);

  let postRecord;
  let authorRecord;
  let fromRecord;
  let objects = [];

  let id = nPost?.clientId;
  let results = await postCollection
    .query(Q.or(Q.where('id', Q.eq(nPost.id)), Q.where('postId', Q.eq(nPost.postId))))
    .fetch();
  if (results?.length > 0) {
    postRecord = results[0];
    if (nPost?.components?.length > 0) {
      const components = await preparePostComponents({
        postId: id,
        components: nPost?.components,
      });
      objects.push(...components);
    }
    postRecord = postRecord.prepareUpdate((p) => {
      preparePost(p, nPost);
    });
  } else {
    if (nPost?.author) {
      authorRecord = await membersCollection.prepareCreate((m) => {
        m.authorOfPost.id = id;
        m.contact.id = nPost?.author?.id;
      });
      objects.push(authorRecord);
    }
    if (nPost?.from) {
      fromRecord = await membersCollection.prepareCreate((m) => {
        m.fromOfPost.id = id;
        m.contact.id = nPost?.from?.id;
      });
      objects.push(fromRecord);
    }

    if (nPost?.components?.length > 0) {
      const components = await preparePostComponents({
        postId: id,
        components: nPost?.components,
      });
      objects.push(...components);
    }
    postRecord = await postCollection.prepareCreate((p) => {
      p._raw = sanitizedRaw({id: id}, postCollection.schema);
      p.clientId = nPost?.clientId;
      p.postId = nPost?.postId;
      p.board.id = nPost?.board_id;
      if (authorRecord) {
        p.author.id = authorRecord.id;
      }
      if (fromRecord) {
        p.from.id = fromRecord.id;
      }
      preparePost(p, nPost);
    });
  }
  const result = {postRecord: postRecord, objects: objects};
  return result;
}

export function upsertNewPost(post) {
  return new Promise(async (resolve, reject) => {
    try {
      let record;
      const db = database.active;
      await db.write(async () => {
        let {postRecord, objects} = await prepareUpsertNewPost(post);
        await db.batch(postRecord, ...objects);
        record = postRecord;
      });
      resolve(record);
    } catch (error) {
      console.log('error in upsertNewPost : \n ', error);
      reject(error);
    }
  });
}

export function updatePostStatus({post, status, data}) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = database.active;
      await db.write(async () => {
        await post.update((p) => {
          p.messageState = status;
          if (data) {
            preparePost(post, data);
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
