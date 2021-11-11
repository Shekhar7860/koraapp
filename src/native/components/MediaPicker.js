/* eslint-disable prettier/prettier */
import {PermissionsAndroid, Alert, Linking} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import {navigate} from '../navigation/NavigationService';
import {isAndroid, isIOS} from '../utils/PlatformCheck';
import {requestMultiple, PERMISSIONS} from 'react-native-permissions';
import {ROUTE_NAMES} from '../navigation/RouteNames';
import * as FileUtilities from '../utils/file-utilities';
import {APP_NAME} from '../utils/AppConstants';
import AccountManager from '../../shared/utils/AccountManager';

export function openMediaPicker(
  type,
  propsData = null,
  cb = () => {},
  newThreadData = null,
  boardID = null,
  mszText = '',
  fromProfile = false,
  returnToTable = (item) => {},
  onMediaUploadedCB = null,
  isFromNewDR = false,
) {
  if (isAndroid) {
    PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ]).then((result) => {
      if (
        result['android.permission.CAMERA'] &&
        result['android.permission.READ_EXTERNAL_STORAGE'] &&
        result['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted'
      ) {
        picksingleFile(
          type,
          propsData,
          cb,
          newThreadData,
          boardID,
          mszText,
          fromProfile,
          returnToTable,
          onMediaUploadedCB,
          isFromNewDR,
        );
      } else if (
        result['android.permission.CAMERA'] ||
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
      }
    });
  } else if (isIOS) {
    requestMultiple([
      PERMISSIONS.IOS.CAMERA,
      PERMISSIONS.IOS.PHOTO_LIBRARY,
    ]).then((result) => {
      if (
        result[PERMISSIONS.IOS.CAMERA] &&
        result[PERMISSIONS.IOS.PHOTO_LIBRARY] === 'granted'
      ) {
        picksingleFile(
          type,
          propsData,
          cb,
          newThreadData,
          boardID,
          mszText,
          fromProfile,
          returnToTable,
          onMediaUploadedCB,
        );
      } else if (
        result[PERMISSIONS.IOS.CAMERA] ||
        result[PERMISSIONS.IOS.PHOTO_LIBRARY] === 'blocked'
      ) {
        Alert.alert(
          'alert',
          'Please Go into Settings -> Applications -> ' +
            APP_NAME +
            ' -> Permissions and Allow permissions to continue',
        );
      }
    });
  }
}

export async function picksingleFile(
  types,
  propsData = null,
  cb,
  newThreadData = null,
  boardID = null,
  mszText = '',
  fromProfile = false,
  returnToTable = (item) => {},
  onMediaUploadedCB = null,
  isFromNewDR = false,
) {
  try {
    const results = await DocumentPicker.pickMultiple({
      type: types,
      copyTo: isAndroid ? 'documentDirectory' : 'cachesDirectory',
      mode: 'import',
    });

    let components = [];
    let allPromises = [];
    let account = AccountManager.getCurrentAccount();
    let userId = account?.user?.id;
    for (const result of results) {
      let fileExtension = result?.name?.split('.').pop().toLowerCase();
      let uuid = FileUtilities.getUUID(FileUtilities.Asset.attachment);
      let filePath = FileUtilities.path(
        uuid,
        FileUtilities.Asset.attachment,
        fileExtension,
        userId,
      );

      let promise = new Promise((resolve, reject) => {
        let fileUri = decodeURI(result?.uri.replace('file://', ''));
        FileUtilities.copyItem(fileUri, filePath)
          .then(() => {
            let component = result;
            if (isAndroid) {
              component.uri = 'file://' + result?.fileCopyUri;
              component.path = 'file://' + result?.fileCopyUri;
            } else {
              component.uri = decodeURI(result?.fileCopyUri);
              component.path = filePath;
            }
            components.push(component);
            resolve(component);
          })
          .catch((error) => {
            console.log('COPY ITEM ERROR', error);
            reject(error);
          });
      });
      allPromises.push(promise);
    }

    Promise.all(allPromises)
      .then((values) => {
        if (fromProfile) {
          returnToTable(values);
        } else if (
          isFromNewDR &&
          onMediaUploadedCB &&
          typeof onMediaUploadedCB === 'function'
        ) {
          onMediaUploadedCB(values);
        } else {
          navigate(ROUTE_NAMES.MEDIA_PREVIEW, {
            mediaList: values,
            boardData: propsData,
            newThreadData: newThreadData,
            boardDataId: boardID,
            mszText: mszText,
            onMediaUploadedCB: null,
          });
        }
        cb();
      })
      .catch((e) => {
        console.log('ERROR', e);
      });
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      // User cancelled the picker, exit any dialogs or menus and move on
      console.log(err);
    } else {
      console.log('DocumentPicker.isCancel(err)', err);
      throw err;
    }
    cb();
  }
}
