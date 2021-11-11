import RNFetchBlob from 'rn-fetch-blob';
import uuid from 'react-native-uuid';
import {Platform, PermissionsAndroid, Alert, Linking} from 'react-native';
import {APP_NAME} from '../utils/AppConstants';
import {isIOS} from './PlatformCheck';
export const Asset = {
  audio: 'audio',
  video: 'video',
  image: 'image',
  attachment: 'attachment',
};

export const fileExtension = (asset) => {
  switch (asset) {
    case 'audio':
      return 'm4a';
    case 'video':
      return 'mp4';
    case 'image':
      return 'jpg';
    case 'attachment':
      return '';
  }
};

export const fileType = (asset) => {
  switch (asset) {
    case 'audio':
      return 'audio';
    case 'video':
      return 'video';
    case 'image':
      return 'image';
    case 'attachment':
      return 'attachment';
  }
};

export const folder = (asset) => {
  switch (asset) {
    case 'audio':
      return 'audios';
    case 'video':
      return 'videos';
    case 'image':
      return 'images';
    case 'attachment':
      return 'attachments';
  }
};

export const thumbnailExtension = (asset) => {
  switch (asset) {
    case 'video':
    case 'image':
      return 'png';
    case 'audio':
    case 'attachment':
      return '';
  }
};

export const maxSize = (asset) => {
  switch (asset) {
    case 'video':
    case 'image':
      return {width: 1280.0, height: 1280.0};
    case 'audio':
    case 'attachment':
      return {width: 0.0, height: 0.0};
  }
};

export const minSize = (asset) => {
  switch (asset) {
    case 'audio':
    case 'attachment':
      return {width: 0.0, height: 0.0};
    case 'video':
    case 'image':
      return {width: 320.0, height: 240.0};
  }
};

export const compressionBitRate = (asset) => {
  switch (asset) {
    case 'audio':
      return 48 * 1000;
    case 'video':
      return 256 * 1000;
    default:
      return 0;
  }
};

export const maxDuration = (asset) => {
  switch (asset) {
    case 'audio':
      return 300.0;
    case 'video':
      return 300.0;
    default:
      return 0.0;
  }
};

export const configureKoraContainer = (userId) => {
  let directoryPath = containerPath(userId);
  return new Promise((resolve, reject) => {
    RNFetchBlob.fs.exists(directoryPath).then((exists) => {
      if (!exists) {
        createDirectory(directoryPath)
          .then(() => {
            console.log('PATH_TO_CREATE : ' + directoryPath);
            resolve(createMediaDirectories(directoryPath));
          })
          .catch((error) => {
            console.log('PATH_TO_CREATE ERROR : ' + error);
            resolve(error);
          });
      } else {
        resolve(createMediaDirectories(directoryPath));
      }
    });
  });
};

export const createMediaDirectories = (directoryPath) => {
  let audiosDirectoryPath = directoryPath + folder(Asset.audio);
  let aPromise = createDirectory(audiosDirectoryPath);

  let imagesDirectoryPath = directoryPath + folder(Asset.image);
  let iPromise = createDirectory(imagesDirectoryPath);

  let videosDirectoryPath = directoryPath + folder(Asset.video);
  let vPromise = createDirectory(videosDirectoryPath);

  let attachmentsDirectoryPath = directoryPath + folder(Asset.attachment);
  let fPromise = createDirectory(attachmentsDirectoryPath);

  Promise.all([aPromise, iPromise, vPromise, fPromise]).then((values) => {
    return true;
  });
};

export const createDirectory = (directoryPath) => {
  return new Promise((resolve, reject) => {
    switch (Platform.OS) {
      case 'ios':
        RNFetchBlob.fs.exists(directoryPath).then((exists) => {
          if (!exists) {
            RNFetchBlob.fs
              .mkdir(directoryPath)
              .then(() => {
                console.log('DIRECTORY_PATH : ' + directoryPath);
                resolve(true);
              })
              .catch((error) => {
                console.log('DIRECTORY_PATH ERROR : ' + error);
                reject(error);
              });
          } else {
            resolve(true);
          }
        });
        break;
      case 'android':
        PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]).then((result) => {
          if (
            result['android.permission.READ_EXTERNAL_STORAGE'] &&
            result['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted'
          ) {
            RNFetchBlob.fs.exists(directoryPath).then((exists) => {
              if (!exists) {
                RNFetchBlob.fs
                  .mkdir(directoryPath)
                  .then(() => {
                    console.log('DIRECTORY_PATH : ' + directoryPath);
                    resolve(true);
                  })
                  .catch((error) => {
                    console.log('DIRECTORY_PATH ERROR : ' + error);
                    reject(error);
                  });
              } else {
                resolve(true);
              }
            });
          } else if (
            result['android.permission.READ_EXTERNAL_STORAGE'] ||
            result['android.permission.WRITE_EXTERNAL_STORAGE'] ===
              'never_ask_again'
          ) {
            Alert.alert(
              'Alert',
              'Please Go into Settings -> Applications -> ' +
                APP_NAME +
                ' -> Permissions and Allow permissions to continue',
              [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {text: 'OK', onPress: () => Linking.openSettings()},
              ],
              {cancelable: false},
            );
            // Alert.alert(
            //   'alert',
            //   'Please Go into Settings -> Applications -> APP_NAME -> Permissions and Allow permissions to continue',
            // );
          }
        });
        break;
      default:
        break;
    }
  });
};

