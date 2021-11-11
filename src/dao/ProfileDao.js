import {sanitizedRaw} from '@nozbe/watermelondb/RawRecord';
import {Q} from '@nozbe/watermelondb';
import database from '../native/realm';
import * as Entity from '../native/realm/dbconstants';

export function updateProfile(profile) {
  return new Promise(async (resolve) => {
    const userDB = database.active;
    try {
      const profiles = [profile];
      const workHours = profile?.workHours?.map((workHour, index) => ({
        ...workHour,
        id: index.toString(),
        userId: profile?.id,
      }));

      const profilesCollection = userDB.collections.get(Entity.Profiles);
      const workHoursCollection = userDB.collections.get(Entity.WorkHours);

      const profileIds = profiles.map((p) => p.id);
      if (profileIds?.length > 0) {
        const existingProfiles = await profilesCollection
          .query(Q.where('id', Q.oneOf(profileIds)))
          .fetch();
        const profilesToUpdate = existingProfiles.filter((i1) =>
          profiles.find((i2) => i1.id === i2.id),
        );
        const profilesToCreate = profiles.filter(
          (i1) => !existingProfiles.find((i2) => i1.id === i2.id),
        );
        const profilesToDelete = existingProfiles.filter(
          (i1) => !profiles.find((i2) => i1.id === i2.id),
        );

        const workHourIds = workHours.map((wh) => wh.id);
        const existingWorkHours = await workHoursCollection
          .query(Q.where('id', Q.oneOf(workHourIds)))
          .fetch();
        const workHoursToUpdate = existingWorkHours.filter((i1) =>
          workHours.find((i2) => i1.id === i2.id),
        );
        const workHoursToCreate = workHours.filter(
          (i1) => !existingWorkHours.find((i2) => i1.id === i2.id),
        );

        const allRecords = [
          ...profilesToCreate.map((profile) =>
            profilesCollection.prepareCreate((record) => {
              record._raw = sanitizedRaw(
                {id: profile.id},
                profilesCollection.schema,
              );
              record.updateProfile(profile);
              return record;
            }),
          ),
          ...profilesToUpdate.map((record) => {
            const profile = profiles.find((p) => p.id === record.id);
            return record.prepareUpdate(() => {
              record.updateProfile(profile);
            });
          }),
          ...profilesToDelete.map((profile) => profile.delete()),
          ...workHoursToCreate.map((workHour) =>
            workHoursCollection.prepareCreate((record) => {
              record._raw = sanitizedRaw(
                {id: workHour.id},
                workHoursCollection.schema,
              );
              record.profile.id = workHour.userId;
              return record.updateWorkHour(workHour);
            }),
          ),
          ...workHoursToUpdate.map((record) => {
            const workHour = workHours.find((wh) => wh.id === record.id);
            return record.prepareUpdate(() => {
              record.updateWorkHour(workHour);
            });
          }),
        ];

        userDB.write(async () => {
          await userDB.batch(...allRecords);
        });
      }
      return resolve();
    } catch (e) {
      console.log('error in updateProfile', e);
    }
  });
}

export function getProfile(profileId) {
  return new Promise(async (resolve) => {
    try {
      const db = database.active;
      const profilesCollection = db.collections.get(Entity.Profiles);
      let profile = null;

      const profileRecord = await profilesCollection.find(profileId);
      await db.write(async () => {
        profile = profileRecord.get();
      });

      resolve(true);
    } catch (e) {
      console.log('error in getProfile', e);
      return resolve(e);
    }
  });
}

export function updateDNDProfile(profileId, dndValue) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = database.active;
      const profilesCollection = db.collections.get(Entity.Profiles);
      const profile = await profilesCollection.find(profileId);
      await db.write(async () => {
        await profile.update((p) => {
          p.nPrefs = {dndTill: dndValue};
        });
      });
      resolve(true);
    } catch (e) {
      console.log('error in updateDNDProfile ' + e);
      reject(false);
    }
  });
}

export function updateIconProfile(profileId, icon) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = database.active;
      const profilesCollection = db.collections.get(Entity.Profiles);
      const profile = await profilesCollection.find(profileId);
      await db.write(async () => {
        await profile.update((p) => {
          p.icon = icon;
        });
      });
      resolve(true);
    } catch (e) {
      console.log('error in updateDNDProfile ' + e);
      reject(false);
    }
  });
}
