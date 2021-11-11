import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  ImageBackground,
  TextInput,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import {isAndroid} from '../../utils/PlatformCheck';
import VideoPlayer from '../../components/Library/react-native-video-controls';
import {Icon} from '../../components/Icon/Icon.js';
import {normalize} from '../../utils/helpers';
import {generateThumbnail} from '../../../helpers';
import {connect} from 'react-redux';
import {goBack} from '../../navigation/NavigationService';
import * as Constants from '../../components/KoraText';
import {sendMessage} from '../../../shared/redux/actions/message-thread.action';
import {
  createPost,
  editPost,
  replyComment,
  replyPost,
} from '../../../shared/redux/actions/discussions.action';
import {createNewThread} from '../../../shared/redux/actions/message-preview.action';
import KoraKeyboardAvoidingView from '../../components/KoraKeyboardAvoidingView';
import Attach from '../../components/Attachment.js';
import Camera from '../../components/CameraModal.js';
import BackButton from '../../components/BackButton';
import * as UsersDao from '../../../dao/UsersDao';
import {Loader} from '../ChatsThreadScreen/ChatLoadingComponent';
import FileIcon from '../findly/singleItem/FileIcon';
import * as BoardsDao from '../../../dao/BoardsDao';
import MessageUploadQueue from '../FileUploader/MessageUploadQueue';
import {store} from '../../../shared/redux/store';
const dimension = Dimensions.get('window');
import * as Type from '../../../shared/redux/constants/message-preview.constants';
import {boardPayload, messagePayload, postPayload} from '../../../helpers';
import FastImage from 'react-native-fast-image';
import PagerView from 'react-native-pager-view';

import {replyToPrivate} from '../../../shared/redux/actions/message-preview.action';
import {upsertNewMessage} from '../../../dao/updateMessages';
import {upsertNewPost} from '../../../dao/updatePosts';

import {createNewBoard} from '../../../shared/redux/actions/message-board.action';

class MediaPreview extends Component {
  viewPager = null;
  dataSourceCords = [];
  scrollViewRef = null;
  audioFilePath = '';

  constructor(props) {
    super(props);
    this.state = {
      mediaList: [],
      selectedObj: null,
      inputTextValue: '',
      loader: false,
      boardData: null,
      uploadProgress: null,
      uploadPreogressMap: {},
      boardDataId: null,
      isSendButtonDisabled: false,
      newThreadData: null,
      mszText: '',
    };
    this.viewPager = React.createRef();
  }

  componentDidMount() {
    const {route} = this.props;
    console.log('params : ', route.params);
    this.generateThumbnail(route.params.mediaList);
    this.setState({
      mediaList: route.params.mediaList,
      boardData: route.params.boardData,
      boardDataId: route.params.boardDataId,
      newThreadData: route.params.newThreadData,
      inputTextValue: route.params.mszText,
    });
    if (route.params.boardData?.components) {
      const components = route.params.boardData?.components;
      const text = components
        ?.filter((obj) => obj.componentType === 'text')
        ?.map((obj) => obj.componentBody)
        ?.join(' ');
      this.setState({inputTextValue: text});
    }
    {
      route.params.caption
        ? this.setState({inputTextValue: route.params.caption})
        : null;
    }
  }

  generateThumbnail(mediaList) {
    var mediaListWithThumbnail = [];
    const promisesArray = mediaList.map((media) => {
      return new Promise((resolve) => {
        generateThumbnail(media.uri, media.type, (response) => {
          let path = isAndroid ? 'file://' + response.path : response.path;
          mediaListWithThumbnail.push({...media, thumbNail: path});
          resolve(mediaListWithThumbnail);
        });
      });
    });
    try {
      Promise.all(promisesArray).then((values) => {
        this.setState({mediaList: mediaListWithThumbnail});
      });
    } catch (e) {
      console.error(e);
    }
  }

  handleResolvedC = (mediaListWithThumbnail) => {
    this.setState({mediaList: mediaListWithThumbnail});
  };

  handleRejectedAny = () => {};

  componentDidUpdate(prevProps) {
    const {route} = this.props;
    if (
      prevProps.route.params.mediaList !== this.props.route.params.mediaList
    ) {
      let newMediaList = Array.isArray(route.params.mediaList)
        ? [...this.state.mediaList, ...route.params.mediaList]
        : this.state.mediaList;
      this.setState({mediaList: newMediaList});
    }
  }

