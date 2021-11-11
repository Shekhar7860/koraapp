import {sanitizedRaw} from '@nozbe/watermelondb/RawRecord';
import {Q} from '@nozbe/watermelondb';
import database from '../native/realm';
import * as Entity from '../native/realm/dbconstants';
import {preparePostComponents} from './PrepareUpsertComponents';

export async function prepareUpsertPosts({boardId, posts = []}) {
  let records = [];
  try {
    if (!(posts && posts.length)) {
      return [];
    }
    let uniquePosts = findUniquePosts({posts});
    const db = database.active;
    const postsCollection = db.collections.get(Entity.Posts);
    const membersCollection = db.collections.get(Entity.Members);

    const ids = uniquePosts.map((p) => {
      return p.clientId || p.postId;
    });
    const allPostRecords = await postsCollection
      .query(Q.and(Q.where('boardId', boardId), Q.where('id', Q.oneOf(ids))))
      .fetch();
    let postsToCreate = uniquePosts.filter((p1) => {
      return !allPostRecords.find((p2) => {
        let id = p1.clientId || p1.postId;
        return id === p2.id;
      });
    });
    let postsToUpdate = allPostRecords.filter((p1) => {
      return uniquePosts.find((p2) => {
        let id = p2.clientId || p2.postId;
        return p1.id === id;
      });
    });
    for (const post of postsToCreate) {
      let fromRecord, authorRecord;
      let id = post?.clientId || post?.postId;
      if (post?.from) {
        let from = post?.from;
        if (typeof from === 'string') {
          from = {
            id: from,
          };
        }
        fromRecord = membersCollection.prepareCreate((m) => {
          m.fromOfPost.id = id;
          m.contact.id = from.id;
        });
        records.push(fromRecord);
      }
      if (post?.author) {
        let author = post?.author;
        if (typeof author === 'string') {
          author = {
            id: author,
          };
        }
        authorRecord = membersCollection.prepareCreate((m) => {
          m.authorOfPost.id = id;
          m.contact.id = author.id;
        });
        records.push(authorRecord);
      }

      if (post?.components) {
        const components = await preparePostComponents({
          postId: id,
          components: post?.components,
        });
        records.push(...components);
      }
      let record = postsCollection.prepareCreate((p) => {
        p._raw = sanitizedRaw({id: id}, postsCollection.schema);
        p.clientId = post.clientId;
        p.board.id = boardId;
        p.postId = post?.postId;
        if (authorRecord) {
          p.author.id = authorRecord.id;
        }
        if (fromRecord) {
          p.from.id = fromRecord.id;
        }
        preparePost(p, post);
      });
      records.push(record);
    }

    postsToUpdate = postsToUpdate.map((post) => {
      const updatedPost = uniquePosts.find((p) => {
        let clientId = p.clientId || p.postId;
        return clientId === post.clientId;
      });
      if (post._hasPendingUpdate) {
        return post;
      }
      return post.prepareUpdate((p) => {
        p.board.id = boardId;
        preparePost(p, updatedPost);
      });
    });

    records.push(...postsToUpdate);
  } catch (e) {
    console.log('error in prepareUpsertPosts', e);
  }
  return records;
}

export function preparePost(record, post) {
  record.postId = post?.postId;
  record.clientId = post?.clientId || post?.postId;
  record.postType = post?.postType;
  record.boardId = post?.boardId;
  record.parentId = post?.parentId;
  record.postType = post?.postType;
  record.namespaceId = post?.namespaceId;
  record.commentCount = post?.commentCount;
  record.like = post?.like;
  record.unlike = post?.unlike;
  record.laugh = post?.laugh;
  record.sad = post?.sad;
  record.shock = post?.shock;
  record.anger = post?.anger;
  record.isPostedAsTeam = post?.isPostedAsTeam;
  record.isEdited = post?.isEdited;
  record.linkPreviews = post.linkPreviews;
  // record.policy = post?.policy;
  // record.location = JSON.stringify(post?.location);
  record.lastModified = post?.lastModified;
  // record.lastModifiedBy = ContactsDao.updateContact(post?.lastModifiedBy);
  record.createdOn = post?.createdOn;
  record.sortTime = post?.sortTime;
  record.deliveredOn = post?.deliveredOn;
  record.messageState = post?.messageState || Entity.ResourceState.SENT;
  record.metaType = post?.metaType;
  record.wsId = post?.wsId;
  record.orgId = post?.orgId;
  record.actionCount = post?.actionCount;
  record.encrypted = post?.encrypted;
  record.hasHistory = post?.hasHistory;
  record.disabledLike = post?.disabledLike;
  record.disabledComment = post?.disabledComment;
  record.disabledOptions = post?.disabledOptions;
  record.postNumber = post?.postNumber;
  record.retentionState = post?.retentionState;
  record.classification = post?.classification;
  record.likeCount = post?.likeCount;
  record.unlikeCount = post?.unlikeCount;
  record.sadCount = post?.sadCount;
  record.remind = post?.remind;
  record.laughCount = post?.laughCount;
  record.angerCount = post?.angerCount;
  record.shockCount = post?.shockCount;
  record.isFollowing = post?.isFollowing;
  record.readCount = post?.readCount;
  record.like = post.like;
  record.unlike = post.unlike;
  record.sad = post.sad;
  record.laugh = post.laugh;
  record.anger = post.anger;
  record.shock = post.shock;
  record.mentions=post?.mentions;
  record.everyoneMentioned = post?.everyoneMentioned;
  record.moreAvailable = false;
}

function findUniquePosts({posts}) {
  const completePosts = [].concat(posts).reverse();
  const uniquePosts = completePosts.reduce((acc, current) => {
    const x = acc.find((item) => {
      let id1 = item.clientId || item.postId;
      let id2 = current.clientId || current.postId;
      return id1 === id2;
    });
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);
  return uniquePosts;
}
