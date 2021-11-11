import {Model} from '@nozbe/watermelondb';
import {field, relation} from '@nozbe/watermelondb/decorators';
import * as Entity from '../../dbconstants';

export default class FileMeta extends Model {
  static table = Entity.FileMetas;

  @field('rId') rId;

  @field('downloadStatus') downloadStatus;

  @field('duration') duration;

  @field('encryptionStatus') encryptionStatus;

  @field('fileExtension') fileExtension;

  @field('fileId') fileId;

  @field('fileName') fileName;

  @field('fileExtn') fileExtn;

  @field('fileSize') fileSize;

  @field('fileType') fileType;

  @field('fileCopyUri') fileCopyUri;

  @field('filePath') filePath;

  @field('uri') uri;

  @field('hash') hash;

  @field('thumbnailURL') thumbnailURL;

  @relation(Entity.Components, 'component_id') component;
}