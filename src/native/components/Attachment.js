/* eslint-disable prettier/prettier */
import React, {Component, createRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Platform,
  TouchableHighlight,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import {openMediaPicker} from './MediaPicker';
import {Icon} from '../components/Icon/Icon.js';
import * as Constants from './KoraText';
import {normalize} from '../utils/helpers';
import ImagePicker from 'react-native-image-crop-picker';
import {request, PERMISSIONS} from 'react-native-permissions';
import {isAndroid} from '../utils/PlatformCheck';
import ActionSheet from 'react-native-actions-sheet';

const array = [
  {icon: 'image', name: 'Media', key: 4},
  {icon: 'Files', name: 'Files', key: 2},
];
const mediaPreview = [...array, {icon: 'Camera', name: 'Camera', key: 3}];

const removePhoto = [{icon: 'Delete_T', name: 'Remove Photo', key: 6}];

const arrayAfterPressMedia = [
  {icon: 'Camera', name: 'Take Photo', key: 7},
  {icon: 'Playbutton', name: 'Take Video', key: 8},
];
const arrayForProfile = [
  {icon: 'Camera', name: 'Take Photo', key: 7},
  {icon: 'Files', name: 'From Photos', key: 9},
];

export default class Attach extends Component {
  mszText = '';
  state = {
    toggleStatePanelVisibility: false,
    openDrawerType: 'default',
    draggablePanelHeight: 230,
  };
  actionSheetRef = createRef();

  handleItemClick = (element) => {
    if (this.props.onResetComposeBar) {
      this.props.onResetComposeBar();
    }
    switch (element.key) {
      case 1:
        this.setState({openDrawerType: 'profile'});
        this.openModal(this.mszText);
        break;
      case 2:
        openMediaPicker(
          [
            DocumentPicker.types.audio,
            DocumentPicker.types.csv,
            DocumentPicker.types.doc,
            DocumentPicker.types.docx,
            DocumentPicker.types.pdf,
            DocumentPicker.types.plainText,
            DocumentPicker.types.ppt,
            DocumentPicker.types.pptx,
            DocumentPicker.types.video,
            DocumentPicker.types.xls,
            DocumentPicker.types.xlsx,
            DocumentPicker.types.zip,
          ],
          this.props.boardData,
          () => this.closeBottomDrawer(),
          this.props.newThreadData,
          this.props.boardID,
          this.mszText,
        );
        break;
      case 3:
        if (isAndroid) {
          this.setState({openDrawerType: 'camera'});
          this.openModal(this.mszText);
        } else {
          this.setState({openDrawerType: 'camera'});
          this.openModal(this.mszText);
        }
        break;
      case 4:
        this.setState({openDrawerType: 'default'});
        switch (Platform.OS) {
          case 'android':
            request(
              PERMISSIONS.IOS.PHOTO_LIBRARY,
              PERMISSIONS.IOS.MEDIA_LIBRARY,
            ).then((result) => {
              openMediaPicker(
                this.props.fromProfile
                  ? [DocumentPicker.types.images]
                  : [DocumentPicker.types.images, DocumentPicker.types.video],
                this.props.boardData,
                () => this.closeBottomDrawer(),
                this.props.newThreadData,
                this.props.boardID,
                this.mszText,
                this.props.fromProfile,
                (item) => {
                  if (this.props.cameraAction) {
                    let currentImage = item[0];
                    if (
                      currentImage?.name == null ||
                      currentImage?.name === undefined
                    ) {
                      let fileName = currentImage?.path?.split('/').pop();
                      currentImage = {...currentImage, filename: fileName};
                    }
                    this.props.cameraAction([currentImage], this.mszText);
                  }
                },
                (items) => {
                  if (this.props.cameraAction) {
                    //start
                    let elements = items.map((item) => {
                      let currentImage = item;
                      if (
                        currentImage?.filename == null ||
                        currentImage?.filename === undefined
                      ) {
                        let fileName = currentImage?.path?.split('/').pop();
                        currentImage = {
                          ...currentImage,
                          filename: fileName,
                          mime: currentImage.type,
                        };
                      }
                      return currentImage;
                    });
                    //end
                    this.props.cameraAction(elements, this.mszText);
                  }
                },
                this.props.isFromNewDR,
              );
            });
            break;
          case 'ios':
            ImagePicker.openPicker({
              multiple: true,
              maxFiles: 50,
              compressImageQuality: 0.8,
              compressVideoPreset: 'HighestQuality',
              forceJpg: true,
            }).then((response) => {
              let images = [];
              response.map((image) => {
                if (!image?.mime?.startsWith('video')) {
                  let filename = response?.filename?.split('.HEIC')[0] + '.jpg';
                  image = {...image, filename: filename};
                }
                images.push(image);
              });
              this.closeBottomDrawer();
              if (this.props.cameraAction) {
                this.props.cameraAction(images, this.mszText);
              }
            });
            break;
          default:
            break;
        }
        break;
      case 6:
        this.props.removePhotoAction();
        break;
      case 7:
        ImagePicker.openCamera({
          mediaType: 'any',
          forceJpg: true,
        }).then((image) => {
          this.closeBottomDrawer();
          if (this.props.cameraAction) {
            let currentImage = image;
            if (
              currentImage?.filename == null ||
              currentImage?.filename === undefined
            ) {
              let fileName = currentImage?.path?.split('/').pop();
              currentImage = {...currentImage, filename: fileName};
            }
            this.props.cameraAction([currentImage], this.mszText);
          }
        });
        break;
      case 8:
        ImagePicker.openCamera({
          mediaType: 'video',
          forceJpg: true,
        }).then((image) => {
          this.closeBottomDrawer();
          if (this.props.cameraAction) {
            let currentImage = image;
            if (
              currentImage?.filename == null ||
              currentImage?.filename === undefined
            ) {
              let fileName = currentImage?.path?.split('/').pop();
              currentImage = {...currentImage, filename: fileName};
            }
            this.props.cameraAction([currentImage], this.mszText);
          }
        });
        break;
      case 9:
        this.setState({openDrawerType: 'default'});
        switch (Platform.OS) {
          case 'android':
            request(
              PERMISSIONS.IOS.PHOTO_LIBRARY,
              PERMISSIONS.IOS.MEDIA_LIBRARY,
            ).then((result) => {
              openMediaPicker(
                this.props.fromProfile
                  ? [DocumentPicker.types.images]
                  : [DocumentPicker.types.images, DocumentPicker.types.video],
                this.props.boardData,
                () => this.closeBottomDrawer(),
                this.props.newThreadData,
                this.props.boardID,
                this.mszText,
                this.props.fromProfile,
                (item) => {
                  if (this.props.cameraAction) {
                    let currentImage = item[0];
                    if (
                      currentImage?.name == null ||
                      currentImage?.name === undefined
                    ) {
                      let fileName = currentImage?.path?.split('/').pop();
                      currentImage = {...currentImage, filename: fileName};
                    }
                    this.props.cameraAction([currentImage], this.mszText);
                  }
                },
              );
            });
            break;
          case 'ios':
            ImagePicker.openPicker({
              multiple: false,
              mediaType: 'photo',
            }).then((response) => {
              let images = [];
              let filename = response?.filename?.split('.HEIC')[0] + '.jpg';
              image = {...response, filename: filename};
              images.push(image);
              this.closeBottomDrawer();
              if (this.props.cameraAction) {
                this.props.cameraAction(images, this.mszText);
              }
            });
          default:
            break;
        }
        break;
        case 10:
        this.setState({openDrawerType: 'default'});
        switch (Platform.OS) {
          case 'android':
            request(
              PERMISSIONS.IOS.PHOTO_LIBRARY,
              PERMISSIONS.IOS.MEDIA_LIBRARY,
            ).then((result) => {
              openMediaPicker(
                
                 [DocumentPicker.types.images]
                  ,
               
                () => this.closeBottomDrawer(),
             
            
           
                (item) => {
                  if (this.props.cameraAction) {
                    let currentImage = item[0];
                    if (
                      currentImage?.name == null ||
                      currentImage?.name === undefined
                    ) {
                      let fileName = currentImage?.path?.split('/').pop();
                      currentImage = {...currentImage, filename: fileName};
                    }
                    this.props.cameraAction([currentImage], this.mszText);
                  }
                },
              );
            });
            break;
          case 'ios':
            ImagePicker.openPicker({
              multiple: false,
              mediaType: 'photo',
            }).then((response) => {
              // console.log('response for profile image', response);
              let images = [];
              // response.map((image) => {
              let filename = response?.filename?.split('.HEIC')[0] + '.jpg';
              image = {...response, filename: filename};
              images.push(image);
              // });
              this.closeBottomDrawer();
              // console.log(
              //   'response for profile image',
              //   response,
              //   this.props.cameraAction,
              // );
              if (this.props.cameraAction) {
                this.props.cameraAction(images, this.mszText);
              }
            });
          default:
            break;
        }
        break;
    }
  };

  list = (listData) => {
    return listData.map((element) => {
      return (
        <TouchableHighlight
          underlayColor="rgba(0,0,0,0.08)"
          key={element.key}
          style={styles.opacityStyle}
          activeOpacity={0.5}
          onPress={() => {
            this.closeBottomDrawer();
            setTimeout(() => this.handleItemClick(element), 1200);
          }}>
          <View style={styles.imageIconStyle1}>
            <View style={styles.imageIconStyle}>
              <Icon name={element.icon} size={normalize(21)} color="#202124" />
            </View>
            <Text style={styles.nameTextStyle}> {element.name} </Text>
          </View>
        </TouchableHighlight>
      );
    });
  };

  renderModalContent = (listData, title) => (
    <View>
      <View style={styles.modalContent}>
        <Text style={styles.textStyle}>{title}</Text>
        <View style={styles.modalStyle1} />
        <View style={styles.viewStyle}>{this.list(listData)}</View>
        <View style={styles.modalStyle2} />
      </View>
    </View>
  );

  openModal(mszText = '') {
    this.mszText = mszText;
    this.actionSheetRef.current?.setModalVisible();
    this.setState({toggleStatePanelVisibility: true});
  }

  setText(mszText = '') {
    this.mszText = mszText;
  }

  closeBottomDrawer() {
    this.actionSheetRef.current?.hide();
    this.setState({toggleStatePanelVisibility: false});
  }

  render() {
    var dataToRender = [];
    var title = '';
    if (this.state.openDrawerType === 'default') {
      if (this.props.mediaPreview) {
        dataToRender = mediaPreview;
      } else {
        dataToRender = array;
      }
      title = 'Attachment';
    } else if (this.state.openDrawerType === 'profile') {
      let profile = this.props.profile;

      if (
        this.props.fromProfile &&
        profile?.icon !== null &&
        profile.icon !== undefined &&
        profile?.icon !== 'no-avatar'
      ) {
        dataToRender = [...arrayForProfile, ...removePhoto];
      } else {
        dataToRender = arrayForProfile;
      }
      title = 'Choose from camera or gallery';
    } else {
      dataToRender = arrayAfterPressMedia;
      title = ' Take photo or video';
    }

    return (
      <View style={styles.container}>
        <ActionSheet
          ref={this.actionSheetRef}
          defaultOverlayOpacity={0.3}
          gestureEnabled={false}
          onClose={() =>
            this.setState({
              openDrawerType: 'default',
            })
          }>
          {this.renderModalContent(dataToRender, title)}
        </ActionSheet>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 5,
    borderRadius: 15,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  textStyle: {
    padding: 15,
    color: '#202124',
    fontSize: normalize(16),
    fontWeight: 'bold',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  viewStyle: {
    padding: 5,
  },
  modalStyle1: {
    borderWidth: 0.4,
    borderColor: '#FFFFFF',
    shadowColor: '#E4E5E7',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 1,
    shadowRadius: 0,

    elevation: 5,
  },
  modalStyle2: {padding: 10},
  opacityStyle: {
    minHeight: 40,
    borderRadius: 5,
    paddingVertical: 5,
  },
  imageIconStyle1: {
    flexDirection: 'row',
    paddingStart: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  imageIconStyle: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameTextStyle: {
    fontSize: normalize(16),
    fontWeight: '400',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#202124',
  },
});