  componentWillUnmount() {}

  getSelectedObj = () => {
    let obj = this.state.selectedObj;
    if (!obj && this.state.mediaList?.length > 0) {
      obj = this.state.mediaList[0];
    }
    return obj;
  };

  onMediaDelete = () => {
    var array = [...this.state.mediaList]; // make a separate copy of the array
    let index = array.indexOf(this.getSelectedObj());

    if (index !== -1) {
      array.splice(index, 1);
      const totalMedia = array.length;
      if (totalMedia === 0) {
        this.props.navigation.goBack();
      } else {
        if (totalMedia === index) {
          index--;
        }
        this.setState({
          mediaList: array,
          selectedObj: array[index],
        });
      }
    }
  };

  previewNewView(obj, index) {
    return (
      <View key={index} style={styles.previewNewView1}>
        {this.previewView(obj)}
      </View>
    );
  }

  previewView(obj = null) {
    if (!obj) {
      return null;
    }
    const type = obj ? obj.type : '';
    if (type.includes('image')) {
      return (
        <Image
          source={obj ? {uri: obj.uri} : require('../../assets/profile.png')}
          style={styles.imageStyle}
          resizeMode={'contain'}
        />
      );
    } else if (type.includes('video')) {
      return (
        <VideoPlayer
          source={{uri: obj.uri}}
          videoWidth={1}
          videoHeight={2}
          resizeMode="contain"
          disableVolume={true}
          disableFullscreen={true}
          disableBack={true}
          onError={(err) => {
            console.log('Error', err);
          }}
          paused={true}
          tapAnywhereToPause={true}
          // controlsTimeout={true}
          fullScreenOnLongPress={true}
          thumbnail={{uri: obj.thumbnailURL}}
        />
      );
    } else {
      const name = obj?.name || obj.filename || '';
      return <FileIcon type={name.split('.').pop().toLowerCase()} />;
    }
  }

  scrollHandler = (scrollToIndex) => {
    if (this.scrollViewRef && this.dataSourceCords.length > scrollToIndex) {
      this.scrollViewRef.scrollTo({
        y: 0,
        x: this.dataSourceCords[scrollToIndex] - 150,
        animated: true,
      });
    }
  };

  singleSection = (item, key) => {
    return (
      <View
        key={key}
        style={styles.item}
        onLayout={(event) => {
          const layout = event.nativeEvent.layout;
          this.dataSourceCords[key] = layout.x;
        }}>
        {this.singleItem(item, key)}
      </View>
    );
  };

  singleItem = (data, index) => {
    let isSelected = false;
    if (this.state.selectedObj && data.name === this.state.selectedObj.name) {
      isSelected = true;
    }

    return (
      <TouchableOpacity
        onPress={() => {
          this.viewPager?.current?.setPage(index);
          this.scrollHandler(index);

          this.setState({
            selectedObj: data,
          });
        }}>
        <View
          style={{
            marginLeft: 16,
            backgroundColor: isSelected ? 'white' : 'black',
            alignItems: 'center',
            padding: 2,
            borderRadius: 4,
          }}>
          {this.getSelctionImage(data)}
        </View>
      </TouchableOpacity>
    );
  };

  getSelctionImage = (data) => {
    const type = data ? data.type : '';
    if (type.includes('image')) {
      return (
        <ImageBackground
          source={{uri: data.uri}}
          style={styles.selectionImage1}
        />
      );
    } else if (type.includes('video')) {
      return (
        <View style={styles.videoContainer}>
          <View style={styles.videoIconContainer}>
            <Icon name={'PlayWhite'} size={24} color={'#6182b0'} />
          </View>
          <FastImage
            source={{uri: data.thumbNail}}
            style={styles.selectionImage2}
          />
        </View>
      );
    } else if (type.length > 0) {
      const name = data?.name || data.filename || '';
      return (
        <ImageBackground style={styles.selectionImage3}>
          <FileIcon type={name.split('.').pop().toLowerCase()} />
        </ImageBackground>
      );
    }
  };

  onComposebarTextChange(text) {
    this.setState({inputTextValue: text});
  }

