import React, { Component } from 'react';
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
import { Loader } from '../../screens/ChatsThreadScreen/ChatLoadingComponent';
import KoraKeyboardAvoidingView from '../../components/KoraKeyboardAvoidingView';
import { connect } from 'react-redux';
import { Icon } from '../../components/Icon/Icon.js';
import * as Constants from '../../components/KoraText';
import { createPost } from '../../../shared/redux/actions/discussions.action';
import { getShareBoards } from '../../../shared/redux/actions/message-board.action';
import uuid from 'react-native-uuid';
import userAuth from '../../../shared/utils/userAuth';
import ShareUtil from './ShareUtil';
import Toast from 'react-native-simple-toast';
import ShareSheetItem from './shareSheetItem';
import { ResourceState } from '../../realm/dbconstants';
import FileUploader from '../FileUploader/index';
import { store } from '../../../shared/redux/store';
import { saveThread } from '../../../shared/redux/actions/message-preview.action';
import { normalize } from '../../utils/helpers';
import * as UsersDao from '../../../dao/UsersDao';
import { emptyArray } from '../../../shared/redux/constants/common.constants';
import { discussionsACL } from '../../core/AccessControls';
import { isIOS } from '../../utils/PlatformCheck';
import * as BoardsDao from '../../../dao/BoardsDao';
import { ThreadsListView } from '../ChatsThreadScreen/ThreadsListView';
import database from '../../realm';
import { ScrollView } from 'react-native';
import ChatComponent from '../../components/Chat/extras/ChatComponent/ChatComponent'

class ShareSheetKora extends Component {
  constructor(props) {
    super(props);
    this.state = {
      boards: [],
      threads: null,
      boardClick: null,
      filteredBoards: [],
      inputValue: '',
      messageBoardListLoading: 'iiiii',
      messageSending: false,
      componentsResetSent: null,
    };
  }

  setMessageSendingStatus(flag) {
    //flag will be true or false
    this.setState({ messageSending: flag });
  }
  componentDidMount = () => {
    //To remove warning and error notifications while app is running on the simulator or the device
    // LogBox.ignoreLogs(["Warning: Each", "Warning: Failed"]);
    // LogBox.ignoreAllLogs(true);

    /* let _params = {
      limit: 20,
      offset: 0,
      queryParam: 'share',
    };
    this.props.getShareBoards(_params); */
    /*   setTimeout(() => {
        var conversation = BoardsDao.getBoardsShare(null);
        var data =
          conversation ||
          []?.filter(
            (a) =>
              a.id !== undefined &&
              a.members.some((v) => v === UsersDao.getUserId()),
          );
        data = data.filter(function (item) {
          const {canSendPost} = discussionsACL(item);
          if (item.type === 'discussion') {
            if (canSendPost) {
              return true;
            } else {
              return false;
            }
          } else {
            return true;
          }
        });
  
        this.setState({boards: data});
      }, 5); */

      setTimeout(async () => {
        var conversation = await BoardsDao.getBoardsShare(null);
        var threadsEdit = [];
        if (conversation?.length > 0) {
          threadsEdit = conversation;
          threadsEdit.map(function (a) {
            a.isChecked = false;
          }); 
       
        }
      
        const userId = UsersDao.getUserId();
    
        this.setState({threads: threadsEdit, loading: false});
      }, 100);
  };

