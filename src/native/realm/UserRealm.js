import * as Constants from './dbconstants';

const QueryItem = {
  name: Constants.QueryItem,
  primaryKey: 'id',
  properties: {
    id: {type: 'string', indexed: true},
    moreAvailable: {type: 'bool', default: false},
    laMod: 'date?',
  },
};

const Boards = {
  name: Constants.Boards,
  properties: {
    items: 'QueryItem[]',
  },
};

const ReplyTo = {
  name: Constants.ReplyTo,
  properties: {
    messageId: 'string?',
    boardId: 'string?',
    message: 'Message?',
    threadId: 'string?',
    type: 'string?',
  },
};

const Message = {
  name: Constants.Message,
  primaryKey: 'clientId',
  properties: {
    encrypted: {type: 'bool', default: false, optional: true},
    clientId: {type: 'string', indexed: true},
    messageId: {type: 'string', indexed: true},
    from: 'Contact?',
    to: 'Contact[]',
    author: 'Contact?',
    components: 'Component[]',
    highImportance: {type: 'bool', default: false, optional: true},
    name: 'string?',
    desc: 'string?',
    logo: 'string?',
    boardId: 'string?',
    boardClientId: 'string?',
    views: {type: 'int', default: 0, optional: true},
    sentOn: 'date?',
    deliveredOn: 'date?',
    isSender: {type: 'bool', default: true},
    secureEmail: {type: 'bool', default: false, optional: true},
    forward: {type: 'bool', default: false, optional: true},
    memo: {type: 'bool', default: false, optional: true},
    deepRecalled: {type: 'bool', default: false, optional: true},
    state: 'string?',
    messages: 'Message[]',
    unread: {type: 'bool', default: false, optional: true},
    groupMessage: {type: 'bool', default: false, optional: true},
    componentsCount: 'ComponentsCount?',
    namespaceId: 'string?',
    isPolicySet: {type: 'bool', default: false, optional: true},
    retentionState: 'string?',
    messageState: {type: 'int', default: Constants.ResourceState.NONE},
    remind: 'Remind[]',
    replyTo: 'ReplyTo?',
    sad: 'Reaction[]',
    shock: 'Reaction[]',
    like: 'Reaction[]',
    laugh: 'Reaction[]',
    anger: 'Reaction[]',
    unlike: 'Reaction[]',
    likeCount: {type: 'int', default: 0, optional: true},
    unlikeCount: {type: 'int', default: 0, optional: true},
    sadCount: {type: 'int', default: 0, optional: true},
    laughCount: {type: 'int', default: 0, optional: true},
    angerCount: {type: 'int', default: 0, optional: true},
    shockCount: {type: 'int', default: 0, optional: true},
    msgNo: 'int?',
    isEdited: {type: 'bool', default: false, optional: true},
    linkPreviews: 'LinkPreview[]',
    mentions: 'Contact[]',
    everyoneMentioned: {type: 'bool', default: false, optional: false},
  },
};

const Remind = {
  name: 'Remind',
  properties: {
    userId: 'string?',
    remindAt: 'date?',
  },
};

const Payload = {
  name: 'Payload',
  properties: {
    url: 'string?',
  },
};

const Reaction = {
  name: 'Reaction',
  properties: {
    rAt: 'date?',
    userId: 'string?',
    _id: 'string?',
  },
};

const LinkPreview = {
  name: 'LinkPreview',
  properties: {
    title: 'string?',
    description: 'string?',
    source: 'string?',
    url: 'string?',
    type: 'string?',
    site: 'string?',
    image: 'string?',
    video: 'string?',
  },
};

const Video = {
  name: 'Video',
  properties: {
    url: 'string?',
    secureUrl: 'string?',
    type: 'string?',
    width: 'string?',
    height: 'string?',
  },
};

const Contact = {
  name: Constants.Contact,
  primaryKey: 'id',
  properties: {
    id: {type: 'string', indexed: true},
    accountId: 'string?',
    fN: 'string?',
    lN: 'string?',
    emailId: 'string?',
    phoneNo: 'string?',
    color: 'string?',
    icon: 'string?',
    orgId: 'string?',
  },
};

