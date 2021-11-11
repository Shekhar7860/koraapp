import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Clipboard from '@react-native-community/clipboard';
import {request, PERMISSIONS, check} from 'react-native-permissions';
import {
  View,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Text,
  Keyboard,
  Platform,
  PermissionsAndroid,
  Alert,
  Linking,
  FlatList,
} from 'react-native';
import {TouchableHighlight} from 'react-native-gesture-handler';
import {Player, Recorder} from '@react-native-community/audio-toolkit';

import styles from './MessageComposebar.Style';
import Attach from '../Attachment.js';
import Camera from '../CameraModal.js';
import TypingIndicator from './TypingIndicator';
import {generateRandomId} from '../Chat/data';
import {Icon} from '../Icon/Icon';
import ToolTip from '../../../ToolTipLib/Tooltip';
import {normalize} from '../../utils/helpers';
import UrlPreview from '../URLPreview/UrlPreview';
import {APP_NAME} from '../../utils/AppConstants';
import * as UsersDao from '../../../dao/UsersDao';
import {
  emptyArray,
  emptyObject,
} from '../../../shared/redux/constants/common.constants';
import {
  mentions_pattern,
  spaceCheck,
  url_regex,
} from '../../utils/regexconstants';
import RNFetchBlob from 'rn-fetch-blob';
import {navigate} from '../../navigation/NavigationService';
import {ROUTE_NAMES} from '../../navigation/RouteNames';
import {isAndroid} from '../../utils/PlatformCheck';

class MessageComposebar extends Component {
  player = Player || null;

  recorder = Recorder || null;
  lastSeek = 0;
  _recordStartTime = 0;
  _recordingMSInterval = 0;
  filename = '';
  urlPreviewData = null;
  isComponentMounted = false;
  tooltipRef = null;
  urlPreview = React.createRef();

  constructor(props) {
    super(props);

    this.state = {
      inputTextValue: '',
      typingParticipants: [],
      isMentions: false,
      mentionList: this.props.contactData,
      isRecordingStopped: false,
      deleteVisible: false,
      recordTime: '00:00:00',
      duration: '00:00:00',
      longPressed: false,
      enablePlayer: false,
      recordFilePath: null,
      isUrlPreviewDeleteClicked: false,
      validURL: null,
      playPauseButton: 'Preparing...',
      loopButtonStatus: false,
      progress: 0,
      error: null,
      editContext: null,
    };
    this.typingTimers = {};
  }

  get inputTextValue() {
    return this.state.inputTextValue;
  }

  get sendVisible() {
    return (
      this.state.inputTextValue?.trim()?.length > 0 || this.state.enablePlayer
    );
  }

  _keyboardDidShow = () => {
    //console.log('Keyboard Shown');
    this.setToggleTipState(false);
    // this.deleteClick();
    // this.focusOnInput();
  };

  _keyboardDidHide = () => {
    //console.log('Keyboard Hidden');
    this.setToggleTipState(false);
    // this.deleteClick();
    //this.focusOnInput();
  };

  _shouldUpdateProgressBar() {
    // Debounce progress bar update by 200 ms
    return Date.now() - this.lastSeek > 200;
  }

  _updateState(err) {
    this.setState({
      playPauseButton: this.player && this.player.isPlaying ? 'Pause' : 'Play',
    });
  }

  _playPause = () => {
    this.player.playPause((err, paused) => {
      if (!paused) {
        this._recordingMSInterval = setInterval(() => {
          this.setState({
            duration: this.player.duration,
          });
        }, 1000);
        setTimeout(() => {
          clearInterval(this._recordingMSInterval);
        }, this.player.duration + 500);
      }

      if (err) {
        this.setState({
          error: err.message,
        });
      }
      if (paused) {
        clearInterval(this._recordingMSInterval);
      }
      this._updateState();
    });
  };

  _stop() {
    this.player?.stop(() => {
      clearInterval(this._recordingMSInterval);
      this._updateState();
    });
  }

  _reloadPlayer() {
    this.player = new Player(this.filename, {
      autoDestroy: false,
    });
    if (isAndroid) {
      this.player.speed = 0.0;
    }
    setTimeout(() => {
      this.player.prepare((err) => {
        if (err) {
          console.log('error at _reloadPlayer():', err);
        } else {
          this.player.looping = this.state.loopButtonStatus;
        }

        this._updateState();
      });
    }, 0);

    this._updateState();

    this.player.on('ended', () => {
      this._updateState();
      if (this.player) {
        this.player.looping = false;
        if (isAndroid) {
          this.player.speed = 0.0;
        }
      }
    });
    this.player.on('pause', () => {
      this._updateState();
    });
  }

  _reloadRecorder() {
    if (this.recorder) {
      this.recorder.stop();
    }
    this.filename = 'voice_record_' + this.getUID() + '.m4a';
    this.recorder = new Recorder(this.filename, {
      bitrate: 256000,
      channels: 2,
      sampleRate: 44100,
      quality: 'max',
      encoder: 'aac',
    });

    this._updateState();
  }

