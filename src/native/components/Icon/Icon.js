import React from 'react';
import {Image} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import {createIconSetFromIcoMoon} from 'react-native-vector-icons';
import icoMoonConfig from '../../../../assets/fonts/Icomoon/selection.json';
import {View} from 'react-native';
import {isEqual} from 'lodash';
import {normalize} from '../../utils/helpers';
import {emptyObject} from '../../../shared/redux/constants/common.constants';
//import { Avatar } from 'react-native-elements';
import {Avatar} from './Avatar';
import * as UsersDao from '../../../dao/UsersDao';
import {id} from 'date-fns/locale';
const IcoMoon = createIconSetFromIcoMoon(icoMoonConfig);
const LIKE = require('./../../assets/emojis/Like/like.png');
const DISLIKE = require('./../../assets/emojis/Dislike/dislike.png');
const HAPPY = require('./../../assets/emojis/Happy/happy.png');
const SAD = require('./../../assets/emojis/Sad/sad.png');
const ANGRY = require('./../../assets/emojis/Angry/angry.png');
const AUDIO = require('./../../assets/audio/play/play.png');
const PAUSE = require('./../../assets/audio/pause/pause.png');
const FINDLY = require('./../../assets/tabs/findly.png');
const LOCK = require('./../../assets/lock.png');

export class Icon extends React.Component {
  shouldComponentUpdate(nextProps) {
    const differentName = this.props.name !== nextProps.name;
    const differentSize = this.props.size !== nextProps.size;
    const differentColor = this.props.color !== nextProps.color;
    const differentStyle = this.props.style !== nextProps.style;
    const differentProfileIcon =
      this.props.profileRefresh !== nextProps.profileRefresh ||
      this.props.profileIcon !== nextProps.profileIcon;
    return (
      differentProfileIcon ||
      differentName ||
      differentSize ||
      differentColor ||
      differentStyle
    );
  }

