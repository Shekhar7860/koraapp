import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Image,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Text,
  TouchableHighlight,
  Alert,
} from 'react-native';
import {Header} from '../../navigation/TabStacks';
import {Icon} from '../../components/Icon/Icon';
import {TABLE_MEMBER} from '../../realm/dbconstants';
import * as Constants from '../../components/KoraText';
import {normalize} from '../../utils/helpers';
import {connect} from 'react-redux';
import {
  addParticipants,
  searchModeOn,
} from '../../../shared/redux/actions/message-preview.action';
import {getBoardMembers} from '../../../shared/redux/actions/discussions.action';
import {
  MuteUnmute,
  deleteUserChtHistry,
  deleteThreadChat,
} from '../../../shared/redux/actions/message-thread.action';
import {withTranslation} from 'react-i18next';
import {navigate} from '../../navigation/NavigationService';
import {ROUTE_NAMES} from '../../navigation/RouteNames';
import {BottomUpModal} from './../../components/BottomUpModal';
import {getTimeline, getThreadContact} from '../../utils/helpers';
import * as UsersDao from '../../../dao/UsersDao';
import {emptyArray} from '../../../shared/redux/constants/common.constants';
import {
  confirmationModalRef,
  KoraConfirm,
} from '../../components/ConfirmationModal';
import API_URL from '../../../../env.constants';
import RenderImage from './RenderImage';

const options1 = [
  {
    id: 'media_and_files',
    icon: 'Contact_MediaFiles',
    title: 'Media & Files',
    size: 20,
  },
  {
    id: 'chat_search',
    icon: 'Contact_Search',
    title: 'Chat Search',
    size: 24,
  },
  {
    id: 'mute_unmute',
    icon: 'Contact_Mute',
    title: 'Mute',
    size: 24,
  },
  {
    id: 'add_participants',
    icon: 'Contact_Addparticipant',
    title: 'Add People',
    size: 24,
  },
];
const directChatOptions = [
  {
    id: 'media_and_files',
    icon: 'Contact_MediaFiles',
    title: 'Media & Files',
    size: 20,
  },
  {
    id: 'chat_search',
    icon: 'Contact_Search',
    title: 'Chat Search',
    size: 24,
  },
  {
    id: 'mute_unmute',
    icon: 'Contact_Mute',
    title: 'Mute',
    size: 24,
  },
];

const options2 = [
  // {
  //   id: 'block_contact',
  //   icon: 'Contact_BlockContact',
  //   title: 'Block Contact',
  //   size: 22,
  // },
  {
    id: 'delete_chat',
    icon: 'Delete_T',
    title: 'Delete Chat', //'Delete Conversation', //'Delete Chat',
    size: 24,
  },
];

class ContactDetailsScreen extends Component {
  constructor(props) {
    super(props);

    // console.log(
    //   '------sss--myne-ssssssss-----',
    //   JSON.stringify(props.route.params.thread),
    // );
    this.listeners = [];
    this.state = {
      thread: this.props.route.params.board,
      participantsList: [],
      contacts: [],
      member: [],
    };
  }

  optionsView1 = () => {
    return (this.state.thread?.type === 'directChat'
      ? directChatOptions
      : options1
    ).map((data) => {
      return this.renderView1(data);
    });
  };
  optionsView2 = () => {
    return options2.map((data) => {
      return this.renderView1(data);
    });
  };