const Component = {
  name: Constants.Component,
  properties: {
    componentId: 'string?',
    componentType: 'string?',
    componentBody: 'string?',
    componentThumbnails: 'ComponentThumbnails[]',
    componentData: 'ComponentData?',
    componentSize: 'string?',
    componentLength: 'string?',
    thumbnailURL: 'string?',
    componentFileId: 'string?',
    localFilePath: 'string?',
    fileMeta: 'FileMeta?',
    uploadItem: 'UploadItem?',
  },
};

const ComponentThumbnails = {
  name: 'ComponentThumbnails',
  properties: {
    url: 'string?',
    localFilePath: 'string?',
  },
};

const ComponentData = {
  name: 'ComponentData',
  properties: {
    eventType: 'string?',
    filename: 'string?',
    eventInitiator: 'EventInitiator?',
    resources: 'EventInitiator[]',
  },
};

const EventInitiator = {
  name: 'EventInitiator',
  properties: {
    userId: 'string?',
    firstName: 'string?',
    lastName: 'string?',
    threadSubject: 'string?',
    emailId: 'string?',
    boardSubject: 'string?',
    boardDesc: 'string?',
    topicName: 'string?',
  },
};

const TemplateData = {
  name: 'TemplateData',
  properties: {
    variables: 'string[]',
  },
};

const ComponentsCount = {
  name: 'ComponentsCount',
  properties: {
    text: {type: 'int', default: 0, optional: true},
    html: {type: 'int', default: 0, optional: true},
    video: {type: 'int', default: 0, optional: true},
    audio: {type: 'int', default: 0, optional: true},
    image: {type: 'int', default: 0, optional: true},
    attachment: {type: 'int', default: 0, optional: true},
    filelink: {type: 'int', default: 0, optional: true},
    contact: {type: 'int', default: 0, optional: true},
    location: {type: 'int', default: 0, optional: true},
    action: {type: 'int', default: 0, optional: true},
    email: {type: 'int', default: 0, optional: true},
    alert: {type: 'int', default: 0, optional: true},
    meeting: {type: 'int', default: 0, optional: true},
    obbot: {type: 'int', default: 0, optional: true},
    obspace: {type: 'int', default: 0, optional: true},
    total: {type: 'int', default: 0, optional: true},
  },
};

const Settings = {
  name: 'Settings',
  properties: {
    threadOwner: 'string?',
    topicName: 'string?',
    messagesCount: 'int?',
    lockParticipants: {type: 'bool', default: false, optional: true},
    lockTopicName: {type: 'bool', default: false, optional: true},
    notifications: 'Notifications',
    threadEmailId: 'string?',
    createdOn: 'string?',
    type: {type: 'int', default: 0, optional: true},
    secureEmail: {type: 'bool', default: false, optional: true},
    groupChat: {type: 'bool', default: false, optional: true},
  },
};

const Notifications = {
  name: Constants.Notifications,
  properties: {
    mute: 'Action?',
  },
};

const Action = {
  name: Constants.Action,
  properties: {
    //on: {type: 'bool', default: false, optional: true},
    //till: 'date?',
    till: {type: 'int', default: -1, optional: true},
  },
};

const Like = {
  name: Constants.Like,
  properties: {
    rAt: 'date?',
    userId: 'string?',
  },
};

