import {
  prepareUpsertNewPost,
  updatePostReactions,
  updatePosts as updatePostWatermelonDB,
} from './updatePosts';
import database from '../native/realm';
import * as Entity from '../native/realm/dbconstants';
import {Q} from '@nozbe/watermelondb';

import reactotron from '../../reactotron-config';
import {upsertNewPost as upsertNewPost_} from '../dao/updatePosts';

export const upsertNewPost = upsertNewPost_;

export function deletePost(postId) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = database.active;
      const postsCollection = db.collections.get(Entity.Posts);
      const posts = await postsCollection
      .query(Q.where('postId', Q.eq(postId)))
      .fetch();
      await db.write(async () => {
        let postsToDelete = posts.map((post) =>
          post.prepareDestroyPermanently(),
        );
        await db.batch(...postsToDelete);
      });
      resolve(true);
    } catch (e) {
      console.log('error in deletePost :', e);
      reject(false);
    }
  });
}

export function reactPost(postId, reaction) {
  return updatePostReactions(postId, reaction);
}

export function getPostsPromisified(boardId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(null);
    }, 0);
  });
}

export function getPosts(boardId) {
  let message = null;
  return message;
}

export function getSinglePost(postId) {
  return new Promise(async (resolve) => {
    const db = database.active;
    const postsCollection = db.collections.get(Entity.Posts);
    const posts = await postsCollection
      .query(Q.where('postId', Q.eq(postId)))
      .fetch();
    if (posts && posts.length > 0)
      resolve(posts[0]);
    resolve(null);
  });
}

export function updatePosts(posts) {
  return new Promise((resolve, reject) => {
    const boardId = posts[0]?.boardId;
    return updatePostWatermelonDB(boardId, posts);
  });
}

export function increaseCommentCount(postId) {}

export function updatePostWithWrite(post, updatePostCount = false) {
  return new Promise((resolve, reject) => {
    const boardId = post?.boardId;
    return updatePostWatermelonDB(boardId, [post], updatePostCount);
  });
}

export function getComments(postId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let message = null;
      resolve(message);
    }, 0);
  });
}

export function getReplies(cId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve([]);
    }, 0);
  });
}

export function updateRemindPost(remind) {
  return new Promise((resolve, reject) => {
    reject(true);
  });
}

function updateRemind(remind) {
  let realmPost = [];
  return realmPost;
}

export function updatePost(post) {
  return updatePostWithWrite(post);
}