  checkThumbNail() {}

  async handleSendAction() {
    let inputTextValue = this.state.inputTextValue;
    let mediaList = this.state.mediaList;
    if (this.props.route?.params.onMediaUploadedCB) {
      this.props.route?.params.onMediaUploadedCB({
        text: inputTextValue,
        mediaList,
        post: this.props.route?.params?.boardData?.post,
      });
      goBack();
      return;
    }

    let board = this.state.boardData;
    switch (board?.type) {
      case 'document':
      case 'table':
      case 'discussion':
      case 'embeddedweb':
      case 'file': {
        this.sendPostAction();
        break;
      }
      case 'directChat':
      case 'groupChat':
      default: {
        this.sendMessageAction();
        break;
      }
    }
  }

  sendPostAction() {
    let inputTextValue = this.state.inputTextValue;
    let mediaList = this.state.mediaList;
    const {_id, postId, id} = this.state.boardData;
    if (this.props.route?.params.onMediaUploadedCB) {
      this.props.route?.params.onMediaUploadedCB({
        text: inputTextValue,
        mediaList,
      });
      return;
    }

    postPayload(
      {
        toList: [],
        boardId: _id,
        board_id: id,
        mediaList: mediaList,
        data: {text: inputTextValue},
        postId: postId,
      },
      (payload) => {
        upsertNewPost(payload)
          .then((nPost) => {
            MessageUploadQueue.addPost(nPost, this.board);
            goBack();
          })
          .catch((error) => {
            console.log('exception in upsertNewPost: ' + error);
          });
      },
    );
  }

  sendMessageAction() {
    let replyObj = this.props.reply || this.props.replyPrivate;
    const {_id, id} = this.state.boardData;
    let mediaList = this.state.mediaList;
    let newThreadData = this.state.newThreadData;
    let inputTextValue = this.state.inputTextValue;

    store.dispatch(replyToPrivate());

    if (newThreadData && newThreadData?.isNewChat) {
      let toList = newThreadData.contactData;
      let topicName = newThreadData?.topicName;
      messagePayload(
        {
          toList: toList,
          boardId: _id,
          board_id: id,
          mediaList: mediaList,
          data: {text: inputTextValue},
          replyObj: replyObj,
        },
        (message) => {
          let boardObject = boardPayload({
            toList: toList,
            topicName: topicName,
            message: message,
          });
          BoardsDao.upsertNewBoard(boardObject)
            .then(({nMessage, nBoard}) => {
              MessageUploadQueue.addMessage(nMessage, nBoard);
              this.props.createNewBoard(nBoard?.id);

              // store.dispatch({
              //   type: Type.CREATE_NEW_THREAD_SUCCESSFUL,
              //   payload: nBoard,
              // });
              goBack();
            })
            .catch((error) => {
              console.error('exception in upsertNewBoard: ' + error);
            });
        },
      );
    } else {
      messagePayload(
        {
          toList: [],
          boardId: _id,
          board_id: id,
          replyObj: replyObj,
          mediaList: mediaList,
          data: {text: inputTextValue},
        },
        (payload) => {
          upsertNewMessage(payload)
            .then((nMessage) => { 
              MessageUploadQueue.addMessage(nMessage);
              goBack();
            })
            .catch((error) => {
              console.error('exception in upsertNewMessage: ' + error);
            });
        },
      );
    }
  }

  getUID = (pattern) => {
    var _pattern = pattern || 'xxxxyx';
    _pattern = _pattern.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    return _pattern;
  };

  imageUpload = (image) => {
    return new Promise((resolve, reject) => {
      let userId = UsersDao.getUserId();
      let userAccessToken = UsersDao.getAccessToken();
      let mediaName = this.getUID();
      let obj = {};

      if (image.name == null) {
        let path = image.fileCopyUri;
        image.name = path.substring(path.lastIndexOf('/') + 1);
      }

      const uploader = new FileUploader(
        image,
        userId,
        'message',
        userAccessToken,
        mediaName,
      );

      uploader.start(
        (progress) => {
          let {uploadPreogressMap} = this.state;
          uploadPreogressMap[image.name] = progress;
          this.setState({uploadPreogressMap});
        },
        (success) => {
          obj.status = 200;
          obj.response = JSON.parse(success);
          resolve(obj.response);
        },
        function (onError) {
          reject(onError);
        },
      );
    });
  };

