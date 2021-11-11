import {sanitizedRaw} from '@nozbe/watermelondb/RawRecord';
import AccountManager from '../shared/utils/AccountManager';
import database from '../native/realm';
import * as Entity from '../native/realm/dbconstants';

export function insertUserInfo(userInfo) {
  return new Promise(async (resolve) => {
    const usersDB = database.users;
    const usersCollection = usersDB.collections.get(Entity.Users);
    const user = {
      enrollType: userInfo?.enrollType,
      makeConsentPolicyAccept: userInfo?.makeConsentPolicyAccept,
      makeBTConsentPolicyAccept: userInfo?.makeBTConsentPolicyAccept,
      sourceType: userInfo?.sourceType,
      isManage: userInfo?.isManage,
      img: userInfo?.img,
      orgID: userInfo?.orgID,
      emailId: userInfo?.emailId,
      profImage: userInfo?.profImage,
      profColour: userInfo?.profColour,
      fName: userInfo?.fName,
      lName: userInfo?.lName,
      isFirstTimeLogin: userInfo?.isFirstTimeLogin,
      roles: userInfo?.roles,
      pwdChangeRequire: userInfo?.pwdChangeRequire,
    };
    let userRecord;
    usersDB.write(async () => {
      try {
        userRecord = await usersCollection.find(userInfo?.id);
        await userRecord.update((record) => {
          record._raw = sanitizedRaw(
            {id: userInfo?.id, ...record._raw},
            usersCollection.schema,
          );
          Object.assign(record, user);
        });
      } catch (e) {
        userRecord = await usersCollection.create((record) => {
          record._raw = sanitizedRaw(
            {id: userInfo?.id},
            usersCollection.schema,
          );
          Object.assign(record, user);
        });
      }
      return resolve(userRecord);
    });
  });
}

export function deleteAll() {
  return new Promise(async (resolve) => {
    try {
      let account = AccountManager.getCurrentAccount();
      AccountManager.removeAccount(account);
      
      const usersDB = database.users;
      usersDB.write(async () => {
        usersDB.unsafeResetDatabase();
      });

      const db = database.active;
      db.write(async () => {
        db.unsafeResetDatabase();
      });
      // const authorizationsCollection = usersDB.collections.get(
      //   Entity.Authorizations,
      // );
      // const usersCollection = usersDB.collections.get(Entity.Users);

      // await authorizationsCollection.deleteAll();
      // await usersCollection.deleteAll();
    } catch (e) {
      console.log('Error in resetting db');
    }
    return resolve();
  });
}

export function insertAuthorization(authInfo) {
  return new Promise(async (resolve) => {
    const usersDB = database.users;
    const authorizationsCollection = usersDB.collections.get(
      Entity.Authorizations,
    );
    const authorization = {
      identity: authInfo?.identity,
      resourceOwnerID: authInfo?.resourceOwnerID,
      orgID: authInfo?.orgID,
      clientID: authInfo?.clientID,
      sesId: authInfo?.sesId,
      accountId: authInfo?.accountId,
      managedBy: authInfo?.managedBy,
      botOrgID: authInfo?.botOrgID,
      showNotificationContent: authInfo?.showNotificationContent,
      scope: authInfo?.scope,
      platDevType: authInfo?.platDevType,
      lastActivity: authInfo?.lastActivity,
      tokenIP: authInfo?.tokenIP,
      accessToken: authInfo?.accessToken,
      refreshToken: authInfo?.refreshToken,
      token_type: authInfo?.token_type,
      expiresDate: authInfo?.expiresDate,
      refreshExpiresDate: authInfo?.refreshExpiresDate,
      issuedDate: authInfo?.issuedDate,
    };
    let authoirizationRecord;
    usersDB.write(async () => {
      try {
        authoirizationRecord = await authorizationsCollection.find(
          authInfo?.accountId,
        );
        await authoirizationRecord.update((record) => {
          record._raw = sanitizedRaw(
            {id: authInfo?.accountId, ...record._raw},
            authorizationsCollection.schema,
          );
          Object.assign(record, authorization);
        });
      } catch (e) {
        authoirizationRecord = await authorizationsCollection.create(
          (record) => {
            record._raw = sanitizedRaw(
              {id: authInfo?.accountId},
              authorizationsCollection.schema,
            );
            Object.assign(record, authorization);
          },
        );
      }
      return resolve(authoirizationRecord);
    });
  });
}

export function getAuthorization() {
  return new Promise(async (resolve) => {
    const usersDB = database.users;
    const authorizationsCollection = usersDB.collections.get(
      Entity.Authorizations,
    );
    var authorization = null;
    const allAuthorizations = await authorizationsCollection.query().fetch();
    if (allAuthorizations?.length > 0) {
      authorization = allAuthorizations[0];
    }
    return resolve(authorization);
  });
}

export function getUserInfo() {
  return new Promise(async (resolve) => {
    const usersDB = database.users;
    const usersCollection = usersDB.collections.get(Entity.Users);
    var user = null;
    const allUsers = await usersCollection.query().fetch();
    if (allUsers?.length > 0) {
      user = allUsers[0];
    }
    return resolve(user);
  });
}

export function getUserAndAuthInfo() {
  return new Promise(async (resolve) => {
    try{
    const usersDB = database.users;
    const usersCollection = usersDB.collections.get(Entity.Users);
    const authorizationsCollection = usersDB.collections.get(Entity.Authorizations);
    let user = null;
    const allUsers = await usersCollection.query().fetch();
    if (allUsers?.length > 0) {
      user = allUsers[0];
    }
    let authorization = null;
    const allAuthorizations = await authorizationsCollection.query().fetch();
    if (allAuthorizations?.length > 0) {
      authorization = allAuthorizations[0];
    }
    let userAndauth = {
      user:user,
      authorization:authorization
    }
    resolve(userAndauth);
  }catch(error){
    console.log('Error in gettign user and auth info');
    let userAndauth = {
      user:null,
      authorization:null
    }
    resolve(userAndauth);
  }
  });
}

export function getAccessToken() {
  let account = AccountManager.getCurrentAccount();
  return account?.authorization?.accessToken;
}

export function getTokenType() {
  let account = AccountManager.getCurrentAccount();
  return account?.authorization?.token_type;
}

export function getUserId() {
  let account = AccountManager.getCurrentAccount();

  return account?.user?.id;
}

export function getOrgId() {
  let account = AccountManager.getCurrentAccount();
  return account?.authorization?.orgID;
}

export function getUserFullObject() {
  let account = AccountManager.getCurrentAccount();
  return account?.user;
}

export function getAuthObject() {
  let account = AccountManager.getCurrentAccount();
  return account?.authorization;
}

export function getUser() {
  let account = AccountManager.getCurrentAccount();
  return account.getUserJson();
}

export function getEmailId() {
  let account = AccountManager.getCurrentAccount();
  return account?.user?.emailId;
}

export function getUserName() {
  let account = AccountManager.getCurrentAccount();
  return account?.user?.fName + ' ' + account?.user?.lName;
}

export function getProfileColor() {
  let account = AccountManager.getCurrentAccount();
  return account?.user?.profColour;
}
