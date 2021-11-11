import axios from 'axios';
import {cacheBlob} from '../on-demand-caching';
import ChunkUpload from './ChunkUpload';
import RNFetchBlob from 'rn-fetch-blob';
import {createThumbnail} from 'react-native-create-thumbnail';

import ImageResizer from 'react-native-image-resizer';
import {isAndroid, isIOS} from '../../utils/PlatformCheck';

import API_URL from '../../../../env.constants';

function FileUploader(
  file,
  userInfoId,
  fileContext,
  userAccessToken,
  mediaName,
) {
  // const app = API_URL.appServer;
  //  this.baseUrl = app;
  this.baseUrl = API_URL.appServer;
  this.CHUNK_SIZE = 2 * 1024 * 1024;
  this.allowedFileTypes = [
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
  this.filetypes = {
    audio: ['m4a', 'amr', 'wav', 'aac', 'mp3'],
    video: ['mp4', 'mov', '3gp', 'flv'],
    image: ['png', 'jpg', 'jpeg'],
  };

  this.file = file;
  this.fileContext = fileContext;
  this.userInfoId = userInfoId;
  this.accessToken = userAccessToken;
  this.onProgress = null;
  this.onSuccess = null;
  this.onError = null;
  this.currentChunk = 0;
  this.fileInfo = {};
  this.result = {};
  this.blobUrl = '';
  this.fileDuration = '';
  this.mediaName = mediaName;

  this.chunk = null;
  this.filePath = '';
  this.thambnil_chunk = null;
  this.thambnil_type = null;
  this.isThambnil = false;

  this.chunk_total_number = 0;
  this.chunk_file = null;

  var kfrm = {};
  kfrm.net = {};

  //##################

  function MultipartData() {
    this.boundary = '--------MultipartData' + Math.random();
    this._fields = [];
  }
  MultipartData.prototype.append = function (key, value) {
    this._fields.push([key, value]);
  };
  MultipartData.prototype.toString = function () {
    var boundary = this.boundary;
    var body = '';
    this._fields.forEach(function (field) {
      body += '--' + boundary + '\r\n';
      // file upload
      if (field[1]?.data) {
        var file = field[1];
        if (file.fileName) {
          body +=
            'Content-Disposition: form-data; name="' +
            field[0] +
            '"; filename="' +
            file.fileName +
            '"';
        } else {
          body += 'Content-Disposition: form-data; name="' + field[0] + '"';
        }
        body += '\r\n';
        if (file.type) {
          body += 'Content-Type: UTF-8; charset=ISO-8859-1\r\n';
        }
        body += 'Content-Transfer-Encoding: base64\r\n';
        body += '\r\n' + file.data + '\r\n'; //base64 data
      } else {
        body +=
          'Content-Disposition: form-data; name="' + field[0] + '";\r\n\r\n';
        body += field[1] + '\r\n';
      }
    });
    body += '--' + boundary + '--';
    return body;
  };

  function getConnection() {
    return new kfrm.net.HttpRequest();
  }
  //https://stackoverflow.com/questions/54578294/react-native-fs-how-to-read-local-images-get-base64-of-local-file/54594945
  this.readLocalImageFile = (name) => {
    console.log('\n---------------- Read local file ------------------\n');
    const self = this;
    //.stat//(require('../../assets/staticImages/sample.jpg'))
    RNFetchBlob.fs
      .stat(
        isAndroid
          ? RNFetchBlob.fs.asset('images/' + name)
          : RNFetchBlob.fs.dirs.MainBundleDir + 'images/' + name,
      )
      .then((stats) => {
        console.log('\n--------------STATS-------------\n', stats, '\n\n');
        self.thambnil_type = 'jpg';
        self.getThambnilChunk(stats.path, stats.size);
      });
  };

  this.getThambnilChunk = (path, size) => {
    let _self = this;
    let i = 0;
    RNFetchBlob.fs
      .readStream(
        (isIOS ? '' : 'file://') + path.replace('file://', ''),
        'base64',
        size,
      )
      .then((ifstream) => {
        ifstream.open();

        ifstream.onData((chunk) => {
          _self.isThambnil = true;
          _self.thambnil_chunk = chunk;
          //  console.log("thambnil_chunk :: ",chunk);
          this.commitFile(chunk);

          // uploadStart(_self);
        });

        ifstream.onError((e) => {
          console.log('Error : ', e);
        }); //this.onFetchBlobError(e));

        ifstream.onEnd(() => {
          //
        });
      });
  };

  this.uploadStart = () => {
    let _self = this;

    console.log(
      '\n----------------UPLOAD START----------------\n',
      _self.thambnil_chunk,
      '\n\n',
    );

    // if(true){
    //   return;
    // }

    // _self.filePath = isIOS
    //   ? _self.filePath.split('file://')[1]
    //   : _self.filePath;
    console.log('\n----------UPLOAD PATH-----------\n', _self.filePath, '\n\n');
    _self.filePath = _self.filePath;
    _self.chunk = new ChunkUpload({
      path: _self.filePath, //response.path, // Path to the file
      size: _self.CHUNK_SIZE, //this.file.size / 3, //10095, // Chunk size (must be multiples of 3)
      fileName: _self.file.name, // Original file name
      fileSize: _self.file.size, // Original file size

      // Errors
      onFetchBlobError: (e) => console.log('onFetchBlobError', e),
      onWriteFileError: (e) => console.log('onWriteFileError', e),
    });

    _self.chunk.digIn(upload.bind(_self));
  };

  this.generateThumbnail = async (uri, type, onSuccessCB = () => {}) => {
    const index = type.indexOf('/');
    let fileType = type.substring(0, index);

    if (fileType === 'audio') {
      this.readLocalImageFile('audio.png');
    } else if (fileType === 'video') {
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
            0,
            null,
            false,
            {mode: 'cover', onlyScaleDown: false},
          )
            .then((response) => {
              this.getThambnilChunk(response.path, response.size);
              return onSuccessCB(response);
            })
            .catch((err) => {
              // console.log('ImageResizer error :', err);
            });
        })
        .catch((err) => console.log({err}));
    } else if (fileType === 'image') {
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
          console.log('ImageResizer :', response);

          this.getThambnilChunk(response.path, response.size);
          return onSuccessCB(response);
          // response.uri is the URI of the new image that can now be displayed, uploaded...
          // response.path is the path of the new image
          // response.name is the name of the new image with the extension
          // response.size is the size of the new image
        })
        .catch((err) => {
          console.log('ImageResizer err :', err);
          // Oops, something went wrong. Check that the filename is correct and
          // inspect err to get more details.
        });
    } else {
      let log = {
        uri: uri,
        type: type,
      };
      return onSuccessCB(log);
    }
  };

  this.commitFile = (thambnil_chunk) => {
    let _self = this;
    let url =
      _self.baseUrl +
      'api/1.1/users/' +
      _self.userInfoId +
      '/file/' +
      _self.fileInfo.fileToken;
    // console.log('\n------------commitFile URL-------------\n', url, '\n\n');

    let totChunks = _self.chunk_total_number;
    let file = _self.chunk_file;

    let _conc = getConnection(),
      _mdat = new MultipartData();
    _conc.addEventListener(
      'load',
      function (evt) {
        // console.log('\n------------_conc load EVT-------------\n', evt, '\n\n');

        if (evt.target.status === 200) {
          console.log('_conc.addEventListener(load success');
          if (_self.onSuccess) _self.onSuccess(evt.target.response);
          //console.log('1_evt.target :', evt.target.response);
        }
        //TODO need to handle failed scenarios
      },
      false,
    );
    _conc.addEventListener(
      'error',
      function (evt) {
        //errorListener(_scope, evt);
        console.log('1_status :', evt);
      },
      false,
    );
    _conc.withCredentials = false;
    _conc.open('PUT', url);

    _conc.setRequestHeader('Authorization', 'bearer ' + this.accessToken);

    _mdat.append('totalChunks', totChunks);
    _mdat.append('messageToken', _self.fileInfo.fileToken);
    // formData.append('fileExtension', this.fileInfo.fileType);
    // formData.append('fileType', this.fileInfo.type);
    // formData.append('fileName', file.file_name);
    //formData.append('fileContext', this.fileContext);
    console.log('FILE DATA', file);
    let fileType = file?.file_name?.split('.').pop().toLowerCase();
    // console.log('fileExtension', fileType);
    // console.log('filename', file.file_name);
    // console.log('fileContext', 'message');

    //reqEntity.addPart("thumbnail", new ByteArrayBody(thumbBaos.toByteArray(),"image/png",thfileName));
    //reqEntity.addPart("thumbnailExtension",new StringBody("png"));

    _mdat.append('fileExtension', fileType);
    _mdat.append('filename', file?.file_name);
    _mdat.append('fileContext', this.fileContext);

    console.log(
      '---------------_self.isThambnil----------------- : ',
      _self.isThambnil,
    );

    if (thambnil_chunk) {
      // _mdat.append('thumbnail', _self.thambnil_chunk);

      console.log('---------------Thumbnail uploded true-----------------');
      //console.log("ThambnilChunk : ",thambnil_chunk);

      let thumbFileName = file?.file_name?.substring(
        0,
        file?.file_name?.indexOf('.'),
      );
      _mdat.append('thumbnail', {
        data: thambnil_chunk,
        fileName: thumbFileName,
        mimeType: 'image/png',
      });

      // _self.thambnil_type="png";

      _mdat.append('thumbnailExtension', 'png');

      // if (_self.thambnil_type) {
      //   _mdat.append('thumbnailExtension', _self.thambnil_type);
      // } else {
      //   _mdat.append('thumbnailExtension', 'png');
      // }
      _mdat.append('thumbnailUpload', true);
    } else {
      console.log('---------------Thumbnail uploded false-----------------');

      _mdat.append('thumbnailUpload', false);
    }
    // _mdat.append('thumbnailUpload', false);

    // if (_this.options.data) {
    //   for (var key in _this.options.data) {
    //     _mdat.append(key, _this.options.data[key]);
    //   };
    // }

    _conc.setRequestHeader(
      'Content-Type',
      'multipart/form-data; boundary=' + _mdat.boundary,
    );
    _conc.send(_mdat.toString());
  };

  // {"size":130030,"name":"IMG_20200902_175441.jpg",
  //"fileCopyUri":"content://com.android.providers.media.documents/document/image%3A247",
  //"type":"image/jpeg",
  //"uri":"content://com.android.providers.media.documents/document/image%3A247"}

  //this.upload = function (file, next, retry, unlink) {
  async function upload(file, next, retry, unlink) {
    // console.log('file :', file);
    // console.log('next :', next);
    //console.log('retry :', retry);
    console.log(
      'Chunk_uploading :  ' +
        file.chunk_number +
        ' / ' +
        file.chunk_total_number,
    );
    let _self = this;
    if (typeof _self.onProgress === 'function') {
      _self.onProgress((100 / file.chunk_total_number) * file.chunk_number);
    }

    let url =
      this.baseUrl +
      'api/1.1/users/' +
      this.userInfoId +
      '/file/' +
      this.fileInfo.fileToken +
      '/chunk';

    console.log('\n------------upload chunk URL-------------\n', url, '\n\n');

    const _conc = getConnection();

    // console.log('_conc  : ', _conc);

    const formData = new MultipartData();

    //############

    _conc.addEventListener(
      'load',
      function (evt) {
        console.log(
          'addEventListener EVT',
          file.chunk_number,
          file.chunk_total_number,
          file.chunk_number === file.chunk_total_number,
        );
        // console.log('evt.target.status :', evt.target.status);
        // console.log('status :', evt);
        // console.log('evt.target :', evt.target);
        if (evt?.target?.status === 200) {
          if (file.chunk_number === file.chunk_total_number) {
            unlink(file.path);
            let urlNew =
              _self.baseUrl +
              'api/1.1/users/' +
              _self.userInfoId +
              '/file/' +
              _self.fileInfo.fileToken;

            _self.chunk_total_number = file.chunk_total_number;
            _self.chunk_file = file;

            let type = _self.file.type.substring(
              0,
              _self.file.type.indexOf('/'),
            );
            // console.log(
            //   'GOT 200 and all chunks uploaded',
            //   type && type === 'audio',
            // );
            if (type && type !== 'video' && type !== 'image') {
              _self.commitFile(null);
            } else {
              _self.generateThumbnail(_self.file.uri, _self.file.type);
            }
          } else {
            next();
          }
        }
      },
      false,
    );
    _conc.addEventListener(
      'error',
      function (evt) {
        // console.log('evt.target.status error :', evt);
        //errorListener(_scope, evt);
      },
      false,
    );
    _conc.withCredentials = false;
    _conc.open('POST', url);

    _conc.setRequestHeader('Authorization', 'bearer ' + this.accessToken);

    //#############

    // formData.append('file', file.blob);
    // formData.append('fileExtension', this.fileInfo.fileType);
    // formData.append('fileType', this.fileInfo.type);
    // formData.append('fileName', file.file_name);
    //formData.append('fileContext', this.fileContext);

    // formData.append('fileToken', this.fileInfo.fileToken);
    // formData.append('expiresOn', this.fileInfo.fileTokenExpiresOn);
    // formData.append('fileTokenExpiresOn', this.fileInfo.fileTokenExpiresOn);
    // formData.append('chunkNo', this.currentChunk);
    // formData.append('messageToken', this.fileInfo.fileToken);
    // formData.append(
    //   'chunk',
    //   _self.dataURLtoFile(chunk, this.fileInfo.fileName),
    // );

    formData.append('chunkNo', file.chunk_number - 1);
    formData.append('messageToken', this.fileInfo.fileToken);
    // formData.append('chunk', file.chunk_data);

    formData.append('chunk', {
      data: file.chunk_data,
      fileName: file?.file_name,
    });
    //console.log('this.accessToken : ', this.accessToken);
    _conc.setRequestHeader(
      'Content-Type',
      'multipart/form-data; boundary=' + formData.boundary,
      'Authorization: bearer ' + this.accessToken,
    );
    try {
      const result = await _conc.send(formData.toString());
      // console.log('_conc.addEventListener RESULT', result);
    } catch (err) {
      console.log('_conc.addEventListener(', err);
    }
  }

  function getDataURL(src) {
    var thecanvas = document.createElement('canvas');
    if (src.tagName == 'IMG' || src.tagName == 'VIDEO') {
      src.width = src.tagName == 'IMG' ? src.width : src.videoWidth;
      src.height = src.tagName == 'IMG' ? src.height : src.videoHeight;
      if (src.width >= src.height) {
        thecanvas.width = 660;
        thecanvas.height = (src.height / src.width) * 660;
      } else {
        thecanvas.height = 660;
        thecanvas.width = (src.width / src.height) * 660;
      }
      if (src.width < 660 && src.height < 660) {
        thecanvas.height = src.height;
        thecanvas.width = src.width;
      }
    } else {
      thecanvas.height = 280;
      thecanvas.width = 420;
    }
    var context = thecanvas.getContext('2d');
    context.drawImage(src, 0, 0, thecanvas.width, thecanvas.height);
    if (src.tagName == 'VIDEO') {
      var sWidth = thecanvas.width;
      var sHeight = thecanvas.height;
      context.beginPath();
      context.arc(sWidth / 2, sHeight / 2, 20, 0, 2 * Math.PI, false);
      context.fillStyle = 'black';
      context.fill();
      context.beginPath();
      context.arc(sWidth / 2, sHeight / 2, 19, 0, 2 * Math.PI, false);
      context.fillStyle = 'white';
      context.fill();
      var path = new Path2D();
      path.moveTo(sWidth / 2 + 10, sHeight / 2);
      path.lineTo(sWidth / 2 - 5, sHeight / 2 - 10);
      path.lineTo(sWidth / 2 - 5, sHeight / 2 + 10);
      context.fillStyle = 'black';
      context.fill(path);
    }
    var dataURL = thecanvas.toDataURL();
    return dataURL;
  }
  this.mydataURLtoFile = function (path, filename, type) {
    //const arr = dataurl.split(',');
    const mime = type; //arr[0].match(/:(.*?);/)[1];
    const bstr = atob(path);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n) {
      u8arr[n - 1] = bstr.charCodeAt(n - 1);
      n -= 1; // to make eslint happy
    }
    return new File([u8arr], filename, {type: mime});
  };

  this.dataURLtoFile = function (dataurl, filename) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n) {
      u8arr[n - 1] = bstr.charCodeAt(n - 1);
      n -= 1; // to make eslint happy
    }
    return new File([u8arr], filename, {type: mime});
  };

  this._uploadFile = function () {
    // console.log('from this._uploadFile');
    // console.log('file :', this.file);
    // console.log('fileExtension :', this.fileInfo.fileType);
    // console.log('fileType :', this.fileInfo.type);
    // console.log('filename :', this.fileInfo.fileName);
    // console.log('fileContext :', this.fileContext);
    let _self = this;
    let formData = new FormData();
    formData.append('file', this.file);
    formData.append('fileExtension', this.fileInfo.fileType);
    formData.append('fileType', this.fileInfo.type);
    formData.append('filename', this.fileInfo.fileName);
    formData.append('fileContext', this.fileContext);

    formData.append('fileToken', this.fileInfo.fileToken);
    formData.append('expiresOn', this.fileInfo.fileTokenExpiresOn);
    formData.append('fileTokenExpiresOn', this.fileInfo.fileTokenExpiresOn);
    //_self.fileInfo.fileToken = responseJson.fileToken;
    //_self.fileInfo.fileTokenExpiresOn = responseJson.expiresOn;
    //{"expiresOn": 1601637240, "fileToken": "528129e6-6d46-46e1-a765-2f6cae12ef46"}

    // if (this.fileInfo.isThumbnail) {
    //   formData.append('thumbnailUpload', true);
    //   let thumbnail = _self.dataURLtoFile(
    //     this.fileInfo.thumbnailData,
    //     this.fileInfo.name + '_thumb',
    //   );
    //   formData.append('thumbnail', thumbnail);
    // } else {
    //   formData.append('thumbnailUpload', false);
    // }
    formData.append('thumbnailUpload', false);
    // console.log('formData :', formData);

    axios
      .post(
        this.baseUrl + 'api/1.1/users/' + this.userInfoId + '/file',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: 'bearer ' + this.accessToken,
          },
          onUploadProgress: function (e) {
            // console.log('AXIOS UPLOAD PROGRESS');
            if (_self.onProgress) {
              let progress = Math.round((e.loaded * 100) / e.total);
              _self.onProgress(progress);
            }
          },
        },
      )
      .then(function (data) {
        // console.log('AXIOS POST SUCCESS');
        let response = {
          type: _self.fileInfo.type,
          fileName: _self.fileInfo.fileName,
          filesize: _self.fileInfo.fileSize,
          fileUrl: data.data,
          mediaName: _self.fileInfo.mediaName,
        };
        if (_self.onSuccess) _self.onSuccess(response);
        // return response;
        // _self.result=response;
      })
      .catch(function (error) {
        console.log(error);
        // console.log(JSON.stringify(error));

        if (_self.onError) _self.onError('FILE_UPLOAD_ERROR');
      });
  };

  this._commitFile = function () {
    let _self = this;
    let url =
      this.baseUrl +
      'api/1.1/users/' +
      this.userInfoId +
      '/file/' +
      this.fileInfo.fileToken;
    let formData = new FormData();
    formData.append('totalChunks', this.fileInfo.totalChunks);
    formData.append('messageToken', this.fileInfo.fileToken);
    formData.append('fileExtension', this.fileInfo.fileType);
    formData.append('fileType', this.fileInfo.type);
    formData.append('filename', this.fileInfo.fileName);
    formData.append('fileContext', this.fileContext);

    if (this.fileInfo.isThumbnail) {
      formData.append('thumbnailUpload', true);
      let thumbnail = this.dataURLtoFile(
        this.fileInfo.thumbnailData,
        this.fileInfo.name + '_thumb',
      );
      formData.append('thumbnail', thumbnail);
    } else {
      formData.append('thumbnailUpload', false);
    }
    axios
      .put(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: 'bearer ' + this.accessToken,
        },
      })
      .then(function (data) {
        if (_self.onProgress) {
          let progress = Math.floor(
            (_self.currentChunk / _self.fileInfo.totalChunks) * 100,
          );
          _self.onProgress(progress);
        }
        let response = {
          type: _self.fileInfo.type,
          fileName: _self.fileInfo.fileName,
          filesize: _self.fileInfo.fileSize,
          fileUrl: data.data,
          blobUrl: _self.blobUrl,
          duration: _self.fileDuration,
          mediaName: _self.fileInfo.mediaName,
        };
        // let response ={type: _self.fileInfo.type, fileUrl: data.data}
        // console.log('ACIOS PUT');
        if (_self.onSuccess) _self.onSuccess(response);
      })
      .catch(function () {
        if (_self.onError) _self.onError('FILE_UPLOAD_ERROR');
      });
  };

  this._uploadChunk = function (chunk) {
    let _self = this;
    let url =
      this.baseUrl +
      'api/1.1/users/' +
      this.userInfoId +
      '/file/' +
      this.fileInfo.fileToken +
      '/chunk';
    let formData = new FormData();
    formData.append('chunkNo', this.currentChunk);
    formData.append('messageToken', this.fileInfo.fileToken);
    formData.append(
      'chunk',
      _self.dataURLtoFile(chunk, this.fileInfo.fileName),
    );

    axios
      .post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: 'bearer ' + this.accessToken,
        },
      })
      .then(function (data) {
        _self.currentChunk++;
        if (_self.currentChunk === _self.fileInfo.totalChunks) {
          _self._commitFile();
        } else {
          _self._initChunkUpload();
        }
      })
      .catch(function () {
        if (_self.onError) _self.onError('FILE_UPLOAD_ERROR');
      });
  };

  this._initChunkUpload = function () {
    // console.log('from this._initChunkUpload');
    let _self = this;
    let start = this.currentChunk * this.CHUNK_SIZE;
    let end =
      this.currentChunk === this.fileInfo.totalChunks - 1
        ? this.file.size
        : (this.currentChunk + 1) * this.CHUNK_SIZE;
    if (this.onProgress) {
      let progress = Math.floor(
        (this.currentChunk / this.fileInfo.totalChunks) * 100,
      );
      this.onProgress(progress);
    }

    // console.log('this.file : ', this.file);

    let blob = this.file.slice(start, end);
    let reader = new FileReader();
    reader.onloadend = function (e) {
      if (e.target.readyState === FileReader.DONE) {
        let chunk = e.target.result;
        _self._uploadChunk(chunk);
      }
    };
    reader.readAsDataURL(blob);
  };

  this._initChunk = function (filePath) {
    // let flag = true;
    // if (flag) {
    //   this.generateThumbnail(this.file.uri);
    //   return;
    // }
    // this.filePath = filePath;
    // this.generateThumbnail(this.file.uri, this.file.type);
    // console.log('INSIDE INIT CHUCK');
    this.uploadStart();
  };

  this._readyForUpload = function () {
    // console.log('correctpath :', this.file.uri);
    // console.log('correctpath :', this.file.path);

    let uri = this.file.uri;
    if (isIOS) {
      if (file.type !== 'audio/mp4') {
        uri = isIOS ? uri.split('file://')[1] : uri;
      }
    }

    if (this.file.path) {
      var str1 = 'file://';
      var str2 = this.file.path;
      var correctpath = str1.concat(str2);

      if (isIOS) {
        // console.log('media type', file);
        if (file.type === 'audio/mp4') {
          correctpath = str2;
        }
        correctpath = str2;
      }
      this.filePath = correctpath;
      // this.setState({absolutepath: correctpath});
      // console.log('correctpath :', correctpath);

      this._initChunk(correctpath);
    } else {
      RNFetchBlob.fs
        .stat(uri) // Relative path obtained from document picker
        .then((stats) => {
          // console.log('STATS', stats);
          var str1 = 'file://';
          var str2 = stats.path;
          let correctpath = str1.concat(str2);
          this.filePath = correctpath;
          // this.setState({absolutepath: correctpath});
          //console.log('correctpath :', correctpath);
          // console.log('RNFetchBlob.fs', correctpath);
          this._initChunk(correctpath);
        })
        .catch((err) => {
          console.log('_readyForUpload', err);
        });
    }

    // RNGRP.getRealPathFromURI(this.file.uri).then((filePath) =>
    //   console.log('filePath :', filePath),
    // );

    // chunk.digIn(this.upload.bind(this));
    //chunk.digIn();
    // if (this.fileInfo.isChunkUpload) {
    // this._initChunkUpload();
    // } else {
    //   this._uploadFile();
    // }
  };

  this._getFileToken = function () {
    let _self = this;
    console.log(
      'File Token :' +
        this.baseUrl +
        'api/1.1/users/' +
        this.userInfoId +
        '/file/token',
    );

    console.log('---Access Token---- : ' + this.accessToken);

    fetch(this.baseUrl + 'api/1.1/users/' + this.userInfoId + '/file/token', {
      method: 'post',
      headers: new Headers({
        Authorization: 'bearer ' + this.accessToken,
      }),
    })
      .then((response) => response.json())
      .then((responseJson) => {
        // console.log('getting data from fetch :', responseJson);
        console.log('fileToken :', responseJson);
        // console.log('fileTokenExpiresOn :', responseJson.expiresOn);
        _self.fileInfo.fileToken = responseJson.fileToken;
        _self.fileInfo.fileTokenExpiresOn = responseJson.expiresOn;
        _self._readyForUpload();
        //{"expiresOn": 1601635412, "fileToken": "04d18e02-62cc-4208-8714-511a5d95c9d3"}
      })
      .catch((error) => console.log('Sathish :', error));

    // axios
    //   .post(
    //     this.baseUrl + 'api/1.1/users/' + this.userInfoId + '/file/token',
    //     {
    //       'User-Agent': DeviceInfo.getUserAgent(),
    //     },
    //     {
    //       headers: {
    //         Authorization: 'bearer ' + this.accessToken,
    //       },
    //     },
    //   )
    //   .then(function (data) {
    //     _self.fileInfo.fileToken = data.data.fileToken;
    //     _self.fileInfo.fileTokenExpiresOn = data.data.expiresOn;
    //     _self._readyForUpload();
    //   })
    //   .catch(function (error) {
    //     console.log(error);
    //     console.log(JSON.stringify(error));
    //     if (_self.onError) _self.onError('FILE_TOKEN_CREATION_ERROR');
    //   });
  };

  this._generateThumbnail = function () {
    let _self = this;
    let reader = new FileReader();

    // console.log('-------7755----------' + _self.fileInfo.type);
    reader.onload = function (e) {
      // console.log('---------_generateThumbnail------ssssss--');
      let blob = new Blob([e.target.result], {
        type: _self.file.type,
      });
      let url = (URL || webkitURL).createObjectURL(blob);
      // console.log('---------_generateThumbnail------STARt--');
      if (_self.fileInfo.type === 'video') {
        let video = document.createElement('video');
        video.preload = 'metadata';
        video.autoplay = true;
        video.muted = true;
        video.addEventListener('loadeddata', function () {
          _self.fileInfo.thumbnailData = getDataURL(video);
          video.pause = true;
          let finalDuration = _self.getDuration(video.duration);
          _self.fileDuration = finalDuration;
          //(URL || webkitURL).revokeObjectURL(url);
          _self.blobUrl = url;
          cacheBlob(url).then(() => _self._getFileToken());
        });
        video.addEventListener('error', function () {
          (URL || webkitURL).revokeObjectURL(url);
        });
        video.src = url;
      } else if (_self.fileInfo.type === 'image') {
        // console.log('---------_generateThumbnail------IMAGE--');
        let img = new Image();
        img.addEventListener('load', function () {
          _self.fileInfo.thumbnailData = getDataURL(img);
          (URL || webkitURL).revokeObjectURL(url);
          _self._getFileToken();
        });
        img.addEventListener('error', function () {
          (URL || webkitURL).revokeObjectURL(url);
        });
        img.src = url;
      } else if (_self.fileInfo.type === 'audio') {
        let audio = document.createElement('audio');
        audio.addEventListener('loadeddata', function () {
          let finalDuration = _self.getDuration(audio.duration);
          _self.fileDuration = finalDuration;
          _self.blobUrl = url;
          cacheBlob(url).then(() => _self._getFileToken());
          _self._getFileToken();
        });
        audio.addEventListener('error', function () {
          (URL || webkitURL).revokeObjectURL(url);
        });
        audio.src = url;
      }
    };
    _self._getFileToken();
    // console.log('-------FILE----------' + JSON.stringify(this.file));
    // reader.readAsDataURL (this.file);
  };

  this.getDuration = function (duration) {
    let minutes = Math.floor(duration / 60);
    let nums = duration - minutes * 60;
    let seconds = parseInt(nums);
    if (minutes.toString().length < 2) {
      minutes = '0' + minutes;
    }
    minutes = minutes.toString();
    let finalDuration = minutes + ' : ' + seconds;
    return finalDuration;
  };

  this.getUID = function (pattern) {
    var _pattern = pattern || 'xxxxyx';
    _pattern = _pattern.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    return _pattern;
  };

  /*******************************    Function for Attachment End  ***********************************************/
  +(function () {
    function getHTTPConnecton() {
      var xhr = false;
      xhr = new XMLHttpRequest();
      if (xhr) {
        return xhr;
      } else if (typeof XDomainRequest !== 'undefined') {
        return new XDomainRequest();
      }
      return xhr;
    }

    function HttpRequest() {
      var xhr = getHTTPConnecton();
      if (!xhr) {
        throw 'Unsupported HTTP Connection';
      }
      try {
        xhr.withCredentials = true;
      } catch (e) {}
      xhr.onreadystatechange = function () {
        return xhr.onReadyStateChange && xhr.onReadyStateChange.call(xhr);
      };
      return xhr;
    }
    kfrm.net.HttpRequest = HttpRequest;
  })();

  this._validateFile = function () {
    if (this.file && this.file.name) {
      this.fileInfo = {
        fileName: this.file.name,
        //mediaName: '463a09c5-bfbe-4598-951b-97f3c86df5e9',
        mediaName: this.mediaName,
        fileType: this.file.name.split('.').pop().toLowerCase(),
        fileSize: this.file.size,
      };

      // console.log('------885------------' + JSON.stringify(this.fileInfo));
      if (this.allowedFileTypes.indexOf(this.fileInfo.fileType) !== -1) {
        // console.log('--INSIDE-------------');
        this.fileInfo.isChunkUpload = this.fileInfo.fileSize > this.CHUNK_SIZE;
        this.fileInfo.totalChunks = this.fileInfo.isChunkUpload
          ? Math.floor(this.fileInfo.fileSize / this.CHUNK_SIZE) + 1
          : 1;
        if (this.filetypes.audio.indexOf(this.fileInfo.fileType) !== -1) {
          this.fileInfo.type = 'audio';
          this.fileInfo.isThumbnail = false;
          this._generateThumbnail();
          //this._getFileToken();
        } else if (
          this.filetypes.video.indexOf(this.fileInfo.fileType) !== -1
        ) {
          this.fileInfo.type = 'video';
          this.fileInfo.isThumbnail = true;
          this._generateThumbnail();
        } else if (
          this.filetypes.image.indexOf(this.fileInfo.fileType) !== -1
        ) {
          // console.log('--INSIDE----IMAGE---------');
          this.fileInfo.type = 'image';
          this.fileInfo.isThumbnail = true;
          this._generateThumbnail();
        } else {
          this.fileInfo.type = 'attachment';
          this.fileInfo.isThumbnail = false;
          this._getFileToken();
        }
      } else {
        if (this.onError) this.onError('INVALID_FILE_FORMAT');
      }
    } else {
      if (this.onError) this.onError('FILE_NAME_MISSING');
    }
  };

  this.start = function (onProgress = null, onSuccess = null, onError = null) {
    // console.log(
    //   '\n-----------------------FILE---------------------\n',
    //   file,
    //   '\n\n',
    // );
    this.onProgress = onProgress;
    this.onSuccess = onSuccess;
    this.onError = onError;
    this._validateFile();
  };
  return this;
}

export default FileUploader;