  millisToMinutesAndSeconds(millis) {
    if (millis === -1) {
      return '00:00';
    }

    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return (
      (minutes < 10 ? '0' : '') +
      minutes +
      ':' +
      (seconds < 10 ? '0' : '') +
      seconds
    );
  }

  _toggleRecord() {
    if (this.player) {
      this.player.stop();
      clearInterval(this._recordingMSInterval);
      if (this.recorder.isRecording) {
        this.recorder.stop();
        clearInterval(this._recordingMSInterval);
      }
    }

    this.recorder.toggleRecord((err, stopped) => {
      this._recordStartTime = Date.now();
      if (!stopped) {
        this._recordingMSInterval = setInterval(() => {
          this.setState({
            recordTime: this.millisToMinutesAndSeconds(
              Date.now() - this._recordStartTime,
            ),
          });
        }, 1000);
      }
      if (err) {
        this.setState({
          error: err.message,
        });
      }
      if (stopped) {
        this._reloadPlayer();
        this.setState({enablePlayer: true});
        clearInterval(this._recordingMSInterval);
      }
      this._updateState();
    });
  }

  _toggleLooping(value) {
    this.setState({
      loopButtonStatus: value,
    });
    if (this.player) {
      this.player.looping = value;
    }
  }

  isAudioRecorded() {
    return (
      this.state.inputTextValue !== '' || this.state.recordFilePath !== null
    );
  }

  deleteClick = () => {
    clearInterval(this._recordingMSInterval);
    if (this.player?.isPlaying) {
      this._stop();
    }
    this._reloadRecorder();
    this.setState({
      recordFilePath: null,
      enablePlayer: false,
      inputTextValue: '',
      recordTime: this.millisToMinutesAndSeconds(0),
    });
  };

  handlePressIn = () => {
    if (
      this.props?.isValidData &&
      typeof this.props.isValidData === 'function'
    ) {
      if (this.props.isValidData()) {
        this.setState({longPressed: true});
        this.handlePermission(false);
      }
    } else {
      this.setState({longPressed: true});
      this.handlePermission(false);
    }
    // clearInterval(this._recordingMSInterval);
  };

  audioActionClick = () => {
    if (
      this.props?.isValidData &&
      typeof this.props.isValidData === 'function'
    ) {
      if (this.props.isValidData()) {
        this.handlePermission(true);
      }
    } else {
      this.handlePermission(true);
    }
  };

  handlePressOut = () => {
    clearInterval(this._recordingMSInterval);
    if (this.recorder.isRecording) {
      this.recorder.stop();
      this._toggleRecord();
      this.setState({recordFilePath: this.recorder.fsPath});
    }
    this._updateState();
  };

  toggleTip = () => {
    this.refs.tooltipRef.toggleTooltip();
  };
  setToggleTipState = (isVisible) => {
    this.refs.tooltipRef?.setTooltipState(isVisible);
  };

  sendActionBase = () => {
    if (
      this.props.newThreadData &&
      this.props.newThreadData.isNewChat &&
      this.props.newThreadData.contactData &&
      this.props.newThreadData.contactData.length === 0
    ) {
      this.props?.handleEmptyContacts();
      return;
    }

    if (
      this.props?.isValidData &&
      typeof this.props.isValidData === 'function'
    ) {
      if (this.props.isValidData?.()) {
        this.sendAction();
      }
    } else {
      this.sendAction();
    }
  };

  getValidImaheUrl = (data) => {
    if (!data) {
      return null;
    }
    let linkImg =
      data.images && data.images.length > 0
        ? data.images.find(function (element) {
            return (
              element.includes('.png') ||
              element.includes('.jpg') ||
              element.includes('.jpeg') ||
              element.includes('.svg')
            );
          })
        : null;

    if (!linkImg) {
      linkImg =
        data.favicons && data.favicons.length > 0
          ? data.favicons[data.favicons.length - 1]
          : null;
    }

    return linkImg;
  };

