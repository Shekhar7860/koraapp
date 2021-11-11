import {Model} from '@nozbe/watermelondb';
import {field, json} from '@nozbe/watermelondb/decorators';
import * as Constants from '../../dbconstants';
import {sanitizer} from '../../utils';

export default class UserInfo extends Model {
  static table = Constants.Users;

  @field('userId') userId;

  @field('enrollType') enrollType;

  @json('roles', sanitizer) roles;

  @field('pwdChangeRequire', 'sanitizer') pwdChangeRequire;

  @field('makeConsentPolicyAccept') makeConsentPolicyAccept;

  @field('makeBTConsentPolicyAccept') makeBTConsentPolicyAccept;

  @field('sourceType') sourceType;

  @field('isManage') isManage;

  @field('img') img;

  @field('orgID') orgID;

  @field('emailId') emailId;

  @field('profImage') profImage;

  @field('profColour') profColour;

  @field('fName') fName;

  @field('lName') lName;

  @field('isFirstTimeLogin') isFirstTimeLogin;
}
