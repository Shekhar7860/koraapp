import React, {Component} from 'react';
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  Text,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
  Animated,
  FlatList,
} from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {withTranslation} from 'react-i18next';
import {Header} from '../../../navigation/TabStacks';
//import Swipeout from '../../../components/Library/react-native-swipeout/src';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {Avatar} from '../../../components/Icon/Avatar';
import {DeleteThread} from '../../ChatsThreadScreen/chats-thread';
import {
  leaveDiscussion,
  addMemberAccess,
} from '../../../../shared/redux/actions/discussions.action';
import * as Constants from '../../../components/KoraText';
import {permissionOptions} from '../../NewDiscussion';
import {BottomUpModal} from '../../../components/BottomUpModal';
import {normalize} from '../../../utils/helpers';
import * as UsersDao from '../../../../dao/UsersDao';
import {
  emptyArray,
  emptyObject,
} from '../../../../shared/redux/constants/common.constants';
import {discussionsACL} from '../../../core/AccessControls';
import {colors} from '../../../theme/colors';
import DeleteMessage from '../../../components/Chat/DeleteChatItemEvent';
import withObservables from '@nozbe/with-observables';
import {of as of$} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {Icon} from '../../../components/Icon/Icon';
import reactotron from 'reactotron-react-native';
const row = [];
const removeDiscussionArray = [
  // {name: 'Are you sure? You really want to delete?', key: 1, color:'black'},
  {name: 'Remove', key: 1, color: colors.koraAlertNegative},
  {name: 'Cancel', key: 2, color: colors.koraAlertPositive},
];
let prevOpenedRow = null;
import database from '../../../realm';
import * as Entity from '../../../realm/dbconstants';
import {Q} from '@nozbe/watermelondb';

class Members extends Component {
  constructor() {
    super();
    this.permission = React.createRef();
    this.deleteUserConfirmModalRef = React.createRef();
    this.selectedPermissionKey = null;
    this.state = {
      userId: '',
      type: 'Post Only',
      switchValue: true,
      board: {},
      creator:null
    };
  }
  toggleSwitch = (e) => {
    this.setState({switchValue: e});
  };
  // get board() {
  //     return this.state.board || {};
  //   }
  get board() {
    return this.props.route.params.board || emptyObject;
  }

  getCreatorContact=async(id)=>{
    try{
    database.active.get(Entity.Contacts).query(
    Q.where('id', id)).then((contact)=>{
        this.setState({creator:contact?.length>0?contact[0]:null})
      });
    }catch(e)
    {

    }
   }

   getCreator = async (board) => {
    try {
     
      const creator = await board?.creator.fetch();
      this.getCreatorContact(creator._raw.contact_id)
      
    } catch (e) {
    }
  };

  componentDidMount() {
    const observable = this.board.observe();
    this.subscription = observable.subscribe((r) => {
      this.setState({board: r});
      if(this.state.creator===null){
      this.getCreator(r)
      }
    });
 }

componentWillUnmount() {
  if (this.subscription?.unsubscribe) {
    this.subscription.unsubscribe();
  }
 }

  leaveDiscussion(id) {
    const board = this.board;

    let _params = {
      wsId: board.wsId,
      rId: board.id,
    };

    let payload = {
      removeMembers: [id],
    };

    let boards = board;
    let updataDiscData = {
      action_type: 'delete-member',
      boards,
    };
    // //console.log(id);
    this.props.leaveDiscussion(_params, payload);
  }

  permissionOption(selectedOption = null) {
    return (
      <BottomUpModal ref={this.permission} height={270}>
        <View style={{height: 31}} />
        {permissionOptions.map((option) => {
          return (
            <TouchableOpacity
              onPress={() => {
                //this.setState({access: option.key});
                this.renderMemberAccess(option.key);
                this.permission.current.closeBottomDrawer();
              }}
              key={option.key}
              underlayColor={'rgba(0,0,0,0.1)'}
              style={{
                margin: 6,
                padding: 4,
                borderRadius: 4,
                marginHorizontal: 10,
              }}>
              <View style={{flexDirection: 'row'}}>
                <View>
                  <Text style={styles.optionTextStyle}>{option.text}</Text>
                  <Text style={styles.optionDescTextStyle}>
                    {option.description}
                  </Text>
                </View>
                {this.selectedPermissionKey &&
                  this.selectedPermissionKey === option.key && (
                    <View
                      style={{
                        flex: 1,
                        alignItems: 'flex-end',
                      }}>
                      <Icon name="SingleTick" size={24} color={'#0D6EFD'} />
                    </View>
                  )}
              </View>
            </TouchableOpacity>
          );
        })}
      </BottomUpModal>
    );
  }

