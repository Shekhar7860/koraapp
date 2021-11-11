import {Q} from '@nozbe/watermelondb';
import database from '../native/realm';
import * as Entity from '../native/realm/dbconstants';

export async function prepareUpsertBoardMembers({
  boardId,
  members = [],
  recentMembers = [],
}) {
  try {
    if (!(members && members.length)) {
      return [];
    }

    members = members?.map((value) => {
      let member = {};
      if (typeof value === 'string') {
        member = {
          id: value,
        };
      } else {
        member = value;
      }
      return member;
    });
    recentMembers = recentMembers?.map((value) => {
      let member = {};
      if (typeof value === 'string') {
        member = {
          id: value,
        };
      } else {
        member = value;
      }
      return member;
    });

    const db = database.active;
    const membersCollection = db.collections.get(Entity.BoardMembers);
    const allMemberRecords = await membersCollection
      .query(Q.where('member_board_id', Q.eq(boardId)))
      .fetch();
    let membersToCreate = members.filter(
      (m1) => !allMemberRecords.find((m2) => m1.id === m2.memberId),
    );
    let membersToUpdate = allMemberRecords.filter((m1) =>
      members.find((m2) => m1.memberId === m2.id),
    );
    let membersToDelete = allMemberRecords.filter(
      (m1) => !members.find((m2) => m1.memberId === m2.id),
    );

    membersToCreate = membersToCreate.map((member) =>
      membersCollection.prepareCreate((m) => {
        m.memberOfBoard.id = boardId;
        m.contact.id = member.id;
        m.memberId = member.id;
      }),
    );

    membersToUpdate = membersToUpdate.map((member) => {
      const updatedMember = members.find((m) => m.id === member.memberId);
      if (member._hasPendingUpdate) {
        console.log(member);
        return member;
      }
      return member.prepareUpdate((m) => {
        m.memberOfBoard.id = boardId;
        m.contact.id = updatedMember.id;
        m.memberId = updatedMember.id;
      });
    });

    membersToDelete = membersToDelete.map((member) =>
      member.prepareDestroyPermanently(),
    );

    // recent members
    const allRecentMemberRecords = await membersCollection
      .query(Q.where('recent_member_board_id', boardId))
      .fetch();
    let recentMembersToCreate = recentMembers.filter(
      (m1) => !allRecentMemberRecords.find((m2) => m1.id === m2.memberId),
    );
    let recentMembersToUpdate = allRecentMemberRecords.filter((m1) =>
      recentMembers.find((m2) => m1.memberId === m2.id),
    );
    let recentMembersToDelete = allRecentMemberRecords.filter(
      (m1) => !recentMembers.find((m2) => m1.memberId === m2.id),
    );

    recentMembersToCreate = recentMembersToCreate.map((member) =>
      membersCollection.prepareCreate((m) => {
        m.recentMemberOfBoard.id = boardId;
        m.contact.id = member.id;
        m.memberId = member.id;
      }),
    );

    recentMembersToUpdate = recentMembersToUpdate.map((member) => {
      const updatedMember = recentMembers.find((m) => m.id === member.memberId);
      if (member._hasPendingUpdate) {
        console.log(member);
        return member;
      }
      return member.prepareUpdate((m) => {
        m.contact.id = updatedMember.id;
        m.memberId = updatedMember.id;
      });
    });

    recentMembersToDelete = recentMembersToDelete.map((member) =>
      member.prepareDestroyPermanently(),
    );

    const allRecords = [
      ...membersToCreate,
      ...membersToUpdate,
      ...membersToDelete,
      ...recentMembersToCreate,
      ...recentMembersToUpdate,
      ...recentMembersToDelete,
    ];
    return allRecords;
  } catch (e) {
    console.log('error in prepareUpsertBoardMembers', e);
    return [];
  }
}
