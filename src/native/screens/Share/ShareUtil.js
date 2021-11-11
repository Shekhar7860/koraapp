import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  TextInput,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import {isIOS} from '../../utils/PlatformCheck';
import RNFS from 'react-native-fs';
export const getPath = (fileObj) => {
  if (fileObj?.contentUri.startsWith('content://')) {
    return RNFetchBlob.fs
      .stat(fileObj.contentUri)
      .then((info) => info)
      .catch((err) => console.log('-----', err.message));
  }
  return fileObj;
};
class ShareUtil {
  filetypes = {
    audio: ['m4a', 'amr', 'wav', 'aac', 'mp3'],
    video: ['mp4', 'mov', '3gp', 'flv'],
    image: ['png', 'jpg', 'jpeg'],
    doc: ['doc', 'docx', 'pdf', 'ppt', 'pptx', 'txt', 'html'],
  };

  getReceivedFileObject = async (fileObjArray) => {
    //console.log('fileObj  --------->>: ', fileObjArray);
    let fileObj=fileObjArray;
   /*  if(!isIOS){
      fileObj=fileObjArray[0];
    } */
    try {
      if (
        fileObj !== null &&
        fileObj.contentUri !== null &&
        fileObj.contentUri !== undefined
      ) {
        // return 'This file is not handled';
        //shared from from internal storage
        var fileName = fileObj.fileName;
        var lastword = fileName.split('.').pop();
        let newObject = await getPath(fileObj);
        //console.log('newObject_123  --------->>: ', newObject);
        let size = 0;
        var coUri = fileObj?.contentUri;
        if (newObject) {
          size = newObject?.size || 0;
          coUri = newObject?.path
            ? 'file://' + newObject?.path
            : fileObj?.contentUri;
        }
        //console.log('fileObj_1  --------->>: ', fileObj);
        //console.log('fileObj?.extension  --------->>: ', fileObj?.extension);


        if (isIOS) {
          coUri = fileObj.filePath;
        }
        console.log('file type', this.filetypes);
        if (
          this.filetypes.audio.indexOf(fileObj?.extension) !== -1 ||
          this.filetypes.audio.indexOf(lastword) !== -1
        ) {
          //console.log('Case_1');
          let audioObject = {
            name: fileObj.fileName,
            uri: coUri,
            fileCopyUri: coUri,
            type: 'audio/' + lastword,
            mType: 'audio',
            size: size,
          };

          return audioObject;
        } else if (
          this.filetypes.video.indexOf(fileObj?.extension?.toLowerCase()) !==
            -1 ||
          this.filetypes.video.indexOf(lastword) !== -1
        ) {
          //console.log('Case_2');
          let videoObject = {
            name: fileObj.fileName,
            uri: coUri,
            fileCopyUri: coUri,
            size: size,
            type: 'video/' + lastword,
            mType: 'video',
          };

          return videoObject;
        } else if (
          this.filetypes.image.indexOf(fileObj?.extension?.toLowerCase()) !==
            -1 ||
          this.filetypes.image.indexOf(lastword) !== -1
        ) {
          //console.log('Case_3');
          let imageObject = {
            fileCopyUri: coUri,
            name: fileObj.fileName,
            mType: 'image',
            type: 'image/' + lastword,
            uri: coUri,
            size: size,
          };

          return imageObject;
        } else if (
          this.filetypes.doc.indexOf(fileObj?.extension) !== -1 ||
          this.filetypes.doc.indexOf(lastword) !== -1
        ) {
          //console.log('Case_4');
          let attachment = {
            name: fileObj.fileName,
            uri: coUri,
            fileCopyUri: coUri,
            mType: 'attachment',
            type: 'application/' + lastword,
            size: size,
          };
          //console.log('attachment  ----->:',attachment);
          return attachment;
          //return <Text>attached document: {fileObj.fileName}</Text>;
        } else {
          //console.log('Case_5');
          let attachment = {
            name: fileObj.fileName,
            uri: coUri,
            fileCopyUri: coUri,
            mType: 'attachment',
            type: 'application/' + lastword,
            size: size,
          };
          return attachment;
          // return <Text>From local storage unsupported/unhandled file:: {fileObj.fileName}</Text>;
        }
      } else {
        //console.log('Case_6');
        if (fileObj !== null) {
          if (fileObj.weblink !== null && fileObj.weblink !== undefined) {
            let urlObject = {
              uri: fileObj.weblink,
              type: 'url',
              mType: 'url',
            };
            return urlObject;
          } else if (
            fileObj.text !== null &&
            fileObj.text !== undefined
          ) {
            let textObject = {
              uri: fileObj.text,
              type: 'txt',
              mType: 'txt',
            };
            return textObject;

            //  return fileObj.text;
          } else {
            //console.log('Case_7');
            return <Text>file not supported</Text>;
          }
        }
      }
    } catch (e) {
      console.log('Error --------->>: ', e);
    } finally {
    }
  };
}
export default new ShareUtil();