const Post = {
  name: Constants.Post,
  primaryKey: 'clientId',
  properties: {
    postId: {type: 'string', indexed: true},
    clientId: {type: 'string', indexed: true},
    messageState: {type: 'int', default: Constants.ResourceState.NONE},
    postType: 'string?',
    author: 'Contact?',
    from: 'Contact?',
    boardId: 'string?',
    parentId: 'string?',
    namespaceId: 'string?',
    comments: 'Post[]',
    commentCount: {type: 'int', default: 0, optional: true},
    // like: 'Like[]',
    sad: 'Reaction[]',
    shock: 'Reaction[]',
    like: 'Reaction[]',
    laugh: 'Reaction[]',
    anger: 'Reaction[]',
    unlike: 'Reaction[]',
    linkPreviews: 'LinkPreview[]',
    read: {type: 'bool', default: false, optional: true},
    isPostedAsTeam: {type: 'bool', default: false, optional: true},
    isEdited: {type: 'bool', default: false, optional: true},
    policy: 'string?',
    components: 'Component[]',
    location: 'string?',
    lastModified: 'date?',
    lastModifiedBy: 'Contact?',
    createdOn: 'date?',
    deliveredOn: 'date?',
    state: {type: 'int', default: 0, optional: true},
    metaType: {type: 'int', default: 0, optional: true},
    wsId: 'string?',
    orgId: 'string?',
    remind: 'Remind[]',
    actionCount: {type: 'int', default: 0, optional: true},
    encrypted: {type: 'bool', default: false, optional: true},
    hasHistory: {type: 'bool', default: false, optional: true},
    disabledLike: {type: 'bool', default: false, optional: true},
    disabledComment: {type: 'bool', default: false, optional: true},
    disabledOptions: {type: 'bool', default: false, optional: true},
    postNumber: {type: 'int', default: 0, optional: true},
    retentionState: 'string?',
    classification: 'string?',
    likeCount: {type: 'int', default: 0, optional: true},
    unlikeCount: {type: 'int', default: 0, optional: true},
    sadCount: {type: 'int', default: 0, optional: true},
    laughCount: {type: 'int', default: 0, optional: true},
    angerCount: {type: 'int', default: 0, optional: true},
    shockCount: {type: 'int', default: 0, optional: true},
    isFollowing: {type: 'bool', default: false, optional: true},
    readCount: {type: 'int', default: 0, optional: true},
    moreAvailable: {type: 'bool', default: false, optional: true},
  },
};

const Board = {
  name: Constants.Board,
  primaryKey: 'clientId',
  properties: {
    id: {type: 'string', indexed: true},
    clientId: {type: 'string', indexed: true},
    name: 'string?',
    meta: 'string?',
    desc: 'string?',
    logo: 'Logo?',
    isAllMembers: {type: 'bool', default: false, optional: true},
    creator: 'Contact?',
    owner: 'Contact?',
    wsId: 'string?',
    namespaceId: 'string?',
    isActive: {type: 'bool', default: false, optional: true},
    lastActivity: 'Activity?',
    recentMembers: {type: 'Contact[]', default: []},
    membersCount: {type: 'int', default: 0, optional: true},
    laMod: 'date?',
    members: {type: 'Contact[]', default: []},
    memberLastModified: 'date?',
    isEmailEnabled: {type: 'bool', default: false, optional: true},
    emailId: 'string?',
    friendlyAliasEmailId: 'string?',
    lastModified: 'date?',
    createdOn: 'date?',
    lastModifiedBy: 'Contact?',
    type: 'string?',
    link: 'Link?',
    payload: 'Payload?',
    allEmailIds: 'string[]',
    access: {type: 'int', default: 0, optional: true},
    isTopicMember: {type: 'bool', default: false, optional: true},
    notifications: 'Notifications?',
    unreadCount: {type: 'int', default: 0, optional: true},
    lastReadId: 'string?',
    firstUnreadTimestamp: 'string?',
    hasDraftPost: {type: 'bool', default: false, optional: true},
    isNew: {type: 'bool', default: false, optional: true},
    wsMembersAccess: {type: 'int', default: 0, optional: true},
    star: {type: 'bool', default: false, optional: true},
    moreAvailable: {type: 'bool', default: false, optional: true},
    isMember:{type: 'bool',default: true,optional: true},
    workspace: 'Workspace?',
    boardState: {type: 'int', default: Constants.ResourceState.NONE},
  },
};

const Activity = {
  name: Constants.Activity,
  properties: {
    post: 'Post?',
    message: 'Message?',
  },
};

const Link = {
  name: Constants.Link,
  primaryKey: 'id',
  properties: {
    id: {type: 'string', indexed: true},
    scope: 'string?',
    access: {type: 'int', default: 0, optional: true},
    shareUrl: 'string?',
  },
};

