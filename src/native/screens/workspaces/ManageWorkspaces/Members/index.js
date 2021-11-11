import React from 'react';
import {withTranslation} from 'react-i18next';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  Text,
  FlatList,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
import {emptyArray} from '../../../../../shared/redux/constants/common.constants';
import {BottomUpModal} from '../../../../components/BottomUpModal';
import {Icon} from '../../../../components/Icon/Icon';
import {fontFamily} from '../../../../components/KoraText';
import {ModalOption} from '../../../../components/WorkspaceOptionsModal';
import {Header} from '../../../../navigation/TabStacks';
import {normalize} from '../../../../utils/helpers';
import {MemberItem} from './../index';
//import Swipeout from '../../../../components/Library/react-native-swipeout/src';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {DeleteThread} from '../../../ChatsThreadScreen/chats-thread';
import {
  changeMemberAccess,
  getAllRoles,
  removeWsMember,
} from '../../../../../shared/redux/actions/workspace.action';
import {ROUTE_NAMES} from '../../../../navigation/RouteNames';
import {navigate} from '../../../../navigation/NavigationService';
import {workspaceACL} from '../../../../core/AccessControls';

const row = [];
let prevOpenedRow = null;
class ManageWorkspaceMember extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      selectedFilter: 'all',
      filters: [
        {
          id: 'all',
          text: 'All',
          icon: 'Share',
        },
        {
          id: 'members',
          text: 'Members',
          icon: 'Male_User',
        },
        {
          id: 'guest',
          text: 'Guest Users',
          icon: 'Happy',
        },
        {
          id: 'requested',
          text: 'Requested',
          icon: 'Add_User',
        },
        {
          id: 'invited',
          text: 'Invited',
          icon: 'Add_User_Group',
        },
      ],
    };
    this.roleModalRef = React.createRef();
    this.filterModalRef = React.createRef();
    this.memberId = '';
  }

  onAddMembersClick = () => {
    console.log('onAddMembersClick');
    navigate(ROUTE_NAMES.MANAGE_WORKSPACES_INVITE);
  };

  get ws() {
    return this.props.route.params.ws;
  }

  componentDidMount() {}

  renderRightContent = () => {
    const {inviteMembers} = workspaceACL(this.ws);
    if (!inviteMembers) {
      return null;
    }
    return (
      <TouchableOpacity
        style={{padding: 20, margin: -20}}
        onPress={this.onAddMembersClick}>
        <Icon size={20} name={'Contact_Addparticipant'} />
      </TouchableOpacity>
    );
  };

  renderSearchTextInput = () => {
    return (
      <View
        style={{
          padding: 8,
          borderColor: '#E5E8EC',
          borderWidth: 1,
          borderRadius: 8,
          flexDirection: 'row',
          flexShrink: 1,
          alignItems: 'center',
        }}>
        <View style={{padding: 2, marginRight: 8}}>
          <Icon name={'Contact_Search'} size={18} />
        </View>
        <TextInput
          placeholder={'Search members'}
          value={this.state.searchText}
          onChangeText={(searchText) => this.setState({searchText})}
          styles={{
            fontSize: 14,
            paddingVertical: 0,
            backgroundColor: 'blue',
          }}
        />
      </View>
    );
  };

  renderFilterButton() {
    let curOption = this.state.filters.find(
      (o) => o.id === this.state.selectedFilter,
    );

    return (
      <TouchableOpacity
        onPress={() => this.filterModalRef.current.open()}
        style={{flexDirection: 'row', alignItems: 'center'}}>
        {/*<Icon name={curOption.icon} size={normalize(21)} />*/}
        {/*<View style={{width: 16}} />*/}
        <Text>{`${curOption.text} (${this.list.length})`}</Text>
        <View style={{flex: 1}} />
        <Icon name={'DownArrow'} size={normalize(15)} />
        <View style={{width: 4}} />
      </TouchableOpacity>
    );
  }

  renderTopSection() {
    return (
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 14,
        }}>
        {this.renderSearchTextInput()}
        <View style={{height: 23}} />
        {this.renderFilterButton()}
      </View>
    );
  }

  onRoleClicked = (memberId) => {
    const {changeAccessLevel} = workspaceACL(this.ws);
    if (!changeAccessLevel) {
      console.log('Current user doest have this right');
    }
    this.memberId = memberId;
    this.roleModalRef.current.open();
  };

  removeWsMember = (user) => () => {
    this.closeRow(-1);
    const wsId = this.props.activeWsId;
    this.props.removeWsMember({wsId, userId: user.id});
  };

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

  newRight(progress, dragX, item) {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [90, 0],
    });

    return (
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
              this.removeWsMember(item);
            }}>
            <DeleteThread text={'Remove'} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  renderItem = ({item, index}) => {
    // const swipeoutBtns = [
    //   {
    //     text: 'Remove',
    //     component: <DeleteThread text={'Remove'} />,
    //     onPress: this.removeWsMember(item),
    //     backgroundColor: '#DD3646',
    //   },
    // ];
    const {removeMembers} = workspaceACL(this.ws);
    const Component = removeMembers ? Swipeable : View;
    return (
      <Component
        ref={(ref) => {
          row[index] = ref;
        }}
        renderRightActions={(progress, dragx) =>
          this.newRight(progress, dragx, item)
        }
        friction={2}
        leftThreshold={30}
        rightThreshold={10}
        useNativeAnimations={true}
        onSwipeableOpen={() => {
          this.closeRow(index);
        }}>
        <MemberItem
          {...item}
          showRole={true}
          onRoleClicked={this.onRoleClicked}
        />
      </Component>

      // <Swipeout
      //   right={swipeoutBtns}
      //   autoClose={true}
      //   style={{backgroundColor: 'white'}}>
      //   <MemberItem
      //     {...item}
      //     showRole={true}
      //     onRoleClicked={this.onRoleClicked}
      //   />
      // </Swipeout>
    );
  };

  count(filter) {
    const {
      activeWsMembers,
      onlyMembers,
      activeAdmins,
      requestedMembers,
      invitedMembers,
      guestMembers,
    } = this.props;

    if (filter === 'all') {
      return activeWsMembers.length;
    }
    if (filter === 'members') {
      return onlyMembers.length;
    }
    if (filter === 'requested') {
      return requestedMembers.length;
    }
    if (filter === 'guest') {
      return guestMembers.length;
    }
    if (filter === 'invited') {
      return invitedMembers.length;
    }
    return activeWsMembers.length;
  }

  get list() {
    const {
      activeWsMembers,
      onlyMembers,
      activeAdmins,
      requestedMembers,
      invitedMembers,
      guestMembers,
    } = this.props;

    if (this.state.selectedFilter === 'all') {
      return activeWsMembers;
    }
    if (this.state.selectedFilter === 'members') {
      return onlyMembers;
    }
    if (this.state.selectedFilter === 'requested') {
      return requestedMembers;
    }
    if (this.state.selectedFilter === 'guest') {
      return guestMembers;
    }
    if (this.state.selectedFilter === 'invited') {
      return invitedMembers;
    }
    return activeWsMembers;
  }

  get searchedList() {
    if (this.state.searchText && this.state.searchText?.length > 0) {
      return this.list.filter(({fN, lN, emailId}) => {
        const txt = `${fN} ${lN} ${emailId}`.toLowerCase();
        const sTxt = this.state.searchText?.toLowerCase();
        return txt.includes(sTxt);
      });
    }
    return this.list;
  }

  renderMemberList() {
    return <FlatList data={this.searchedList} renderItem={this.renderItem} />;
  }

  renderMainContent() {
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        {this.renderTopSection()}
        <View style={styles.lineSeperator} />
        {this.renderMemberList()}
      </View>
    );
  }

  filterOptionClicked = (option) => {
    this.setState({selectedFilter: option.id, searchText: ''}, () =>
      this.filterModalRef.current.close(),
    );
  };

  renderFilterModal() {
    return (
      <BottomUpModal height={300} ref={this.filterModalRef}>
        <View style={{height: 15}} />
        {this.state.filters.map((val) => (
          <ModalOption
            key={val.id}
            id={val.id}
            icon={''} //{val.icon}
            text={`${val.text} ${this.count(val.id)}`}
            onPress={this.filterOptionClicked}
          />
        ))}
      </BottomUpModal>
    );
  }

  roleOptionClicked = ({id}) => {
    const wsId = this.props.activeWsId;
    const memberId = this.memberId;
    this.props.changeMemberAccess({roleId: id, wsId, memberId});
    this.roleModalRef.current.close();
  };

  renderRoleModal() {
    return (
      <BottomUpModal height={200} ref={this.roleModalRef}>
        <View style={{height: 15}} />
        {this.props.wsMemberRoles?.map((option) => {
          return (
            <ModalOption
              id={option.roleId}
              icon={''}
              text={option.roleName}
              onPress={this.roleOptionClicked}
            />
          );
        })}
      </BottomUpModal>
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
        {this.renderFilterModal()}
        {this.renderRoleModal()}
        <Header
          title={t('Members')}
          goBack={true}
          navigation={this.props.navigation}
          rightContent={this.renderRightContent}
        />
        {this.renderMainContent()}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const {workspace} = state;
  let ws = workspace.workspacelist?.ws || emptyArray;
  let activeWs = ws.find((o) => o.id === workspace.activeWsId);
  const activeMembers = workspace.activeWsMembers?.members;
  const onlyMembers = activeMembers?.filter((r) => {
    return r.memberStatus === 'member';
  });
  const activeAdmins = activeMembers?.filter((r) => {
    return r.memberStatus === 'wsmember' && r.role?.name === 'wsadmin';
  });
  const requestedMembers = activeMembers?.filter((r) => {
    return r.memberStatus === 'requested';
  });
  const invitedMembers = activeMembers?.filter((r) => {
    return r.memberStatus === 'invited';
  });
  const guestMembers = activeMembers?.filter((r) => {
    return r.memberStatus === 'guest';
  });

  return {
    activeWs: activeWs,
    activeWsId: workspace.activeWsId,
    activeWsMembers: workspace.activeWsMembers?.members || emptyArray,
    wsMemberRoles: workspace.wsMemberRoles,
    onlyMembers,
    activeAdmins,
    requestedMembers,
    invitedMembers,
    guestMembers,
  };
};

export default connect(mapStateToProps, {
  removeWsMember,
  getAllRoles,
  changeMemberAccess,
})(withTranslation()(ManageWorkspaceMember));

const styles = StyleSheet.create({
  lineSeperator: {
    marginHorizontal: 1,
    borderBottomColor: '#E4E5E7',
    borderBottomWidth: 1,
  },
  safeAreaStyles: {
    flex: 1,
    backgroundColor: '#EFF0F1',
    flexDirection: 'column',
  },
  rightItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
