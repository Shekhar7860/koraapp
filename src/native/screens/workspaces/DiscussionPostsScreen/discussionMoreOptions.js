import React from 'react';
import {
  KeyboardAvoidingView,
  View,
  TextInput,
  TouchableOpacity,
  TouchableHighlight,
  StyleSheet,
  Text,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {normalize} from '../../../utils/helpers';
import {BottomUpModal} from '../../../components/BottomUpModal';
import {Icon} from '../../../components/Icon/Icon';
import {navigate, goBack} from '../../../navigation/NavigationService';
import {ROUTE_NAMES} from '../../../navigation/RouteNames';
import {
  getDiscussions,
  markBoardAsStar,
  muteUnmute,
  markAsRead as markAsReadAction,
  markAsUnread as markAsUnReadAction,
} from '../../../../shared/redux/actions/discussions.action';
import {withTranslation} from 'react-i18next';
import {connect} from 'react-redux';
import Clipboard from '@react-native-community/clipboard';
import Toast from 'react-native-simple-toast';
import * as Constants from '../../../components/KoraText';
import {emptyObject} from '../../../../shared/redux/constants/common.constants';
import {SvgIcon} from '../../../components/Icon/SvgIcon.js';
import ActionItemBottomSheet from '../../../components/BottomUpModal/ActionItemBottomSheet';
import reactotron from 'reactotron-react-native';

const star = {
  icon: 'DR_Starred',
  text: 'Star',
  id: 'star',
  color: 'black',
};
let unstar = {
  icon: 'Favourite',
  text: 'Unstar',
  id: 'star',
  color: '#FFDA2D',
};
const markAsUnread = {
  id: 'markAsUnread',
  text: 'Mark As Unread',
  icon: 'Mark_As_Read',
};

const markAsRead = {
  id: 'markAsRead',
  text: 'Mark As Read',
  icon: 'Mark_As_Read',
};

let mute = {icon: 'Un_Mute', text: 'Mute', id: 'mute'};
let unmute = {icon: 'Mute', text: 'Unmute', id: 'mute'};

class DiscussionMoreOptions extends React.Component {
  constructor(props) {
    super();
    this.state = {
      isStar: false,
      isMute: '',
    };
  }
  modalRef = React.createRef();

  componentDidMount() {
    // this.props.onRef(this);
    const {board, mute, star} = this.props;
    let muteOn = false;
    const till = mute?.till;
    if (till) {
      muteOn = new Date() < new Date(till);
    }
    this.setState({isStar: star, isMute: muteOn});
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.mute !== this.props.mute) {
      let muteOn = false;
      const till = this.props.mute?.till;
      if (till) {
        muteOn = new Date() < new Date(till);
      }
      this.setState({isMute: muteOn});
    }
  }

  renderModal() {
    this.modalRef.current.open();
  }
  starClickEvent() {
    this.setState({isStar: !this.state.isStar});
    const {board, wsId, id, star} = this.props;
    let _params = {
      wsId: wsId,
      rId: id,
    };
    let payload = {
      markAsStar: !star,
    };
    let updataDiscData = {
      boards: {
        _id:board._id,
        id:board.id
      }
    };
    
     this.props.markBoardAsStar(_params, payload, updataDiscData);
  }

  addSomeMinutesToTime = (startTime, minutestoAdd) => {
    const dateObj = new Date(startTime);
    const newDateInNumber = dateObj.setMinutes(
      dateObj.getMinutes() + minutestoAdd,
    );
    const processedTime = new Date(newDateInNumber).getTime();
    return processedTime;
  };

  muteClickEvent(data) {
    const {board, id, wsId} = this.props;
    const minutesTillMute = data.value || 0;
    let d = new Date();
    let n = d.toISOString();
    let muteTime = this.addSomeMinutesToTime(n, data.value || 0);
    d.setMinutes(d.getMinutes() + minutesTillMute);
    let payload = {
      mute: muteTime,
      // on: !this.state.isMute,
    };
    let _params = {
      boardId: id,
      wsId: wsId,
    };
    this.props.muteUnmute(_params, payload);
    this.muteModal.closeBottomDrawer();
  }
  showMuteModal() {
    const {t} = this.props;
    const options = [
      {text: t('4 hours'), value: 60 * 4},
      {text: t('1 day'), value: 60 * 24},
      {text: t('1 week'), value: 60 * 24 * 7},
      {text: t('Until turned off'), value: 60 * 24 * 7 * 52},
    ];
    let name = this.props.board.name;
    return (
      <BottomUpModal
        ref={(x) => {
          this.muteModal = x;
        }}
        height={350}>
        <View style={{flexDirection: 'column', borderRadius: 4}}>
          <View
            style={{
              paddingTop: 20,
              paddingLeft: 20,
              paddingBottom: 11,
              borderBottomWidth: 0.4,
              borderColor: '#9AA0A6',
              marginBottom: 9,
            }}>
            <Text
              numberOfLines={1}
              lineBreakMode={'middle'}
              style={styles.muteTextStyle}>
              {/* {t('Mute', {context: 'for ...', board: {boardName}})} */}
              {t('Mute {{context}} for...', {context: name})}
            </Text>
          </View>
          {options.map((option) => {
            return (
              <ActionItemBottomSheet
                title={option.text}
                iconName={option.icon}
                key={option.id}
                id={option.id}
                itemType={'titleOnly'}
                optionSelected={() => {
                  this.muteClickEvent(option);
                  this.setState({isMute: true});
                }}
              />
              // <TouchableOpacity
              //   key={option.text}
              //   underlayColor="rgba(0,0,0,0.05)"
              //   onPress={() => {
              //     this.muteClickEvent(option);
              //     this.setState({isMute: true});
              //   }}
              //   style={{
              //     borderRadius: 4,
              //     flexDirection: 'row',
              //     paddingHorizontal: 10,
              //     marginHorizontal: 10,
              //     paddingVertical: 16,
              //   }}>
              //   <Text style={styles.optionTextStyle}>{option.text}</Text>
              // </TouchableOpacity>
            );
          })}
          <ActionItemBottomSheet
            title={'Cancel'}
            itemType={'titleOnly'}
            optionSelected={() => this.muteModal.closeBottomDrawer()}
          />
          {/* <TouchableOpacity
            onPress={() => {
              this.muteModal.closeBottomDrawer();
            }}
            style={{paddingLeft: 20, paddingVertical: 16}}>
            <Text style={styles.cancelTextStyle}>{t('Cancel')}</Text>
          </TouchableOpacity> */}
        </View>
      </BottomUpModal>
    );
  }
  getDiscussionLink() {
    let {link} = this.props;
    link = link || emptyObject;
    const {id, scope = '', access, shareUrl = ''} = link;
    if (shareUrl === '') {
      Toast.showWithGravity('No Board link !', Toast.SHORT, Toast.BOTTOM);
      return;
    }

    Clipboard.setString(link?.shareUrl || '');
    Toast.showWithGravity('Board link copied!', Toast.SHORT, Toast.BOTTOM);
  }
  renderOnClick(id) {
    if (id === 'star') {
    this.starClickEvent();
    }
    if (id === 'mute') {
      this.modalRef.current.close();
      if (!this.state.isMute) {
        setTimeout(() => this.muteModal.openBottomDrawer(), 1000);
      } else {
        this.setState({isMute: false});
        this.muteClickEvent({});
      }
    }
    if (id === 'view_files') {
      this.modalRef.current.close();
      if (this.props?.navigateToFiles) {
        this.props?.navigateToFiles(
          this.props.board.id,
          this.props.board,
          this.props.titleName,
        );
      } else {
        navigate('View_Files', {
          threadId: this.props.board?._id,
          thread: this.props.board,
          titleName: this.props.titleName,
        });
      }
    }
    if (id === 'link') {
      this.modalRef.current.close();
      setTimeout(() => this.getDiscussionLink(), 1000);
    }
    if (id === 'manage_room') {
      this.modalRef.current.close();
      if (this.props.navigateToManageRoom) {
        this.props.navigateToManageRoom(this.props.board || emptyObject);
      } else {
        navigate(ROUTE_NAMES.ROOM_DETAILS, {
          board: this.props.board || emptyObject,
        });
      }
    }
    if (id === markAsUnread.id) {
      const _params = {
        rId: this.props.id,
      };
      const postId = this.props?.postId;
      let payload = {
        markUnreadPostId: postId,
      };
      this.props.markAsUnReadAction(_params, payload);
    }
    if (id === markAsRead.id) {
      const _params = {
        rId: this.props.id,
      };
      const postId = this.props?.postId;

      let payload = {
        markReadPostId: postId,
      };
      this.props.markAsReadAction(_params, payload);
    }
  }

  render() {
    const {t} = this.props;
    const unread = this.props.unreadCount > 0;
    let optionsList = [
      this.state.isStar ? unstar : star,
      // this.props.board.star ? unstar : star,
      this.state.isMute ? unmute : mute,
      unread ? markAsRead : markAsUnread,
      {icon: 'View_Files', text: t('View Files'), id: 'view_files'},
      {icon: 'External_Link', text: t('Get Link'), id: 'link'},
      {icon: 'Admin', text: t('Manage'), id: 'manage_room'},
    ];
    return (
      <>
        {this.showMuteModal()}
        <BottomUpModal ref={this.modalRef} expandable={true} height={340}>
          <View
            style={{
              paddingTop: 15,
              padding: 0,
            }}>
            {optionsList.map((item) => (
              <ActionItemBottomSheet
                title={item.text}
                iconName={item.icon}
                id={item.id}
                key={item.id}
                isStarred={this.props.board.star}
                muteOn={this.state.isMute}
                isUnread={unread}
                optionSelected={() => this.renderOnClick(item.id)}
              />
              // <TouchableOpacity
              //   key={item.id}
              //   style={{
              //     flexDirection: 'row',
              //     margin: 3,
              //     alignItems: 'center',
              //     padding: 12,
              //   }}
              //   onPress={() => this.renderOnClick(item.id)}>
              //   {item.text === 'Unstar' ? (
              //     <SvgIcon name="Star_Filled" width={20} height={20} />
              //   ) : (
              //     <Icon
              //       name={item.icon}
              //       size={normalize(20)}
              //       color={item.color}
              //     />
              //   )}

              //   <Text style={{paddingLeft: 10, fontSize: normalize(15)}}>
              //     {item.text}
              //   </Text>
              // </TouchableOpacity>
            ))}
          </View>
        </BottomUpModal>
      </>
    );
  }
}

const styles = StyleSheet.create({
  muteTextStyle: {
    color: '#202124',
    fontSize: normalize(16),
    fontWeight: '600',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  optionTextStyle: {
    fontWeight: '500',
    fontSize: normalize(16),
    fontFamily: Constants.fontFamily,
    color: '#202124',
  },
  cancelTextStyle: {
    color: '#DD3646',
    fontWeight: '400',
    fontSize: normalize(16),
    fontFamily: Constants.fontFamily,
  },
});

const mapStateToProps = (state) => {
  const {discussion} = state;
  return {
    posts: discussion?.allPosts?.posts,
  };
};

export default connect(
  mapStateToProps,
  {
    getDiscussions,
    markBoardAsStar,
    muteUnmute,
    markAsReadAction,
    markAsUnReadAction,
  },
  null,
  {
    forwardRef: true,
  },
)(withTranslation(null, {withRef: true})(DiscussionMoreOptions));
