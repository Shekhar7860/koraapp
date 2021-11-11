import {Platform, PermissionsAndroid, Linking, Alert} from 'react-native';
import {isAndroid} from '../../utils/PlatformCheck';
import FileViewer from 'react-native-file-viewer';
import RNFetchBlob from 'rn-fetch-blob';
import API_URL from '../../../../env.constants';
import * as UsersDao from '../../../dao/UsersDao';
import AccountManager from '../../../shared/utils/AccountManager';

export const singleAttachementPreview = (
  componentsList,
  messageId,
  statusCB = (status) => {},
) => {
  if (!componentsList) {
    statusCB(false);
    return false;
  }

  let components = componentsList.filter(function (data) {
    return (
      data.componentType === 'image' ||
      data.componentType === 'video' ||
      data.componentType === 'audio' ||
      data.componentType === 'attachment'
    );
  });

  // console.log('modified components :', components);
  if (components.length === 0 || components.length > 1) {
    // console.log('modified components length :', components.length);
    statusCB(false);
    return false;
  }

  const type =
    components[0] && components[0].componentType
      ? components[0].componentType
      : '';
  if (components.length === 1 && type === 'attachment') {
    let data = components[0];

    var directoryPath = '';
    let account = AccountManager.getCurrentAccount();
    let KoraV2_DIR_Name = account?.user?.id || 'KoraV2';
    if (isAndroid) {
      directoryPath =
        RNFetchBlob.fs.dirs.SDCardDir + '/' + KoraV2_DIR_Name + '/';
    } else {
      directoryPath =
        RNFetchBlob.fs.dirs.CacheDir + '/' + KoraV2_DIR_Name + '/';
    }

    var obj = {
      componentFileId: data.componentFileId,
      messageId: messageId,
      localFilePath: null,
      componentType: data.componentType,
      directoryPath: directoryPath,
      filename: data.componentData.filename,
      thumbnailURL: data.thumbnailURL,
    };

    //console.log('Case_1', statusCB);
    checkPermission(obj, statusCB);
  } else {
    //console.log('count :', components.length);
    statusCB(false);
    return false;
  }
};

function checkPermission(obj = null, statusCB) {
  switch (Platform.OS) {
    case 'android':
      return PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ])
        .then((result) => {
          if (
            result['android.permission.READ_EXTERNAL_STORAGE'] &&
            result['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted'
          ) {
            // openSingleMediaView({obj, statusCB});
            //console.log('Case_2', statusCB);
            checkAndDownloadMedia(obj, statusCB);
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
            console.log('PermissionsAndroid Error :');
            statusCB(false);
          }
          // statusCB(false);
        })
        .catch((e) => {
          console.error('ERROR', e);
          statusCB(false);
        });
      break;
    case 'ios':
      // Check iOS permissions
      // openSingleMediaView({obj, statusCB});
      console.log('Case_3', statusCB);
      checkAndDownloadMedia(obj, statusCB);
      break;
    default:
      //console.log('Case_4', statusCB);
      statusCB(false);
  }
}

function openSingleMediaView(obj = null, statusCB) {
  if (obj === null) {
    console.log('obj is NULL');
    //console.log('Case_13', statusCB);
    statusCB(false);
    return false;
  }

  if (!obj.localFilePath) {
    //console.log('Case_14', statusCB);
    statusCB(false);
    return false;
  }

  FileViewer.open('file://' + obj.localFilePath)
    .then(() => {
      // success
      console.log('----------success');
      //console.log('Case_15', statusCB);
      statusCB(true);
    })
    .catch((error) => {
      // error
      // console.log('----------', error);
      // console.log(
      //   'There has been a problem with your FileViewer.open operation: ' +
      //     error.message,
      // );
      //console.log('Case_16 :', statusCB);
      statusCB(false);

      // return this.previewView(obj, index);
      //throw error;
    });
}

