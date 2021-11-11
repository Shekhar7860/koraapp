import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';
import * as Constants from '../../dbconstants';

export default class Onboarding extends Model {
  static table = Constants.Onboardings;

  @field('android') android;

  @field('ios') ios;

  @field('knwPortal') knwPortal;

  @field('plugin') plugin;

  @field('skillStore') skillStore;

  @field('sta') sta;

  @field('web') web;

  @field('nEmails') nEmails;
}
