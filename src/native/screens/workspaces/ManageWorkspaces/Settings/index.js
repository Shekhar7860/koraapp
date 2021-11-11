import React from 'react';
import {connect} from 'react-redux';
import {
  ScrollView,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
  SafeAreaView,
} from 'react-native';
import {Header} from '../../../../navigation/TabStacks';
import {normalize} from '../../../../utils/helpers';
import {fontFamily} from '../../../../components/KoraText';
import {withTranslation} from 'react-i18next';
import {KoraToggleSwitch} from '../../../../components/toggleButton';
import {RadioButton} from 'react-native-paper';
import {editWorkspace} from '../../../../../shared/redux/actions/workspace.action';
import {BottomUpModal} from '../../../../components/BottomUpModal';
import {Icon} from '../../../../components/Icon/Icon';
import {UserItemWithSelection} from '../../../NewDiscussion/AddException';
import {Q} from '@nozbe/watermelondb';
import withObservables from '@nozbe/with-observables';
import {of as of$} from 'rxjs';
import {switchMap, catchError} from 'rxjs/operators';
import database from '../../../../realm';
import * as Entity from '../../../../realm/dbconstants';

const VisisibilityTypes = [
  {
    key: 'private',
    name: 'Private',
    description: 'Admin has to invite members manually.',
  },
  // {
  //   key: 'open',
  //   name: 'Open',
  //   description:
  //     'Anyone in your organization can send request to join this workspace.\nWorkspace admin has to approve.',
  // },
  {
    key: 'public',
    name: 'Public',
    description: 'Anyone in your organization can join this workspace.',
  },
];

const CreateBoardTypes = [
  {
    key: true,
    text: 'Allow.',
  },
  {
    key: false,
    text: 'Do not allow.',
  },
  // {
  //   key: 'members',
  //   text: 'Only selected members. ',
  // },
];

const SearchTextInput = ({placeholder, onChangeText, value}) => {
  return (
    <View
      style={{
        borderColor: '#E5E8EC',
        borderWidth: 1,
        borderRadius: 8,
        padding: 8,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      <Icon name={'Contact_Search'} size={20} />
      <TextInput
        value={value}
        placeholder={placeholder}
        onChangeText={console.log}
        style={[styles.text, {paddingLeft: 5}]}
      />
    </View>
  );
};

const RadioButtonOption = ({status, onPress, children = null}) => {
  return (
    <View style={{flexDirection: 'row', marginLeft: -8}}>
      <RadioButton.Android
        color={'#0D6EFD'}
        underlayColor={'white'}
        status={status}
        onPress={onPress}
      />
      <View
        style={[
          styles.directionColumn,
          {justifyContent: 'center', flexShrink: 1},
        ]}>
        {children}
      </View>
    </View>
  );
};

const OuterRadioButton = ({
  status,
  onPress,
  children = null,
  key,
  containerStyles = null,
}) => {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          marginVertical: 7,
          marginLeft: -8,
        },
        containerStyles,
      ]}>
      <RadioButton.Android
        key={key}
        value={key}
        color={'#0D6EFD'}
        underlayColor={'white'}
        status={status}
        onPress={onPress}
      />
      <View style={styles.directionColumn}>{children}</View>
    </View>
  );
};

class WorkspaceSettings extends React.Component {
  constructor(props) {
    super();
    this.state = {
      whoCanAcceptRequests: {all: true, roles: [], members: []},
      whoCanCreateBoard: {all: true, roles: [], members: []},
      whoCanInviteUsers: {all: true, roles: [], members: []},
      type: 'private',
      usersList: [],
      searchText: '',
    };
    this.userSelectionModalRef = React.createRef();
  }

  simpleObject(obj) {
    return {
      all: obj.all,
      roles: Array.from(obj.roles),
      members: Array.from(obj.members),
    };
  }

