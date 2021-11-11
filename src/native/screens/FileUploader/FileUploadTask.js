import PropTypes from 'prop-types';
import RNFS from 'react-native-fs';
import uuid from 'react-native-uuid';
import {createThumbnail} from 'react-native-create-thumbnail';
import ImageResizer from 'react-native-image-resizer';
import RNFetchBlob from 'rn-fetch-blob';

import {isAndroid, isIOS} from '../../utils/PlatformCheck';
import API_CONST from '../../../shared/utils/api-constants';
import {invokeAPICall} from '../../../shared/utils/invoke-api';

import MultipartData from './MultipartData';
import {
  updateChunkStatus,
  updateFileId,
  updateFileToken,
  upsertUploadItem,
} from '../../../dao/UpsertChunks';

export const ChunkSize = {
  small: 512 * 1024,
  medium: 1000 * 1024,
  large: 2 * 1000 * 1024,
};

class FileUploadTask {
  constructor(props) {
    this.props = props;
    this.chunkSize = ChunkSize.large
    this.userId = props.userId;
    this.accessToken = props.accessToken;
    this.component = props.component;
    this.onSuccess = props.onSuccess;
    this.onProgress = props.onProgress;
    this.onFailure = props.onFailure;
    this.uploadProgress = null;
    this.fileType = 'attachment';
    this.thumbnailType = 'jpg';
    this.isThumbnail = true;
    this.thumbnailChunk = null;
    this.fileContext = props?.fileContext || 'message';
    this.dataObjects = [];
    this.chunks = [];
  }

  async sendComponent() {
    let self = this;
    try {
      this.fileMeta = await this.component.fileMeta.fetch();
      this.uploadItem = await this.component.uploadItem.fetch();
    } catch (e) {
      console.log('error in fileMeta/uploadItem', e);
    }
    this.validateFile();
    this.configureUploadItem(
      (completion = (status) => {
        self
          .getFileToken()
          .then((response) => {
            if (status) {
              self.uploadChunks();
            } else {
              this.onFailure();
            }
          })
          .catch((error) => {
            console.log('error :', error);
            this.onFailure(error);
            return;
          });
      }),
    );
  }

  readChunk = (filePath, length, position) => {
    return RNFS.read(filePath, length, position, 'base64');
  };

  async configureUploadItem(completion = () => {}) {
    let self = this;
    let component = this.component;
    let fileMeta = this.fileMeta;
    let filePath = fileMeta?.filePath;
    if (RNFS.exists(filePath) === false) {
      completion();
      return;
    }

    let allChunks = this.uploadItem?.chunks || [];
    if (allChunks?.length > 0) {
      completion();
      return;
    }

    let promises = [];
    const length = this.chunkSize;
    let currentOffset = 0;
    let numberOfChunks = Math.floor(fileMeta?.fileSize / this.chunkSize) + 1;
    for (let i = 0; i < numberOfChunks; i++) {
      let promise = this.readChunk(filePath, length, currentOffset);
      promises.push(promise);
      currentOffset += this.chunkSize;
    }

    this.dataObjects = await Promise.all(promises);
    let offset = 0;
    for (
      let chunkNumber = 0;
      chunkNumber < this.dataObjects?.length;
      chunkNumber++
    ) {
      let data = this.dataObjects[chunkNumber];
      let chunkLength = data?.length;
      if (chunkLength > 0) {
        let chunk = {
          id: uuid.v4(),
          chunkOffset: offset,
          chunkNumber: chunkNumber,
          chunkSize: chunkLength,
        };
        offset += chunkLength;
        allChunks.push(chunk);
      }
    }
    numberOfChunks = allChunks.length;
    upsertUploadItem({
      component: component,
      fileContext: self.fileContext,
      fileName: fileMeta?.fileName,
      numberOfChunks: numberOfChunks,
      chunks: allChunks,
    })
      .then(({uploadItem, chunkObjects}) => {
        self.uploadItem = uploadItem;
        self.chunks.push(...chunkObjects);
        completion(true);
      })
      .catch((e) => {
        console.log('error in upsertUploadItem in FileUploadTask', e);
        completion(false);
      });
  }