  render() {
    // console.log('=================Icon.js================');
    const {name, size, color = 'black', style = emptyObject} = this.props;
    const iconsMap = {
      Home: <IcoMoon name={'kr-home'} size={size} color={color} />,
      Workspaces: <IcoMoon name={'Suitcase'} size={size} color={color} />,
      Messages: <IcoMoon name={'kr-chat-outlined'} size={size} color={color} />,
      Hash: <IcoMoon name={'Hash'} size={size} color={color} />,
      //Reminder: <IcoMoon name={'Reminder'} size={size} color={color} />,
      HomeFilled: <IcoMoon name={'kr-home_filled'} size={size} color={color} />,
      Filter: <IcoMoon name={'Filter'} size={size} color={color} />,
      WorkspacesFilled: <IcoMoon name={'Suitcase'} size={size} color={color} />,
      MessagesFilled: (
        <IcoMoon name={'kr-chat-filled'} size={size} color={color} />
      ),
      GroupIcon: <IcoMoon name={'Add-User-Group'} size={size} color={color} />,
      MoreFilled: (
        <IcoMoon
          name={'kr-Overflow-Outlined'}
          size={size}
          color={color}
          style={style}
        />
      ),
      LeaveConversation: (
        <IcoMoon name={'kr-Leave_Conversation'} size={size} color={color} />
      ),
      ShareGroup: <IcoMoon name={'share-group'} size={size} color={color} />,
      DriveCloud: <IcoMoon name={'cloud'} size={size} color={color} />,
      EmojiSmile: <IcoMoon name={'kr-smile'} size={size} color={color} />,
      Froala: <FontAwesome name={'edit'} size={size} color={color} />,
      Mute: <IcoMoon name={'kr-mute'} size={size} color={color} />,
      Un_Mute: <IcoMoon name={'Audio-On'} size={size} color={color} />,
      More: <IcoMoon name={'kr-Overflow-Outlined'} size={size} color={color} />,
      DR_Everything: (
        <IcoMoon name={'kr-everthing'} size={size} color={color} />
      ),
      DR_Starred: <IcoMoon name={'kr-starred'} size={size} color={color} />,
      DR_Chat: <IcoMoon name={'kr-chat-outlined'} size={size} color={color} />,
      DR_Mention: <IcoMoon name={'kr-mentions'} size={size} color={color} />,
      DR_Contacts: <IcoMoon name={'kr-mentions'} size={size} color={color} />,
      Plus_icon: <IcoMoon name={'kr-plus'} size={size} color={color} />,
      Logout: <IcoMoon name={'kr-logout'} size={size} color={color} />,
      SignOut: <IcoMoon name={'Outlined3'} size={size} color={color} />,
      Exit: <IcoMoon name={'Exit'} size={size} color={color} />,
      LockFilled: <IcoMoon name={'Filled1'} size={size} color={color} />,
      Badge: <IcoMoon name={'kr-badge'} size={size} color={color} />,
      Comment_Icon: (
        <IcoMoon name={'Comment'} size={size} color={color} style={style} />
      ),
      List_View: <IcoMoon name={'Button'} size={size} color={color} />,
      Day_View: <IcoMoon name={'Calendar'} size={size} color={color} />,
      Clock: <IcoMoon name={'Time'} size={size} color={color} style={style} />,
      Link: <IcoMoon name={'Link'} size={size} color={color} />,
      Open: <IcoMoon name={'Dropdown'} size={size} color={color} />,
      Contacts: <IcoMoon name={'kr-contacts'} size={size} color={color} />,
      Notes: <IcoMoon name={'Notes'} size={size} color={color} />,
      Publish: <IcoMoon name={'Publish'} size={size} color={color} />,
      Right_Arrow: (
        <IcoMoon
          name={'Dropdown-Down'}
          size={size}
          color={color}
          style={{transform: [{rotate: '-90deg'}]}}
        />
      ),
      Dropdown_Down: (
        <IcoMoon
          name={'Dropdown-Down'}
          size={size}
          color={color}
          style={style}
        />
      ),
      Dropdown_Up: (
        <IcoMoon name={'Dropdown-Up'} size={size} color={color} style={style} />
      ),
      Sort: <IcoMoon name={'Sort'} size={size} color={color} />,
      Record: <IcoMoon name={'Record'} size={size} color={color} />,
      PlayWhite: <Image style={{height: size, width: size}} source={AUDIO} />,
      PauseWhite: <Image style={{height: size, width: size}} source={PAUSE} />,
      Play: <IcoMoon name={'kr-play'} size={size} color={color} />,
      Pause: <IcoMoon name={'Pause'} size={size} color={color} />,
      Contact_Card: <IcoMoon name={'Contact-Card'} size={size} color={color} />,
      Location: (
        <IcoMoon name={'Location'} size={size} color={color} style={style} />
      ),
      Shape: <IcoMoon name={'Shape'} size={size} color={color} />,
      Files: <IcoMoon name={'kr-file'} size={size} color={color} />,
      Download: <IcoMoon name={'kr-download'} size={size} color={color} />,
      Error: <IcoMoon name={'Error-Info'} size={size} color={color} />,
      ViewDetails: (
        <IcoMoon
          name={'View-Details'}
          size={size}
          color={color}
          style={style}
        />
      ),
      Grid_View: <IcoMoon name={'Grid-View'} size={size} color={color} />,
      Tasks: <IcoMoon name={'Outlined7'} size={size} color={color} />,
      TasksFilled: <IcoMoon name={'Outlined7'} size={size} color={color} />,
      Task: <IcoMoon name={'Outlined7'} size={size} color={color} />,
      TaskFilled: <IcoMoon name={'Outlined7'} size={size} color={color} />,
      Events: <IcoMoon name={'Calendar1'} size={size} color={color} />,
      EventsFilled: <IcoMoon name={'Calendar1'} size={size} color={color} />,
      Knowledge: <IcoMoon name={'Outlined5'} size={size} color={color} />,
      KnowledgeFilled: <IcoMoon name={'Outlined5'} size={size} color={color} />,
      Automations: <IcoMoon name={'Outlined9'} size={size} color={color} />,
      AutomationsFilled: (
        <IcoMoon name={'Outlined9'} size={size} color={color} />
      ),
      More_Apps: <IcoMoon name={'All'} size={size} color={color} />,
      SendIcon: <IcoMoon name={'Send'} size={size} color={color} />,
      image: <IcoMoon name={'Image'} size={size} color={color} style={style} />,
      findly: (
        <View>
          <Image style={{height: size, width: size}} source={FINDLY} />
        </View>
      ),
      findlyFilled: (
        <View>
          <Image style={{height: size, width: size}} source={FINDLY} />
        </View>
      ),
      UserProfile: (
        <View
          style={
            this.props.profileFilled
              ? {
                  backgroundColor: '#0D6EFD',
                  borderRadius: 32 / 2,
                  // borderWidth: 1,
                  width: 32,
                  height: 32,
                  justifyContent: 'center',
                  alignItems: 'center',
                  margin: -10,
                }
              : null
          }>
          <Avatar
            rad={28}
            updateProfile={this.props.profileRefresh}
            name={UsersDao.getUserName()}
            color={UsersDao.getProfileColor()}
            profileIcon={this.props.profileIcon}
            textSize={normalize(14)}
            userId={this.props.userId}
          />
        </View>
      ),
      UserProfileWithDND: (
        <View
          style={{
            backgroundColor: '#0D6EFD',
            borderRadius: 32 / 2,
            // borderWidth: 1,
            width: this.props.profileFilled ? 32 : 28,
            height: this.props.profileFilled ? 32 : 28,
            justifyContent: 'center',
            alignItems: 'center',
            margin: -10,
          }}>
          <Avatar
            rad={28}
            updateProfile={this.props.profileRefresh}
            name={UsersDao.getUserName()}
            color={UsersDao.getProfileColor()}
            profileIcon={this.props.profileIcon}
            textSize={normalize(14)}
            userId={this.props.userId}
          />
        </View>
      ),
      // 'Apps store': <IcoMoon name={'All'} size={size} color={color} />,
      // 'Apps storeFilled': <IcoMoon name={'All'} size={size} color={color} />,
      Help: <IcoMoon name={'kr-help'} size={size} color={color} />,
      Version: <IcoMoon name={'kr-info'} size={size} color={color} />,
      Close: <IcoMoon name={'kr-close'} size={size} color={color} />,

      View_Files: <IcoMoon name={'kr-video_play'} size={size} color={color} />,
      Playbutton: <IcoMoon name={'Playbutton'} size={size} color={color} />,
      Mark_As_Read: <IcoMoon name={'Unsee'} size={size} color={color} />,

      Contact_VCall: (
        <IcoMoon name={'kr-video_call'} size={size} color={color} />
      ),
      Contact_ACall: <IcoMoon name={'kr-phone'} size={size} color={color} />,
      Contact_MediaFiles: (
        <IcoMoon name={'kr-media_files'} size={size} color={color} />
      ),
      Contact_Search: (
        <IcoMoon name={'kr-search'} size={size} color={color} style={style} />
      ),
      Contact_Mute: <IcoMoon name={'kr-mute'} size={size} color={color} />,
      Contact_Unmute: <Octicons name={'unmute'} size={size} color={color} />,
      Contact_Addparticipant: (
        <IcoMoon name={'kr-add_user_male'} size={size} color={color} />
      ),
      Contact_BlockContact: (
        <IcoMoon name={'kr-block_contact'} size={size} color={color} />
      ),
      Right_Direction: (
        <IcoMoon
          style={style}
          name={'kr-right_direction'}
          size={size}
          color={color}
        />
      ),
      Left_Direction: (
        <IcoMoon name={'kr-left_direction'} size={size} color={color} />
      ),
      // DownArrow: <AntDesign name={'down-arrow'} size={size} color={color} />,
      Question: <AntDesign name={'questioncircle'} size={size} color={color} />,
      Up: <AntDesign name={'up'} size={size} color={color} />,
      Down: <AntDesign name={'down'} size={size} color={color} />,
      Menu: <IcoMoon name={'Menu'} size={size} color={color} />,
      Upload: <IcoMoon name={'kr-upload'} size={size} color={color} />,
      Camera: <IcoMoon name={'kr-cam'} size={size} color={color} />,
      Delete_T: <IcoMoon name={'kr-delete'} size={size} color={color} />,
      Favourite: <IcoMoon name={'kr-favourite'} size={size} color={color} />,
      media: <IcoMoon name={'kr-media_files'} size={size} color={color} />,
      document: <IcoMoon name={'kr-file'} size={size} color={color} />,
      contact: <IcoMoon name={'Contact-Card'} size={size} color={color} />,
      location: <IcoMoon name={'Location'} size={size} color={color} />,
      Share: <IcoMoon name={'Share'} size={size} color={color} />,
      Share_Dot: <IcoMoon name={'Object-Share'} size={size} color={color} />,
      DownArrow: <IcoMoon name={'kr-down_arrow'} size={size} color={color} />,
      UpArrow: <IcoMoon name={'Carrot-Up'} size={size} color={color} />,
      Group: <IcoMoon name={'Share'} size={size} color={color} />,
      DoubleTick: <IcoMoon name={'kr-double-tick'} size={size} color={color} />,
      People: <IcoMoon name={'kr-people'} size={size} color={color} />,
      SingleTick: <IcoMoon name={'kr-tick'} size={size} color={color} />,
      Globe: <IcoMoon name={'Globe-Web'} size={size} color={color} />,
      Company: <IcoMoon name={'Company'} size={size} color={color} />,
      BookmarkOutlined: (
        <IcoMoon name={'kr-bookmark-outlined'} size={size} color={color} />
      ),
      Information_Circle: (
        <IcoMoon name={'kr-info'} size={size} color={color} />
      ),
      Discussion_Icon: (
        <IcoMoon name={'Storyboard'} size={size} color={color} />
      ),
      Copy: <IcoMoon name={'kr-copy-clone'} size={size} color={color} />,
      Reply_Private: (
        <IcoMoon name={'Reply-Private'} size={size} color={color} />
      ),
      Reply: (
        <IcoMoon
          style={{transform: [{rotateY: '180deg'}]}}
          name={'kr-return'}
          size={size}
          color={color}
        />
      ),
      mic: <IcoMoon name={'Microphone'} size={size} color={color} />,
      Attachment: <IcoMoon name={'kr-attachment'} size={size} color={color} />,

      edit: <IcoMoon name={'Amend-Edit'} size={size} color={color} />,
      history: <IcoMoon name={'History'} size={size} color={color} />,
      future: <IcoMoon name={'Future'} size={size} color={color} />,

      Admin: <IcoMoon name={'Admin-Settings'} size={size} color={color} />,
      External_Link: (
        <IcoMoon name={'External-Link'} size={size} color={color} />
      ),
      cross: (
        <IcoMoon name={'kr-close'} size={size} color={color} style={style} />
      ),
      like: <Image style={{height: size, width: size}} source={LIKE} />,
      unlike: <Image style={{height: size, width: size}} source={DISLIKE} />,
      laugh: <Image style={{height: size, width: size}} source={HAPPY} />,
      sad: (
        <Image
          style={{height: size, width: size, resizeMode: 'cover'}}
          source={SAD}
        />
      ),
      anger: <Image style={{height: size, width: size}} source={ANGRY} />,
      Future: <IcoMoon name={'Future'} size={size} color={color} />,
      DarkMode: <IcoMoon name={'Dark-Mode'} size={size} color={color} />,
      settings: <IcoMoon name={'kr-settings'} size={size} color={color} />,
      forward: <IcoMoon name={'kr-return'} size={size} color={color} />,
      traceInfo: <IcoMoon name={'kr-info'} size={size} color={color} />,
      Checked: <IcoMoon name={'Checked'} size={size} color={color} />,
      CheckBox: (
        <IcoMoon name={'kr-checked_checkbox'} size={size} color={color} />
      ),
      CheckBoxEmpty: <IcoMoon name={'Outlined2'} size={size} color={color} />,
      Retry: <IcoMoon name={'Return'} size={size} color={color} />,
      templates: <IcoMoon name={'Shape'} size={size} color={color} />,
      notification: (
        <IcoMoon name={'kr-notification'} size={size} color={color} />
      ),
      close: <IcoMoon name={'kr-close'} size={size} color={color} />,
      link: <IcoMoon name={'Link'} size={size} color={color} style={style} />,
      options: <IcoMoon name={'ellipsis'} size={size} color={color} />,
      help_meetings: <IcoMoon name={'meetings'} size={size} color={color} />,
      help_tasks: <IcoMoon name={'tasks'} size={size} color={color} />,
      help_recent: <IcoMoon name={'recent'} size={size} color={color} />,
      enter: <IcoMoon name={'Enter'} size={size} color={color} />,
      traits: <IcoMoon name={'Traits'} size={size} color={color} />,
      Tip: <IcoMoon name={'Tip'} size={size} color={color} />,
      Lock: <Image style={{height: size, width: size - 2}} source={LOCK} />,
      email: <IcoMoon name={'Mail'} size={size} color={color} />,

      Email_Filled: (
        <IcoMoon name={'Material-Mail'} size={size} color={color} />
      ),
      Comment_Material: (
        <IcoMoon name={'Comment_Material'} size={size} color={color} />
      ),
      Like_Filled: <IcoMoon name={'Like_Filled'} size={size} color={color} />,
      Material_Info: (
        <IcoMoon name={'Material-Info'} size={size} color={color} />
      ),
      Material_Location: (
        <IcoMoon name={'Material-Location'} size={size} color={color} />
      ),
      Material_Person: (
        <IcoMoon name={'Material-Person'} size={size} color={color} />
      ),
      MeetingCalendar: (
        <IcoMoon name={'MeetingCalendar'} size={size} color={color} />
      ),
    };

    const keys = Object.keys(iconsMap);
    if (keys.indexOf(name) === -1) {
      return <IcoMoon name={name} size={size} color={color} />;
      // console.log('Icon', name, 'not available', '\n', 'Must be of type', keys);
      // name = keys[0];
    }

    return iconsMap[name];
  }
}
