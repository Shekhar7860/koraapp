import {debounce} from 'lodash';
import React from 'react';
import {memo} from 'react';
import {withTranslation} from 'react-i18next';
import {TouchableOpacity} from 'react-native';
import {ScrollView} from 'react-native';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {connect} from 'react-redux';

import {
  getAllWSMembers,
  editWorkspace,
  getAllRoles,
} from '../../../../shared/redux/actions/workspace.action';
import {emptyArray} from '../../../../shared/redux/constants/common.constants';
import {Avatar} from '../../../components/Icon/Avatar';
import {Icon} from '../../../components/Icon/Icon';
import {fontFamily} from '../../../components/KoraText';
import {RoomAvatar} from '../../../components/RoomAvatar';
import {navigate} from '../../../navigation/NavigationService';
import {ROUTE_NAMES} from '../../../navigation/RouteNames';
import {Header} from '../../../navigation/TabStacks';
import {getTimeline, normalize} from '../../../utils/helpers';
import {BoardProfilePicture} from '../DiscussionRoomDetails';
import reactotron from '../../../../../reactotron-config';
import {workspaceACL} from '../../../core/AccessControls';

import {Q} from '@nozbe/watermelondb';
import withObservables from '@nozbe/with-observables';
import {of as of$} from 'rxjs';
import {switchMap, catchError} from 'rxjs/operators';
import database from '../../../realm';
import * as Entity from '../../../realm/dbconstants';

export const ManageItem = memo(
  ({
    icon = '',
    text = '',
    rightArrow = false,
    textColor = '#202124',
    iconColor = '#202124',
    onPress = () => {},
  }) => {
    return (
      <TouchableOpacity onPress={onPress} style={styles.manageItem}>
        {icon !== '' && (
          <View style={{marginRight: 13}}>
            <Icon name={icon} size={22} color={iconColor} />
          </View>
        )}
        {text !== '' && (
          <Text style={[styles.description, {color: textColor}]}>{text}</Text>
        )}
        {rightArrow && (
          <>
            <View style={{flex: 1}} />
            <Icon name={'Right_Direction'} size={12} />
          </>
        )}
      </TouchableOpacity>
    );
  },
);

const AboutSectionItem = memo(({logo = '', title = '', text = ''}) => {
  return (
    <View style={{flexDirection: 'row', marginBottom: 20}}>
      <View style={{marginRight: 12}}>
        <Icon name={logo} size={20} color={'#9AA0A6'} />
      </View>
      <View style={{flexDirection: 'column'}}>
        <Text style={[styles.highlight, {marginBottom: 6}]}>{title}</Text>
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  );
});

const wsRole = {
  wsadmin: 'Admin',
  wsmember: 'Member',
  member: 'Member',
  guest: 'Guest',
  wsowner: 'Owner',
};

function getPrettifiedWSRoleName(role) {
  return wsRole[role] || role;
}

export const MemberItem = ({
  icon,
  fN = '',
  lN = '',
  emailId,
  color,
  id,
  memberStatus = '',
  onRoleClicked = () => {},
  showRole = false,
  role = {},
}) => {
  let roleName = getPrettifiedWSRoleName(memberStatus);
  if (roleName === 'Member') {
    if (role.name === 'wsadmin') {
      roleName = 'Admin';
    } else if (role.name === 'wsowner') {
      roleName = 'Owner';
    }
  }
  let fullName = `${fN} ${lN}`;
  if (fullName.trim() === '') {
    fullName = emailId;
    emailId = '';
  }
  return (
    <View
      style={{
        flexDirection: 'row',
        paddingVertical: 14.25,
        paddingHorizontal: 16,
      }}>
      <View style={{marginRight: 11}}>
        <Avatar
          profileIcon={icon}
          userId={id}
          rad={39}
          name={fullName}
          color={color}
        />
      </View>
      <View style={{flexDirection: 'column'}}>
        <Text style={styles.name}>{fullName}</Text>
        <Text style={styles.emailId}>{emailId}</Text>
      </View>
      {showRole && (
        <>
          <View style={{flex: 1}} />
          <View>
            <Text
              style={{textDecorationLine: 'underline', color: '#9AA0A6'}}
              onPress={() => onRoleClicked(id)}>
              {roleName}
            </Text>
          </View>
        </>
      )}
    </View>
  );
};

class ManageWorkspacesScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      description: '',
      ws: {},
      creatorFullName:''
    };
    this.listener = null;
    this.boardProfilePictureRef = React.createRef();
  }

  get ws() {
    return this.state.ws;
  }

  get getCreatorFullName(){
    return this.state.creatorFullName;
  }

  getAllRoles() {
    this.props.getAllRoles(this.props.activeWsId);
  }

  componentDidMount() {
    this.props.getAllWSMembers(this.props.activeWsId);

    this.getAllRoles();
    this.listener = this.ws;
    try {
      const db = database.active;

      if (this.messagesSubscription && this.messagesSubscription.unsubscribe) {
        this.messagesSubscription.unsubscribe();
      }

      const whereClause = [Q.where('wsId', this.props.activeWsId)];
      db.collections
        .get(Entity.Workspaces)
        .query(...whereClause)
        .then((ws) => {
          this?.subscription?.unsubscribe?.();
          this.subscription = ws[0].observe().subscribe(
            (workspace) => {
              this.setState({
                ws: workspace,
                name: workspace.name,
                description: workspace.description,
              });
              if(this.state.creatorFullName==''){
                let id = workspace?.createdBy;
                this.getCreatedContact(id);
                }
            },
            (error) => console.log('ERROR', error),
          );
        });
    } catch (e) {
      console.log('error in subscribeMessages', e);
    }
  }

  componentWillUnmount() {
    this.setState = (a, b) => {};
    this?.subscription?.unsubscribe?.();
    if (this.messagesSubscription && this.messagesSubscription.unsubscribe) {
      this.messagesSubscription.unsubscribe();
    }

    // this.ws?.removeAllListeners();
  }

  editNameApi = debounce(() => {
    let payload = {};
    payload.name = this.state.name;

    this.props.editWorkspace(this.ws.wsId, payload);
  }, 400);

  editWSApi = debounce(() => {
    console.log('CHANGE DESCRIPTION');
    const {ws, ...rest} = this.state;
    const payload = rest;

    payload.description = this.state.description;
    this.props.editWorkspace(this.ws.wsId, payload);
  }, 400);

  editLogo = (payload) => {
    this.props.editWorkspace(this.ws.wsId, payload);
    this.boardProfilePictureRef.current.close();
  };

  editWorkspace = (key) => (txt) => {
    const obj = {};
    obj[key] = txt;
    console.log('EDIT WS', txt);

    this.setState(obj, () => {
      if (key === 'name') {
        this.editNameApi();
      } else {
        this.editWSApi();
      }
    });
  };

  renderEditNameAndDescription() {
    const {logo} = this.ws;
    const {editWsName, editWsDescription, editWsPic} = workspaceACL(this.ws);
    return (
      <View style={styles.subView}>
        <View style={styles.rowCenter}>
          <TouchableOpacity
            onPress={() => {
              this.boardProfilePictureRef.current.open();
            }}
            style={styles.logoBox}>
            <RoomAvatar boardIcon={logo} showCircle={false} />
          </TouchableOpacity>
          <TextInput
            editable={editWsName}
            style={styles.wsName}
            value={this.state.name}
            onChangeText={this.editWorkspace('name')}
          />
        </View>
        <View style={styles.lineSeperator} />
        <TextInput
          editable={editWsDescription}
          style={styles.description}
          value={this.state.description}
          onChangeText={this.editWorkspace('description')}
          placeholder={'Add description...'}
          placeholderTextColor={'#9AA0A6'}
        />
      </View>
    );
  }

  renderMemberList() {
    return this.props.activeWsMembers?.slice(0, 2)?.map((user) => {
      return (
        <View key={user.id || user._id}>
          <View style={[styles.lineSeperator, styles.marginVertical0]} />
          <MemberItem {...user} />
        </View>
      );
    });
  }

  onMembersPress = () => {
    navigate(ROUTE_NAMES.MANAGE_WORKSPACES_MEMBERS, {
      ws: this.props.route.params.ws,
    });
  };

  onAddMembersPress = () => {
    navigate(ROUTE_NAMES.MANAGE_WORKSPACES_INVITE);
  };

  renderMemberSection() {
    const {t} = this.props;
    const {inviteMembers} = workspaceACL(this.ws);

    return (
      <View style={{backgroundColor: 'white'}}>
        {inviteMembers && (
          <>
            <ManageItem
              icon={'Contact_Addparticipant'}
              onPress={this.onAddMembersPress}
              text={t('Add Members')}
            />
            <View style={[styles.lineSeperator, styles.marginVertical0]} />
          </>
        )}
        <ManageItem
          onPress={this.onMembersPress}
          icon={'Share'}
          text={t('Members')}
          rightArrow={false}
        />
        {this.renderMemberList()}
        <View style={[styles.lineSeperator, styles.marginVertical0]} />
        <ManageItem
          text={t('See All')}
          rightArrow={true}
          onPress={this.onMembersPress}
        />
      </View>
    );
  }

  navigateToWsSettings = () => {
    navigate(ROUTE_NAMES.WORKSPACE_SETTINGS, {ws: this.ws});
  };

  renderOptions() {
    const {t} = this.props;
    const {canDeleteWs, changeSettings} = workspaceACL(this.ws);

    return (
      <View style={{backgroundColor: 'white'}}>
        <ManageItem
          icon={'notification'}
          text={t('Notification')}
          rightArrow={true}
        />
        {changeSettings && (
          <>
            <View style={[styles.lineSeperator, styles.marginVertical0]} />
            <ManageItem
              icon={'Admin'}
              onPress={this.navigateToWsSettings}
              text={t('Settings')}
              rightArrow={true}
            />
          </>
        )}
        {canDeleteWs && (
          <>
            <View style={[styles.lineSeperator, styles.marginVertical0]} />
            <ManageItem
              icon={'Delete_T'}
              text={t('Delete Workspace')}
              textColor={'#DD3646'}
              iconColor={'#DD3646'}
            />
          </>
        )}
      </View>
    );
  }

  getCreatedContact =(id)=>{
  
      database.active.get(Entity.Contacts).query(
      Q.where('id', id)).then((contact)=>{
         let fullName=(contact[0]?.fN!==undefined?contact[0]?.fN:'')
         +' '+(contact[0]?.lN!==undefined?contact[0]?.lN:'');
         this.setState({creatorFullName:fullName})
        });
       
     }

  renderAboutSection() {
    // return null;
    const {t} = this.props;

    let membersCount = this.ws?.membersCount;
    let createDate = this.ws?.createDate;
    return (
      <View
        style={{
          paddingVertical: 20,
          paddingHorizontal: 16,
          backgroundColor: 'white',
        }}>
        <Text style={styles.highlight}>{t('About')}</Text>
        <View style={{height: 21}} />
        <AboutSectionItem
          title={t('Created By')}
          logo={'kr-add_user_male'}
          text={this.getCreatorFullName||''}
        />
        <AboutSectionItem
          title={t('Members')}
          logo={'Share'}
          text={`${membersCount}`}
        />
        <AboutSectionItem
          title={t('Created On')}
          logo={'Day_View'}
          text={`${getTimeline(new Date(createDate), 'discList')}`}
        />
      </View>
    );
  }
  render() {
    const {
      t,
      route: {
        params: {},
      },
    } = this.props;
    return (
      <View style={styles.safeAreaStyles}>
        <Header
          title={t('Manage Workspace')}
          goBack={true}
          navigation={this.props.navigation}
        />
        <BoardProfilePicture
          ref={this.boardProfilePictureRef}
          uploadEmoji={this.editLogo}
        />
        <ScrollView style={styles.scrollViewStyles}>
          {this.renderEditNameAndDescription()}
          <View style={styles.sectionSeperator} />
          {this.renderMemberSection()}
          <View style={styles.sectionSeperator} />
          {this.renderOptions()}
          <View style={styles.sectionSeperator} />
          {this.renderAboutSection()}
        </ScrollView>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const {workspace} = state;
  let ws = workspace.workspacelist?.ws || emptyArray;

  return {
    activeWsId: workspace.activeWsId,
    activeWsMembers: workspace.activeWsMembers?.members || emptyArray,
    wsMemberRoles: workspace.wsMemberRoles,
  };
};

export default connect(mapStateToProps, {
  getAllWSMembers,
  getAllRoles,
  editWorkspace,
})(withTranslation()(ManageWorkspacesScreen));

const styles = StyleSheet.create({
  marginVertical0: {marginVertical: 0},
  name: {
    fontWeight: '500',
    fontSize: normalize(16),
    lineHeight: normalize(20),
    fontFamily: fontFamily,
  },
  emailId: {
    fontFamily: fontFamily,
    fontWeight: '500',
    fontSize: normalize(12),
    lineHeight: normalize(14),
    color: '#9AA0A6',
  },
  text: {
    fontFamily: fontFamily,
    fontWeight: '400',
    fontSize: normalize(16),
    lineHeight: normalize(20),
  },
  highlight: {
    fontFamily: fontFamily,
    fontWeight: '700',
    fontSize: normalize(14),
    lineHeight: normalize(17),
  },
  manageItem: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionSeperator: {
    height: 20,
    backgroundColor: '#EFF0F1',
  },
  lineSeperator: {
    marginVertical: 16,
    borderBottomColor: '#E4E5E7',
    borderBottomWidth: 1,
  },
  wsName: {
    fontFamily: fontFamily,
    fontWeight: '700',
    fontSize: normalize(18),
    lineHeight: normalize(21),
  },
  logoBox: {
    height: 44,
    width: 44,
    backgroundColor: '#EFF0F1',
    borderRadius: 4,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  rowCenter: {flexDirection: 'row', alignItems: 'center'},
  subView: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    paddingBottom: 19,
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  joinText: {
    color: '#106CF6',
    lineHeight: normalize(26),
    fontFamily: fontFamily,
    fontSize: normalize(16),
    fontWeight: '400',
  },
  invitedTagContainer: {
    borderRadius: 4,
    paddingHorizontal: 11,
    paddingVertical: 3,
    backgroundColor: '#EAF6EC',
  },
  invitedTag: {
    color: '#135423',
    fontSize: normalize(14),
    lineHeight: normalize(14),
  },
  requestedTagContainer: {
    borderRadius: 4,
    paddingHorizontal: 11,
    paddingVertical: 3,
    backgroundColor: '#EFF0F1',
  },
  requestedTag: {
    color: '#3C4043',
    fontSize: normalize(14),
    lineHeight: normalize(14),
  },
  itemHeader: {
    fontWeight: '700',
    fontSize: normalize(16),
  },
  wsItem: {
    padding: 18,
    borderRadius: 4,
    borderColor: '#E4E5E7',
    backgroundColor: 'white',
  },
  cardLogo: {
    width: 76,
    marginLeft: -16,
    alignItems: 'center',
    // justifyContent: 'center',
  },
  description: {
    fontFamily: fontFamily,
    fontWeight: '400',
    fontSize: normalize(16),
    lineHeight: normalize(19.86),
  },
  list: {
    marginTop: 14,
    paddingHorizontal: 18,
    // marginBottom: 100,
  },
  cardHeader: {fontWeight: '700', marginBottom: 7},
  safeAreaStyles: {
    flex: 1,
    backgroundColor: '#EFF0F1',
    flexDirection: 'column',
  },
  scrollViewStyles: {backgroundColor: 'white'},
  mediumText: {fontWeight: '500', fontSize: 16},
  topText: {
    fontWeight: '700',
    fontSize: normalize(18),
    fontFamily: fontFamily,
  },
  emojiTextStyle: {
    fontWeight: '400',
    fontSize: normalize(28),
    fontStyle: 'normal',
  },
  textInput: {
    fontFamily: fontFamily,
    fontWeight: '700',
    fontSize: normalize(20),
    paddingHorizontal: 10,
    lineHeight: 24,
  },
  flexOne: {flex: 1},
  emojiContainer: {
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF0F1',
    borderRadius: 4,
  },
  iconAndNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  card: {
    borderWidth: 0.5,
    borderColor: '#BDC1C6',
    padding: 14,
    paddingEnd: 28,
    borderRadius: 6,
  },
  selected: {
    borderColor: '#126df6',
    backgroundColor: '#F3F8FF',
  },
  cardText: {
    fontWeight: '400',
    color: '#202124',
    flexShrink: 1,
  },
  selectedText: {
    color: '#07377F',
  },
});