  getFileToken() {
    let self = this;
    return new Promise((resolve, reject) => {
      invokeAPICall({
        url: '/api/1.1/users/' + this.userId + '/file/token',
        method: API_CONST.POST,
      })
        .then((responseJson) => {
          let uploadItem = self.uploadItem;
          updateFileToken({uploadItem: uploadItem, data: responseJson?.data})
            .then(() => {
              resolve(responseJson?.data);
            })
            .catch((e) => {
              console.log('error in updateFileToken :', e);
              resolve(responseJson?.data);
            });
        })
        .catch((error) => {
          console.log('file token task :', error);
          reject(error);
        });
    });
  }

  async uploadChunks() {
    let self = this;
    let chunks = this.chunks;

    let promises = [];
    chunks?.map((chunk) => {
      let promise = self.chunkRequest(chunk);
      promises.push(promise);
    });

    let responses = await Promise.all(promises);
    if (responses.includes(false)) {
      self.onFailure();
    } else {
      this.mergeRequest()
        .then((response) => {
          if (response?.data) {
            self.onSuccess(response?.data);
          } else {
            self.onFailure();
          }
        })
        .catch((error) => {
          self.onFailure(error);
        });
    }
  }

  chunkRequest(chunk) {
    let self = this;
    return new Promise((resolve, reject) => {
      let uploadItem = self.uploadItem;
      let fileToken = uploadItem?.fileToken;
      let chunkNumber = chunk?.chunkNumber;
      let content = self.dataObjects[chunkNumber];
      let fileName = this.fileMeta?.fileName;

      const formData = new MultipartData();
      formData.append('chunkNo', chunkNumber);
      formData.append('messageToken', fileToken);

      formData.append('chunk', {
        data: content,
        fileName: fileName,
      });

      invokeAPICall({
        url: '/api/1.1/users/' + this.userId + '/file/' + fileToken + '/chunk',
        data: formData.toString(),
        contentType: 'multipart/form-data; boundary=' + formData.boundary,
        method: API_CONST.POST,
      })
        .then((responseJson) => {
          updateChunkStatus({chunk: chunk, status: true})
            .then(() => {
              resolve(true);
            })
            .catch((e) => {
              console.log('error in updateChunkStatus :', e);
              resolve(false);
            });
        })
        .catch((error) => {
          console.log('chunk request error:', error);
          reject(false);
        });
    });
  }

  mergeRequest() {
    let self = this;
    return new Promise((resolve, reject) => {
      let uploadItem = self.uploadItem;
      let fileToken = uploadItem?.fileToken;
      let fileName = uploadItem?.fileName;
      let fileExtension = fileName?.split('.').pop().toLowerCase();
      let numberOfChunks = uploadItem?.numberOfChunks;
      let fileContext = uploadItem?.fileContext;

      let formData = new MultipartData();
      formData.append('totalChunks', numberOfChunks);
      formData.append('messageToken', fileToken);
      formData.append('fileExtension', fileExtension);
      formData.append('filename', fileName);
      formData.append('fileContext', fileContext);

      switch (this.fileType) {
        case 'video':
        case 'image':
          let thumbnailFileName = fileName.substring(0, fileName.indexOf('.'));
          formData.append('thumbnail', {
            data: self.thumbnailChunk,
            fileName: thumbnailFileName,
            mimeType: 'image/png',
          });
          formData.append('thumbnailExtension', 'png');
          formData.append('thumbnailUpload', true);
          break;
        default:
          formData.append('thumbnailUpload', false);
          break;
      }

      invokeAPICall({
        url: '/api/1.1/users/' + self.userId + '/file/' + fileToken,
        data: formData.toString(),
        contentType: 'multipart/form-data; boundary=' + formData.boundary,
        method: API_CONST.PUT,
      })
        .then((responseJson) => {
          updateFileId({component: self.component, fileMeta: self.fileMeta, data: responseJson?.data})
            .then(() => {
              resolve(responseJson);
            })
            .catch((e) => {
              console.log('error in updateFileId :', e);
              resolve(responseJson);
            });
        })
        .catch((error) => {
          console.log('merge request error:', error);
          reject(error);
        });
    });
  }