  onPageSelected = (event) => {
    let obj = this.state.mediaList[event.nativeEvent.position];
    this.scrollHandler(event.nativeEvent.position);
    this.setState({
      selectedObj: obj,
    });
  };

  getAllPreviews = () => {
    return Array.isArray(this.state.mediaList) ? (
      this.state.mediaList.map((data, index) => {
        return this.previewNewView(data, index);
      })
    ) : (
      <></>
    );
  };

  //https://github.com/callstack/react-native-viewpager/blob/master/example/src/App.tsx
  mediaPager = () => {
    return (
      <PagerView
        ref={this.viewPager}
        style={styles.viewPager1}
        onPageSelected={this.onPageSelected}
        showPageIndicator={false}
        overScrollMode="always"
        // Lib does not support dynamically orientation change
        orientation="horizontal"
        // Lib does not support dynamically transitionStyle change
        transitionStyle="scroll"
        keyboardDismissMode="on-drag"
        scrollEnabled={true}
        pageMargin={10}
        initialPage={0}>
        {this.getAllPreviews()}
      </PagerView>
    );
  };

  handleCameraAction(images) {
    this.selectFile(images);
  }

  handleCameraActionFromAttachment(images) {
    this.selectFile(images);
  }

  selectFile = (images, mszText = '') => {
    console.log('select files', images);
    try {
      let imageArray = [];
      images.forEach(function (image) {
        let imageJson = {
          fileCopyUri: image.path,
          name: image.filename,
          size: image.size,
          type: image.mime,
          uri: image.path,
          path: image.path,
        };
        imageArray.push(imageJson);
      });
      const mediaList = this.state.mediaList;
      this.setState({
        mediaList: [...mediaList, ...imageArray],
      });
    } catch (err) {
      throw err;
    }
  };