  componentDidMount() {
    const db = database.active;

    const whereClause = [Q.where('wsId', this.props.activeWsId)];

    db.collections
      .get(Entity.Workspaces)
      .query(...whereClause)
      .then((ws) => {
        this?.subscription?.unsubscribe?.();
        this.subscription = ws[0].observe().subscribe(
          (workspace) => {
            this.setState({
              type: workspace.type,
              whoCanAcceptRequests: this.simpleObject(
                workspace?.settings?.whoCanAcceptRequests,
              ),
              whoCanCreateBoard: this.simpleObject(
                workspace?.settings?.whoCanCreateBoard,
              ),
              whoCanInviteUsers: this.simpleObject(
                workspace?.settings?.whoCanInviteUsers,
              ),
            });
          },
          (error) => console.log('ERROR', error),
        );
      });

    // this.ws?.addListener?.((obj) => {
    //   this.setState({
    //     type: obj.type,
    //   });
    // });

    // this.ws?.settings?.addListener?.((obj) => {
    // });
  }

  componentWillUnmount() {
    this?.subscription?.unsubscribe?.();

    this.setState = (a, b) => {};
    this.ws?.settings?.removeAllListeners?.();
    this.ws?.removeAllListeners?.();
  }

  get ws() {
    return this.props.route.params.ws;
  }

  getPayload() {
    const {
      whoCanAcceptRequests,
      whoCanCreateBoard,
      whoCanInviteUsers,
      type,
    } = this.state;
    if (whoCanCreateBoard.all === 'members') {
      whoCanCreateBoard.all = false;
      whoCanCreateBoard.members = whoCanCreateBoard.members.map((object) => {
        return object?.id || object;
      });
    }

    return {
      settings: {whoCanAcceptRequests, whoCanCreateBoard, whoCanInviteUsers},
      type,
    };
  }

  callUpdateWsApi = () => {
    let payload = this.getPayload();
    this.props.editWorkspace(this.ws.id, payload);
  };

  setCanInviteUserFlag = (flag = false) => {
    let {whoCanInviteUsers} = this.state;
    whoCanInviteUsers.all = flag;
    this.setState({whoCanInviteUsers: whoCanInviteUsers}, this.callUpdateWsApi);
  };

  setWhoCanCreateBoardFlag = (flag) => () => {
    let {whoCanCreateBoard} = this.state;
    whoCanCreateBoard.all = flag;
    this.setState({whoCanCreateBoard: whoCanCreateBoard}, this.callUpdateWsApi);
  };

  setBoardTypeFlag = (flag) => () => {
    this.setState({type: flag}, this.callUpdateWsApi);
  };

  renderMemberAccessSection() {
    return (
      <View
        style={[
          styles.containerPadding,
          styles.directionColumn,
          styles.marginMinus7,
        ]}>
        <View style={[styles.directionRow, styles.flexOne]}>
          <Text style={[styles.flexShrinkOne, styles.boldText]}>
            Members can invite & manage workspace members
          </Text>
          <KoraToggleSwitch
            isToggleOn={this.state.whoCanInviteUsers?.all}
            onChange={this.setCanInviteUserFlag}
          />
        </View>
        <View style={{height: 14}} />
        <Text style={styles.text}>
          This will enable workspace members to invite new members to the
          workspace and also enables option to manage workspace to the members
        </Text>
      </View>
    );
  }

  addAdminToCanAcceptUser = () => {
    let {whoCanAcceptRequests} = this.state;
    if (!whoCanAcceptRequests.roles?.find((role) => role === 'wsadmin')) {
      whoCanAcceptRequests.roles = [...whoCanAcceptRequests.roles, 'wsadmin'];
      whoCanAcceptRequests.members = [];
    }
    this.setState(
      {whoCanAcceptRequests: whoCanAcceptRequests},
      this.callUpdateWsApi,
    );
  };