  getThumbnailChunk(path, size) {
    let self = this;
    RNFetchBlob.fs
      .readStream(
        (isIOS ? '' : 'file://') + path.replace('file://', ''),
        'base64',
        size,
      )
      .then((ifstream) => {
        ifstream.open();

        ifstream.onData((chunk) => {
          self.isThumbnail = true;
          self.thumbnailChunk = chunk;
        });

        ifstream.onError((e) => {
          console.log('Error : ', e);
        });

        ifstream.onEnd(() => {});
      });
  }

  async generateThumbnail(uri, type) {
    switch (type) {
      case 'audio':
        let fileName = 'audio.png';
        RNFetchBlob.fs
          .stat(
            isAndroid
              ? RNFetchBlob.fs.asset('images/' + fileName)
              : RNFetchBlob.fs.dirs.MainBundleDir + 'images/' + name,
          )
          .then((stats) => {
            self.thumbnailType = 'jpg';
            self.getThumbnailChunk(stats.path, stats.size);
          });
        break;
      case 'video':
        createThumbnail({
          url: uri,
          timeStamp: 10000,
        })
          .then((response) => {
            ImageResizer.createResizedImage(
              response.path,
              320,
              240,
              'JPEG',
              100,
            )
              .then((response) => {
                this.getThumbnailChunk(response.path, response.size);
              })
              .catch((err) => {
                console.log('ImageResizer error :', err);
              });
          })
          .catch((err) => console.log({err}));
        break;
      case 'image':
        ImageResizer.createResizedImage(
          uri,
          320,
          240,
          'JPEG',
          100,
          0,
          null,
          false,
          {mode: 'cover', onlyScaleDown: false},
        )
          .then((response) => {
            this.getThumbnailChunk(response.path, response.size);
          })
          .catch((err) => {
            console.log('ImageResizer error :', err);
          });
        break;
      default:
        break;
    }
  }

  async getImageFormData(uri, width,height) {

        ImageResizer.createResizedImage(
          uri,
          width,
          height,
          'JPEG',
          100,
          0,
          null,
          false,
          {mode: 'cover', onlyScaleDown: false},
        )
          .then((response) => {
            //this.getThumbnailChunk(response.path, response.size);
            let path = response.path;
            let size = response.size;
            console.log("ImageResizer.createResizedImag response ----->:",response);
            let self = this;
            RNFetchBlob.fs
              .readStream(
                (isIOS ? '' : 'file://') + path.replace('file://', ''),
                'base64',
                size,
              )
              .then((ifstream) => {
                ifstream.open();
        
                ifstream.onData((chunk) => {
                  //self.isThumbnail = true;
                  //self.thumbnailChunk = chunk;
                  const formData = new MultipartData();
                  formData.append('profile', {
                    data: self.thumbnailChunk,
                    fileName: thumbnailFileName,
                    mimeType: 'image/png',
                  });

                  console.log('formData  ----->:',formData);
                });
        
                ifstream.onError((e) => {
                  console.log('Error : ', e);
                });
        
                ifstream.onEnd(() => {});
              });
          })
          .catch((err) => {
            console.log('ImageResizer error :', err);
          });
       
  }