export const containerPath = (userId) => {
  let KoraV2_DIR_Name = userId || 'KoraV2';
  let directoryPath =
    RNFetchBlob.fs.dirs.SDCardDir + '/' + KoraV2_DIR_Name + '/';
  switch (Platform.OS) {
    case 'ios':
      directoryPath =
        RNFetchBlob.fs.dirs.DocumentDir + '/' + KoraV2_DIR_Name + '/';
      createDirectory(directoryPath);
      break;
    default:
      break;
  }
  return directoryPath;
};

export const getUUID = (fileType) => {
  let fileName = '';
  switch (fileType) {
    case 'audio':
      fileName = 'A_' + uuid.v1();
      break;
    case 'image':
      fileName = 'I_' + uuid.v1();
      break;
    case 'video':
      fileName = 'V_' + uuid.v1();
      break;
    default:
      fileName = 'AT_' + uuid.v1();
  }
  return fileName;
};

export const thumbnailFileName = (itemName, fileType) => {
  switch (fileType) {
    case 'audio':
      return itemName + '.' + thumbnailExtension(fileType);
    case 'image':
      return itemName + '.' + thumbnailExtension(fileType);
    case 'video':
      return itemName + '.' + thumbnailExtension(fileType);
    default:
      return itemName + '.' + thumbnailExtension(fileType);
  }
};

export const fileName = (itemName, fileType, fileExtension) => {
  switch (fileType) {
    case 'audio':
      return itemName + '.' + fileExtension(fileType);
    case 'image':
      return itemName + '.' + fileExtension(fileType);
    case 'video':
      return itemName + '.' + fileExtension(fileType);
    default:
      return itemName + '.' + fileExtension;
  }
};

export const path = (name, fileType, fileExtension, userId) => {
  let koraContainerPath = containerPath(userId);
  let fileNameWithExtn = fileName(name, fileType, fileExtension);
  switch (fileType) {
    case 'audio':
      return koraContainerPath + folder(fileType) + '/' + fileNameWithExtn;
    case 'image':
      return koraContainerPath + folder(fileType) + '/' + fileNameWithExtn;
    case 'video':
      return koraContainerPath + folder(fileType) + '/' + fileNameWithExtn;
    default:
      return koraContainerPath + folder(fileType) + '/' + fileNameWithExtn;
  }
};

export const thumbnailPath = (fileName, fileType, userId) => {
  let koraContainerPath = containerPath(userId);
  let fileNameWithExtn = thumbnailFileName(fileName + '_thumbnail', fileType);
  switch (fileType) {
    case 'audio':
      return koraContainerPath + folder(fileType) + '/' + fileNameWithExtn;
    case 'image':
      return koraContainerPath + folder(fileType) + '/' + fileNameWithExtn;
    case 'video':
      return koraContainerPath + folder(fileType) + '/' + fileNameWithExtn;
    default:
      return koraContainerPath + folder(fileType) + '/' + fileNameWithExtn;
  }
};

export const removeItem = (filePath) => {
  return new Promise((resolve, reject) => {
    RNFetchBlob.fs.exists(filePath).then((exists) => {
      if (!exists) {
        resolve(false);
      } else {
        RNFetchBlob.fs
          .unlink(filePath)
          .then(() => {
            resolve(true);
          })
          .catch(() => {
            resolve(false);
          });
      }
    });
  });
};

export const copyItem = (sourcePath, destinationPath) => {
  return new Promise((resolve, reject) => {
    if (isIOS) {
      RNFetchBlob.fs
        .cp(sourcePath, destinationPath)
        .then(() => {
          resolve(true);
        })
        .catch((error) => {
          reject(error);
        });
    } else {
      resolve(true);
    }
  });
};

export const saveItem = (assetUrl, filePath) => {
  return new Promise((resolve, reject) => {
    removeItem(filePath)
      .then(() => {
        copyItem(assetUrl, filePath)
          .then(() => {
            resolve(true);
          })
          .catch(() => {
            resolve(false);
          });
      })
      .catch(() => {
        resolve(false);
      });
  });
};