function checkAndDownloadMedia(component, statusCB) {
  if (component && component.localFilePath) {
    //console.log('Case_5', statusCB);
    statusCB(false);
    return;
  }
  if (!component?.filename || !component?.componentFileId) {
    //console.log('Case_6', statusCB);
    statusCB(false);
    return;
  }
  var directoryPath = '';
  let account = AccountManager.getCurrentAccount();
  let KoraV2_DIR_Name = account?.user?.id || 'KoraV2';
  if (isAndroid) {
    directoryPath = RNFetchBlob.fs.dirs.SDCardDir + '/' + KoraV2_DIR_Name + '/';
  } else {
    directoryPath = RNFetchBlob.fs.dirs.CacheDir + '/' + KoraV2_DIR_Name + '/';

    //console.log('sdcard path', directoryPath);
  }
  let fileType = component.filename.split('.').pop().toLowerCase();
  let fileId = component.componentFileId;
  let filePath = directoryPath + fileId + '.' + fileType;

  if (filePath)
    RNFetchBlob.fs.exists(filePath).then((exists) => {
      if (exists) {
        //  console.log('This file exist ', filePath);
        //console.log('Case_7', statusCB);
        updateFilePath(component, filePath, statusCB);
        return;
      } else {
        console.log('Downloading start ........................ ', filePath);
        let url =
          API_URL.appServer +
          'api/1.1/ka/users/' +
          UsersDao.getUserId() +
          '/' +
          component.messageId +
          '/' +
          fileId +
          '/signedMediaURL';

        console.log('url : ', url);

        fetch(url, {
          method: 'get',
          headers: new Headers({
            Authorization: 'bearer ' + UsersDao.getAccessToken(),
          }),
        })
          .then((response) => {
            //console.log('response', response);
            return response.json();
          })

          .then((responseJson) => {
            if (responseJson && responseJson?.errors) {
              console.log('responseJson error  -------->>: ', responseJson);
              //console.log('Case_8', statusCB);
              statusCB(false);
              return;
            }
            createOrGetFilePath(
              component,
              directoryPath,
              responseJson,
              fileId,

              true,
              statusCB,
            );
          })
          .catch((error) => {
            // error
            console.log('----------', error);
            console.log(
              'There has been a problem with your fetch url operation: ' +
                error.message,
            );
            //console.log('Case_9', statusCB);
            statusCB(false);
            // ADD THIS THROW error
            //throw error;
          });
      }
    });
}

function createOrGetFilePath(
  component,
  directoryPath,
  response,
  fileId,
  isJustDownloaded = false,
  statusCB,
) {
  return new Promise(function (resolve, reject) {
    RNFetchBlob.fs
      .exists(directoryPath)
      .then((exists) => {
        if (!exists) {
          RNFetchBlob.fs
            .mkdir(directoryPath)
            .then(() => {
              console.log('PATH_TO_CREATE : ' + directoryPath);
              saveFileToInternal(
                component,
                directoryPath,
                response,
                fileId,

                isJustDownloaded,
                statusCB,
              );
            })
            .catch((error) => {
              // error
              console.log('----------', error);
              console.log(
                'There has been a problem with your Mkdir operation: ' +
                  error.message,
              );
              console.log('Case_10', statusCB);
              statusCB(false);
              // ADD THIS THROW error
              // throw error;
            });
        } else {
          saveFileToInternal(
            component,
            directoryPath,
            response,
            fileId,

            isJustDownloaded,
            statusCB,
          );
        }
      })
      .catch((error) => {
        // error
        console.log('----------', error);
        console.log(
          'There has been a problem with your Mkdir _2 operation: ' +
            error.message,
        );
        //console.log('Case_11', statusCB);
        statusCB(false);
        // ADD THIS THROW error
        //  throw error;
      });
  });
}

function updateFilePath(obj, filePath, statusCB) {
  obj.localFilePath = filePath;
  openSingleMediaView(obj, statusCB);
}

//https://github.com/joltup/rn-fetch-blob
async function saveFileToInternal(
  component,
  directoryPath,
  response,
  fileId,
  isJustDownloaded = false,
  statusCB,
) {
  let self = this;
  let fileType = response.filename.split('.').pop().toLowerCase();
  let filePath = directoryPath + fileId + '.' + fileType;

  if (filePath)
    await RNFetchBlob.fs.exists(filePath).then((exists) => {
      if (exists) {
        if (filePath) {
          // console.log('This file exist ', filePath);
          console.log('Case_12', statusCB);
          updateFilePath(component, filePath, statusCB);
        }
      } else {
        RNFetchBlob.config({
          // response data will be saved to this path if it has access right.
          path: filePath,
        })
          .fetch('GET', response.mediaUrl)
          .then((res) => {
            // the path should be dirs.DocumentDir + 'path-to-file.anything'
            console.log('The file saved to ', res.path());
            updateFilePath(component, filePath, statusCB);
          });
      }
    });
}
