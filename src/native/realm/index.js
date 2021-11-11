import {Database} from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import logger from '@nozbe/watermelondb/utils/common/logger';

import Action from './models/app/Action';
import Activity from './models/app/Activity';
import AppControlPermissions from './models/app/AppControlPermissions';
import Board from './models/app/Board';
import BoardMembers from './models/app/BoardMember';
import Chunk from './models/app/Chunk';
import Component from './models/app/Component';
import ComponentData from './models/app/ComponentData';
import ComponentThumbnail from './models/app/ComponentThumbnail';
import Contact from './models/app/Contact';
import Emoji from './models/app/Emoji';
import EventInitiator from './models/app/EventInitiator';
import FileMeta from './models/app/FileMeta';
import Like from './models/app/Like';
import Link from './models/app/Link';
import LinkPreview from './models/app/LinkPreview';
import Logo from './models/app/Logo';
import Member from './models/app/Member';
import Message from './models/app/Message';
import MessageUploadItem from './models/app/MessageUploadItem';
import Notification from './models/app/Notification';
import NPref from './models/app/NPref';
import Onboarding from './models/app/Onboarding';
import Payload from './models/app/Payload';
import Post from './models/app/Post';
import PostUploadItem from './models/app/PostUploadItem';
import Profile from './models/app/Profile';
import QueryItem from './models/app/QueryItem';
import Reaction from './models/app/Reaction';
import Reminder from './models/app/Reminder';
import ReplyTo from './models/app/ReplyTo';
import Settings from './models/app/Settings';
import Size from './models/app/Size';
import TemplateData from './models/app/TemplateData';
import UploadItem from './models/app/UploadItem';
import Video from './models/app/Video';
import WorkHour from './models/app/WorkHour';
import Workspace from './models/app/Workspace';
import WSCounter from './models/app/WSCounter';
import WSNotificationSettings from './models/app/WSNotificationSettings';
import WSSettings from './models/app/WSSettings';
import WSTeamChatSettings from './models/app/WSTeamChatSettings';
import WSUserSettings from './models/app/WSUserSettings';

import Authorization from './models/users/Authorization';
import Server from './models/users/Server';
import UserInfo from './models/users/UserInfo';

import usersSchema from './schema/UsersRealm';
import appSchema from './schema/UserRealm';

import appMigrations from './models/app/Migrations';
import usersMigrations from './models/users/Migrations';

const getDatabasePath = (name) => `${name}`;

export const getDatabase = (database = '') => {
  const path = database.replace(/(^\w+:|^)\/\//, '').replace(/\//g, '.');
  const dbName = getDatabasePath(path);

  const adapter = new SQLiteAdapter({
    dbName,
    schema: appSchema,
    migrations: appMigrations,
    jsi: true,
  });

  return new Database({
    adapter,
    modelClasses: [
      Action,
      Activity,
      AppControlPermissions,
      Board,
      BoardMembers,
      Chunk,
      Component,
      ComponentData,
      ComponentThumbnail,
      Contact,
      Emoji,
      EventInitiator,
      FileMeta,
      Like,
      Link,
      LinkPreview,
      Logo,
      Member,
      Message,
      MessageUploadItem,
      Notification,
      NPref,
      Onboarding,
      Payload,
      Post,
      PostUploadItem,
      Profile,
      QueryItem,
      Reaction,
      Reminder,
      ReplyTo,
      Settings,
      Size,
      TemplateData,
      UploadItem,
      Video,
      WorkHour,
      Workspace,
      WSCounter,
      WSNotificationSettings,
      WSSettings,
      WSTeamChatSettings,
      WSUserSettings,
    ],
  });
};

class DB {
  databases = {
    usersDB: new Database({
      adapter: new SQLiteAdapter({
        dbName: getDatabasePath('default'),
        schema: usersSchema,
        migrations: usersMigrations,
        jsi: true,
      }),
      modelClasses: [Authorization, Server, UserInfo],
    }),
  };

  get active() {
    return this.databases.activeDB;
  }

  get users() {
    return this.databases.usersDB;
  }

  setActiveDB(database) {
    this.databases.activeDB = getDatabase(database);
  }
}

const db = new DB();
export default db;

if (!__DEV__) {
  logger.silence();
}