  removeAdminToCanAcceptUser = () => {
    let {whoCanAcceptRequests} = this.state;
    if (whoCanAcceptRequests.roles?.find((role) => role === 'wsadmin')) {
      whoCanAcceptRequests.roles = whoCanAcceptRequests.roles.filter(
        (role) => role !== 'wsadmin',
      );
      whoCanAcceptRequests.roles = [...whoCanAcceptRequests.roles];
      whoCanAcceptRequests.members = [];
    }
    whoCanAcceptRequests.all = false;
    this.setState(
      {whoCanAcceptRequests: whoCanAcceptRequests},
      this.callUpdateWsApi,
    );
  };

  renderWorkspaceVisibility() {
    return (
      <View style={{padding: 18}}>
        <Text style={styles.boldText}>Workspace visibility</Text>
        <View style={{height: 14}} />
        <View style={{marginVertical: -7}}>
          {VisisibilityTypes.map((option) => {
            const canWsAdminAccept = this.state.whoCanAcceptRequests.roles?.find(
              (role) => role === 'wsadmin',
            );
            return (
              <>
                <OuterRadioButton
                  status={
                    this.state.type === option.key ? 'checked' : 'unchecked'
                  }
                  onPress={this.setBoardTypeFlag(option.key)}
                  key={option.key}>
                  <Text style={styles.boldText}>{option.name}</Text>
                  <Text style={styles.text}>{option.description}</Text>
                </OuterRadioButton>
                {option.key === 'VisisibilityTypes[1].key' && (
                  <View style={{flexDirection: 'row', marginBottom: 5}}>
                    <View style={{width: 30}} />
                    <View style={{flexShrink: 1}}>
                      <Text style={styles.memberApproval}>Member approval</Text>
                      <RadioButtonOption
                        status={canWsAdminAccept ? 'checked' : 'unchecked'}
                        onPress={this.addAdminToCanAcceptUser}>
                        <Text style={[styles.text, {flexShrink: 1}]}>
                          All admins of this workspace are notified to approve
                          new members{' '}
                        </Text>
                      </RadioButtonOption>
                      <View style={{height: 14}} />
                      <RadioButtonOption
                        status={!canWsAdminAccept ? 'checked' : 'unchecked'}
                        onPress={this.removeAdminToCanAcceptUser}>
                        <Text style={[styles.text]}>
                          Only selected admins are notified to approve new
                          members.{' '}
                          {!canWsAdminAccept ? (
                            <Text
                              style={[
                                styles.text,
                                {
                                  color: '#0D6EFD',
                                  textDecorationLine: 'underline',
                                },
                              ]}>
                              Manage
                            </Text>
                          ) : null}
                        </Text>
                      </RadioButtonOption>
                    </View>
                  </View>
                )}
              </>
            );
          })}
        </View>
      </View>
    );
  }

  onWhoCanCreateBoardPress = () => {
    this.setState(
      {
        usersList: this.state.whoCanCreateBoard.members.map(
          ({fN, lN, id, emailId = ''}) => {
            return {fN, lN, id, emailId, marked: true};
          },
        ),
      },
      () => this.userSelectionModalRef.current.open(),
    );
  };

  renderCreateNewBoardOptions() {
    return (
      <View style={{paddingVertical: 14, paddingHorizontal: 17}}>
        <Text style={styles.boldText}>Allow member to create new boards</Text>
        <View style={{height: 7}} />
        {CreateBoardTypes.map((option) => {
          return (
            <OuterRadioButton
              key={option.key}
              status={
                this.state.whoCanCreateBoard.all === option.key
                  ? 'checked'
                  : 'unchecked'
              }
              onPress={this.setWhoCanCreateBoardFlag(option.key)}
              containerStyles={{marginVertical: 0}}>
              <View style={{flex: 1, justifyContent: 'center'}}>
                <Text style={styles.text}>
                  {option.text}
                  {option.key === 'members' &&
                  this.state.whoCanCreateBoard.members?.length > 0 ? (
                    <Text
                      onPress={this.onWhoCanCreateBoardPress}
                      style={[
                        styles.text,
                        {
                          color: '#0D6EFD',
                          textDecorationLine: 'underline',
                        },
                      ]}>
                      Manage
                    </Text>
                  ) : null}
                </Text>
              </View>
            </OuterRadioButton>
          );
        })}
      </View>
    );
  }

