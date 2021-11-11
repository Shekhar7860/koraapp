import {Model} from '@nozbe/watermelondb';
import {field, children, json, date, readonly} from '@nozbe/watermelondb/decorators';
import * as Entity from '../../dbconstants';
import {sanitizer} from '../../utils';

export default class Profile extends Model {
  static table = Entity.Profiles;

  static associations = {
    [Entity.WorkHours]: {type: 'has_many', foreignKey: 'profile_id'},
  };

  @field('fN') fN;

  @field('lN') lN;

  @field('color') color;

  @field('icon') icon;

  @field('dept') dept;

  @field('jTitle') jTitle;

  @field('empId') empId;

  @field('designation') designation;

  @field('phoneNo') phoneNo;

  @field('manager') manager;

  @field('orgId') orgId;

  @field('emailId') emailId;

  @field('isOnboarded') isOnboarded;

  @children('workHours') workHours;

  @field('workTimeZone') workTimeZone;

  @field('workTimeZoneCity') workTimeZoneCity;

  @field('workTimeZoneOffset') workTimeZoneOffset;

  @field('weatherUnit') weatherUnit;

  @field('kaIdentity') kaIdentity;

  @json('onboarding', sanitizer) onboarding;

  @json('nPrefs', sanitizer) nPrefs;

  @field('speakerIcon') speakerIcon;

  @field('usageLimits') usageLimits;

  @readonly @date('updated_at') updatedAt;

  // methods
  get() {
    return {
      // _id: this._id,
      fN: this.fN,
      lN: this.lN,
      color: this.color,
      icon: this.icon,
      dept: this.dept,
      jTitle: this.jTitle,
      empId: this.empId,
      designation: this.designation,
      phoneNo: this.phoneNo,
      manager: this.manager,
      orgId: this.orgId,
      emailId: this.emailId,
      isOnboarded: this.isOnboarded,
      workTimeZone: this.workTimeZone,
      workTimeZoneCity: this.workTimeZoneCity,
      workTimeZoneOffset: this.workTimeZoneOffset,
      weatherUnit: this.weatherUnit,
      kaIdentity: this.kaIdentity,
      speakerIcon: this.speakerIcon,
      usageLimits: this.usageLimits,
      onboarding: this.onboarding,
      nPrefs: this.nPrefs,
    };
  }

  async addWorkHour(workHour) {
    return this.collections.get(Entity.WorkHours).create((record) => {
      record.profile?.set(this);
      record.a = workHour.a;
      record.s = workHour.s;
      record.e = workHour?.e;
      record.ua = workHour?.ua;
      record.start = workHour?.start;
      record.end = workHour?.end;
    });
  }

  updateProfile(profile) {
    this._id = profile?.id;
    this.fN = profile?.fN;
    this.lN = profile?.lN;
    this.color = profile?.color;
    this.icon = profile?.icon;
    this.dept = profile?.dept;
    this.jTitle = profile?.jTitle;
    this.empId = profile?.empId;
    this.designation = profile?.designation;
    this.phoneNo = profile?.phoneNo;
    this.manager = profile?.manager;
    this.orgId = profile?.orgId;
    this.emailId = profile?.emailId;
    this.isOnboarded = profile?.isOnboarded;
    this.workTimeZone = profile?.workTimeZone;
    this.workTimeZoneCity = profile?.workTimeZoneCity;
    this.workTimeZoneOffset = profile?.workTimeZoneOffset;
    this.weatherUnit = profile?.weatherUnit;
    this.kaIdentity = profile?.kaIdentity;
    this.speakerIcon = profile?.speakerIcon;
    this.usageLimits = profile?.usageLimits;
    this.onboarding = profile?.onboarding;
    this.nPrefs = profile?.nPrefs;
  }

  async deleteAllWorkHours() {
    await this.workHours.destroyAllPermanently();
  }

  async delete() {
    await this.deleteAllWorkHours(); // delete all workhours first
    await this.markAsDeleted(); // syncable
    await this.destroyPermanently(); // permanent
  }
}
