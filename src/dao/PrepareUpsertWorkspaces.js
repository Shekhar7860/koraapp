import {sanitizedRaw} from '@nozbe/watermelondb/RawRecord';
import {Q} from '@nozbe/watermelondb';
import database from '../native/realm';
import * as Entity from '../native/realm/dbconstants';

export async function prepareUpsertWorkspaces(workspaces) {
  let wsRecords = [];
  const db = database.active;
  try {
    const workspacesCollection = db.collections.get(Entity.Workspaces);
    const workspaceIds = workspaces.map((w) => w.id);
    if (workspaceIds?.length > 0) {
      const existingWorkspaces = await workspacesCollection
        .query(Q.where('id', Q.oneOf(workspaceIds)))
        .fetch();
      const workspacesToUpdate = existingWorkspaces.filter((w1) =>
        workspaces.find((w2) => w1.id === w2.id),
      );
      const workspacesToCreate = workspaces.filter(
        (w1) => !existingWorkspaces.find((w2) => w1.id === w2.id),
      );

      const newWorkspaces = workspacesToCreate.map((workspace) =>
        workspacesCollection.prepareCreate((record) => {
          record._raw = sanitizedRaw(
            {id: workspace.id},
            workspacesCollection.schema,
          );
          prepareUpsertWorkspace(record, workspace);
          return record;
        }),
      );

      const updatedWorkspaces = workspacesToUpdate.map((record) => {
        if (record._hasPendingUpdate) {
          console.log(record);
          return record;
        }
        const workspace = workspaces.find((w) => w.id === record.id);
        return record.prepareUpdate(() => {
          prepareUpsertWorkspace(record, workspace);
        });
      });

      wsRecords.push(...newWorkspaces, ...updatedWorkspaces);
    }
  } catch (e) {
    console.log('error in upsertWorkspaces', e);
  }
  return wsRecords;
}

export function prepareUpsertWorkspace(record, workspace) {
  record.description = workspace?.description;
  record.wsId = workspace?.id;
  record.settings = workspace?.settings;
  record.type = workspace?.type;
  record.requesttojoin = workspace?.requesttojoin;
  record.status = workspace?.status;
  record.name = workspace?.name;
  record.color = workspace?.color;
  record.logo = workspace?.logo;
  record.orgId = workspace?.orgId;
  record.namelower = workspace?.namelower;
  record.createDate = workspace?.createDate;
  record.modifiedDate = workspace?.modifiedDate;
  record.memberLastModified = workspace?.memberLastModified;
  record.link = workspace?.link;
  // record.modifiedBy = ContactsDao.updateContact(workspace?.modifiedBy);
  record.counter = workspace?.counter;
  record.namelower = workspace?.namelower;
  record.category = workspace?.category;
  record.portal = workspace?.portal;
  record.geoFenceDetails = workspace?.geoFenceDetails;
  record.userStatus = workspace?.userStatus
    ? workspace?.userStatus
    : record.userStatus;
  record.membersCount = workspace?.membersCount;
  record.lMod = workspace?.lMod;
  record.sortTime = workspace?.sortTime;
  record.hidden = workspace?.hidden;
  record.isWSStarred = workspace?.isWSStarred;
  record.moreAvailable = workspace?.moreAvailable;
  // record.owner = ContactsDao.updateContact(workspace?.owner);
  record.createdBy = workspace?.createdBy;
  record.isMember=workspace?.isMember;
}