  sendAction = async (mediaData) => {
    let self = this;
    // Keyboard.dismiss;
    this.setState({
      isUrlPreviewDeleteClicked: false,
    });
    let filePath = this.state.recordFilePath;
    if (filePath?.length > 0) {
      clearInterval(this._recordingMSInterval);
      RNFetchBlob.fs.stat(filePath).then((stats) => {
        let data = {
          name: stats.filename,
          size: stats.size,
          type: 'audio',
          path: stats.path,
          fileCopyUri: stats.uri || stats.path,
          uri: stats.uri || stats.path,
          duration: this.state.recordTime,
        };

        self._reloadRecorder();
        self.props.onSendButtonClick?.(data);
        self.setState({
          recordFilePath: null,
          enablePlayer: false,
          inputTextValue: '',
          recordTime: this.millisToMinutesAndSeconds(0),
        });
      });
      return;
    }

    const str = this.inputTextValue || '';
    if (str.trim().length === 0) {
      return;
    }
    //@evryone check
    let everyone = false;
    if (
      (
        str
          .trim()
          .toLocaleLowerCase()
          .match(/@everyone /g) || emptyArray
      ).length > 0 ||
      str.trim().toLocaleLowerCase() === '@everyone'
    ) {
      everyone = true;
    }
    let allAttMentions = [];

    if (
      this.props.contactData &&
      this.props.isGroupChat &&
      str.trim().includes('@')
    ) {
      //resolving @mentions for ids
      var tokens = [];
      const userMessage = str.trim();

      userMessage.replace(/\@(.*?)(?!\S)/g, function (a, b) {
        tokens.push(b);
      });

      tokens = tokens.filter((text) => text !== '');

      if (tokens.length > 0) {
        let participantTemp = this.props.contactData || emptyArray;
        allAttMentions = participantTemp
          .filter((item) => {
            let trimName =
              (item?.fN !== undefined ? item?.fN : '') +
              (item?.lN !== undefined ? item?.lN : '');
            if (typeof trimName === 'string' || trimName instanceof String) {
              let name = trimName.trim().replace(/ /g, '');

              return tokens.includes(name);
            } else {
              return false;
            }
          })
          .map((a) => a.emailId);
      }
    }

    let data = null;
    if (this.urlPreviewData) {
      data = {
        type: 'link',
        text: this.inputTextValue,
        title: this.urlPreviewData.title,
        description: this.urlPreviewData.description,
        source: this.urlPreviewData.link,
        url: this.urlPreviewData.link,
        previewType: this.urlPreviewData.contentType,
        site: this.urlPreviewData.link,
        image: this.urlPreviewData?.image?.url, //this.getValidImaheUrl(this.urlPreviewData),
        // this.urlPreviewData &&
        // this.urlPreviewData.images &&
        // this.urlPreviewData.images.length > 0
        //   ? this.urlPreviewData.images[0]
        //   : this.urlPreviewData &&
        //     this.urlPreviewData.favicons &&
        //     this.urlPreviewData.favicons.length > 0
        //   ? this.urlPreviewData.favicons[
        //       this.urlPreviewData.favicons.length - 1
        //     ]
        //   : null,
        video:
          this.urlPreviewData &&
          this.urlPreviewData.videos &&
          this.urlPreviewData.videos.length > 0
            ? this.urlPreviewData.videos[0]
            : null,
      };
    } else {
      data = {
        type: 'text',
        text: this.inputTextValue,
      };
    }

    if (everyone) {
      data = {...data, everyoneMentioned: true};
    }
    if (allAttMentions.length > 0) {
      data = {...data, mentions: allAttMentions};
    }
    if (this.state.editContext) {
      let editContext = this.state.editContext;
      data.post = editContext;
      try {
        let components = await editContext.components.fetch();
        data.mediaList = components.filter(
          ({componentType}) => {
            return componentType !== 'text';
          },
        );
      } catch (e) {
}
    }
    this.props.onSendButtonClick?.(data);
    if (this.state.editContext) {
      this.setState({editContext: null});
    }

    this.setText();
    this.setState({
      isUrlPreviewDeleteClicked: false,
    });

    if (this.urlPreview && this.urlPreview.current) {
      this.urlPreview.current.setUrl(null);
      // this.urlPreview.current.hidePreview();
    }
    this.urlPreviewData = null;
  }

  setText = (text = '', afterStateChange = () => {}) => {
    if (!text || text === '') {
      this.setState(
        {inputTextValue: ''},
        () => !this.state.editContext && this.refs.input?.clear(),
      );
      if (this.urlPreview && this.urlPreview.current) {
        this.urlPreview.current.setUrl(null);
        //  this.urlPreview.current.hidePreview();
      }
    } else {
      this.setState({inputTextValue: text}, () => afterStateChange(text));
      // this.refs.input?.setNativeProps({text: text});
    }
  };

  focusOnInput = () => {
    this.refs.input.focus();
  };

