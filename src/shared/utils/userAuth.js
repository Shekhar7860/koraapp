class UserAuth {
  // getBotAccessToken() {
  //   return window.$.jStorage.get('botAuthorization').authorization.accessToken;
  // }
  // getBotUserId() {
  //   return window.$.jStorage.get('botAuthorization').userInfo.userId;
  // }
  // isAdmin() {
  //   let currentAccount = store.getState().login.currentUser;
  //   return !!(
  //     currentAccount &&
  //     currentAccount.userInfo &&
  //     currentAccount.userInfo.roles &&
  //     currentAccount.userInfo.roles.length > 0
  //   );
  // }
  // getContactList() {
  //   let contactList = store.getState().createMessage.contactData;
  //   return contactList;
  // }

  // getAppControl() {
  //   if (window.$.jStorage.get('appControl')) {
  //     return window.$.jStorage.get('appControl');
  //   } else {
  //     return null;
  //   }
  // }
  generateId(num) {
    var cId = Math.random().toString(36).slice(2);
    return cId.substring(0, num);
  }

  // getEmailId() {
  //   let currentAccount = store.getState().login.currentUser;
  //   if (
  //     currentAccount &&
  //     currentAccount.userInfo &&
  //     currentAccount.userInfo.id
  //   ) {
  //     return currentAccount.userInfo && currentAccount.userInfo.emailId;
  //   } else {
  //     return null;
  //   }
  // }

  // getAdminEmailId() {
  //   return (
  //     window.$.jStorage.get('appControl') &&
  //     window.$.jStorage.get('appControl').account &&
  //     window.$.jStorage.get('appControl').account.emailId
  //   );
  // }
  // checkSameDraftExists(draftBody, draftArray, index, fromFooter) {
  //   for (let [i, draft] of draftArray.entries()) {
  //     if (draftBody.to.length === draft.to.length &&
  //         this.sameContactsDraftExists(draftBody.to, draft.to)) {
  //         if (draft.draftId !== draftBody.draftId) {
  //             draftBody.draftId = draft.draftId;
  //             store.dispatch(getCurrentDraftId(draft.draftId));
  //             if(!draftBody.components.length) {
  //                 draftBody.components = draft.components;
  //                 draftArray.splice(index, 1);
  //             }
  //             break;
  //         } 
  //         // else if(fromFooter && !draftBody.components.length) {
  //         //   draftBody.components = draft.components;
  //         //   draftArray.splice(i,1);
  //         // }
  //     }
  //   }
  //   return draftBody;
  // }
  // getCurrentDraftBody(draftId, draftArray, threadId) {
  //   let draftBody, index = '';
  //   if (draftArray && draftArray.length) {
  //       if (draftId) {
  //           for (let i = 0; i < draftArray.length; i++) {
  //               if (draftArray[i].draftId === draftId) {
  //                   draftBody = JSON.parse(JSON.stringify(draftArray[i]));
  //                   index = i;
  //                   break;
  //               }
  //           }
  //       } else if (threadId) {
  //           for (let i = 0; i < draftArray.length; i++) {
  //               if (draftArray[i].threadId === threadId) {
  //                   draftBody = JSON.parse(JSON.stringify(draftArray[i]));
  //                   index = i;
  //                   break;
  //               }
  //           }
  //       } else {
  //           return { draftBody: null, index: '' };

  //       }
  //   } else {
  //       return { draftBody: null, index: '' };;
  //   }
  // }
  // getAdminEmailId() {
  //   return (
  //     window.$.jStorage.get('appControl') &&
  //     window.$.jStorage.get('appControl').account &&
  //     window.$.jStorage.get('appControl').account.emailId
  //   );
  // }

  // getFileUploadLimit() {
  //   // return window.$.jStorage.get('appControl') && window.$.jStorage.get('appControl').storage && window.$.jStorage.get('appControl').storage.limits && window.$.jStorage.get('appControl').storage.limits.fileSize;
  //   return (
  //     window.$.jStorage.get('usageLimit') &&
  //     window.$.jStorage.get('usageLimit').attachment &&
  //     window.$.jStorage.get('usageLimit').attachment.size
  //   );
  // }

  // getUserId() {
  //   let currentAccount = store.getState().login.currentUser;
  //   if (
  //     currentAccount &&
  //     currentAccount.userInfo &&
  //     currentAccount.userInfo.id
  //   ) {
  //     return currentAccount.userInfo.id;
  //   } else {
  //     return null;
  //   }
  // }
  // getUserName() {
  //   let currentUser = store.getState().login.currentUser;
  //   if (
  //     currentUser &&
  //     currentUser.userInfo
  //   ) {
  //     return currentUser.userInfo.fName + ' ' + currentUser.userInfo.lName;
  //   } else {
  //     return null;
  //   }
  // }
  // getAppControlList() {
  //   if (
  //     window.$.jStorage.get('appControl') &&
  //     window.$.jStorage.get('appControl').applicationControl
  //   ) {
  //     return window.$.jStorage.get('appControl').applicationControl;
  //   } else {
  //     return null;
  //   }
  // }

  // setUserLoggedIn() {
  //   this.isUserLoggedIn = true;
  //   return true;
  // }

  // getUserLoggedIn() {
  //   return this.isUserLoggedIn;
  // }

  // getAccessToken = () => {
  //   let currentAccount = store.getState().login.currentUser;

  //   if (currentAccount && currentAccount.authorization.accessToken) {
  //     return currentAccount.authorization.accessToken;
  //   } else {
  //     return false;
  //   }
  // };

  // readAuthData =()=> {
  //   return new Promise((resolve, reject) => {
  //   let currentAccount = store.getState().login.currentUser;

  //   if (currentAccount && currentAccount.authorization.accessToken) {
  //     resolve(true);
  //   } else {
  //     reject(false)
  //   }
  //   });
  // }

  // sameContactsDraftExists(arr1, arr2) {
  //   return arr1.every(val => arr2.includes(val));
  // }

  // getUserId = () => {
  //   let currentAccount = store.getState().login.currentUser;
  //   if (
  //     currentAccount &&
  //     currentAccount.userInfo &&
  //     currentAccount.userInfo.id
  //   ) {
  //     return currentAccount.userInfo.id;
  //   } else {
  //     return null;
  //   }
  // };
  // getUser = () => {
  //   let currentAccount = store.getState().login.currentUser;
  //   return {
  //     emailId: this.getEmailId(),
  //     id: this.getUserId(),
  //     fN: currentAccount.userInfo.fName,
  //     lN: currentAccount.userInfo.lName,
  //     orgId: currentAccount.orgId,
  //   };
  // };
  // getOrgId = () => {
  //   let currentAccount = store.getState().login.currentUser;
  //     if (
  //     currentAccount &&
  //     currentAccount.userInfo &&
  //     currentAccount.userInfo.orgID
  //   ) {
  //     return currentAccount.userInfo.orgID;
  //   } else {
  //     return null;
  //   }
  // }
}


export default new UserAuth();