  renderHeader = () => {
    return (
      <View style={styles.headerStyle}>
        <View style={styles.headerStyle2}>
          <BackButton
            onPress={() => {
              goBack();
            }}
            viewStyle={{paddingRight: 0}}
            color="white"
          />
        </View>
        <View style={styles.headerStyle3}>
          <Text style={styles.headerStyle4}>Media Preview</Text>
        </View>
        <View style={styles.deleteMediaStyle}>
          <TouchableOpacity
            onPress={() => {
              this.onMediaDelete();
            }}>
            <Icon name={'Delete_T'} size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  render() {
    console.log('Media preview');
    return (
      <SafeAreaView style={styles.emptyState1}>
        {this.state.loader ? (
          <View style={styles.emptyState2}>
            <Loader />
          </View>
        ) : null}
        {this.renderHeader()}
        <KoraKeyboardAvoidingView
          style={styles.emptyState3}
          keyboardShouldPersistTaps="handled">
          <StatusBar backgroundColor="black" barStyle="light-content" />

          <View style={styles.emptyState4}>
            {this.mediaPager()}
            <View style={styles.mediaPager1}>
              <View style={styles.mediaPager2}>
                <ScrollView
                  ref={(ref) => {
                    this.scrollViewRef = ref;
                  }}
                  horizontal={true}
                  centerContent={true}
                  style={styles.scrollViewStylePreviewApp}
                  keyboardShouldPersistTaps="handled">
                  <View style={styles.scrollViewInnerView}>
                    {this.state.mediaList.map(this.singleSection)}
                  </View>
                </ScrollView>
                <TouchableOpacity
                  onPress={() => {
                    this.state.mediaList.length < 10
                      ? this.refs?.attachments?.openModal()
                      : alert('Max 10 files can be sent at a time');
                  }}
                  style={styles.scrollViewStylePreviewApp1}>
                  <Icon
                    name={'Plus_icon'}
                    size={normalize(24)}
                    color="#ffffff"
                  />
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.ViewGroup,
                  {alignItems: 'center', minHeight: 57, paddingBottom: 7},
                ]}>
                <TextInput
                  ref="input"
                  onChangeText={(txt) => this.onComposebarTextChange(txt)}
                  style={styles.inputTextStyle}
                  multiline
                  placeholder={'Add a caption'}
                  value={this.state.inputTextValue}
                />

                <TouchableOpacity
                  onPress={
                    this.state.isSendButtonDisabled
                      ? null
                      : () => this.handleSendAction()
                  }
                  disabled={this.state.isSendButtonDisabled}
                  style={styles.sendViewStyle}>
                  <Image
                    source={require('../../assets/send.png')}
                    style={{
                      height: 16,
                      width: 16,
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={{position: 'absolute'}}>
              <Camera ref="camera" boardData={this.props.boardData} />
              <Attach
                ref="attachments"
                boardData={this.props.boardData}
                cameraAction={(images) => {
                  this.handleCameraActionFromAttachment(images);
                }}
                mediaPreview={true}
              />
            </View>
          </View>
        </KoraKeyboardAvoidingView>
      </SafeAreaView>
    );
  }
}
const styles = StyleSheet.create({
  viewPager: {
    flex: 1,
  },
  ViewGroup: {
    alignItems: 'baseline',
    flexDirection: 'row',
    backgroundColor: 'white',
    justifyContent: 'space-between',
  },
  borderDivStyle: {
    backgroundColor: '#BDC1C6',
    height: 1,
    marginTop: 1,
  },
  inputTextStyle: {
    flex: 1,
    maxHeight: 130,
    paddingLeft: 10,
    fontSize: normalize(17),
    lineHeight: 23,
    borderBottomWidth: 0,
    borderBottomColor: 'white',
  },
  scrollViewStylePreviewApp: {
    width: '100%',
    height: '100%',
  },
  scrollViewStylePreviewApp1: {marginRight: 18, marginLeft: 18},
  scrollViewInnerView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionViewStyle: {
    marginEnd: 10,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendViewStyle: {
    backgroundColor: '#0D6EFD',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    marginEnd: 10,
    width: 36,
    height: 36,
    marginTop: 7,
  },
  imageStyle: {
    width: dimension.width,
    resizeMode: 'contain',
    aspectRatio: 1,
  },
  audioStyle: {
    height: 332,
    width: '100%',
  },

  defaultStyle: {
    height: 332,
    width: '100%',
  },
  defaultStyle2: {
    height: 48,
    width: 48,
    borderRadius: 4,
  },
  headerStyle: {
    width: '100%',
    flexDirection: 'row',
    height: 54,
  },
  headerStyle2: {
    height: '100%',
    width: '10%',
    justifyContent: 'center',
    paddingLeft: 16,
  },
  headerStyle3: {
    height: '100%',
    justifyContent: 'center',
    marginLeft: 15,
    flex: 1,
  },
  headerStyle4: {
    textAlign: 'left',
    lineHeight: 22,
    fontSize: normalize(18),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    fontWeight: 'bold',
    minWidth: 200,
    color: 'white',
  },
  deleteMediaStyle: {
    height: '100%',
    padding: 5,
    justifyContent: 'center',
    marginRight: 15,
  },
  emptyState1: {flex: 1, backgroundColor: 'black'},
  emptyState2: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState3: {flex: 1},
  emptyState4: {flex: 1, backgroundColor: 'black'},
  previewNewView1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  selectionImage1: {
    height: 48,
    width: 48,
    borderRadius: 4,
  },
  selectionImage2: {
    height: 48,
    width: 48,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  selectionImage3: {
    height: 45,
    width: 36,
  },
  videoContainer: {alignItems: 'center', justifyContent: 'center'},
  videoIconContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  viewPager1: {flex: 1},
  mediaPager1: {justifyContent: 'flex-end', marginBottom: 0},
  mediaPager2: {
    marginBottom: 2,
    marginTop: 1,
    height: 78,
    backgroundColor: 'black',
    alignItems: 'center',
    flexDirection: 'row',
  },
});

const mapStateToProps = (state) => {
  let {messageThreadList, preview} = state;
  return {
    activeBoardId: messageThreadList.activeBoardId,
    reply: preview.reply,
    replyPrivate: preview.replyPrivate,
  };
};

export default connect(mapStateToProps, {
  createNewThread,
  createPost,
  editPost,
  sendMessage,
  replyComment,
  replyToPrivate,
  replyPost,
  createNewBoard,
})(MediaPreview);
