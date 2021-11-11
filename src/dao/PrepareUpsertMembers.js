import {Q} from '@nozbe/watermelondb';
import database from '../native/realm';
import * as Entity from '../native/realm/dbconstants';

export async function prepareMembers({messageId, members = []}) {
  try {
    if (!(members && members.length)) {
      return [];
    }

    const db = database.active;
    const membersCollection = db.collections.get(Entity.Members);
    const memberIds = members.map((m) => m.id);
    const allMemberRecords = await membersCollection
      .query(
        Q.where('member_message_id', messageId),
        Q.where('memberId', Q.oneOf(memberIds)),
      )
      .fetch();

    let membersToCreate = members.filter(
      (m1) => !allMemberRecords.find((m2) => m1.id === m2.memberId),
    );
    let membersToUpdate = allMemberRecords.filter((m1) =>
      members.find((m2) => m1.memberId === m2.id),
    );

    membersToCreate = membersToCreate.map((member) =>
      membersCollection.prepareCreate((m) => {
        m.memberOfMessage.id = messageId;
        m.contact.id = member.id;
      }),
    );

    membersToUpdate = membersToUpdate.map((member) => {
      const updatedMember = members.find((m) => m.id === member.memberId);
      if (member._hasPendingUpdate) {
        console.log(member);
        return;
      }
      return member.prepareUpdate((m) => {
        m.contact.id = updatedMember.id;
      });
    });

    const allRecords = [...membersToCreate, ...membersToUpdate];
    return allRecords;
  } catch (e) {
    console.log('error in prepareMembers', e);
    return [];
  }
}