  renderMemberAccess(val) {
    let {wsId, id} = this.board;
    let _params = {
      wsId: wsId,
      rId: id,
    };
    let payload = {
      members: [{access: val, userId: this.state.userId}],
    };
    this.props.addMemberAccess(_params, payload);
  }

  closeRow(index) {
    if (prevOpenedRow && prevOpenedRow !== row[index]) {
      prevOpenedRow.close();
    }

    if (index !== -1) {
      prevOpenedRow = row[index];
    } else {
      prevOpenedRow = null;
      for (let i = 0; i < row.length; i++) {
        if (row[i]) {
          row[i].close();
        }
      }
    }
  }

  newRight(progress, dragX, data, isUser, canRemoveMember) {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [90, 0],
    });

    return !isUser && canRemoveMember ? (
      <View style={styles.rightItem}>
        <Animated.View
          style={
            (styles.swipeChildStyle,
            {backgroundColor: '#DD3646'},
            {transform: [{translateX: trans}]})
          }>
          <TouchableOpacity
            style={[styles.swipeChildStyle, {backgroundColor: '#DD3646'}]}
            onPress={() => {
              this.closeRow(-1);
              this.deleteUserConfirmModalRef?.current?.openModal(
                (onPannelStatus) => {
                  // this.setState({
                  //   onDeletePannelStatus: onPannelStatus,
                  // });
                },
                (element) => {
                  switch (element.key) {
                    case 1:
                      this.leaveDiscussion(data.id);
                      // this.onDeleteButtonClick();
                      // this.deleteForSelf(id);
                      break;
                    case 2:
                      break;
                    case 3:
                      break;
                  }
                },
              );
            }}>
            <DeleteThread text="Remove" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    ) : null;
  }
  renderItem = (obj) => {
    let creatorId = this.state.creator?.id || this.state.creator;
    let dat = this.board.creator.id;
    const index = obj.index;
    const data = obj.item;
    const _key = data.access;
    const {canRemoveMember} = discussionsACL(this.board);
    let text = permissionOptions.find(({key}) => key === _key)?.text || '';
    //console.log('Show participants', data.fN, text, _key, data.access);
    let userId = data.id;
    const fN = data.fN || '';
    const lN = data.lN || '';
    let name = fN + ' ' + lN;
    const isUser = data.id === UsersDao.getUserId();
    if (isUser) {
      name = 'You';
    }
    //  let swipeoutBtns = null;
    // if (!isUser) {
    //   swipeoutBtns = [
    //     {
    //       text: 'Remove',
    //       component: <DeleteThread text={'Remove'} />,
    //       onPress: () => {
    //         this.leaveDiscussion(userId);
    //       },
    //       backgroundColor: '#DD3646',
    //     },
    //   ];
    // }

    return (
      <Swipeable
        ref={(ref) => {
          row[index] = ref;
        }}
        renderRightActions={(progress, dragx) =>
          this.newRight(progress, dragx, data, isUser, canRemoveMember)
        }
        friction={2}
        leftThreshold={30}
        rightThreshold={10}
        useNativeAnimations={true}
        onSwipeableOpen={() => {
          this.closeRow(index);
        }}>
        {userId === dat ? null : (
          <View>
            <View
              key={data.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: 20,
                marginTop: 10,
                height: 60,
              }}>
              <View style={{flexDirection: 'row', flex: 1}}>
                <Avatar
                  profileIcon={data?.icon}
                  userId={data?.id}
                  name={data?.fN}
                  color={data?.color}
                />
                <View
                  style={{
                    flexDirection: 'column',
                    marginHorizontal: 10,
                    flexShrink: 1,
                    justifyContent:'center',
                 
                  }}>
                  <Text numberOfLines={1} style={styles.nameTextStyle}>
                    {name}
                  </Text>
                  {(data.emailId!==''&&data.emailId!==undefined) &&(
                  <Text numberOfLines={1} style={styles.emailIdTextStyle}>
                    {data.emailId || ''}
                  </Text>
                  )}
                </View>
              </View>
              {UsersDao.getUserId() === creatorId ? (
                <TouchableOpacity
                  underlayColor={(0, 0, 0, 0.2)}
                  onPress={() => {
                    this.selectedPermissionKey = _key;
                    this.setState({userId: userId});
                    this.permission.current.openBottomDrawer(_key);
                  }}>
                  <Text style={styles.memberTextStyle}>{text}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.memberTextStyle}>{text}</Text>
              )}
            </View>
          </View>
        )}
      </Swipeable>
    );
  };

  keyExtractor = (data) => {
    return data?.id;
  };

  showParticipants = (creatorId) => {
    //let dat = this.board.creator.id;
    let members = this.props.boardMembers?.members || emptyArray;
    if(members&&members.length>0)
    {
      members =
      members
      .filter(
        (a) =>
        a && a.id!==undefined&& a.id !== this.state.creator?.id
         );
    }
    const {canRemoveMember} = discussionsACL(this.board);
    return (
      <FlatList
        data={members}
        extraData={members}
        renderItem={this.renderItem}
        removeClippedSubviews={true}
        keyExtractor={this.keyExtractor}
      />
    );
  };

  deleteUserConfirmModal(options) {
    return (
      <DeleteMessage
        delteOptionsArray={options}
        title="Are you sure?"
        ref={this.deleteUserConfirmModalRef}
      />
    );
  }

  render() {
    const {t} = this.props;
    let dat = this.state.creator;
    if (typeof dat === 'string') {
      const members = this.props.boardMembers?.members || emptyArray;
      dat = members.find((o) => o.id === dat) || emptyObject;
    }
    const isUser = UsersDao.getUserId();
    let adminName = dat?.fN!==undefined?dat?.fN:'' + ' ' + dat?.lN!==undefined?dat?.lN:'';
    let wsName = this.props.activeWs.name;
    if (wsName?.length > 18) {
      wsName = wsName.substring(0, 18) + '...';
    }
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        {this.deleteUserConfirmModal(removeDiscussionArray)}
        <Header
          title="Members"
          goBack={true}
          // backIcon={<Icon name={'cross'} size={30} />}
          navigation={this.props.navigation}
        />
        <ScrollView bounces={false}>
          <View>
            <View
              //key={data.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: 20,
                marginTop: 10,
                height: 60,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  flex: 1,
                }}>
                <Avatar
                  profileIcon={dat?.icon}
                  userId={dat?.id}
                  name={dat?.fN}
                  color={dat?.color}
                />
                <TouchableOpacity
                  style={{flexDirection: 'column', marginLeft: 10}}>
                  <Text style={styles.adminNameTextStyle}>
                    {dat?.id === isUser ? 'You' : adminName}
                  </Text>
                  <Text style={styles.emailIdTextStyle}>{dat?.emailId}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.adminTextStyle}>{t('Owner')}</Text>
            </View>
          </View>
          {this.showParticipants(dat?.id || dat)}
        </ScrollView>
        {/* </ScrollView> */}
        <SafeAreaView style={{backgroundColor: 'white'}} />
        {this.permissionOption()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  nameTextStyle: {
    fontWeight: '500',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#292929',
    flexShrink: 1,
  },
  emailIdTextStyle: {
    marginTop: 4,
    fontWeight: '400',
    fontSize: normalize(12),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#5F6368',
    flexShrink: 1,
  },
  memberTextStyle: {
    textDecorationLine: 'underline',
    paddingRight: 22,
    color: '#9AA0A6',
    fontWeight: '500',
    fontSize: normalize(14),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  permissionsTextStyle: {
    color: '#5F6368',
    flex: 1,
    fontWeight: '500',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  postOnlyTextStyle: {
    marginRight: 15,
    fontWeight: '500',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  textStyle: {
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  adminNameTextStyle: {
    fontSize: normalize(16),
    fontWeight: '500',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#202124',
  },
  optionTextStyle: {
    fontWeight: '500',
    lineHeight: 20,
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  optionDescTextStyle: {
    marginTop: 5,
    fontWeight: '400',
    fontSize: normalize(14),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#5F6368',
  },
  adminTextStyle: {
    textDecorationLine: 'underline',
    paddingRight: 22,
    color: '#9AA0A6',
    fontWeight: '500',
    fontSize: normalize(14),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  rightItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  swipeChildStyle: {
    width: 90,
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const mapStateToProps = (state) => {
  const {workspace, discussion} = state;
  let ws = workspace.workspacelist?.ws || emptyArray;
  return {
    activeWsMembers: workspace.activeWsMembers?.members || emptyArray,
    allDiscussions: discussion.allDiscussions,
    workspacelist: workspace.workspacelist?.ws || emptyArray,
    activeWsId: workspace.activeWsId,
    boardMembers: discussion.boardMembers,
    activeWs: ws.find((obj) => obj?.id === workspace.activeWsId) || emptyObject,
  };
};

Members.propTypes = {
  leaveDiscussion: PropTypes.func,
};

Members.defaultProps = {
  leaveDiscussion: () => {},
};

export default connect(mapStateToProps, {
  leaveDiscussion,
  addMemberAccess,
})(withTranslation()(Members));
