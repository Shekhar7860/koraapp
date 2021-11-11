class Account {
  constructor(user, authorization) {
    this.user = user;
    this.authorization = authorization;
  }

  getAuthorization() {
    return this.authorization;
  }
  
  getUser() {
    return this.user;
  }

  getUserJson() {
    if (this.user && this.authorization) {
      return {
        emailId: this.user?.emailId,
        id: this.user?.id,
        fN: this.user?.fName,
        lN: this.user?.lName,
        icon: this.user?.profImage,
        orgId: this.authorization?.orgID,
      };
    } else {
      return null;
    }
  }
}

export default Account;