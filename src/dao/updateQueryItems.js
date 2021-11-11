import {sanitizedRaw} from '@nozbe/watermelondb/RawRecord';
import {Q} from '@nozbe/watermelondb';
import database from '../native/realm';
import * as Entity from '../native/realm/dbconstants';

export function updateQueryItems(data) {
  return new Promise(async (resolve, reject) => {
    try {
      let records = await prepareUpsertQueryItems(data);
      await db.write(async () => {
        await db.batch(...records);
      });
      return resolve();
    } catch (err) {
      console.log('error in upsert query items:\n ', err);
      return reject({message: 'error in upsert query items'});
    }
  });
}

export async function prepareUpsertQueryItems(data) {
  const types = [
    {
      id: 'everything',
      badge: 'Badge',
      icon: 'DR_Everything',
      name: 'All Messages',
      filter: 'all',
      index: 0,
      active: false,
    },
    {
      id: 'discussion',
      badge: 'Badge',
      icon: 'Discussion_Icon',
      name: 'Rooms',
      filter: 'discussion',
      index: 1,
      active: true,
    },
    {
      id: 'chats',
      badge: 'Badge',
      icon: 'DR_Chat',
      name: 'Chats',
      filter: 'chats',
      index: 2,
      active: true,
    },
    {
      id: 'starred',
      badge: 'Badge',
      icon: 'DR_Starred',
      name: 'Starred',
      filter: 'starred',
      index: 3,
      active: true,
    },
    {
      id: 'muted',
      badge: 'Badge',
      icon: 'Mute',
      name: 'Muted',
      filter: 'muted',
      index: 4,
      active: true,
    },
    {
      id: 'unread',
      badge: 'Badge',
      icon: 'See',
      name: 'Unread',
      filter: 'unread',
      index: 5,
      active: true,
    },
  ];
  let queryItems = [];
  types.forEach((type) => {
    let item = data[type.id];
    if (item) {
      let quertyItem = {
        id: type.id,
        moreAvailable: item?.moreAvailable || false,
        lastBoardSortTime: item?.lastBoardSortTime,
        badge: type?.badge,
        icon: type?.icon,
        name: type?.name,
        filter: type?.filter,
        index: type?.index,
        active: type?.active,
      };
      queryItems.push(quertyItem);
    }
  });

  try {
    if (!(queryItems && queryItems.length)) {
      return [];
    }
    const db = database.active;

    const queryItemsCollection = db.collections.get(Entity.QueryItems);
    const queryItemIds = queryItems.map((q) => q.id);
    const allQueryItemRecords = await queryItemsCollection
      .query(Q.where('id', Q.oneOf(queryItemIds)))
      .fetch();

    let queryItemsToCreate = queryItems.filter(
      (q1) => !allQueryItemRecords.find((q2) => q1.id === q2.id),
    );
    queryItemsToUpdate;
    let queryItemsToUpdate = allQueryItemRecords.filter((q1) =>
      queryItems.find((q2) => q1.id === q2.id),
    );

    queryItemsToCreate = queryItemsToCreate.map((queryItem) =>
      queryItemsCollection.prepareCreate((q) => {
        q._raw = sanitizedRaw({id: queryItem.id}, queryItemsCollection.schema);
        q.moreAvailable = queryItem?.moreAvailable;
        q.lastBoardSortTime = queryItem?.lastBoardSortTime;
        q.badge = queryItem?.badge;
        q.icon = queryItem?.icon;
        q.name = queryItem?.name;
        q.filter = queryItem?.filter;
        q.index = queryItem?.index;
        q.active = queryItem?.active;
        q.laMod = new Date();
      }),
    );

    queryItemsToUpdate = queryItemsToUpdate.map((queryItem) => {
      const updatedQueryItem = queryItems.find((q) => q.id === queryItem.id);
      if (queryItem._hasPendingUpdate) {
        return;
      }
      return queryItem.prepareUpdate((q) => {
        q.moreAvailable = updatedQueryItem?.moreAvailable;
        q.active = updatedQueryItem?.active;
        if (q.lastBoardSortTime > updatedQueryItem?.lastBoardSortTime) {
          q.lastBoardSortTime = updatedQueryItem?.lastBoardSortTime;
        }
        q.laMod = new Date();
      });
    });

    let records = [...queryItemsToCreate, ...queryItemsToUpdate];
    return records;
  } catch (err) {
    console.log('error in upsert query items:\n ', err);
    return [];
  }
}

export async function prepareUpdateQueryItem(item) {
  let records = [];
  if (!(item && item.id)) {
    return records;
  }
  const db = database.active;
  const queryItemsCollection = db.collections.get(Entity.QueryItems);
  try {
    const record = await queryItemsCollection.find(item.id);
    let queryItem = record.prepareUpdate((q) => {
      q.moreAvailable = item?.moreAvailable;
      q.lastBoardSortTime = item?.lastBoardSortTime;
      q.laMod = new Date();
    });
    records.push(queryItem);
  } catch (error) {
    console.log('error in prepareUpdateQueryItem : \n ', error);
  }
  return records;
}

export function getQueryItem(query) {
  return new Promise((resolve, reject) => {
    var type = query;
    switch (query) {
      case 'all':
      case 'everything':
        type = 'everything';
        break;
      case 'chat':
        type = 'chats';
        break;
      default:
        break;
    }

    const db = database.active;
    const queryItemsCollection = db.collections.get(Entity.QueryItems);
    db.write(async () => {
      try {
        const queryItem = await queryItemsCollection.find(type);
        resolve(queryItem);
      } catch (err) {
        console.log('error in find query item : \n ', err);
        reject({message: 'error in find query item :'});
      }
    });
  });
}