  renderView1 = (data) => {
    let muteOn = false;
    const {thread} = this.state;
    let till = thread?.notifications?.mute?.till;
    if (till) {
      muteOn = new Date() < new Date(till);
    }

    let text = muteOn ? 'Unmute' : 'Mute';
    if (data.id === 'delete_chat') {
      return (
        <TouchableOpacity
          onPress={() => {
            this.onOptionClick(data.id);
          }}
          style={[styles.sectionSingleView]}
          key={data.id}>
          {/* <Image source={data.icon} /> */}
          <View
            style={{width: 24, alignItems: 'center', justifyContent: 'center'}}>
            <Icon name={data.icon} size={data.size} color="#DD3646" />
          </View>
          <View style={styles.sectionSingleViewSub}>
            <Text style={styles.titleTextStyle}>{data.title}</Text>
          </View>
        </TouchableOpacity>
      );
    }
    if (data.id === 'mute_unmute') {
      return (
        <TouchableOpacity
          onPress={() => {
            if (muteOn) {
              this.renderMuteButton({});
              return;
            }
            this.onOptionClick(data.id);
          }}
          style={[styles.sectionSingleView]}
          key={data.id}>
          {/* <Image source={data.icon} /> */}
          <View
            style={{width: 24, alignItems: 'center', justifyContent: 'center'}}>
            <Icon
              name={muteOn ? data.icon : 'Contact_Unmute'}
              size={data.size}
              color="#202124"
            />
          </View>
          <View style={styles.sectionSingleViewSub}>
            <Text style={styles.textStyle}>{text}</Text>
          </View>
        </TouchableOpacity>
      );
    }
    if (data.id === 'block_contact' || data.id === 'add_participants') {
      return (
        <TouchableOpacity
          onPress={() => {
            this.onOptionClick(data.id);
          }}
          style={[styles.sectionSingleView]}
          key={data.id}>
          {/* <Image source={data.icon} /> */}
          <View
            style={{width: 24, alignItems: 'center', justifyContent: 'center'}}>
            <Icon name={data.icon} size={data.size} color="#202124" />
          </View>
          <View style={styles.sectionSingleViewSub}>
            <Text style={styles.setion2Text}>{data.title}</Text>
          </View>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          onPress={() => {
            this.onOptionClick(data.id);
          }}
          style={[styles.sectionSingleView]}
          key={data.id}>
          {/* <Image source={data.icon} /> */}
          <View
            style={{width: 24, alignItems: 'center', justifyContent: 'center'}}>
            <Icon name={data.icon} size={data.size} color="#202124" />
          </View>
          <View style={styles.sectionSingleViewSub}>
            <Text style={styles.setion2Text}>{data.title}</Text>
            <View style={styles.arrow}>
              <Icon name="Right_Direction" size={16} color="#202124" />
            </View>
            {/* <Image
            source={require('../../assets/contact/right_arrow.png')}
            style={styles.arrow}
          /> */}
          </View>
        </TouchableOpacity>
      );
    }
  };

  renderMuteButton(data) {
    const {thread} = this.state;

    const item = thread;
    // console.log('-----------------', JSON.stringify(item));
    const minutesTillMute = data.value || -60 * 24;
    let d = new Date();
    d.setMinutes(d.getMinutes() + minutesTillMute);
    const payload = {
      mute: minutesTillMute !== 0 ? d.getTime() : new Date().getTime(),
      // on: minutesTillMute !== 0,
    };
    this.props.MuteUnmute({id: item?.id}, payload);
    this.refs.modal.closeBottomDrawer();
  }

  renderMute() {
    const muteOptions = [
      {text: '4 hours', value: 60 * 4},
      {text: '1 day', value: 60 * 24},
      {text: '1 week', value: 60 * 24 * 7},
      {text: 'Until turned off', value: 60 * 24 * 7 * 52},
    ];
    return (
      <BottomUpModal ref="modal" height={280}>
        <View style={styles.muteViewStyle}>
          <Text
            numberOfLines={1}
            lineBreakMode={'middle'}
            style={styles.muteTextStyle}>
            {'Mute Notification'}
          </Text>
        </View>
        <View
          style={{flexDirection: 'column', paddingTop: 10, borderRadius: 4}}>
          {muteOptions.map((option) => {
            return (
              <TouchableHighlight
                key={option.text}
                underlayColor="rgba(0,0,0,0.05)"
                onPress={() => this.renderMuteButton(option)}
                style={{
                  borderRadius: 4,
                  flexDirection: 'row',
                  paddingHorizontal: 10,
                  marginHorizontal: 10,
                  paddingVertical: 16,
                }}>
                <Text style={styles.optionTextStyle}>{option.text}</Text>
              </TouchableHighlight>
            );
          })}
          <TouchableHighlight
            onPress={() => {
              this.refs.modal.closeBottomDrawer();
            }}
            underlayColor="rgba(0,0,0,0.05)"
            style={{paddingLeft: 20, paddingVertical: 16}}>
            <Text style={styles.cancelTextStyle}>Cancel</Text>
          </TouchableHighlight>
        </View>
      </BottomUpModal>
    );
  }

