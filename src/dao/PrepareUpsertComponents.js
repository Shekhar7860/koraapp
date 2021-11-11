import {Q} from '@nozbe/watermelondb';
import database from '../native/realm';
import * as Entity from '../native/realm/dbconstants';

export async function prepareMessageComponents({messageId, components = []}) {
  let records = [];
  try {
    if (!(components && components.length)) {
      return records;
    }
    const db = database.active;
    const fileMetaCollection = db.collections.get(Entity.FileMetas);
    const componentCollection = db.collections.get(Entity.Components);
    const componentIds = components.map((c) => c.componentId);
    const allComponentRecords = await componentCollection
      .query(
        Q.and(
          Q.where('message_id', messageId),
          Q.where('componentId', Q.oneOf(componentIds)),
        ),
      )
      .fetch();

    let componentsToCreate = components.filter(
      (c1) =>
        !allComponentRecords.find((c2) => c1.componentId === c2.componentId),
    );
    let componentsToUpdate = allComponentRecords.filter((c1) =>
      components.find((c2) => c1.componentId === c2.componentId),
    );

    componentsToCreate = componentsToCreate.map((component) => {
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
          f.rId = messageId;
        });
        records.push(fm);
      }
      return componentCollection.prepareCreate((c) => {
        c.message.id = messageId;
        if (fm) {
          c.fileMeta.id = fm.id;
        }
        prepareComponent(c, component);
      });
    });

    componentsToUpdate = componentsToUpdate.map((component) => {
      const updatedComponent = components.find(
        (c) => c.componentId === component.componentId,
      );
      if (component._hasPendingUpdate) {
        console.log(component);
        return component;
      }
      return component.prepareUpdate((c) => {
        prepareComponent(c, updatedComponent);
      });
    });

    records.push(...componentsToCreate, ...componentsToUpdate);    
  } catch (e) {
    console.log('error in prepareMessageComponents', e);
  }
  return records;
}

export async function preparePostComponents({postId, components = []}) {
  let records = [];
  try {
    if (!(components && components.length)) {
      return records;
    }
    const db = database.active;
    const fileMetaCollection = db.collections.get(Entity.FileMetas);
    const componentCollection = db.collections.get(Entity.Components);
    const componentIds = components.map((c) => c.componentId);
    const allComponentRecords = await componentCollection
      .query(
        Q.and(
          Q.where('post_id', postId),
          Q.where('componentId', Q.oneOf(componentIds)),
        ),
      )
      .fetch();

    let componentsToCreate = components.filter(
      (c1) =>
        !allComponentRecords.find((c2) => c1.componentId === c2.componentId),
    );
    let componentsToUpdate = allComponentRecords.filter((c1) =>
      components.find((c2) => c1.componentId === c2.componentId),
    );

    componentsToCreate = componentsToCreate.map((component) => {
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
          f.rId = postId;
        });
        records.push(fm);
      }
      return componentCollection.prepareCreate((c) => {
        c.post.id = postId;
        if (fm) {
          c.fileMeta.id = fm.id;
        }
        prepareComponent(c, component);
      });
    });

    componentsToUpdate = componentsToUpdate.map((component) => {
      const updatedComponent = components.find(
        (c) => c.componentId === component.componentId,
      );
      if (component._hasPendingUpdate) {
        console.log(component);
        return component;
      }
      return component.prepareUpdate((c) => {
        prepareComponent(c, updatedComponent);
      });
    });

    records.push(...componentsToCreate, ...componentsToUpdate);    
  } catch (e) {
    console.log('error in preparePostComponents', e);
  }
  return records;
}

export function prepareComponent(record, component) {
  record.componentId = component?.componentId;
  record.componentType = component?.componentType;
  record.componentBody = component?.componentBody;
  record.componentThumbnails = component?.componentThumbnails;
  record.componentData = component?.componentData;
  record.componentSize = component?.componentSize;
  record.componentLength = component?.componentLength;
  record.thumbnailURL = component?.thumbnailURL;
  record.componentFileId = component?.componentFileId;
}