  getUID(pattern) {
    var _pattern = pattern || 'xxxxyx';
    _pattern = _pattern.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    return _pattern;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.typingParticipant?.id !== this.props.typingParticipant?.id) {
      this.addParticipentToTyping(this.props.typingParticipant);
    }
    if (
      this.props.contactData !== prevProps.contactData &&
      this.props.enableNewNotations
    ) {
      this.setState({mentionList: this.props.contactData});
    }
  }

  setText(text = '') {
    this.setState({inputTextValue: text});
  }

  addParticipentToTyping(participent) {
    if (participent) {
      clearTimeout(this.typingTimers[participent.id]);
      const index = this.state.typingParticipants.findIndex(
        (obj) => obj.id === participent.id,
      );
      if (index === -1) {
        this.setState({
          typingParticipants: [...this.state.typingParticipants, participent],
        });
      }
      this.typingTimers[participent.id] = setTimeout(() => {
        const {typingParticipants} = this.state;

        const newtypingParticipants = typingParticipants.filter(
          (obj) => obj.id !== participent.id,
        );
        this.setState({typingParticipants: newtypingParticipants});
      }, 3000);
    }
  }

  attachementClickAction = () => {
    let mszText = this.inputTextValue || '';
    this.refs.attachments.openModal(mszText);
  };

  selectFile = (images, mszText = '') => {
    // console.log('select files', images);
    let options = {
      title: 'Select Image',
      // customButtons: [
      //   {
      //     name: 'customOptionKey',
      //     title: 'Choose file from Custom Option'
      //   },
      // ],
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    try {
      let imageArray = [];
      let count = 0;
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
      if (this.state.editContext) {
        let mediaList = this.state.editContext.components.filter(
          ({componentType}) => {
            return componentType !== 'text';
          },
        );
        mszText =
          this.state.editContext.components.find(({componentType}) => {
            return componentType === 'text';
          })?.componentBody || '';
        mediaList = mediaList.map((obj) => {
          return {
            type: obj.componentType,
            uri: obj.thumbnailURL,
            ...JSON.parse(JSON.stringify(obj)),
          };
        });
        imageArray = [...mediaList, ...imageArray];
      }
      navigate(ROUTE_NAMES.MEDIA_PREVIEW, {
        caption: this.inputTextValue,
        mediaList: imageArray,
        boardData: this.props.boardData,
        boardDataId: this.props.boardID,
        newThreadData: this.props.newThreadData,
        mszText: mszText,
        onMediaUploadedCB: this.onMediaUploadedCB,
      });
    } catch (err) {
      throw err;
    }
  };

  handleCameraAction(images) {
    let mszText = this.inputTextValue || '';
    this.selectFile(images, mszText);
  }

  onMediaUploadedCB = (data) => {
    if (this.state.editContext) {
      data.post = this.state.editContext;
    }
    this.props.onSendButtonClick?.(data);
    if (this.state.editContext) {
      this.setState({editContext: null, inputTextValue: ''});
    }
  };

  clearAudioFromComposebar = (data) => {
    if (
      this.state.inputTextValue !== '' ||
      this.state.recordFilePath !== null
    ) {
      this.deleteClick();
    }
  };
  resetInputTextValue() {
    setTimeout(() => {
      this.setText();
    }, 500);
  }

  handleCameraActionFromAttachment = (images, mszText) => {
    this.selectFile(images, mszText);
    this.resetInputTextValue();
  };

  onComposebarTextChange = (text) => {
    this.setState(
      {
        inputTextValue: text,
      },
      () => {
        this.onTextChange(text);
        this.handleURLPreview(text);
      },
    );
  };

  handleURLPreview = async (text) => {
    let url = this.getValidURL(text);
    if (!text || text.trim().length === 0 || !url || this.state.isMentions) {
      if (this.urlPreview && this.urlPreview.current) {
        this.urlPreview.current.setUrl(null);
        // this.urlPreview.current.hidePreview();
      }
      this.urlPreviewData = null;
      if (!text || text.trim().length === 0) {
        this.setState({
          isUrlPreviewDeleteClicked: false,
        });
      }
    } else {
      if (url) {
        this.showURLPreview(url);
        return;
      }
      const copiedContent = await Clipboard.getString();

      if (copiedContent === '') {
        return;
      }
      const isPasted = text.includes(copiedContent);
      if (isPasted) {
        this.handleOnPaste(text);
      }
    }
  };

  getValidURL = (text) => {
    if (!text || text.trim() === '') {
      return null;
    }
    if (
      text &&
      text.match(url_regex) &&
      text.match(url_regex).length >= 1 &&
      text.match(url_regex)[0]
    ) {
      return text.match(url_regex)[0];
    }
  };

  handleOnPaste = (text) => {
    const url = this.getValidURL(text);
    if (url) {
      this.showURLPreview(url);
    }
  };

  showURLPreview = (url) => {
    if (!this.state.validURL) {
      if (this.urlPreview && this.urlPreview.current) {
        this.urlPreview.current.setUrl(url);
      }
    } else if (!(this.state.validURL === url)) {
      if (this.urlPreview && this.urlPreview.current) {
        this.urlPreview.current.setUrl(url);
      }
    }
  };

  searchText = (query) => {
    //override suggestion filter, we can search by specific attributes
    query = query.toUpperCase();
    let allContacts = this.props.contactData;
    const everyOne = {
      id: 'everyone',
      fN: 'Everyone',
      lN: '',
      emailId: 'everyone',
      color: '#7f8c8d',
    };

    allContacts = [...allContacts, everyOne];
    if (
      allContacts.length <= 1 &&
      this.props.boardTotalMembers &&
      this.props.boardTotalMembers > 1
    ) {
      // here there is chance of board member api fail,trying to call board member api here
      // like navigating without network to chat screen & trying @mentions
      if (this.props.callMembersApi) {
        this.props.callMembersApi('');
      }
    }
    let searchResults = allContacts.filter((s) => {
      if (s.id === UsersDao.getUserId()) {
        return false;
      }
      if (!s.fN) {
        return true;
      }
      let name = s.fN;
      if(s?.lN!==undefined&&s?.lN!==null)
      {
        name+= ' '+s.lN;
      }
      return name?.trim()?.toUpperCase().includes(query);
    });
    if (searchResults.length === 0) {
      this.setState({mentionList: []});
    } else {
      this.setState({mentionList: searchResults});
    }
  };

  onTextChange = (value, props) => {
    if (
      (this.props.newThreadData && this.props.newThreadData.isNewChat) ||
      !this.props.isGroupChat
    ) {
      return;
    }
    if (this.props.boardData?.membersCount < 2) {
      return;
    }
    const lastChar = this.inputTextValue.substr(this.inputTextValue.length - 1);
    const currentChar = value.substr(value.length - 1);

    if (value.length === 0) {
      this.setState({isMentions: false});
    } else {
      if (spaceCheck.test(lastChar) && currentChar !== '@') {
        this.setState({isMentions: false});
      } else {
        const checkSpecialChar = currentChar.match(/[^@A-Za-z_]/);
        if (checkSpecialChar === null || currentChar === '@') {
          const matches = value.match(mentions_pattern) || emptyArray;
          if (matches.length > 0) {
            this.setState({isMentions: true});
            var n = value.lastIndexOf('@');
            var result = value.substring(n + 1);
            this.searchText(result);
          }
        } else if (checkSpecialChar != null) {
          this.setState({isMentions: false});
        }
      }
    }
  };

  onMentionSelection(item) {
    var n = this.inputTextValue.lastIndexOf('@');
    var result = this.inputTextValue.substring(0, n + 1);
    var userName =
      (item.fN !== undefined ? item.fN : '') +
      (item.lN !== undefined ? item.lN : '');
    this.setText(result + userName.trim().replace(/ /g, '') + ' ');
    this.setState({
      isMentions: false,
    });
  }

  renderTypingIndicator() {
    let {typingParticipants} = this.state;
    if (typingParticipants.length <= 0) {
      return null;
    }
    typingParticipants = typingParticipants?.map((obj) => {
      return {...obj, modifiedName: obj.fN.charAt(0).toUpperCase()};
    });
    if (typingParticipants.length > 4) {
      const count = typingParticipants.length - 3;
      typingParticipants = [
        typingParticipants[0],
        typingParticipants[1],
        typingParticipants[2],
        {_id: generateRandomId(), modifiedName: `+${count}`},
      ];
    }
    if (typingParticipants?.length > 0) {
      if (this.refs?.typingIndicator && this.isComponentMounted) {
        this.refs?.typingIndicator.start();
      }
    } else {
      if (this.refs?.typingIndicator) {
        this.refs?.typingIndicator.stop();
      }
    }

    return typingParticipants?.length > 0 ? (
      <View style={styles.typingStyle1}>
        {typingParticipants?.map((value, index) => {
          return (
            <View
              key={value.id}
              style={[styles.typingStyle, {backgroundColor: value.color}]}>
              <Text style={styles.nameTextStyle1}>{value.modifiedName}</Text>
            </View>
          );
        })}

        <TypingIndicator
          ref="typingIndicator"
          dotColor="blue"
          dotMargin={6}
          dotAmplitude={4}
          dsotSpeed={0.5}
          dotRadius={2}
          dotX={14}
          dotY={14}
        />
      </View>
    ) : null;
  }

  componentDidMount() {
    this.isComponentMounted = true;
    this.player = null;
    this.recorder = null;

    this._reloadRecorder();

    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this._keyboardDidShow,
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this._keyboardDidHide,
    );
  }

  componentWillUnmount() {
    this.setState = (a, b) => false;
    this.isComponentMounted = false;
    clearInterval(this.state.recordTime, this.state.duration);
    clearInterval(this._recordingMSInterval);
    Object.values(this.typingTimers).forEach((obj) => {
      clearTimeout(obj);
    });
    this.keyboardDidShowListener?.remove();
    this.keyboardDidHideListener?.remove();
  }

  renderSuggestionsViewItem = ({item}) => {
    return this.suggestionsItem(item, item.fN, item.lN);
  };

  renderSuggestionsView = (contacts) => {
    if (this.state.mentionList && this.state.mentionList.length > 0) {
      return (
        <View style={styles.mainStyle}>
          <FlatList
            style={styles.listStyle}
            bounces={false}
            data={this.state.mentionList}
            renderItem={this.renderSuggestionsViewItem}
            keyboardShouldPersistTaps="always"
            keyExtractor={(item) => item.id}
            extraData={this.state}
          />
        </View>
      );
    } else {
      // alert('No match found');
      return null;
    }
  };

  suggestionsItem(item, fN, lN) {
    const name = fN + ' ' + lN;
    return (
      <TouchableWithoutFeedback onPress={() => this.onMentionSelection(item)}>
        <View style={styles.box}>
          <View style={[styles.box1, {backgroundColor: item.color}]}>
            <Text style={styles.characterTextStyle}>
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.box2}>
            <Text style={styles.username}>{name}</Text>
            <Text style={styles.emailAddress}>{item.emailId}</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  checkRecordAudioPermission = () => {
    switch (Platform.OS) {
      case 'android':
        return PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ])
          .then((result) => {
            if (
              result['android.permission.RECORD_AUDIO'] &&
              result['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted'
            ) {
              return Promise.resolve(true);
            } else if (
              result['android.permission.RECORD_AUDIO'] ||
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
              return Promise.reject(false);
            }
            return Promise.reject(false);
          })
          .catch((e) => {
            console.error('ERROR', e);
            return Promise.reject(false);
          });
      case 'ios':
        // Check iOS permissions
        return check(PERMISSIONS.IOS.MICROPHONE)
          .then((value) => {
            if (value === 'granted') {
              return Promise.resolve(true);
            }
            return request(PERMISSIONS.IOS.MICROPHONE)
              .then((result) => {
                console.log('REQUESTED PERMISSION', result);
                if (result === 'blocked') {
                  Alert.alert(
                    'Alert',
                    'Please Go into Settings -> Applications ->' +
                      APP_NAME +
                      ' -> Permissions and Allow permissions to continue',
                  );
                  return Promise.reject(false);
                }
                return Promise.reject(false);
              })
              .catch((e) => {
                console.error('ERROR', e);
                return Promise.reject(false);
              });
          })
          .catch((e) => {
            console.error('ERROR', e);
            return Promise.reject(false);
          });

      default:
        return Promise.reject(false);
    }
  };

  handlePermission = (fromPress) => {
    this.checkRecordAudioPermission()
      .then((flag) => {
        if (flag) {
          if (fromPress) {
            //singleClick
            // wait 0.5 seconds
            // Keyboard.dismiss();
            //this.refs.tooltipRef.toggleTooltip();
            this.toggleTip();
          } else {
            //from long press
            try {
              this._toggleRecord();
            } catch (e) {
              console.log(e);
            }
          }
        } else {
          console.error('Permission Denied');
        }
      })
      .catch((e) => {
        console.error('E', e);
      });

    // switch (Platform.OS) {
    //   case 'android':
    //     PermissionsAndroid.requestMultiple([
    //       PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    //       PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    //     ]).then((result) => {
    //       if (
    //         result['android.permission.RECORD_AUDIO'] &&
    //         result['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted'
    //       ) {
    //         //accepted
    //         if (fromPress) {
    //           //singleClick
    //           // wait 0.5 seconds
    //           // Keyboard.dismiss();
    //           //this.refs.tooltipRef.toggleTooltip();
    //           setTimeout(() => {
    //             this.toggleTip();
    //           }, 100);
    //         } else {
    //           //from long press
    //           if (this.isComponentMounted) {
    //             try {
    //               this._toggleRecord();
    //             } catch (e) {
    //               console.log(e);
    //             }
    //           }
    //         }
    //       } else if (
    //         result['android.permission.RECORD_AUDIO'] ||
    //         result['android.permission.WRITE_EXTERNAL_STORAGE'] ===
    //           'never_ask_again'
    //       ) {
    //         Alert.alert(
    //           'Alert',
    //           'Please Go into Settings -> Applications -> ' +
    //             APP_NAME +
    //             ' -> Permissions and Allow permissions to continue',
    //           [
    //             {
    //               text: 'Cancel',
    //               onPress: () => console.log('Cancel Pressed'),
    //               style: 'cancel',
    //             },
    //             {text: 'OK', onPress: () => Linking.openSettings()},
    //           ],
    //           {cancelable: false},
    //         );
    //         // Alert.alert(
    //         //   'alert',
    //         //   'Please Go into Settings -> Applications -> APP_NAME -> Permissions and Allow permissions to continue',
    //         // );
    //       }
    //     });
    //     break;
    //   case 'ios':
    //     // Check iOS permissions
    //     request(PERMISSIONS.IOS.MICROPHONE).then((result) => {
    //       if (result === 'granted') {
    //         //accepted
    //         if (fromPress) {
    //           //singleClick
    //           // wait 0.5 seconds
    //           //Keyboard.dismiss();
    //           //this.refs.tooltipRef.toggleTooltip();
    //           setTimeout(() => {
    //             this.toggleTip();
    //           }, 150);
    //         } else {
    //           //from long press
    //           if (this.isComponentMounted && this.state.longPressed) {
    //             try {
    //               this._toggleRecord();
    //             } catch (e) {
    //               console.log(e);
    //             }
    //           }
    //         }
    //       } else if (result['PERMISSIONS.IOS.MICROPHONE'] === 'blocked') {
    //         Alert.alert(
    //           'alert',
    //           'Please Go into Settings -> Applications ->' +
    //             APP_NAME +
    //             ' -> Permissions and Allow permissions to continue',
    //         );
    //       }
    //     });
    //     break;
    //   default:
    //     break;
    // }
  };

  onUrlPreviewDeleteClick = () => {
    this.setState({
      isUrlPreviewDeleteClicked: true,
    });
    if (this.urlPreview && this.urlPreview.current) {
      this.urlPreview.current.setUrl(null);
      this.urlPreviewData = null;
    }
  };

  renderCamera = (color = 'black') => {
    if (this.props.renderCamera) {
      return this.props.renderCamera(color);
    }
    return (
      <TouchableOpacity
        style={[styles.iconStyle, this.props.iconStyle]}
        onPress={() => {
          // console.log('check camera props', this.props.onCameraClick);

          // if (this.props.onCameraClick) {
          //   this.props.onCameraClick();
          // }

          if (
            this.props?.isValidData &&
            typeof this.props.isValidData === 'function'
          ) {
            if (this.props.isValidData()) {
              this.refs.attachments.setText(this.inputTextValue || '');
              this.refs.attachments.handleItemClick({key: 3});
            }
          } else {
            this.refs.attachments.setText(this.inputTextValue || '');
            this.refs.attachments.handleItemClick({key: 3});
          }
        }}>
        <Icon color={color} name={'Camera'} size={normalize(22)} />
      </TouchableOpacity>
    );
  };

  renderAudio = (color = 'black') => {
    return (
      <>
        {this.state.enablePlayer && (
          <TouchableOpacity
            style={[
              styles.sendViewStyle,
              this.props.sendViewStyle,
              styles.FloatingButtonStyle,
            ]}
            onPress={this.deleteClick}>
            <Icon color={'#FFFFFF'} name={'Delete_T'} size={normalize(14)} />
          </TouchableOpacity>
        )}
        {!this.sendVisible && this.props.canRecord ? (
          <View style={this.props.buttons_container}>
            <TouchableOpacity
              //keyboardShouldPersistTaps="always"
              onLongPress={this.handlePressIn}
              onPress={this.audioActionClick}
              onPressOut={() => {
                if (
                  this.props?.isValidData &&
                  typeof this.props.isValidData === 'function'
                ) {
                  if (this.props.isValidData()) {
                    this.handlePressOut();
                  }
                } else {
                  this.handlePressOut();
                }
              }}
              style={[styles.iconStyle, this.props.iconStyle]}>
              <Icon color={color} name={'mic'} size={normalize(22)} />
            </TouchableOpacity>
          </View>
        ) : null}
      </>
    );
  };

  onAttachmentEditPress = () => {
    let mediaList = this.state.editContext.components.filter(
      ({componentType}) => {
        return componentType !== 'text';
      },
    );
    let mszText =
      this.state.editContext.components.find(({componentType}) => {
        return componentType === 'text';
      })?.componentBody || '';
    mediaList = mediaList.map((obj) => {
      return {
        type: obj.componentType,
        uri: obj.thumbnailURL,
        ...JSON.parse(JSON.stringify(obj)),
      };
    });

    navigate(ROUTE_NAMES.MEDIA_PREVIEW, {
      caption: this.inputTextValue,
      mediaList: mediaList,
      boardData: this.props.boardData,
      boardDataId: this.props.boardID,
      newThreadData: this.props.newThreadData,
      mszText: mszText,
      onMediaUploadedCB: this.onMediaUploadedCB,
    });
  };

  onCancelEditPress = () => {
    this.setState({editContext: null, inputTextValue: ''});
  };

  setEditContext = async (post) => {
    try {
      let components = await post.components.fetch();
      const component = components?.find(
        ({componentType}) => componentType === 'text',
      );

      if (component) {
        this.setState(
          {editContext: post, inputTextValue: component?.componentBody || ''},
          () => this.focusOnInput(),
        );
      }
    } catch (e) {
      console.log('error in setEditContext', e);
    }
  };

  renderEditSection() {
    let editContext = this.state.editContext;
    if (!editContext) {
      return null;
    }
    try {
      let components = editContext.components.fetch();
      const count = components.filter(
        ({componentType}) => componentType !== 'text',
      ).length;
      const attachmentText = `${count} ${
        count > 1 ? 'Attachments' : 'Attachment'
      }`;
      return (
        <View style={styles.editSectionMain}>
          <Text style={styles.editTextStyle}>{'Edit message'}</Text>
          <View style={{flex: 1}} />
          <Icon name={'Attachment'} size={normalize(16)} color={'#FFFFFF'} />
          <View style={{width: 3}} />
          <Text onPress={this.onAttachmentEditPress} style={styles.editTextStyle}>
            {attachmentText}
          </Text>
          <View style={{width: 16}} />
          <Text
            onPress={this.onCancelEditPress}
            style={[styles.editTextStyle, styles.cancelColor]}>
            {'Cancel'}
          </Text>
        </View>
      );
    } catch (e) {
      return (
        <View />
      );
    }
  }

  onLoad = (data) => {
    if (data) {
      this.urlPreviewData = data;
    }
  };

  attachmentOnPress = () => {
    if (
      this.props.newThreadData &&
      this.props.newThreadData.isNewChat &&
      this.props.newThreadData.contactData &&
      this.props.newThreadData.contactData.length === 0
    ) {
      this.props?.handleEmptyContacts();
      return;
    }
    if (
      this.props?.isValidData &&
      typeof this.props.isValidData === 'function'
    ) {
      if (this.props.isValidData()) {
        this.attachementClickAction();
      }
    } else {
      this.attachementClickAction();
    }
  };

  onResetComposeBar = () => {
    this.setText();
  };

  render() {
    console.log('=================MessageComposebar.js================');
    let tempFlag =
      (isAndroid && !this.recorder.isRecording && this.state.enablePlayer) ||
      this.recorder.isRecording;
    const color = '#BDC1C6';
    return (
      <View style={styles.sendStyle1}>
        {!this.state.isUrlPreviewDeleteClicked && !this.state.isMentions && (
          <UrlPreview
            ref={this.urlPreview}
            onDeleteClick={this.onUrlPreviewDeleteClick}
            onLoad={this.onLoad}
          />
        )}
        <View style={{alignItems: 'center'}}>
          {this.state.isMentions
            ? this.renderSuggestionsView(this.props.contactData)
            : null}
          {this.renderEditSection()}
          <Attach
            ref="attachments"
            boardData={this.props.boardData}
            boardID={this.props.boardDataId}
            newThreadData={this.props.newThreadData}
            cameraAction={this.handleCameraActionFromAttachment}
            onResetComposeBar={this.onResetComposeBar}
            isFromNewDR={this.props.isFromNewDR || false}
          />
          <Camera
            ref="camera"
            boardData={this.props.boardData}
            boardID={this.props.boardDataId}
            newThreadData={this.props.newThreadData}
            message={this.inputTextValue}
          />
          {this.renderTypingIndicator()}
          <View style={styles.borderDivStyle} />

          <View
            style={[
              styles.ViewGroup,
              this.props.containerStyle,
              {alignItems: 'center'},
            ]}>
            <TextInput
              ref="input"
              autoFocus={this.props.autoFocus}
              onBlur={this.onBlur}
              onFocus={this.onFocus}
              style={[
                styles.inputTextStyle,
                this.props.inputTextStyle,
                tempFlag ? {height: 0} : emptyObject,
              ]}
              multiline
              placeholderTextColor="#BDC1C6"
              placeholder={this.props.placeholder || 'Type your message'}
              onChangeText={this.onComposebarTextChange}
              value={this.inputTextValue}
            />

            {this.recorder.isRecording ? (
              <View style={[styles.ViewGroupTimer]}>
                <Icon color={'#DD3646'} name={'Record'} size={20} />
                <Text style={styles.inputTextStyleTimer}>
                  {this.state.recordTime}
                </Text>
              </View>
            ) : !this.recorder.isRecording && this.state.enablePlayer ? (
              <View style={[styles.ViewGroupTimer]}>
                <TouchableHighlight
                  style={{borderRadius: 5}}
                  underlayColor="#71000000"
                  onPress={this._playPause}>
                  <Icon
                    color={'#0D6EFD'}
                    name={this.state.playPauseButton}
                    size={normalize(24)}
                  />
                </TouchableHighlight>
                <Text style={styles.inputTextStylePlay}>
                  {this.player.isPlaying
                    ? this.millisToMinutesAndSeconds(
                        this.player.currentTime < 1
                          ? this.player.duration
                          : this.player.currentTime -
                              this.player.duration +
                              this.player.duration,
                      )
                    : this.state.recordTime}
                </Text>
              </View>
            ) : (
              <View style={styles.placeHolder}>
                <View
                  style={[
                    styles.inputTextStyle1,
                    this.props.buttons_container,
                  ]}>
                  <TouchableOpacity
                    style={styles.iconStyle}
                    onPress={this.attachmentOnPress}>
                    <Icon
                      color={color}
                      name={'Attachment'}
                      size={normalize(22)}
                    />
                  </TouchableOpacity>
                  {!this.sendVisible &&
                    this.props.isShowCamera &&
                    this.renderCamera(color)}
                </View>
              </View>
            )}
            {this.renderAudio(color)}
            <View style={styles.FloatingButtonStyle1}>
              <View style={{left: -18, bottom: -20}}>
                <ToolTip
                  actionType={'none'}
                  ref="tooltipRef"
                  withPointer={false}
                  height={40}
                  width={228}
                  backgroundColor={'#0D6EFD'}
                  popover={
                    <View style={[styles.toolTipStyle1]}>
                      <Text style={styles.toolTipStyle2}>
                        Hold to start recording
                      </Text>
                      <Icon
                        color={'#FFF'}
                        name={'close'}
                        size={normalize(16)}
                      />
                    </View>
                  }
                />
              </View>
              {this.sendVisible && (
                <TouchableOpacity
                  onPress={this.sendActionBase}
                  style={[styles.sendViewStyle, this.props.sendViewStyle]}>
                  <Icon
                    color={'#FFFFFF'}
                    name={'SendIcon'}
                    size={normalize(14)}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={[styles.borderDivStyle, {borderColor: 'red'}]} />
        </View>
      </View>
    );
  }
}

MessageComposebar.propTypes = {
  onSendButtonClick: PropTypes.func,
  renderCamera: PropTypes.func,
  containerStyle: PropTypes.object,
  onCameraClick: PropTypes.func,
  isShowCamera: PropTypes.bool,
  buttons_container: PropTypes.object,
  send_button_container: PropTypes.object,
  inputTextStyle: PropTypes.object,
  iconStyle: PropTypes.object,
  buttons_sub_container: PropTypes.object,
  canRecord: PropTypes.bool,
  autoFocus: PropTypes.bool,
};

MessageComposebar.defaultProps = {
  onSendButtonClick: (data) => {},

  textDidChange: (data = '') => {},
  renderCamera: null,
  canRecord: true,
  containerStyle: {
    paddingVertical: 16,
    borderColor: '#E6E7E9',
    borderTopWidth: 1,
    paddingLeft: 20,
    paddingRight: 5,
  },
  autoFocus: false,
  buttons_container: {},
  send_button_container: {},
  inputTextStyle: {
    fontSize: normalize(16),
    lineHeight: normalize(20),
  },
  iconStyle: {},
  buttons_sub_container: {},
  onCameraClick: null,
  isShowCamera: false,
  sendViewStyle: {},
};

export default MessageComposebar;