  onOptionClick = (id) => {
    console.log('Now clicked : ' + id);
    if (id === 'chat_search') {
      this.props.searchModeOn();
      this.props.navigation.goBack();
    }
    if (id === 'delete_chat') {
      KoraConfirm.confirm({
        onOptionClick: (data) => {
          if (data?.id === 'delete') {
            console.log('DELET');
            const {thread} = this.state;
            this.props.deleteThreadChat(thread?._id, true);
          }
        },
      });
    }
    // if (id === 'delete_chat') {
    //   Alert.alert(
    //     'Alert',
    //     'Are you sure? Do you really want to delete?',
    //     [
    //       {
    //         text: 'Cancel',
    //         onPress: () => console.log('Cancel Pressed'),
    //         style: 'cancel',
    //       },
    //       {
    //         text: 'Delete',
    //         onPress: () => {
    //           const {thread} = this.state;
    //           this.props.deleteThreadChat(thread?._id, true);
    //         },
    //       },
    //     ],
    //     {cancelable: false},
    //   );
    // }
    if (id === 'add_participants') {
      const {thread} = this.state;
      navigate(ROUTE_NAMES.ADD_PARTICIPENTS, {thread: thread});
    }
    if (id === 'mute_unmute') {
      this.refs.modal.openBottomDrawer();
    }
    if (id === 'media_and_files') {
      const {thread} = this.state;
      navigate('View_Files', {
        threadId: thread?._id,
        thread: thread,
      });
    }
  };

  componentDidUpdate(prevProps) {
    if (prevProps.boardMembers !== this.props.boardMembers) {
      const participantsList = this.props.boardMembers?.members || emptyArray;
      const members = participantsList;
      const otherMember = members.filter(
        (user) => user.id !== UsersDao.getUserId(),
      );
      this.setState({
        member: otherMember[0],
      });

      this.setState({
        participantsList: this.props.boardMembers?.members || emptyArray,
      });
    }

    if (prevProps.usermuteUnmuteThread !== this.props.usermuteUnmuteThread) {
      //for mute unmute update
      const {thread} = this.state;
      const mute = this.props.usermuteUnmuteThread?.mute;
      const notifications = {
        notifications: {mute},
      };
      this.setState({thread: thread, ...notifications});
    }
  }

  componentDidMount() {
    const {board} = this.props.route.params;
    this.setState({
      thread: board,
      // member: board?.members?.filter(
      //   (user) => user.id !== UsersDao.getUserId(),
      // )[0],
    });
    this.props.getBoardMembers({
      rId: this.state.thread?._id,
    });

    // const members = this.state.participantsList;
    // const otherMember = members.filter(
    //   (user) => user.id !== UsersDao.getUserId(),
    // );
    // this.setState({
    //   member: otherMember[0],
    // });

    // const participents =
    //   thread && thread.lastMessage ? [...thread.lastMessage.to] : null;

    // if (participents) {
    //   this.setState({contacts: participents});
    // } else {
    //   const id = thread && thread.to ? thread.to[0] : null;
    //   if (id) {
    //   }
    // }
  }

