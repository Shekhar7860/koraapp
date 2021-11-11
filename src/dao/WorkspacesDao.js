import {Q} from '@nozbe/watermelondb';
import database from '../native/realm';
import * as Entity from '../native/realm/dbconstants';
import {prepareUpsertWorkspaces} from './PrepareUpsertWorkspaces';

export function getWorkspace(wsId, createNewIfNull = false) {
  let workspace = null;
  return workspace;
}

function initializeWsWithId(wsId) {
  let realmObj = null;
  return new Promise((resolve, reject) => {
    resolve(realmObj);
  });
}

export function getWorkspacePromisified(wsId, createNewIfNull = false) {
  return new Promise((resolve, reject) => {
    const db = database.active;
    const workspacesCollection = db.collections.get(Entity.Workspaces);
    workspacesCollection
      .query(Q.where('id', wsId))
      .fetch()
      .then((data) => {
        resolve(data[0]?._raw);
      })
      .catch(reject);
  });
}

export function starUnstarWs(wsId, value) {
  return new Promise(async (resolve, reject) => {
    const db = database.active;
    const wsCollection = db.collections.get(Entity.Workspaces);
    const workspaces = await wsCollection.query(Q.where('id', wsId)).fetch();
    if (workspaces?.length > 0) {
      let workspace = workspaces[0];
      await db.write(async () => {
        await workspace.update((w) => {
          w.isWSStarred = value;
        });
      });
      resolve(true);
    } else {
      console.log('error in starUnstarWs', e);
      reject(false);
    }
  });
}

//HERE
export function getWorkspaces() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve([]);
    }, 100);
  });
}

export function getWorkspacesList(ids, isObject) {
  let ws = [];
  return ws;
}

export function getWSLastModified() {
  return new Promise(async (resolve) => {
    const db = database.active;
    try {
      const wsCollection = db.collections.get(Entity.Workspaces);
      const whereClause = [Q.experimentalSortBy('modifiedDate', Q.desc)];
      const workspaces = await wsCollection.query(...whereClause).fetch();
      if (workspaces && workspaces.length > 0) {
        let ws = workspaces[0];
        resolve(ws.modifiedDate);
      } else {
        resolve(false);
      }
    } catch (e) {
      console.log('error in getWSLastModified', e);
      reject(false);
    }
  });
}

export function upsertWorkspaces(workspaces) {
  return new Promise(async (resolve, reject) => {
    try {
      let db = database.active;
      await db.write(async () => {
        let wsRecords = await prepareUpsertWorkspaces(workspaces);
        await db.batch(...wsRecords);
      });
      resolve();
    } catch (e) {
      console.log('error in upsertWorkspaces', e);
      reject({message: 'error in upsertWorkspaces'});
    }
  });
}

export function editWorkspace(workspace) {
  return new Promise(async (resolve, reject) => {
    try {
      let db = database.active;
      await db.write(async () => {
        const workspaces = [workspace];
        let wsRecords = await prepareUpsertWorkspaces(workspaces);
        await db.batch(...wsRecords);
      });
      resolve();
    } catch (e) {
      console.log('error in editWorkspace', e);
      reject({message: 'error in editWorkspace'});
    }
  });
}