  validateFile() {
    if (this.fileMeta && this.fileMeta?.fileName) {
      let fileExtn = this.fileMeta?.fileName?.split('.').pop().toLowerCase();
      let fileUri = this.fileMeta?.uri;

      if (this.allowedFileTypes().indexOf(fileExtn) !== -1) {
        if (this.fileTypes.audio.indexOf(fileExtn) !== -1) {
          this.fileType = 'audio';
          this.isThumbnail = false;
          this.generateThumbnail(fileUri, this.fileType);
        } else if (this.fileTypes.video.indexOf(fileExtn) !== -1) {
          this.fileType = 'video';
          this.isThumbnail = true;
          this.generateThumbnail(fileUri, this.fileType);
        } else if (this.fileTypes.image.indexOf(fileExtn) !== -1) {
          this.fileType = 'image';
          this.isThumbnail = true;
          this.generateThumbnail(fileUri, this.fileType);
        } else {
          this.fileType = 'attachment';
          this.isThumbnail = false;
        }
      } else if (this.onError) {
        this.onError('INVALID_FILE_FORMAT');
      }
    } else if (this.onError) {
      this.onError('FILE_NAME_MISSING');
    }
  }




  authorization() {
    return this.tokenType + ' ' + this.accessToken;
  }

  allowedFileTypes() {
    return [
      'm4a',
      'amr',
      'aac',
      'wav',
      'mp3',
      'mp4',
      'mov',
      '3gp',
      'flv',
      'png',
      'jpg',
      'jpeg',
      'gif',
      'bmp',
      'csv',
      'txt',
      'json',
      'pdf',
      'doc',
      'dot',
      'docx',
      'docm',
      'dotx',
      'dotm',
      'xls',
      'xlt',
      'xlm',
      'xlsx',
      'xlsm',
      'xltx',
      'xltm',
      'xlsb',
      'xla',
      'xlam',
      'xll',
      'xlw',
      'ppt',
      'pot',
      'pps',
      'pptx',
      'pptm',
      'potx',
      'potm',
      'ppam',
      'ppsx',
      'ppsm',
      'sldx',
      'sldm',
      'zip',
      'rar',
      'tar',
      'wpd',
      'wps',
      'rtf',
      'msg',
      'dat',
      'sdf',
      'vcf',
      'xml',
      '3ds',
      '3dm',
      'max',
      'obj',
      'ai',
      'eps',
      'ps',
      'svg',
      'indd',
      'pct',
      'accdb',
      'db',
      'dbf',
      'mdb',
      'pdb',
      'sql',
      'apk',
      'cgi',
      'cfm',
      'csr',
      'css',
      'htm',
      'html',
      'jsp',
      'php',
      'xhtml',
      'rss',
      'fnt',
      'fon',
      'otf',
      'ttf',
      'cab',
      'cur',
      'dll',
      'dmp',
      'drv',
      '7z',
      'cbr',
      'deb',
      'gz',
      'pkg',
      'rpm',
      'zipx',
      'bak',
      'avi',
      'm4v',
      'mpg',
      'rm',
      'swf',
      'vob',
      'wmv',
      '3gp2',
      '3g2',
      'asf',
      'asx',
      'srt',
      'wma',
      'mid',
      'aif',
      'iff',
      'm3u',
      'mpa',
      'ra',
      'aiff',
      'tiff',
    ];
  }

  fileTypes = {
    audio: ['m4a', 'amr', 'wav', 'aac', 'mp3'],
    video: ['mp4', 'mov', '3gp', 'flv'],
    image: ['png', 'jpg', 'jpeg'],
  };
}

FileUploadTask.defaultProps = {
  onSuccess: () => {},
  onProgress: () => {},
  onFailure: () => {},
  component: null,
  userId: null,
  tokenType: null,
  accessToken: null,
};

FileUploadTask.propTypes = {
  onSuccess: PropTypes.func,
  onProgress: PropTypes.func,
  onFailure: PropTypes.func,
  component: PropTypes.object,
  userId: PropTypes.string,
  tokenType: PropTypes.string,
  accessToken: PropTypes.string,
};

export default FileUploadTask;
