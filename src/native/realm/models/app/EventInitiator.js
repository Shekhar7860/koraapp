import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';
import * as Constants from '../../dbconstants';

export default class EventInitiator extends Model {
  static table = Constants.EventInitiators;

  @field('userId') userId;

  @field('firstName') firstName;

  @field('lastName') lastName;

  @field('threadSubject') threadSubject;

  @field('emailId') emailId;

  @field('boardSubject') boardSubject;

  @field('boardDesc') boardDesc;

  @field('topicName') topicName;
}
