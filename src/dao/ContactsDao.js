import database from '../native/realm';
import * as Entity from '../native/realm/dbconstants';
import {Q} from '@nozbe/watermelondb';
import {prepareUpsertContacts} from './PrepareUpsertContacts';

export function getContacts() {
  let contacts = [];
  return contacts;
}

export function updateContacts(contacts) {
  console.log('Updating contacts ContactsDao');
  return new Promise(async (resolve) => {
    const db = database.active;
    try {
      contacts = contacts?.map((value) => {
        let contact = {};
        if (typeof value === 'string') {
          contact = {
            id: value,
          };
        } else {
          contact = value;
        }
        return contact;
      });
      await db.write(async () => {
        const allRecords = await prepareUpsertContacts(contacts);
        await db.batch(...allRecords);
      });
      return resolve();
    } catch (e) {
      console.log('error in updateContacts', e);
    }
  });
}

export function getContactFromEmailID(emailId) {
  return new Promise(async (resolve) => {
    const db = database.active;
    const contactsCollection = db.collections.get(Entity.Contacts);
    const existingContacts = await contactsCollection
      .query(Q.where('emailId', Q.eq(emailId)))
      .fetch();
    if (existingContacts && existingContacts.length > 0)
      resolve(existingContacts[0]);
    resolve(null);
  });
}

export function getContact(contact) {
  let member = {};
  if (typeof contact === 'string') {
    member = {
      id: contact,
    };
  } else {
    member = contact;
  }
  return member;
}

export function updateContact(value) {
  let member = null;
  if (value) {
    if (typeof value === 'string') {
      member = {
        id: value,
      };
    } else {
      member = value;
    }
    return member;
  }
  return member;
}
