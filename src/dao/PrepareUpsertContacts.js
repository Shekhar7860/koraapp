import {Q} from '@nozbe/watermelondb';
import database from '../native/realm';
import * as Entity from '../native/realm/dbconstants';

export async function prepareUpsertContacts(contacts) {
  const db = database.active;
  const contactsCollection = db.collections.get(Entity.Contacts);

  contacts = contacts.filter((contact) => {
    return contact != null;
  });

  let allContacts = contacts.map((member) => {
    let contact = {};
    if (typeof member === 'string') {
      contact = {
        id: member,
      };
    } else {
      contact = member;
    }
    return contact;
  });

  const contactIds = allContacts.map((c) => c.id);
  const distinctContacts = allContacts.filter(
    ({id}, index) => !contactIds.includes(id, index + 1),
  );

  let allRecords = [];
  if (contactIds?.length > 0) {
    const existingContacts = await contactsCollection
      .query(Q.where('id', Q.oneOf(contactIds)))
      .fetch();
    const contactsToUpdate = existingContacts.filter((c1) =>
      distinctContacts.find((c2) => c1.id === c2.id),
    );
    const contactsToCreate = distinctContacts.filter(
      (c1) => !existingContacts.find((c2) => c1.id === c2.id),
    );

    let newContacts = contactsToCreate.map((contact) =>
      contactsCollection.prepareCreate((record) => {
        record._raw.id = contact?.id;
        prepareContact(record, contact);
        return record;
      }),
    );
    let updatedContacts = contactsToUpdate.map((record) => {
      const contact = distinctContacts.find((c) => c.id === record.id);
      return record.prepareUpdate((c) => {
        prepareContact(c, contact);
      });
    });
    allRecords.push(...newContacts, ...updatedContacts);
  }
  return allRecords;
}

export function prepareContact(record, value) {
  var contact = null;
  if (value) {
    if (typeof value === 'string') {
      contact = {
        id: value,
      };
    } else {
      contact = value;
    }
  }
  if (contact?.accountId) {
    record.accountId = contact?.accountId;
  }
  if (contact?.fN) {
    record.fN = contact?.fN;
  }
  if (contact?.lN) {
    record.lN = contact?.lN;
  }
  if (contact?.phoneNo) {
    record.phoneNo = contact?.phoneNo;
  }
  if (contact?.color) {
    record.color = contact?.color;
  }
  if (contact?.icon) {
    record.icon = contact?.icon;
  }
  if (contact?.orgId) {
    record.orgId = contact?.orgId;
  }
  if (contact?.emailId) {
    record.emailId = contact?.emailId;
  }
}