const Workspace = {
  name: Constants.Workspace,
  primaryKey: 'id',
  properties: {
    id: {type: 'string', indexed: true},
    settings: 'WSSettings?',
    type: 'string?',
    requesttojoin: 'bool?',
    status: 'string?',
    name: 'string?',
    owner: 'Contact?',
    createdBy: 'Contact?',
    color: 'string?',
    logo: 'Logo?',
    orgId: 'string?',
    createDate: 'date?',
    modifiedDate: 'date?',
    memberLastModified: 'date?',
    modifiedBy: 'Contact?',
    desc: 'string?',
    link:'Link?',
    geoFenceDetails: 'string?',
    userStatus: 'string?',
    membersCount: {type: 'int', default: 0, optional: true},
    lMod: 'date?',
    hidden: {type: 'bool', default: false, optional: true},
    isWSStarred: {type: 'bool', default: false, optional: true},
    counter: 'WSCounter?',
    boards: 'Board[]',
    boardCount: {type: 'int', default: 0, optional: true},
    moreAvailable: {type: 'bool', default: false, optional: true},
  },
};

const WSSettings = {
  name: Constants.WSSettings,
  primaryKey: 'wsId',
  properties: {
    wsId: {type: 'string', indexed: true},
    whoCanInviteUsers: 'WSUserSettings?',
    whoCanCreateBoard: 'WSUserSettings?',
    whoCanAcceptRequests: 'WSUserSettings?',
    allowExternalDomainUsers: {type: 'bool', default: true, optional: true},
    allowExternalDomains: 'string[]',
    allowNonManagedDomainUsers: {type: 'bool', default: false, optional: true},
    isDefaultAddMembers: {type: 'bool', default: true, optional: true},
    notificationSettings: 'WSNotificationSettings?',
  },
};

const WSUserSettings = {
  name: Constants.WSUserSettings,
  properties: {
    all: 'bool?',
    roles: 'string[]',
    members: 'Contact[]',
  },
};

const WSNotificationSettings = {
  name: Constants.WSNotificationSettings,
  properties: {
    enable: {type: 'bool', default: true, optional: true},
    teamChatSettings: 'WSTeamChatSettings?',
    customSetting: 'string?',
    forceApply: {type: 'bool', default: true, optional: true},
  },
};

const WSTeamChatSettings = {
  name: Constants.WSTeamChatSettings,
  properties: {
    directMessages: {type: 'bool', default: true, optional: true},
    groupMessages: {type: 'bool', default: true, optional: true},
  },
};

const WSCounter = {
  name: Constants.WSCounter,
  properties: {
    disb: {type: 'int', default: 0, optional: true},
    docb: {type: 'int', default: 0, optional: true},
    emwb: {type: 'int', default: 0, optional: true},
    taskb: {type: 'int', default: 0, optional: true},
    tabb: {type: 'int', default: 0, optional: true},
  },
};

const AppControlPermissions = {
  name: Constants.AppControlPermissions,
  primaryKey: 'userId',
  properties: {
    userId: {type: 'string', indexed: true},
    licenseId: 'string?',
    role: 'string?',
    managedBy: 'string?',
    emailId: 'string?',
    storage: 'string?',
    applicationControl: 'string?',
  },
};

const Profile = {
  name: Constants.Profile,
  primaryKey: 'id',
  properties: {
    id: {type: 'string', indexed: true},
    fN: 'string?',
    lN: 'string?',
    color: 'string?',
    icon: 'string?',
    dept: 'string?',
    jTitle: 'string?',
    empId: 'string?',
    designation: 'string?',
    phoneNo: 'string?',
    manager: 'string?',
    orgId: 'string?',
    emailId: 'string?',
    isOnboarded: {type: 'bool', default: false, optional: true},
    workHours: 'WorkHours[]',
    workTimeZone: 'string?',
    workTimeZoneCity: 'string?',
    workTimeZoneOffset: 'string[]',
    weatherUnit: {type: 'int', default: 0, optional: true},
    kaIdentity: 'string?',
    onboarding: 'Onboarding?',
    nPrefs: 'NPrefs?',
    speakerIcon: {type: 'bool', default: false, optional: true},
    // usageLimits: 'string?',
  },
};
const NPrefs = {
  name: Constants.NPrefs,
  properties: {
    sound: 'string?',
    dndTill: {type: 'int', default: 0, optional: true},
  },
};
const Onboarding = {
  name: Constants.Onboarding,
  properties: {
    android: {type: 'int', default: 0, optional: true},
    ios: {type: 'int', default: 0, optional: true},
    knwPortal: {type: 'int', default: 0, optional: true},
    plugin: {type: 'int', default: 0, optional: true},
    skillStore: {type: 'int', default: 0, optional: true},
    sta: {type: 'int', default: 0, optional: true},
    web: {type: 'int', default: 0, optional: true},
    nEmails: {type: 'int', default: 0, optional: true},
  },
};