  componentDidUpdate(prevProps) {
    if (
      prevProps.messageBoardListLoading !== this.props.messageBoardListLoading
    ) {
      this.setState({
        messageBoardListLoading: this.props.messageBoardListLoading,
      });
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
      console.log(userId + ':--dd---' + userAccessToken);
      if (image.name == null) {
        let path = image.uri;
        image.name = path.substring(path.lastIndexOf('/') + 1);
      }

      console.log(userId + ':-----' + userAccessToken);
      const uploader = new FileUploader(
        image,
        userId,
        'message',
        userAccessToken,
        mediaName,
      );

      uploader.start(
        (progress) => {
          // let {uploadPreogressMap} = this.state;
          //  uploadPreogressMap[image.name] = progress;
          // this.setState({uploadPreogressMap});
          console.log('progress', progress);
        },
        (success) => {
          console.log('SUCCESS', success);
          // success.link = success.fileUrl.thumbnailURL;
          // success.fileId = success.fileUrl.fileId;

          obj.status = 200;
          obj.response = JSON.parse(success);
          console.log('result', 'success', obj);

          resolve(obj.response);
          // editor.image._imageUploaded.call(obj, $current_image);
        },
        function (onError) {
          console.log('imageUpload', onError);
          reject(onError);
          // editor.image._imageUploadError();
        },
      );
    });
  };

  sendShareButton = (board) => {
    let boardId = board._id;
    let type = board.type;
    let ws = board.wsId;

    let itemData = {
      type: type,
      ws: ws,
      id: boardId
    }
    console.log(type + '------------------>', boardId)
    this.generateSendAction(itemData)
  }
  generateSendAction = async (itemObject, index) => {
    let components = null;
    if (this.props.type !== 'file') {
      var value = [];

      let fileObject = this.props.shareExtDataIos;
      if (fileObject === undefined || fileObject[0] === undefined) {
        console.log('fail');
        return;
      }

      if (isIOS) {
        var fileObj = fileObject[0];
        fileObj['contentUri'] = fileObj.filePath;
        value = await ShareUtil.getReceivedFileObject(fileObj);
      } else {
        value = await ShareUtil.getReceivedFileObject(fileObject[0]);
      }

      //console.log('value  -----> :', value);

      if (value?.mType === undefined || value?.mType === null) {
        Toast.showWithGravity(
          'unsuported file to send',
          Toast.SHORT,
          Toast.BOTTOM,
        );
        return;
      }
      this.setMessageSendingStatus(true);

      if (value?.mType === 'txt' || value?.mType === 'url') {
        components = [
          {
            componentId: userAuth.generateId(6),
            componentType: 'text',
            componentBody: value.uri ? value.uri.trim() : '',
          },
        ];
      } else {
        let arrayVal = [value];

        const promisesArray = arrayVal.map((media) => {
          if (media.thumbnailURL) {
            return new Promise((resolve, reject) => {
              return resolve(media);
            });
          }

          return this.imageUpload(media);
        });

        let fileIds;
        try {
          fileIds = await Promise.all(promisesArray);
        } catch (e) { }

        let files = fileIds.map((val, i) => {
          return {
            //fileId: val.fileId,
            ...val,
            ...arrayVal[i],
          };
        });

        components = files.map((file) => {
          //console.log('File :::', file);
          if (file.componentId) {
            let {
              componentData,
              componentFileId,
              componentId,
              componentSize,
              componentThumbnails,
              componentType,
              thumbnailURL,
            } = file;
            componentThumbnails = [
              {
                width: 320,
                height: 240,
                size: 'smaller',
                url: thumbnailURL,
              },
            ];
            return {
              componentData,
              componentFileId,
              componentId,
              componentSize,
              componentThumbnails,
              componentType,
            };
          }
          let componentThumbnails = [];
          if (file.thumbnailURL) {
            componentThumbnails = [
              {
                width: 320,
                height: 240,
                size: 'smaller',
                url: file.thumbnailURL,
              },
            ];
          }

          let componentType = 'image';

          if (file?.mType.includes('image')) {
            componentType = 'image';
          } else if (file.type.includes('video')) {
            componentType = 'video';
          } else {
            componentType = 'attachment';
          }

          return {
            componentId: userAuth.generateId(6),
            componentType,
            componentFileId: file.fileId,
            componentSize: file.size + '',
            componentData: { filename: file.name },
            componentThumbnails: componentThumbnails,
          };
        });
      }

      var data = {
        type: 'text',
        text: '',
      };
    } else {
      var data = {
        type: this.props.type,
        files: this.props.shareData,
      };
    }

    this.sendAction(itemObject, data, components, index);
  };


  sendAction(itemObject, data, componentData = null, index) {
    const isDiscussion = itemObject.type === 'discussion';
    let components = [];
    if (data?.type === 'file') {
      let fileList = data.files?.map((attachment) => {
        return {
          referenceId: attachment.resourceId,
          componentId: userAuth.generateId(6),
          componentType: attachment.fileType,
          componentData: {
            filename: attachment.fileName,
          },
          componentFileId: attachment.id,
        };
      });
      components = fileList;
    } else {
      components = componentData;
    }
    const linkPreviews = [];
    if (data.type === 'link') {
      let linkPreview = {
        title: data.title,
        description: data.description,
        source: data.site,
        url: data.url,
        type: data.previewType,
        site: data.site,
        image: data.image,
        video: data.video,
      };
      linkPreviews[0] = linkPreview;
    }

    const uniqueId = uuid.v1();
    let threadId = uniqueId;

    threadId = itemObject?.id;

    const replyObj = this.props.reply || this.props.replyPrivate;
    const messages = replyObj ? [replyObj] : [];

    const message = {
      components,
      messageId: uniqueId,
      encrypted: false,

      messages,
      listRecepients: [],
      topicName: '',
      author: UsersDao.getUser(),
      from: UsersDao.getUser(),
      clientId: uniqueId,
      threadId: threadId,
      sentOn: new Date(),
      messageState: ResourceState.SENDING,
      linkPreviews,
    };

    let payload = {
      classification: isDiscussion ? 'POSTS' : '',
      components: message.components,

      linkPreviews,
      mentions: [],
      hashTag: [],
    };
    this.setState({ boardClick: itemObject });
    if (isDiscussion) {
      const _params = {
        wsId: itemObject.wsId,
        rId: threadId,
      };

      // this.setMessageSendingStatus(true);
      store.dispatch(
        createPost(payload, _params, false, (type, boardId) => {
          console.log('-----------createPost----------------->',boardId)
          if (type === 'success') {
           // let tempBoard = this.state.boards;
          //  tempBoard[index].sent = true;
           // this.setState({ boards: tempBoard });
           
           let chats = this.state.threads;
           chats = chats.map(function (a) {
            
             if (a?._id === boardId) {
               a.isChecked = true;
             }
             return a;
           });
            this.setMessageSendingStatus(false);
            Toast.showWithGravity(
              'Successfully sent',
              Toast.SHORT,
              Toast.BOTTOM,
            );
          } else {
            Toast.showWithGravity('Sharing failed', Toast.SHORT, Toast.BOTTOM);
            this.setMessageSendingStatus(false);
          }
        }),
      );
    } else {
      store.dispatch(
        saveThread(payload, threadId, null, (type, boardId) => {
          console.log(type+'--------------resp---------------------->',boardId)
          if (type === 'success') {
           let chats = this.state.threads;
           chats = chats.map(function (a) {
            
             if (a?._id === boardId) {
               a.isChecked = true;
             }
             return a;
           });
            this.setMessageSendingStatus(false);
            Toast.showWithGravity(
              'Successfully sent',
              Toast.SHORT,
              Toast.BOTTOM,
            );
          } else {
           Toast.showWithGravity('Sharing failed', Toast.SHORT, Toast.BOTTOM);
          this.setMessageSendingStatus(false);
          }
        }),
      );
    }
  }
  textChangeTriggered(inputText) {
    this.setState({ inputValue: inputText });

    var filteredList = this.state.boards?.filter((item) => {
      var recentMemberItems = item?.members?.filter((contact) => {
        if (contact !== null) {
          var fullName = contact.fN + ' ' + contact.lN;
          var email = contact.emailId || '';
          if (
            fullName.toUpperCase().indexOf(inputText.toUpperCase()) > -1 ||
            (email.toUpperCase().indexOf(inputText.toUpperCase()) > -1 &&
              contact.id !== UsersDao.getUserId())
          )
            return contact;
        }
      });

      if (
        (item.name !== undefined &&
          item.name !== '' &&
          String(item.name?.toUpperCase()).indexOf(inputText.toUpperCase()) >
          -1) ||
        (recentMemberItems !== undefined && recentMemberItems.length > 0)
      )
        return item;
    });

    // console.log(tempData);
    this.setState({ filteredBoards: filteredList });
  }

  refreshApi() {
    let _params = {
      limit: 20,
      offset: 0,
      queryParam: 'share',
    };
    this.props.getShareBoards(_params);
  }

  callNewFunction = async () => {
    let fileObject = this.props.shareExtDataIos;
    //let data = null;//await ShareUtil.getReceivedFileObject(fileObject[0]);
    //console.log('fileObject _5656   ------>:', fileObject);
    fileObject = fileObject[0];
    if (isIOS) {
      // fileObject = fileObject[0];
      fileObject['contentUri'] = fileObject.filePath;
    }
    let data = await ShareUtil.getReceivedFileObject(fileObject);
    //console.log("data   ------>:",data);
    this.props.onNewThreadClick(data);
  };
  onNewClick = () => {
    if (this.props.type !== 'file') {
      let fileObject = this.props.shareExtDataIos;

      if (
        fileObject === undefined ||
        fileObject[0] === undefined
      ) {
        console.log('fail');
        return;
      }
      this.callNewFunction();
    } else {
      this.props.onNewThreadClick(this.props.shareData);
    }
  }

  
  checkBoxSelected = (selectedItems, type) => {
    this.sendShareButton(selectedItems);
    console.log(type+'------------KKK-------------------->',selectedItems);
  }
  render() {
    if (this.props.messageBoardListLoading) {
      return <Loader />;
    }
    if (this.props.messageApiFailed) {
      return (
        <View style={styles.v6}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => this.refreshApi()}
            style={styles.failed}>
            <Text style={{ color: '#FFFFFF' }}>LOADING FAILED,TRY AGAIN</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <SafeAreaView style={{ flex: 1 }}>
      <View>
          <Text style={styles.v5}>Share</Text>
          <View style={{backgroundColor: '#E4E5E7', height: 1}}/>
   <ScrollView style={{paddingStart: 5, paddingEnd: 5}}>
  
   <ChatComponent
              threads={this.state.threads}
              fromShare={true}
              onNewClick={this.onNewClick}
              checkBoxSelected={this.checkBoxSelected}
              searchText={this.state.searchText}
             
            
          
              
            />
              </ScrollView>
              {this.state.messageSending ? (
          <View style={styles.l1}>
            <Loader />
          </View>
        ) : null}
                
                </View>     
      </SafeAreaView>
    );
  }
}
const styles = StyleSheet.create({
  v7: {
    marginRight: 8,
    alignItems: 'center',
    alignContent: 'center',
  },
  v6: {
    backgroundColor: '#FFFFFF',

    minHeight: '80%',
    paddingTop: 10,
    justifyContent: 'center',
    marginStart: 30,
    marginEnd: 30,
  },
  v5: {
    padding: 15,
    fontWeight: '600',
    fontSize: normalize(16),
    fontStyle: 'normal',
    color: '#202124',
    fontFamily: Constants.fontFamily,
  },
  v3: {
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  l1: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    // opacity: 0.5,
    zIndex: 1,

    justifyContent: 'center',
    alignItems: 'center',
  },
  v1: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 45,
    paddingStart: 8,
    marginTop: 10,
    marginBottom: 15,

    flex: 1,
  },
  startn: {
    fontWeight: '600',
    color: '#202124',
    fontFamily: Constants.fontFamily,
  },
  recents: {
    fontWeight: '400',
    color: '#202124',
    fontSize: 16,
  },
  ViewGroup: {
    alignItems: 'baseline',
    flexDirection: 'row',
    backgroundColor: 'white',
    justifyContent: 'space-between',
  },
  searchTextInputStyle: {
    fontWeight: '400',
    fontSize: normalize(14),
    fontStyle: 'normal',
    width: '100%',

    fontFamily: Constants.fontFamily,
  },
  sendButtonBackground: {
    minHeight: 30,
    minWidth: 60,
    borderColor: '#85B7FE',
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: '#E7F1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginStart: 10,
  },
  sentButtonBackground: {
    minHeight: 30,
    minWidth: 60,
    borderColor: '#BDC1C6',
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: '#EFF0F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginStart: 10,
  },
  inputBorder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    borderWidth: 1,

    borderColor: '#E5E8EC',
    flexDirection: 'row',
    minHeight: 40,
    paddingStart: 10,
    marginStart: 15,
    marginEnd: 15,
    marginTop: 10,
    flex: 1,
  },
  roundedIcon: {
    marginRight: 15,
    backgroundColor: '#85B7FE',
    borderRadius: 45 / 2,
    alignItems: 'center',
    width: 45,
    height: 45,
    alignContent: 'center',
    justifyContent: 'center',
  },
  failed: {
    backgroundColor: '#0D6EFD',
    padding: 10,
    width: '100%',
    alignItems: 'center',
  },
});

const mapStateToProps = (state) => {
  const { messageBoards, native, discussion } = state;
  return {
    messageBoardListLoading: messageBoards.messageBoardListLoading,
    messageApiFailed: messageBoards.messageApiFailed,
    showLoader: discussion.showLoader,
    shareExtDataIos: native.shareExtensionDataIOS,
    
  };
};
export default connect(mapStateToProps, {
  getShareBoards,
  saveThread,
  createPost,
})(ShareSheetKora);
