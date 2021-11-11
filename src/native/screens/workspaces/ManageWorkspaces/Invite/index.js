import React from 'react';
import {withTranslation} from 'react-i18next';
import {
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {connect} from 'react-redux';
import {emptyArray} from '../../../../../shared/redux/constants/common.constants';
import {Header} from '../../../../navigation/TabStacks';
import {
  changeMemberAccess,
  getAllRoles,
  removeWsMember,
  sendWsInvite,
} from '../../../../../shared/redux/actions/workspace.action';
import ContactSelection from '../../../../components/ContactSelection';
import {Icon} from '../../../../components/Icon/Icon';
import {normalize} from '../../../../utils/helpers';
import {fontFamily} from '../../../../components/KoraText';
import {goBack} from '../../../../navigation/NavigationService';
import {BottomUpModal} from '../../../../components/BottomUpModal';
import {ModalOption} from '../../../../components/WorkspaceOptionsModal';
import UserAvatar from '../../../../components/Library/react-native-user-avatar/src';
import {Avatar} from '../../../../components/Icon/Avatar';
import {useState} from 'react';

const MultiWSMemberView = ({members = []}) => {
  members = members.slice(0, 10);
  const [cnt, changeCnt] = useState(5);
  const remaining = members.length - cnt;
  return (
    <View
      onLayout={(event) => {
        const {x, y, width, height} = event.nativeEvent.layout;
        changeCnt(width / 50);
      }}
      style={[
        {
          flexDirection: 'row',
          marginHorizontal: -5,
        },
        remaining > 0 ? {justifyContent: 'space-between'} : null,
      ]}>
      {members.slice(0, cnt).map((user, index) => (
        <View style={{paddingHorizontal: 4}}>
          <Avatar
            type={'offline'}
            rad={40}
            name={user.fN + ' ' + user.lN}
            color={user.color}
            profileIcon={user?.icon}
            userId={user?.id}
          />
          {index === cnt - 1 && Boolean(remaining) && (
            <View
              style={{
                right: 5,
                position: 'absolute',
                height: 40,
                width: 40,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
                opacity: 0.7,
                backgroundColor: 'black',
              }}>
              <Text
                style={{
                  color: 'white',
                  fontWeight: '500',
                  fontFamily: fontFamily,
                  fontSize: normalize(16),
                  lineHeight: normalize(19.36),
                }}>{`+${remaining}`}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

export const Buttons = {
  Basic: (props) => <KoraButton {...props} />,
  Primary: (props) => (
    <KoraButton
      {...props}
      textColor={'#FFFFFF'}
      backgroundColor={'#0D6EFD'}
      borderColor={'#0D6EFD'}
    />
  ),
  Danger: (props) => (
    <KoraButton
      {...props}
      textColor={'#FFFFFF'}
      backgroundColor={'#DD3646'}
      borderColor={'#DD3646'}
    />
  ),
};

export const KoraButton = ({
  text = '',
  onPress = () => {},
  backgroundColor = 'white',
  textColor = '#202124',
  borderColor = '#BDC1C6',
  extraTextStyle = {},
  borderRadius = 4,
}) => {
  const touchableStyle = {
    flex: 0,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
  };

  const textStyle = {
    fontSize: normalize(16),
    lineHeight: normalize(20),
    fontFamily: fontFamily,
    ...extraTextStyle,
  };
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          borderColor: borderColor,
          borderRadius: borderRadius,
          backgroundColor: backgroundColor,
        },
        touchableStyle,
      ]}>
      <Text
        style={[
          {
            color: textColor,
          },
          textStyle,
        ]}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};
class InviteMember extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRole: {
        icon: '',
        id: '',
        text: '',
      },
    };
    this.roleModalRef = React.createRef();
  }

  componentDidMount() {
    if (
      Array.isArray(this.props.wsMemberRoles) &&
      this.props.wsMemberRoles.length > 0
    ) {
      this.setState({
        selectedRole: this.props.wsMemberRoles[0],
      });
    }
  }

  roleOptionClicked = (selectedRole) => {
    selectedRole = this.props.wsMemberRoles.find(
      (obj) => obj.roleId === selectedRole.id,
    );
    this.setState({selectedRole});
    this.roleModalRef.current?.close();
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

  renderContactSelection() {
    const {contactData} = this.props;
    return (
      <ContactSelection
        inputStyles={{
          borderColor: '#E5E8EC',
          borderWidth: 1,
          borderRadius: 8,
          padding: 11,
          minHeight: 90,
          marginVertical: 14,
        }}
        filterList={this.props.activeWsMembers}
        placeholder={
          contactData.length > 0 ? 'Add People' : 'Type and select people'
        }
        mainContainerStyle={{paddingHorizontal: 0,paddingTop:0}}
        listStyle={{paddingVertical: 10}}
        searchLeftContent={() => null}
        shouldFilter={() => false}
      />
    );
  }

  renderRolesSection() {
    return (
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Text
          style={{
            fontFamily: fontFamily,
            fontWeight: '500',
            fontSize: normalize(16),
            lineHeight: normalize(19.36),
            color: '#8A959F',
          }}>
          {'Roles & Permission Level'}
        </Text>
        <View style={{flex: 1}} />
        <TouchableOpacity
          onPress={() => this.roleModalRef?.current?.open()}
          style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text
            style={{
              fontFamily: fontFamily,
              fontWeight: '500',
              fontSize: normalize(16),
              lineHeight: normalize(19.36),
              color: '#202124',
            }}>
            {this.state.selectedRole?.roleName}
          </Text>
          <View style={{width: 14}} />
          <Icon name={'DownArrow'} size={normalize(15)} />
        </TouchableOpacity>
        <View style={{width: 4}} />
      </View>
    );
  }

  sendWsInvite = () => {
    const {contactData, activeWsId} = this.props;
    const payload = {
      wsId: activeWsId,
      members: contactData.map((obj) => {
        return {
          memberId: obj.id,
          role: this.state.selectedRole.role,
        };
      }),
    };
    this.props.sendWsInvite(payload, () => goBack());
  };

  render() {
    const {
      t,
      route: {
        params: {},
      },
    } = this.props;
    return (
      <View style={styles.safeAreaStyles}>
        {this.renderRoleModal()}
        <Header
          title={t('Invite')}
          goBack={true}
          navigation={this.props.navigation}
          rightContent={this.renderRightContent}
        />
        <View
          style={{
            paddingVertical: 14,
            paddingHorizontal: 16,
            paddingTop:0,
            borderBottomColor: '#E6E6E6',
            borderBottomWidth: 1,
          }}>
          {this.renderContactSelection()}
          <View style={{height: 19}} />
          {this.renderRolesSection()}
          <View style={{height: 5}} />
        </View>
        <View
          style={{
            paddingVertical: 15,
            paddingHorizontal: 16,
            flexDirection: 'row',
          }}>
          <Buttons.Primary
            onPress={this.sendWsInvite}
            text={'Send Invitation'}
          />
          <View style={{width: 15}} />
          <Buttons.Basic onPress={goBack} text={'Cancel'} />
        </View>
        {/* <View style={{flex: 1}} /> */}
        <View style={{padding: 12}}>
          <MultiWSMemberView members={this.props.activeWsMembers} />
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const {workspace, createMessage} = state;
  let ws = workspace.workspacelist?.ws || emptyArray;
  let activeWs = ws.find((o) => o.id === workspace.activeWsId);
  return {
    activeWs: activeWs,
    activeWsId: workspace.activeWsId,
    activeWsMembers: workspace.activeWsMembers?.members || emptyArray,
    wsMemberRoles: workspace.wsMemberRoles,
    activeMembers: workspace.activeWsMembers?.members,
    contactData: createMessage.contactData || emptyArray,
  };
};

export default connect(mapStateToProps, {
  removeWsMember,
  getAllRoles,
  changeMemberAccess,
  sendWsInvite,
})(withTranslation()(InviteMember));

const styles = StyleSheet.create({
  lineSeperator: {
    marginHorizontal: 1,
    borderBottomColor: '#E4E5E7',
    borderBottomWidth: 1,
  },
  safeAreaStyles: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'column',
  },
});
