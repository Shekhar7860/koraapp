import {Model} from '@nozbe/watermelondb';
import {field, json, date} from '@nozbe/watermelondb/decorators';
import * as Constants from '../../dbconstants';

export default class Settings extends Model {
  static table = Constants.Settings;

  @field('threadOwner') threadOwner;

  @field('topicName') topicName;

  @field('messagesCount') messagesCount;

  @field('lockParticipants') lockParticipants;

  @field('lockTopicName') lockTopicName;

  @json('notifications') notifications;

  @field('threadEmailId') threadEmailId;

  @date('createdOn') createdOn;

  @field('type') type;

  @field('secureEmail') secureEmail;

  @field('groupChat') groupChat;
}
