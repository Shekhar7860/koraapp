import database from '../native/realm';
import {prepareUpsertContacts} from './PrepareUpsertContacts';
import {prepareUpsertQueryItems} from './updateQueryItems';
import {prepareUpsertBoards} from './PrepareUpsertBoards';
import {prepareUpsertWorkspaces} from './PrepareUpsertWorkspaces';

export function initialSync({msgBoardsData, wsData, wsBoardsData}) {
  return new Promise(async (resolve, reject) => {
    try {
      let records = [];
      let boardMembers = msgBoardsData?.resolveMembers || [];
      let wsMembers = wsBoardsData?.resolveMembers || [];
      let wsDataMembers = wsData?.resolveMembers || [];
      let members = [...boardMembers, ...wsMembers, ...wsDataMembers];

      // boards
      let msgBoards = msgBoardsData?.boards || [];
      let allWsBoards = wsData?.boards || [];
      let wsBoards = wsBoardsData?.boards || [];
      let allBoards = [...msgBoards, ...allWsBoards, ...wsBoards];
      allBoards.forEach((board) => {
        switch (board?.type) {
          case 'directChat':
          case 'groupChat': {
            var messages = board?.messages || [];
            let lastMessage = board?.lastActivity;
            if (lastMessage) {
              let message = messages?.find(
                (message) => message?.messageId === lastMessage?.messageId,
              );
              if (!message) {
                messages?.push(lastMessage);
              }
            }
            messages.forEach((message) => {
              if (message?.to?.length > 0) {
                members.push(...message?.to);
              }
              if (message?.author) {
                members.push(message?.author);
              }
              if (message?.from) {
                members.push(message?.from);
              }
            });
            break;
          }
          case 'document':
          case 'table':
          case 'discussion':
          case 'embeddedweb':
          case 'file': {
            var posts = board?.posts || [];
            let lastPost = board?.lastActivity;
            if (lastPost) {
              let post = posts?.find(
                (post) => post?.postId === lastPost?.postId,
              );
              if (!post) {
                posts?.push(lastPost);
              }
            }
            posts.forEach((post) => {
              if (post?.author) {
                members.push(post?.author);
              }
              if (post?.from) {
                members.push(post?.from);
              }
            });
            break;
          }
          default:
            break;
        }
      });

      // workspaces
      let allWs = wsData?.ws || [];
      let ws = wsBoardsData?.ws || [];;
      let allWorkspaces = [...allWs, ...ws];
      allWorkspaces.forEach((ws) => {
        // if (ws?.members?.length > 0) {
          // members.push(...ws?.members);
        // }
        if (ws?.owner) {
          members.push(ws?.owner);
        }
      });

      members = members.filter((member) => {
        return member != null;
      });

      const contactIds = members.map((c) => c.id);
      const contacts = members.filter(
        ({id}, index) => !contactIds.includes(id, index + 1),
      );

      let db = database.active;
      await db.write(async () => {
        // contacts
        if (contacts.length > 0) {
          let contactRecords = await prepareUpsertContacts(contacts);
          records.push(...contactRecords);
        }

        // query items
        if (msgBoardsData?.boards?.length > 0) {
          let queryItemRecords = await prepareUpsertQueryItems(msgBoardsData);
          records.push(...queryItemRecords);
        }

        // workspaces
        const workspaceIds = allWorkspaces.map((ws) => ws.id);
        const workspaces = allWorkspaces.filter(
          ({id}, index) => !workspaceIds.includes(id, index + 1),
        );
        if (workspaces.length > 0) {
          let wsRecords = await prepareUpsertWorkspaces(workspaces);
          records.push(...wsRecords);
        }
        
        // boards
        const boardIds = allBoards.map((b) => b.id);
        const boards = allBoards.filter(
          ({id}, index) => !boardIds.includes(id, index + 1),
        );

        if (boards.length > 0) {
          let boardRecords = await prepareUpsertBoards(boards);
          records.push(...boardRecords);
        }

        await db.batch(...records);
      });
      resolve();
    } catch (e) {
      console.log('error in initialSync', e);
      reject({message: 'error in initialSync'});
    }
  });
}
