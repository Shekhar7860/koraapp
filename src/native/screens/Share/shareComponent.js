import React, {Component} from 'react';
import {StyleSheet, View, Text, Image} from 'react-native';
import VideoPlayer from '../../components/Library/react-native-video-controls';
import ReceiveSharingIntent from 'react-native-receive-sharing-intent';

class ShareComponent extends Component {
  filetypes = {
    audio: ['m4a', 'amr', 'wav', 'aac', 'mp3'],
    video: ['mp4', 'mov', '3gp', 'flv'],
    image: ['png', 'jpg', 'jpeg'],
    doc: ['doc', 'docx', 'pdf', 'ppt', 'pptx', 'txt', 'html'],
  };

  getReceivedFileObject() {
    let fileObj = this.props.route.params?.sharedFiles?.files[0] || null;
    try {
      if (
        fileObj !== null &&
        fileObj.contentUri !== null &&
        fileObj.contentUri !== undefined
      ) {
        //shared from from internal storage
        var fileName = fileObj.fileName;
        var lastword = fileName.split('.').pop();
        console.log('split word-----------------------', lastword);
        if (
          this.filetypes.audio.indexOf(fileObj.extension) !== -1 ||
          this.filetypes.audio.indexOf(lastword) !== -1
        ) {
          // console.log('-----AUDIO RECEIVED--------', JSON.stringify(fileObj));
          return <Text>Audio Received:{fileObj.fileName}</Text>;
        } else if (
          this.filetypes.video.indexOf(fileObj.extension) !== -1 ||
          this.filetypes.video.indexOf(lastword) !== -1
        ) {
          // console.log('-----VIDEO RECEIVED--------', JSON.stringify(fileObj));

          return (
            <VideoPlayer
              source={{uri: fileObj.contentUri}}
              videoWidth={1}
              videoHeight={2}
              resizeMode="contain"
              disableVolume={true}
              disableFullscreen={true}
              disableBack={true}
              onError={(err) => {
                console.log('Error', err);
              }}
              // controlsTimeout={true}
              fullScreenOnLongPress={true}
              /*  thumbnail={{uri: obj.uri}} */
            />
          );
        } else if (
          this.filetypes.image.indexOf(fileObj.extension) !== -1 ||
          this.filetypes.image.indexOf(lastword) !== -1
        ) {
          // console.log('-----Image RECEIVED--------', JSON.stringify(fileObj));
          return (
            <Image
              source={
                fileObj.contentUri
                  ? {uri: fileObj.contentUri}
                  : require('../../assets/profile.png')
              }
              style={styles.imageStyle}
            />
          );
        } else if (
          this.filetypes.doc.indexOf(fileObj.extension) !== -1 ||
          this.filetypes.doc.indexOf(lastword) !== -1
        ) {
          return <Text>attached document: {fileObj.fileName}</Text>;
        } else {
          return (
            <Text>
              From local storage unsupported/unhandled file:: {fileObj.fileName}
            </Text>
          );
        }
      } else {
        if (fileObj !== null) {
          if (fileObj.weblink !== null && fileObj.weblink !== undefined) {
            return <Text>URL : {fileObj.weblink}</Text>;
          } else if (fileObj.text !== null && fileObj.text !== undefined) {
            return <Text>{fileObj.text}</Text>;
          } else {
            return <Text>New supported File</Text>;
          }
        }
      }
    } catch (e) {
      console.log('Eroor', e);
    } finally {
      ReceiveSharingIntent.clearReceivedFiles();
      console.log('clearing received intent', '------------------');
    }
  }
  constructor(props) {
    super(props);
  }
  render() {
    var flag = true;
    return <View style={{padding: 20}}>{this.getReceivedFileObject()}</View>;
  }
}
const styles = StyleSheet.create({
  imageStyle: {
    height: 400,
    width: '100%',
  },
});
export default ShareComponent;