const WorkHours = {
  name: Constants.WorkHours,
  properties: {
    a: {type: 'bool', default: false, optional: true},
    s: {type: 'int', default: 0, optional: true},
    e: {type: 'int', default: 0, optional: true},
    ua: {type: 'bool', default: false, optional: true},
    start: 'string?',
    end: 'string?',
  },
};

const Logo = {
  name: Constants.Logo,
  properties: {
    type: 'string?',
    val: 'Emoji?',
  },
};

const Emoji = {
  name: 'Emoji',
  properties: {
    category: 'string?',
    unicode: 'string?',
    thumbnails: {type: 'Sizes[]', default: []},
  },
};

const Sizes = {
  name: 'Sizes',
  properties: {
    size: 'string?',
    url: 'string?',
  },
};

const FileMeta = {
  name: Constants.FileMeta,
  primaryKey: 'id',
  properties: {
    id: {type: 'string', indexed: true},
    downloadStatus: 'double?',
    duration: 'double?',
    encryptionStatus: {type: 'bool', default: false, optional: true},
    fileExtension: 'string?',
    fileId: 'string?',
    fileName: 'string?',
    fileExtn: 'string?',
    fileSize: 'double?',
    fileType: 'string?',
    fileCopyUri: 'string?',
    filePath: 'string?',
    uri: 'string?',
    hash: 'string?',
    thumbnailURL: 'string?',
  },
};

const UploadItem = {
  name: Constants.UploadItem,
  primaryKey: 'id',
  properties: {
    id: {type: 'string', indexed: true},
    cookie: 'string?',
    expiresOn: 'int?',
    fileContext: 'string?',
    fileName: 'string?',
    fileExtn: 'string?',
    fileToken: 'string?',
    mergeStatus: {type: 'bool', default: false, optional: true},
    numberOfChunks: 'int?',
    uploadStatus: {type: 'bool', default: false, optional: true},
    chunks: 'Chunk[]',
  },
};

const Chunk = {
  name: Constants.Chunk,
  primaryKey: 'id',
  properties: {
    id: {type: 'string', indexed: true},
    chunkOffset: 'int?',
    chunkNumber: 'int?',
    chunkSize: 'int?',
    chunkStatus: {type: 'bool', default: false, optional: true},
  },
};

const MessageUploadItem = {
  name: Constants.MessageUploadItem,
  primaryKey: 'id',
  properties: {
    id: {type: 'string', indexed: true},
    priority: {type: 'int', default: 0, optional: true},
    progress: {type: 'int', default: 0, optional: true},
    retryCount: {type: 'int', default: 0, optional: true},
    message: 'Message?',
    board: 'Board?',
  },
};

const PostUploadItem = {
  name: Constants.PostUploadItem,
  primaryKey: 'id',
  properties: {
    id: {type: 'string', indexed: true},
    priority: 'int?',
    progress: 'int?',
    retryCount: 'int?',
    message: 'Post?',
  },
};

export const userDBOptions = {
  path: Constants.USER_DB_NAME,
  deleteRealmIfMigrationNeeded: true,
  schema: [
    AppControlPermissions,
    Profile,
    QueryItem,
    Boards,
    Emoji,
    Logo,
    Sizes,
    Board,
    Reaction,
    LinkPreview,
    Message,
    Remind,
    ReplyTo,
    Contact,
    Component,
    ComponentData,
    ComponentThumbnails,
    EventInitiator,
    TemplateData,
    ComponentsCount,
    Settings,
    Notifications,
    Action,
    Post,
    Link,
    Payload,
    Like,
    Activity,
    Workspace,
    WSSettings,
    WSNotificationSettings,
    WSUserSettings,
    WSTeamChatSettings,
    WSCounter,
    Video,
    MessageUploadItem,
    PostUploadItem,
    UploadItem,
    Chunk,
    FileMeta,
    WorkHours,
    Onboarding,
    NPrefs,
  ],
  schemaVersion: Constants.USER_DB_VERSION,
};