  render() {
    const member = this.state.member || emptyArray;
    // console.log('member  -------------->> :', member);
    let url = null;
    if (member?.icon === 'profile.png') {
      url =
        API_URL?.appServer +
        'api/1.1/getMediaStream/profilePictures/' +
        member?.id +
        '/d_64x64_profile.png';
    }
    return (
      <>
        <SafeAreaView style={{backgroundColor: '#ffffff'}}>
          <Header
            {...this.props}
            title={'Contact Information'}
            goBack={true}
            //navigation={this.props.navigation}
          />
        </SafeAreaView>
        <SafeAreaView style={{flex: 1, backgroundColor: '#EFF0F1'}}>
          <ScrollView>
            <View style={styles.container}>
              {
                url ? (
                  <RenderImage
                    url={`${url}?${new Date().getTime()}`}
                    member={member}
                    styles={styles}
                  />
                ) : null
                // <View
                //   style={[
                //     styles.image_container,
                //     {backgroundColor: member?.color ? member?.color : 'white'},
                //   ]}>
                //   <View
                //     style={[
                //       styles.image,
                //       {
                //         backgroundColor: member?.color ? member?.color : 'white',
                //         justifyContent: 'center',
                //       },
                //     ]}>
                //     {member?.fN && (
                //       <Text style={[styles.fullNameTextStyleAvtar]}>
                //         {member?.fN?.charAt(0)}
                //       </Text>
                //     )}
                //   </View>
                // </View>
              }

              <View style={styles.sectionSingleView}>
                <View style={{flex: 1}}>
                  <View>
                    <Text style={styles.contact}>
                      {member.fN}&nbsp;{member.lN}
                    </Text>
                    <Text style={styles.subContact}>{member.emailId}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.sectionSingleView}>
                <Image
                  source={require('../../assets/contact/availability.png')}
                />
                <Text
                  style={[
                    styles.availableDetails,
                    {flex: 1, paddingStart: 10},
                  ]}>
                  Available
                </Text>
                <TouchableOpacity
                  style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                  }}
                  onPress={() => {}}>
                  <Text style={[styles.availableDetails, {marginEnd: 10}]}>
                    Details
                  </Text>
                  <View style={styles.arrow}>
                    <Icon name="Right_Direction" size={16} color="#202124" />
                  </View>
                  {/* <Image
                  source={require('../../assets/contact/right_arrow.png')}
                  style={styles.arrow}
                /> */}
                </TouchableOpacity>
              </View>
              <View style={{flex: 1, marginTop: 25}}>
                {this.optionsView1()}
              </View>

              <View
                style={{
                  flex: 1,
                  marginTop: 35,
                  backgroundColor: '#FFF',
                }}>
                {this.optionsView2()}
              </View>
            </View>
          </ScrollView>
          {this.renderMute()}
        </SafeAreaView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  muteViewStyle: {
    paddingTop: 20,
    paddingLeft: 20,
    paddingBottom: 11,
    borderBottomWidth: 0.4,
    borderColor: '#9AA0A6',
  },
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
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#202124',
  },
  cancelTextStyle: {
    color: '#DD3646',
    fontWeight: '500',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  container: {
    backgroundColor: '#EFF0F1',
    flex: 1,
    alignItems: 'baseline',
    justifyContent: 'flex-start',
  },
  sectionSingleView: {
    backgroundColor: '#FFF',
    width: '100%',
    height: 60,
    paddingStart: 20,
    borderBottomWidth: 1.5,
    borderColor: '#EFF0F1',
    justifyContent: 'flex-start',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 0,
  },
  sectionSingleViewSub: {
    backgroundColor: '#FFF',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 0,
  },
  contact: {
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: normalize(20),
    color: '#202124',
  },
  subContact: {
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: normalize(12),
    lineHeight: 15,
    // color: '#9AA0A6',
  },
  availableDetails: {
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: normalize(12),
    lineHeight: 15,
    // color: '#9AA0A6',
  },
  arrow: {
    alignSelf: 'center',
    alignItems: 'center',
    marginEnd: 25,
  },
  setion2Text: {
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: normalize(16),
    lineHeight: 19,
    color: '#202124',
    flex: 1,
    paddingStart: 10,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 120 / 2,
    borderColor: 'white',
    borderWidth: 2,
    alignSelf: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  image_container: {
    width: '100%',
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullNameTextStyleAvtar: {
    fontWeight: '800',
    fontSize: normalize(20),
    fontStyle: 'normal',
    color: 'white',
    fontFamily: Constants.fontFamily,
  },
  textStyle: {
    marginStart: 10,
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#202124',
  },
  titleTextStyle: {
    marginStart: 10,
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#202124',
    color: '#DD3646',
  },
});
// export default GroupDetailsScreen;
const mapStateToProps = (state) => {
  let {discussion, messageThreadList} = state;
  return {
    boardMembers: discussion.boardMembers,
    usermuteUnmuteThread: messageThreadList.usermuteUnmuteThread,
  };
};
export default connect(mapStateToProps, {
  MuteUnmute,
  searchModeOn,
  deleteUserChtHistry,
  getBoardMembers,
  deleteThreadChat,
})(ContactDetailsScreen);
