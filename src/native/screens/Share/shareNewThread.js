import React, {Component} from 'react';

import {
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
  Image,
  FlatList,
  TextInput,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {connect} from 'react-redux';
import ContactsTag from './ContactsTagShare';
//import ContactsTag from '../NewChatScreen/ContactsTag';
import ReceiveSharingIntent from 'react-native-receive-sharing-intent';
import {navigate} from '../../navigation/NavigationService';
import {ROUTE_NAMES} from '../../navigation/RouteNames';
import {Loader} from '../../screens/ChatsThreadScreen/ChatLoadingComponent';
import {store} from '../../../shared/redux/store';
import {
  setTopicName,
  threadFind,
} from '../../../shared/redux/actions/create-message.action';
import ContactSelection from '../../components/ContactSelection';
import {getRecentContactList} from '../../../shared/redux/actions/create-message.action';

import {ResourceState} from '../../realm/dbconstants';
import FileUploader from '../FileUploader/index';
import {
  createThread,
  createNewThread,
} from '../../../shared/redux/actions/message-preview.action';
import uuid from 'react-native-uuid';
import userAuth from '../../../shared/utils/userAuth';
import KoraKeyboardAvoidingView from '../../components/KoraKeyboardAvoidingView';
import * as Constants from '../../components/KoraText';
import * as UsersDao from '../../../dao/UsersDao';
import {normalize} from '../../utils/helpers';
import {startOrStopTrackingMsgBoards} from '../../../shared/redux/actions/message-board.action';
class ShareNewThread extends Component {
  constructor(props) {
    super(props);
    // this.participents = props.route.params.thread.participants || [];

    this.state = {
      recentContactArray: [],
      shareData: props.shareData,
      filesObject: null,
      messageSending: false,
      // contactListArray: [],
      // tagsSelected: [],
      //  participents: props.route.params.thread.participants || [],
    };
  }
  setMessageSendingStatus(flag) {
    //flag will be true or false
    this.setState({messageSending: flag});
  }
  componentDidMount() {
    this.props.getRecentContactList();

    let recentContactArray = this.props.recentData;
    /*   recentContactArray = recentContactArray.filter((contact) => {
      const id = contact._id;
      const p = this.state.participents.map((a) => a);
      const index = p.indexOf((part) => part._id === id);
      return index === -1;
    }); */
    console.log('TEST', recentContactArray.length);
    this.setState({recentContactArray, shareData: this.props.shareData});
  }

  componentDidUpdate(prevProps) {
    console.log(
      'FLAGS',
      this.props.recentData !== prevProps.recentData,
      this.props.contactList !== prevProps.contactList,
      this.props.shareData !== prevProps.shareData,
    );
    if (this.props.shareData !== prevProps.shareData) {
      this.setState({shareData: this.props.shareData});
    }
    if (this.props.recentData !== prevProps.recentData) {
      console.log('FLAGS 1');
      let recentContactArray = this.props.recentData;
      /*    recentContactArray = recentContactArray.filter((contact) => {
        const id = contact._id;
        const index = this.state.participents.indexOf((part) => {
          console.log('FLAGS 2', part);
          return false;
        });
        return index === -1;
      }); */

      this.setState({recentContactArray: recentContactArray});
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
        let path = image.uri;
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
  generateSendAction = async () => {
    //Check participants avaialble or not
    if (this.props.contactData && this.props.contactData < 1) {
      alert('Please add participants');
      return;
    }

    var data = {};
    let components = null;
    this.setMessageSendingStatus(true);
    if (this.props.type === 'file') {
      data = {
        type: this.props.type,
        files: this.props.shareData,
      };
    } else {
      let value = this.state.shareData;

      if (value.mType === 'txt' || value.mType === 'url') {
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
        // this.setState({loader: true, isSendButtonDisabled: true});

        let fileIds;
        try {
          fileIds = await Promise.all(promisesArray);
        } catch (e) {}

        let files = fileIds.map((val, i) => {
          return {
            //fileId: val.fileId,
            ...val,
            ...arrayVal[i],
          };
        });

        components = files.map((file) => {
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

          if (file.mType.includes('image')) {
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
            componentData: {filename: file.name},
            componentThumbnails: componentThumbnails,
          };
        });
      }

      data = {
        type: 'text',
        text: '',
      };
    }
    this.sendAction(data, components);
  };

  sendAction(data, componenets = null) {
    let toList;
    let components = [];
    if (data.type === 'file') {
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
      components = componenets;
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

    toList = this.props.contactData;

    if (toList < 1) {
      alert('Please add participants');
      return;
    }
    const replyObj = this.props.reply || this.props.replyPrivate;
    const messages = replyObj ? [replyObj] : [];
    let replyTo = replyObj ? replyObj.messageId : null;
    let topicName = this.props.topicName || '';
    const message = {
      components,
      messageId: uniqueId,
      encrypted: false,
      to: toList,
      messages,
      listRecepients: [],
      topicName: '',
      author: UsersDao.getUser(),
      from: UsersDao.getUser(),
      clientId: uniqueId,
      id: uniqueId,
      sentOn: new Date(),
      messageState: ResourceState.SENDING,
    };

    const threadPayload = {
      id: uniqueId,
      name: topicName || '',
      lastActivity: message,
      clientId: uniqueId,
      members: [...toList, UsersDao.getUser()],
      groupChat: toList.length > 1,
    };

    let onetoonecontact;
    let toParticipants = [];
    message.to.forEach((contact) => {
      toParticipants.push({userId: contact.id});
      if (contact.id !== UsersDao.getUserId()) {
        onetoonecontact = contact.id;
      }
    });
    const payload = {
      members: toParticipants,
      listRecepients: [],
      ...(threadPayload.name && {name: threadPayload.name}),
      type: toParticipants.length == 1 ? 'directChat' : 'groupChat',
    };
    let _params = {
      message: message,
      thread: payload,
      isOneToOne: toParticipants.length == 1,
      contact: toParticipants.length == 1 ? onetoonecontact : null,
    };
    this.setMessageSendingStatus(true);
    //  createPost(payload, _params, false, (type, boardId) => {
    let par = {
      isTracking: true,
    };
    store.dispatch(startOrStopTrackingMsgBoards(par));
    store.dispatch(
      createNewThread(_params, (type) => {
        if (type === 'success') {
          if (this.props.topicName !== '') {
            this.props.setTopicName('');
          }

          this.setMessageSendingStatus(false);
         
        this.props.onFinishThreadClick('close');
        navigate(ROUTE_NAMES.MESSAGES);
        } else {
          this.setMessageSendingStatus(false);
          this.props.onFinishThreadClick('close');
          navigate(ROUTE_NAMES.MESSAGES);
        }
      }),
    );

    /*   if (this.props.messageType === 'success') {
      if (this.props.topicName !== '') {
        this.props.setTopicName('');
      }
    
      this.setMessageSendingStatus(false);
      this.props.onFinishThreadClick('close');
      navigate(ROUTE_NAMES.MESSAGES);
    } else if (this.props.messageType === 'failure') {
  
      this.setMessageSendingStatus(false);
      this.props.onFinishThreadClick('close');
      navigate(ROUTE_NAMES.MESSAGES);
    } */
  }
  render() {
    return (
      <View
        style={{
          flexDirection: 'column',
          height: '100%',
          backgroundColor: '#FFF',
        }}>
        {this.state.messageSending ? (
          <View style={styles.v5}>
            <Loader />
          </View>
        ) : null}
        <View
          style={{
            flexDirection: 'column',
            flex: 1,
            backgroundColor: '#FFFFFF',
          }}>
          <Text style={styles.newthread}>New thread</Text>
          <View
            style={{
              backgroundColor: '#E4E5E7',
              height: 1,
            }}></View>

          <KoraKeyboardAvoidingView style={styles.v4}>
            <View style={styles.v2}>
             {/*  <ContactsTag
                visible={true}
                onDeleteTag={(tag) => {}}
                showTo={false}
              
              /> */}
              <ContactSelection
        autoFocus={true}
        fromShare={true}
        inputStyles={{
          borderColor: '#0D6EFD',
          borderWidth: 1,
          borderRadius: 4,
          padding: 8,
          marginBottom: 14,
          
        }}
        // filterList={this.board.members || []}
        searchLeftContent={() => null}
        shouldFilter={() => false}
      />
            </View>
          </KoraKeyboardAvoidingView>
        </View>
        <View style={styles.v3}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              this.generateSendAction();
            }}
            style={styles.generateSend}>
            <Text style={styles.btn}>Create & Forward</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  btn:{color: '#FFFFFF', fontWeight: '600',
  fontSize: normalize(16),
  fontStyle: 'normal',fontFamily: Constants.fontFamily},
  v5: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    // opacity: 0.5,
    zIndex: 5,
    // backgroundColor: 'clear',
    justifyContent: 'center',
    alignItems: 'center',
  },
  v4: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    flexShrink:1,
  },
  v2: {
    flex: 1,
    

    margin: 0,
    height:'100%',
  
  },
  v3: {
    justifyContent: 'center',
    minHeight: 60,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 30,
    flex: 0,
  },
  generateSend: {
    backgroundColor: '#0D6EFD',
    padding: 10,
    width: '100%',
    alignItems: 'center',
    borderRadius: 4,
  },
  newthread: {
    padding: 15,
    color: '#202124',
    fontWeight: '600',
    fontSize: normalize(16),
    fontStyle: 'normal',
    width: '100%',
    fontFamily: Constants.fontFamily,
  },
});
const mapStateToProps = (state) => {
  let {createMessage, preview} = state;
  return {
    topicName: createMessage.topicName,
    contactList: createMessage.contactlistData,
    recentData: createMessage.recentData,
    contactData: createMessage.contactData,
    messageType: preview.messageType,
  };
};

export default connect(mapStateToProps, {
  getRecentContactList,
  createThread,
  setTopicName,
  startOrStopTrackingMsgBoards,
  createNewThread,
})(ShareNewThread);
