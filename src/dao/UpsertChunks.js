import database from '../native/realm';
import * as Entity from '../native/realm/dbconstants';

export function upsertUploadItem({
  component,
  fileContext,
  fileName,
  numberOfChunks,
  chunks = [],
}) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!(chunks && chunks.length)) {
        reject({message: 'No chunks'});
      }

      const db = database.active;
      const uploadItemsCollection = db.collections.get(Entity.UploadItems);
      const chunksCollection = db.collections.get(Entity.Chunks);
      let uploadItem = uploadItemsCollection.prepareCreate((u) => {
        u.component.id = component.id;
        u.fileContext = fileContext;
        u.fileName = fileName;
        u.numberOfChunks = numberOfChunks;
      });
      let updatedComponent = component.prepareUpdate((c) => {
        c.uploadItem.id = c.id;
      });

      let chunksToCreate = chunks.map((chunk) =>
        chunksCollection.prepareCreate((c) => {
          c.uploadItem.id = uploadItem.id;
          c.chunkOffset = chunk.chunkOffset;
          c.chunkNumber = chunk.chunkNumber;
          c.chunkSize = chunk.chunkSize;
        }),
      );

      try {
        const objects = [updatedComponent, ...chunksToCreate, uploadItem];
        await db.write(async () => {
          await db.batch(...objects);
        });
      } catch (e) {
        console.log('error in saving upsertUploadItem', e);
      }
      resolve({uploadItem: uploadItem, chunkObjects: chunksToCreate});
    } catch (e) {
      console.log('error in upsertUploadItem', e);
      reject(e);
    }
  });
}

export function updateFileToken({uploadItem, data}) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = database.active;
      await db.write(async () => {
        await uploadItem.update((u) => {
          if (data?.fileToken) {
            u.fileToken = data?.fileToken;
          }
          if (data?.expiresOn) {
            u.expiresOn = data?.expiresOn;
          }
        });
      });
      resolve();
    } catch (e) {
      console.log('error in updateFileToken', e, uploadItem.id);
      reject(e);
    }
  });
}

export function updateChunkStatus({chunk, status}) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = database.active;
      await db.write(async () => {
        await chunk.update((c) => {
          c.chunkStatus = status;
        });
      });
      resolve(true);
    } catch (e) {
      console.log('error in updateChunkStatus', e, chunk.uploadItem.id);
      reject(e);
    }
  });
}

export function updateFileId({component, fileMeta, data}) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = database.active;
      await db.write(async () => {
        await fileMeta.update((f) => {
          f.fileId = data?.fileId;
          f.hash = data?.hash;
          f.thumbnailURL = data?.thumbnailURL;
        });
        await component.update((c) => {
          c.componentFileId = data?.fileId;
          c.thumbnailURL=data?.thumbnailURL;
        });
      });
      resolve(true);
    } catch (e) {
      console.log('error in updateChunkStatus', e, chunk.uploadItem.id);
      reject(e);
    }
  });
}