  modifyWhoCanCreateBoardMembers = () => {
    let {members} = this.state.whoCanCreateBoard;
    let {whoCanCreateBoard} = this.state;
    whoCanCreateBoard.members = this.state.usersList;
    this.setState({whoCanCreateBoard: whoCanCreateBoard}, this.callUpdateWsApi);
  };

  onMarkUnMarkCB = this.modifyWhoCanCreateBoardMembers;

  markUnMark = (_id) => (value) => {
    let {usersList} = this.state;
    const index = usersList.findIndex(({id}) => id === _id);
    if (index > -1) {
      usersList[index].marked = value;
    }
    this.setState({usersList: usersList}, this.onMarkUnMarkCB);
  };

  userItem = ({item, data}) => {
    const {fN, lN, marked, id, emailId = ''} = item;
    return (
      <View style={{marginLeft: -14}}>
        <UserItemWithSelection
          fN={fN}
          lN={lN}
          profileIcon={item?.icon}
          userId={item?.id}
          marked={marked}
          emailId={emailId}
          onMarkToggle={this.markUnMark(id)}
        />
      </View>
    );
  };

  listHeader = () => {
    return (
      <SearchTextInput
        placeholder={'Search members'}
        onChangeText={(searchText) => {
          console.log('SEARCH ', searchText);
          this.setState({searchText});
        }}
        value={this.state.searchText}
      />
    );
  };

  renderUserSelectionModal() {
    const {usersList} = this.state;
    return (
      <BottomUpModal ref={this.userSelectionModalRef}>
        <View
          style={{
            height: 60,
            paddingHorizontal: 18,
            borderBottomWidth: 0.7,
            borderBottomColor: '#BDC1C6',
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            onPress={() => this.userSelectionModalRef.current.close()}>
            <Icon size={22} name={'cross'} />
          </TouchableOpacity>
        </View>
        <View
          style={{
            height: '100%',
            paddingTop: 15,
            paddingLeft: 15,
            paddingRight: 15,
          }}>
          {this.listHeader()}
          <View style={{height: 11.5}} />
          <FlatList data={usersList} renderItem={this.userItem} />
        </View>
      </BottomUpModal>
    );
  }

  render() {
    return (
      <View style={styles.safeAreaStyles}>
        {this.renderUserSelectionModal()}
        <Header
          title={'Settings'}
          goBack={true}
          navigation={this.props.navigation}
        />
        <ScrollView style={styles.scrollViewStyles}>
          {this.renderMemberAccessSection()}
          <View style={styles.seperator} />
          {this.renderWorkspaceVisibility()}
          <View style={styles.seperator} />
          {this.renderCreateNewBoardOptions()}
        </ScrollView>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const {workspace} = state;

  return {
    activeWsId: workspace.activeWsId,
  };
};

export default connect(mapStateToProps, {editWorkspace})(
  withTranslation()(WorkspaceSettings),
);

const styles = StyleSheet.create({
  memberApproval: {
    fontWeight: '500',
    fontSize: normalize(14),
    lineHeight: normalize(20),
    fontFamily: fontFamily,
    marginBottom: 13,
  },
  marginMinus7: {
    marginBottom: -7,
  },
  boldText: {
    fontWeight: '700',
    fontSize: normalize(16),
    lineHeight: normalize(20),
    fontFamily: fontFamily,
  },
  flexShrinkOne: {flexShrink: 1},
  directionColumn: {flexDirection: 'column'},
  directionRow: {flexDirection: 'row'},
  containerPadding: {paddingVertical: 23, paddingHorizontal: 17},
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
  seperator: {height: 1, backgroundColor: '#E4E5E7'},
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
