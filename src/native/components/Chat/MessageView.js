import React from 'react';
import {
  View,
  Animated,
  TouchableHighlight,
  PermissionsAndroid,
  Alert,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from 'react-native';
import { decode } from 'html-entities';
import withObservables from '@nozbe/with-observables';

import styles from './styles';
import { getPrettifiedFileSize } from './helper';
import * as Constants from '../KoraText';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import AsyncImage from './../../components/AsyncImage';
import AudioCompnent from './AudioCompnent';
import { ReactionWithText } from '../ReactionWithText';
import { MultiComponentView } from './extras/MultiComponentView';
import { Icon } from '../Icon/Icon';
import Autolink from 'react-native-autolink';
import { KoraCheckBox } from '../../screens/checkBox.js';
import { navigate } from '../../navigation/NavigationService';
import { ROUTE_NAMES } from '../../navigation/RouteNames';
import { ResourceState } from '../../realm/dbconstants';
import FileIcon from './FileIcon';
import { normalize } from '../../utils/helpers';
import { APP_NAME } from '../../utils/AppConstants';
import { KoraParsedText } from '../KoraParsedText';
import * as UsersDao from '../../../dao/UsersDao';
import { emptyArray } from '../../../shared/redux/constants/common.constants';
import { Platform } from 'react-native';
import { getHostName } from '../../utils/regexconstants';
import { downloadAtatchment } from '../../../shared/redux/actions/message-preview.action';
import { connect } from 'react-redux';
import { AudioPlayer } from './AudioPlayer';
import { ActivityIndicator } from 'react-native-paper';

import { singleAttachementPreview } from '../../screens/ChatScreen/SingleAttachementPreview';
import { SvgCssUri } from 'react-native-svg';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

const MessageStatus = ({ status, onClick = () => { } }) => {
  switch (status) {
    case ResourceState.NONE:
    case ResourceState.SENT:
      return (
        <View style={styles.doubleTick}>
          <Icon name={'Checked'} size={15} color="#4A90E2" />
        </View>
      );
    case ResourceState.SENDING:
      return <ActivityIndicator style={styles.doubleTick1} size={10} />;
    case ResourceState.FAILED:
      const failColor = '#DD3646';
      return (
        <TouchableHighlight
          onPress={onClick}
          underlayColor="rgba(0,0,0,0.2)"
          style={styles.mainContainer}>
          <View style={styles.textImageContainer}>
            <Text style={styles.timeStamp1}>Sending Failed</Text>
            <Icon name={'Retry'} size={15} color={failColor} />
          </View>
        </TouchableHighlight>
      );
    default:
      return <ActivityIndicator style={styles.doubleTick1} size={10} />;
  }
};


const TagsComponents = ({
  forwarded = false,
  edited = false,
  hasReminder = false,
  hasMention = false,
  remind = [],
  onPress = () => { },
}) => {
  if (!(forwarded || edited || hasReminder || hasMention)) {
    return null;
  }
  return (
    <View style={styles.tagsComponent1}>
      {/* <View style={{height: 5}} /> */}
      <View style={styles.tagsComponent2}>
        {forwarded ? (
          <View style={styles.tagContainer}>
            <Icon name={'forward'} size={18} color={'#5F6368'} />
            <Text style={styles.tagText}>{'Forwarded'}</Text>
          </View>
        ) : null}
        {edited ? (
          <View style={styles.tagContainer}>
            <Icon name={'edit'} size={18} color={'#07377F'} />
            <Text style={styles.tagText}>{'Edited'}</Text>
          </View>
        ) : null}
        {hasReminder ? (
          <TouchableOpacity
            style={styles.tagContainer}
            onPress={onPress(remind)}>
            <Icon name={'History'} size={18} color={'#07377F'} />
            <Text style={styles.tagText}>{'Reminder'}</Text>
          </TouchableOpacity>
        ) : null}
        {hasMention ? (
          <View style={styles.tagContainer}>
            <Icon name={'History'} size={18} color={'#07377F'} />
            <Text style={styles.tagText}>{'Mentioned'}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};


function renderImage(image) {
  let fileExtension = image?.split('.').pop().toLowerCase();

  return (
    <View style={localStyles.unfurlUrl3}>
      {fileExtension && fileExtension === 'svg' ? (
        <SvgCssUri height={50} width={80} uri={image} />
      ) : (
          <Image source={{ uri: image }} style={localStyles.unfurlUrl4} />
        )}
    </View>
  );
}

export const renderUnForURL = (
  componentId,
  componentBody,
  linkPreviews,
  selfText,
  isEnableClick = true
) => {
  let words = componentBody?.split(' ') || emptyArray;
  if (words.length === 1) {
    words = componentBody?.split('\n');
  }

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (isEnableClick) {
          Linking.openURL(linkPreviews[0]?.url || linkPreviews[0]?.source);
        }
      }}
      key={componentId} style={localStyles.unfurUrlStyle}>
      <View style={localStyles.unfurlUrl1}>
        <View
          style={[
            selfText ? localStyles.unfurlUrl6 : localStyles.emptyStyle,
            localStyles.unfurlUrl7,
          ]}>
          <View style={localStyles.unfurlUrl2}>
            <Text numberOfLines={1} style={styles.urlTextTitle}>
              {linkPreviews[0].title}{' '}
            </Text>
            <Text numberOfLines={2} style={styles.urlSubText}>
              {linkPreviews[0].description}{' '}
            </Text>
            <Autolink
              numberOfLines={1}
              style={localStyles.autoLinkStyle}
              mention="instagram"
              text={getHostName(componentBody)}
              stripPrefix={false}
              url={false}
            />
          </View>

          {linkPreviews[0].image && renderImage(linkPreviews[0].image)}
        </View>
      </View>

      <View
        style={[
          selfText ? localStyles.unfurlUrl8 : localStyles.emptyStyle,
          localStyles.unfurlUrl5,
        ]}>
        {words.length > 1 ? (
          <Autolink
            style={selfText ? styles.senderText : styles.text}
            text={componentBody}
            stripPrefix={true}
            url={true}
            webFallback={true}
          />
        ) : (
            <Autolink
              numberOfLines={1}
              style={selfText ? styles.senderText : styles.text}
              text={componentBody}
              stripPrefix={true}
              url={true}
              webFallback={true}
            />
          )}
      </View>
    </TouchableWithoutFeedback>
  );
};
const audioPlayer = new AudioPlayer();

class _MessageView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      playerMode: false,
      selectedComponentID: '',
      reminderTime: '',
    };
    this._animated = new Animated.Value(1);
    this.reminderRef = React.createRef();
  }

  get highlighted() {
    return this.props.highlighted || false;
  }
  componentDidMount() {
    if (this.props.universalSearch) {
      setTimeout(() => {
        this.props.scrollTo(this.props.searchMessageId);
      }, 100);
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.download !== prevProps.download &&
      this.props.download?.mediaUrl !== prevProps.download?.mediaUrl
    ) {
      this.setState({
        playerMode: this.props.download?.mediaUrl ? true : false,
      });
    }
  }

  _reminderIconClicked = (item) => {
    const reminderTime = item[0].remindAt;
    this.props.onReminderInfoPressed(reminderTime);
  };

  onBottomUpModalClicked = () => {
    this.reminderRef.current.closeBottomDrawer();
  };

  renderReplyComponent(linkPreviews = [], resolvedReplyTo, selfMessage) {
    const { replyMessage, replyComponents, replyFrom } = this.props;
    if (replyMessage) {
      const isIamOwner = replyFrom?.id === UsersDao.getUserId();
      let fromId = replyFrom?.id;
      // const selfMessage = fromId === UsersDao.getUserId();

      const mediaComponentsArray = ['image', 'video', 'audio', 'attachment'];
      const mediaComponents = replyComponents?.filter((component) =>
        mediaComponentsArray.includes(component.componentType),
      );

      const otherComponents = replyComponents?.filter(
        (component) => !mediaComponentsArray.includes(component.componentType),
      );

      const authorName =
        replyFrom?.id === UsersDao.getUserId()
          ? 'You'
          : replyFrom?.fN + ' ' + replyFrom?.lN;
      return (
        <TouchableHighlight
          onPress={() => {
            this.props.scrollTo && this.props.scrollTo(replyMessage.messageId);
          }}
          underlayColor="rgba(0,0,0,0.2)"
          style={{
            flexDirection: 'row',
            borderLeftWidth: 3,
            borderLeftColor: selfMessage ? '#BDC1C6' : '#0D6EFD',
            backgroundColor: selfMessage ? '#EFF0F1' : '#E7F1FF',
            alignItems: 'center',
            borderRadius: 4,
            paddingBottom: 5,
            paddingTop: 5,
            marginBottom: 5,
          }}>
          <>
            <View style={localStyles.authorStyle1}>
              <View style={localStyles.emptyStyle}>
                <Text style={styles.authorNameTextStyle}>{authorName}</Text>
              </View>
              <View style={localStyles.emptyStyle}>
                {otherComponents?.map((c, index) =>
                  this.renderComponent(
                    c,
                    selfMessage,
                    linkPreviews,
                    this.props.item?.mentions,
                    index,
                  ),
                )}
                {this.renderMediaComponents(mediaComponents, true, selfMessage)}
              </View>
            </View>
          </>
        </TouchableHighlight>
      );
    }
    return <View />;
  }

  renderFileComponent({ filename, componentSize, fileType }) {
    return (
      <View style={localStyles.fileComponent1}>
        <View style={localStyles.filterComponent1}>
          {fileType ? (
            <View style={localStyles.filterComponent2}>
              <FileIcon width={36} height={45} type={fileType} />
            </View>
          ) : (
              <View style={localStyles.filterComponent3}>
                <Icon name={'document'} size={16} color={'#85B7FE'} />
              </View>
            )}
        </View>
        <View style={localStyles.filterComponent4}>
          <View style={localStyles.filterComponent5}>
            <Text
              numberOfLines={1}
              lineBreakMode={'clip'}
              style={styles.fileNameTextStyle}>
              {filename}
            </Text>
          </View>
          <View style={localStyles.filterComponent6}>
            <View>
              <Text>&nbsp;</Text>
            </View>
            <View style={localStyles.filterComponent7}>
              <Text style={styles.fileSizeTextStyle}>
                {getPrettifiedFileSize(componentSize)}
              </Text>
              <AntDesignIcon
                style={localStyles.filterComponent8}
                name={'arrowdown'}
                color={'#5F6368'}
              />
            </View>
          </View>
        </View>
      </View>
    );
  }

  renderImageComponent({ thumbnailURL }) {
    return (
      <AsyncImage
        style={styles.imageComponent}
        placeholderSource={require('./../../assets/logo.png')}
        source={{
          uri: thumbnailURL,
        }}
      />
    );
  }

  componentWillUnmount() {
    if (audioPlayer) {
      audioPlayer?.stop();
    }
  }

  particularMediaClick = (componentID) => {
    this.props.download = null;
    this.onClick(componentID);
  };

  playPauseClick = (url, audioCallback = null) => {
    if (audioPlayer) {
      if (audioPlayer.isPlayingAudio()) {
        audioPlayer.pauseAudio();
        if (url !== audioPlayer.getFilePath()) {
          audioPlayer.stop();
          setTimeout(() => {
            audioPlayer._reloadPlayer(url, audioCallback);
          }, 500);
        }
      } else {
        if (url === audioPlayer.getFilePath()) {
          setTimeout(() => {
            audioPlayer._playPause(url, audioCallback);
          }, 500);
        } else {
          audioPlayer.stop();
          setTimeout(() => {
            audioPlayer._reloadPlayer(url, audioCallback);
          }, 500);
        }
      }
    }
  };
  sliderSeek = (percentage) => {
    if (audioPlayer && audioPlayer.isPlayingAudio()) {
      audioPlayer.seek(percentage);
    }
  };
  sliderValue = () => {
    return 5;
  };

  getPlayerCurrentTime = () => {
    return 0;
  };

  renderMediaComponents(components, isReply = false, selfMessage = false) {
    let { selectedComponentID, playerMode } = this.state;
    const totalComponents = components?.length;
    if (totalComponents === 0) {
      return <></>;
    }
    if (totalComponents === 1 && components[0].componentType === 'audio') {
      let component = components[0];
      let item = {
        ...this.props.item._raw,
        componentFileId: component.componentFileId,
      };

      return (
        <AudioCompnent
          playPauseClick={(url, audioCallback) =>
            this.playPauseClick(url, audioCallback)
          }
          sliderSeek={(percentage) => {
            if (audioPlayer && audioPlayer.isPlayingAudio()) {
              audioPlayer?.seek(percentage);
            }
          }}
          item={item}
          sliderMax={100}
          sliderMin={1}
          btnState="Play"
          isSelfComponent={selfMessage}
          duration={component?.componentLength}
        />
      );
    }
    return (
      <MultiComponentView
        borderRadius={10}
        components={components}
        particularMediaClick={this.particularMediaClick}
        onLongClickMedia={() => {
          if (isReply) {
            this.onLongPress();
          }
        }}
      />
    );
  }

  renderDeletedComponent(selfText = false) {
    let componentBody = 'This message was deleted';
    return (
      <View
        style={[
          styles.paddingTop5,
          selfText ? localStyles.unfurlUrl6 : localStyles.emptyStyle,
        ]}>
        <Text style={localStyles.deletedTextStyle1} text={componentBody}>
          {componentBody}
        </Text>
      </View>
    );
  }

  renderComponent = (
    component,
    selfText = false,
    linkPreviews = [],
    mentions,
    index,
  ) => {
    const { componentType, componentId, componentBody, ...rest } = component;
    const componentStyle = {
      paddingVertical: 10,
      paddingHorizontal: 12,
      backgroundColor: 'white',
      borderRadius: 4,
      borderColor: '#e4e5e8',
    };
    const componentStyle1 = {
      paddingVertical: 10,
      paddingHorizontal: 12,
      backgroundColor: 'white',
      borderRadius: 4,
      borderColor: '#e4e5e8',
      flexShrink: 1,
      overflow: 'hidden',
    };

    if (componentType === 'text') {
      if (linkPreviews && linkPreviews.length > 0) {
        return renderUnForURL(
          componentId,
          componentBody,
          linkPreviews,
          selfText,
        );
      } else {
        return (
          <View key={componentId} style={styles.paddingTop5}>
            <KoraParsedText
              style={selfText ? styles.senderText : styles.text}
              isDR={false}
              atMentionStyle={false}
              mentions={mentions}>
              {decode(componentBody)}
            </KoraParsedText>
          </View>
        );
      }
    } else if (componentType === 'attachment') {
      const { componentData, componentSize } = component;
      const filename = componentData?.filename;

      let fileType = null;

      if (filename) {
        fileType = filename.split('.').pop().toLowerCase();
      }
      return (
        <View key={componentId} style={styles.paddingTop5}>
          <TouchableHighlight
            onLongPress={this.onLongPress}
            onPress={() => {
              this.onClick(componentId);
            }}>
            <View style={componentStyle}>
              {this.renderFileComponent({ filename, componentSize, fileType })}
            </View>
          </TouchableHighlight>
        </View>
      );
    } else if (componentType === 'image' || componentType === 'video') {
      const { componentData, thumbnailURL } = rest;
      const { filename } = componentData;
      if (componentType === 'video') {
      }
      return (
        <View key={componentId} style={styles.paddingTop5}>
          <View key={componentId} style={componentStyle1}>
            {this.renderImageComponent({ thumbnailURL })}
          </View>
        </View>
      );
    } else {
      return (
        <View key={componentId} style={styles.paddingTop5}>
          <View style={componentStyle}>
            <Text style={selfText ? styles.senderText : styles.text}>
              {componentType}
            </Text>
          </View>
        </View>
      );
    }
  };

  onLongPress = () => {
    const { item } = this.props;
    const { state } = item;

    if (!(state && state === 'recalled')) {
      if (
        this.props.onLongPress &&
        typeof this.props.onLongPress === 'function'
      ) {
        this.props.onLongPress(this.props.item);
      }
    }
  };

  onClick = (componentID) => {
    const { item } = this.props;
    const { state } = item;

    if (!(state && state === 'recalled')) {
      this.checkPermissions(this.props.item, componentID);
    }
  };

  openMediaView(item, componentID) {
    let { components } = this.props;
    if (item && item.messageId && item.components) {
      let newComponents = [];
      components?.map((data) => {
        if (
          data.componentType === 'image' ||
          data.componentType === 'video' ||
          data.componentType === 'audio' ||
          data.componentType === 'attachment'
        ) {
          newComponents.push(data);
        }
      });
      if (
        newComponents.length === 1 &&
        components[0].componentType === 'audio'
      ) {
      } else if (newComponents.length > 0) {
        if (components[0]?.componentFileId === null) {
          return;
        }
        singleAttachementPreview(components, item.messageId, (status) => {
          if (!status) {
            navigate(ROUTE_NAMES.CHAT_MEDIA_VIEW, {
              components: components,
              messageId: item.messageId,
              titleName: this.props.titleName,
              selectedComponentID: componentID,
            });
          }
        });
      }
    }
  }

  checkPermissions(item, componentID) {
    switch (Platform.OS) {
      case 'android':
        PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]).then((result) => {
          if (
            result['android.permission.READ_EXTERNAL_STORAGE'] &&
            result['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted'
          ) {
            this.openMediaView(item, componentID);
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
                { text: 'OK', onPress: () => Linking.openSettings() },
              ],
              { cancelable: false },
            );
          }
        });
        break;
      case 'ios':
        this.openMediaView(item, componentID);
        break;
      default:
        break;
    }
  }

  onEmojiClick = () => {
    console.log('emoji action');
    if (
      this.props.onEmojiClick &&
      typeof this.props.onEmojiClick === 'function'
    ) {
      this.props.onEmojiClick(this.props.item);
    }
  };

  hasReminder(reminder) {
    if (reminder?.length && reminder.length > 0) {
      const userId = UsersDao.getUserId();
      const reminderObj = reminder.find((obj) => obj.userId === userId);
      return (
        new Date(reminderObj?.remindAt) > new Date(), reminderObj?.remindAt
      );
    }
    return false;
  }

  checkThisBox(value, item) {
    this.props.onCheckBoxPress(item);
  }

  messageStatusOnClick = () => {
    const { item } = this.props;
    // if (typeof this.props.messageRetry === 'function') {
    console.log('entered in retry', item);
    this.props.messageRetry(item);
    // }
  };

  render() {
    const { item, components, fromMember, index, selectedIndex } = this.props;
    if (typeof item?.isValid === 'function' && !item.isValid()) {
      return null;
    }
    let isSelectedMessage = this.props.isSelectedMessage || false;

    let resolvedReplyTo = null;
    if (item?.replyTo) {
      resolvedReplyTo = this.props.replyToResolves?.filter(
        (e) => e.messageId === item?.replyTo?.messageId,
      );
    }

    let sadCount = item?.sadCount;
    let shockCount = item?.shockCount;
    let likeCount = item?.likeCount;
    let laughCount = item?.laughCount;
    let angerCount = item?.angerCount;
    let unlikeCount = item?.unlikeCount;
    let state = item?.state;
    let linkPreviews = item?.linkPreviews;

    const multiEmojiObj = {
      sadCount,
      shockCount,
      likeCount,
      laughCount,
      angerCount,
      unlikeCount,
    };
    const selfMessage = item.isSender === true ? true : false;
    var disableTouch = state && state === 'recalled';
    if (this.props.multiSelectOn) {
      disableTouch = true;
    }
    const messageStyle = selfMessage
      ? styles.sendMessage
      : styles.receiveMessage;
    const mediaComponentsArray = ['image', 'video', 'audio', 'attachment'];
    const mediaComponents = components?.filter((component) =>
      mediaComponentsArray.includes(component.componentType),
    );

    const otherComponents = components?.filter(
      (component) => !mediaComponentsArray.includes(component.componentType),
    );
    const { messageState = ResourceState.SENT, remind } = item;
    const failedStateColor = '#FCEAED';
    const hasReminder = this.hasReminder(remind);
    const isForward = item.forward;
    const isFailedState = messageState == ResourceState.FAILED;
    const widthInCaseOfMultiSelect = this.props.multiSelectOn ? '90%' : '100%';
    let highlightMessage =
      this.props.universalSearch &&
      item?.messageId === this.props.searchMessageId;
    let isEdited = item?.isEdited;
    if (index == selectedIndex){
      highlightMessage = true
    }
   
  //  console.log('index', index)
    // if (index == 5){
    //   highlightMessage = true
    // }
    // else {
    //   highlightMessage =  false
    // }
    return (
      <>
        {isEdited ? <View
          style={{
            paddingHorizontal: 20,
            flexDirection: selfMessage ? 'row-reverse' : 'row',
          }}> 
          <TagsComponents
            edited={true}
          // onPress={openReminderInfo}
          // hasMention={true}
          />
        </View> : null}

        {item.showSenderTime || hasReminder ? (
          <View
            style={{
              paddingHorizontal: 20,
              flexDirection: selfMessage ? 'row-reverse' : 'row',
              width: this.props.multiSelectOn ? '90%' : '100%',
              alignItems: 'center',
            }}>
            {/* <TagsComponents
              edited={true}
            // onPress={openReminderInfo}
            // hasMention={true}
            /> */}

            {selfMessage ? (
              <View style={localStyles.msgRetry1}>
                <MessageStatus
                  onClick={this.messageStatusOnClick}
                  status={messageState}
                />
              </View>
            ) : null}
            {isFailedState
              ? null
              : item.showSenderTime && (
                <Text style={styles.timeStamp}>{item.prettifiedTime}</Text>
              )}

            <Text>&nbsp;</Text>
            <TouchableHighlight style={localStyles.failedState1}>
              <>
                <ReactionWithText data={item} />
                <MultiEmoji
                  data={multiEmojiObj}
                  sumPosition={selfMessage ? 'left' : 'right'}
                  onClick={this.onEmojiClick}
                />
              </>
            </TouchableHighlight>
            {hasReminder && (
              <View style={localStyles.hasReminder1}>
                <TouchableOpacity
                  style={localStyles.hasReminder11}
                  onPress={this._reminderIconClicked.bind(this, remind)}>
                  <Icon name={'History'} size={18} color={'#5F6368'} />
                  <Text
                    numberOfLines={1}
                    style={localStyles.hasRemiderTextStyle}>
                    Reminder
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : null}
        <View style={localStyles.hasReminder2}>
          <Animated.View
            style={[
              {
                flexDirection: selfMessage ? 'row-reverse' : 'row',
                paddingHorizontal: 20,
                marginVertical: 5,
                width: widthInCaseOfMultiSelect,
              },
              { opacity: this._animated },
            ]}>
            <TouchableHighlight
              onLongPress={this.onLongPress}
              disabled={disableTouch}
              underlayColor="rgba(0,0,0,0.2)"
              style={[
                messageStyle,
                isFailedState ? { backgroundColor: failedStateColor } : {},
                this.highlighted
                  ? { borderColor: '#FF784B', borderWidth: 2 }
                  : {},
                highlightMessage
                  ? {
                    borderColor: '#FF784B',
                    borderWidth: 2,
                    backgroundColor: '#FFF1ED',
                    borderBottomColor: '#FF784B',
                    borderBottomWidth: 2,
                  }
                  : {},
              ]}>
              {state && state === 'recalled' ? (
                this.renderDeletedComponent(selfMessage)
              ) : (
                  <View style={localStyles.deleteComponent1}>
                    {(!selfMessage && item.showSenderName) || isForward ? (
                      <View
                        style={{
                          flexDirection: selfMessage ? 'row-reverse' : 'row',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          paddingBottom: item.groupMessage ? 8 : 0,
                        }}>
                        {!selfMessage && item.groupMessage && (
                          <Text
                            numberOfLines={1}
                            adjustsFontSizeToFit={true}
                            style={[
                              styles.userNameText,
                              //{width: isForward ? '70%' : '100%'},
                            ]}>
                            {fromMember?.fN} {fromMember?.lN}
                          </Text>
                        )}

                        {isForward ? (
                          <>
                            {selfMessage && (
                              <View style={localStyles.forwardStyle1} />
                            )}
                            <View style={styles.tagContainer}>
                              <Icon
                                name={'forward'}
                                size={18}
                                color={'#5F6368'}
                              />
                              <Text style={localStyles.forwardedText}>
                                Forwarded
                            </Text>
                            </View>
                          </>
                        ) : null}
                      </View>
                    ) : null}
                    {this.renderReplyComponent(linkPreviews, resolvedReplyTo, selfMessage)}
                    {otherComponents?.map((c, index) =>
                      this.renderComponent(
                        c,
                        selfMessage,
                        linkPreviews,
                        item?.mentions,
                        index,
                      ),
                    )}
                    {this.renderMediaComponents(
                      mediaComponents,
                      false,
                      selfMessage,
                    )}
                  </View>
                )}
            </TouchableHighlight>
          </Animated.View>
          {this.props.multiSelectOn &&
            state &&
            state !== 'recalled' &&
            !isFailedState ? (
              <View style={localStyles.multiSelect1}>
                <KoraCheckBox
                  isChecked={isSelectedMessage}
                  onValueChange={(newValue) => {
                    this.checkThisBox(newValue, item);
                  }}
                />
              </View>
            ) : null}
        </View>
      </>
    );
  }
}

export const MultiEmoji = ({
  data,
  onClick = () => { },
  sumPosition = null,
  textColor = '#202124',
  showCount = 'false',
  forceShowCount = false,
  border = true,
  spacing = 5,
}) => {
  const allCounts = Object.values(data);
  const maxCnt = Math.max(...allCounts);

  if (maxCnt === 0) {
    return null;
  }

  let emojiOnTop = 'like';
  for (let key in data) {
    if (data[key] === maxCnt) {
      emojiOnTop = key.slice(0, -5);
    }
  }
  const sum = Object.values(data).reduce((a, b) => a + b, 0);

  if (isNaN(sum)) {
    return null;
  }
  const emojis = Object.entries(data)
    .filter(([key, val]) => val !== 0)
    .map(([key, val]) => key.split('Count')[0]);
  const SumComponent = () => {
    if (sumPosition == null || (sum <= 1 && !forceShowCount && sum < 1)) {
      return null;
    }
    return (
      <>
        <View style={{ width: spacing }} />
        <Text
          style={{
            fontSize: normalize(14),
            lineHeight: 20,
            fontWeight: '500',
            color: '#5F6368',
            marginRight: 5,
          }}>
          {sum}
        </Text>
      </>
    );
  };

  return (
    <View style={localStyles.multiEmoji3}>
      {emojis.map((emoji) => {
        return (
          <View key={emoji} style={localStyles.multiEmoji2}>
            <TouchableHighlight
              underlayColor="rgba(0,0,0,0.2)"
              onPress={() => {
                onClick();
              }}
              style={[localStyles.multiEmoji1, { borderWidth: border ? 2 : 0 }]}>
              <View style={{ flexDirection: 'row' }}>
                <Icon name={emoji} size={19} />
              </View>
            </TouchableHighlight>
          </View>
        );
      })}
      <SumComponent />
    </View>
  );
};

const mapStateToProps = (state) => {
  const { preview } = state;
  return {
    download: preview.downloadAttachment,
  };
};

const enhance = withObservables([], ({ item }) => ({
  item: item.observe(),
}));

export const MessageView = connect(mapStateToProps, {
  downloadAtatchment,
})(enhance(_MessageView));

const localStyles = StyleSheet.create({
  authorStyle1: {
    flexDirection: 'column',
    marginHorizontal: 10,
    minWidth: 40,
  },
  filterComponent1: {
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterComponent2: {
    height: 40,
    paddingVertical: 4,
    paddingHorizontal: 5,
  },
  filterComponent3: {
    paddingVertical: 4,
    paddingHorizontal: 5,
    borderWidth: 0,
    borderBottomWidth: 2,
    borderRadius: 3,
    backgroundColor: '#F8F9FA',
    borderColor: '#85B7FE',
  },
  filterComponent4: {
    paddingLeft: 10,
    flexDirection: 'column',
    flexShrink: 1,
  },
  filterComponent5: { paddingBottom: 9 },
  filterComponent6: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterComponent7: { flexDirection: 'row' },
  filterComponent8: { paddingLeft: 4 },
  unfurlUrl1: {
    flexDirection: 'column',
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    borderColor: '#85B7FE',
    borderWidth: 0.4,

    padding: 8,
  },
  unfurlUrl6: { alignItems: 'flex-end' },
  unfurlUrl2: {
    flex: 1,
    flexDirection: 'column',
    marginEnd: 5,
  },
  unfurlUrl7: { flexDirection: 'row' },
  unfurlUrl3: {
    height: 50,
    width: 80,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    borderColor: '#E4E5E7',
    borderWidth: 1,
    borderRadius: 4,
  },
  emptyStyle: {},
  unfurlUrl4: {
    height: 50,
    minHeight: 30,
    width: 80,
    borderColor: 'gray',
    resizeMode: 'cover',
    alignSelf: 'center',
    borderRadius: 6,
    alignContent: 'center',
    overflow: 'hidden',
  },
  unfurlUrl5: {
    marginTop: 5,
    marginEnd: 5,
    marginStart: 5,
  },
  unfurlUrl8: { alignItems: 'flex-start' },
  forwardedText: {
    fontStyle: 'italic',
    fontWeight: '400',
    fontSize: normalize(10),
    lineHeight: normalize(12),
    color: '#5F6368',
    paddingLeft: 5,
  },
  tagContainer: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    borderRadius: 4,
    marginHorizontal: 5,
    backgroundColor: '#EFF0F1',

    alignItems: 'center',
  },
  multiEmoji1: {
    position: 'relative',
    borderRadius: 19,
    zIndex: 20,
    marginHorizontal: -3,
    borderColor: 'white',
    backgroundColor: '#F8F9FA',
  },
  multiEmoji2: { flexShrink: 0, overflow: 'visible' },
  multiEmoji3: { flexDirection: 'row', alignItems: 'center' },
  multiSelect1: {
    width: 50,
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 10,
  },
  msgRetry1: { marginLeft: 7 },
  hasReminder1: {
    backgroundColor: '#EFF0F1',
    flexDirection: 'row',
    borderRadius: 4,
    padding: 4,
  },
  hasReminder11: { flexDirection: 'row', height: '100%' },
  hasReminder2: {
    flexDirection: 'row',
    flex: 1,

    justifyContent: 'flex-start',
  },
  hasRemiderTextStyle: {
    marginLeft: 5,
  },
  bottomUpmodal1: { flexDirection: 'column' },
  bottomUpmodal2: {
    flexDirection: 'row',
  },
  bottomUpmodal3: { marginBottom: 5 },
  bottomUpmodal4: { alignItems: 'center', paddingVertical: 20 },
  fileComponent1: { display: 'flex', flexDirection: 'row' },
  failedState1: { marginHorizontal: 3, flexDirection: 'row' },
  deleteComponent1: { flexDirection: 'column' },
  deletedTextStyle1: {
    fontWeight: 'normal',
    fontSize: normalize(16),
    fontStyle: 'italic',
    fontFamily: Constants.fontFamily,
    color: '#202124',
    lineHeight: 25,
  },
  cancelTextStyle1: {
    color: '#202124',
    fontWeight: '500',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  unfurUrlStyle: {
    paddingTop: 5,
    flexDirection: 'column',
    minWidth: '100%',
  },
  autoLinkStyle: {
    fontStyle: 'normal',
    color: '#202124',
    fontWeight: '400',
    fontSize: normalize(12),
    fontFamily: Constants.fontFamily,
    lineHeight: 18,
    marginTop: 3,
  },
  senderAutoLinkStyle: {
    fontStyle: 'normal',
    color: 'white',
    fontWeight: '400',
    fontSize: normalize(12),
    fontFamily: Constants.fontFamily,
    lineHeight: 18,
    marginTop: 3,
  },
  timeStamp1: {
    fontWeight: 'normal',
    fontSize: normalize(12),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#DD3646',
    opacity: 0.6,
  },
  forwardStyle1: { flex: 1 },
});
