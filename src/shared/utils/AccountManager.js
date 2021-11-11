import Account from "./Account";
import database from '../../native/realm';

class AccountManager {
  constructor() {
    this.accounts = [];
  }

  prepareAccount(user, authorization) {
    let account = new Account(user, authorization);
    database.setActiveDB(user?.id);
    this.accounts.push(account);
  }

  getCurrentAccount() {
    let account = null;
    if (this.accounts?.length > 0) {
      account = this.accounts[0];
    }
    return account;
  }
  
  removeAccount(account) {
    if (this.accounts.includes(account)) {
      this.accounts.pop(account);
    }
  }
}

export default new AccountManager();
