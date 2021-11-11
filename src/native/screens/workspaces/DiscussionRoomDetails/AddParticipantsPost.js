import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  TouchableHighlight,
  Text,
  KeyboardAvoidingView,
  TouchableOpacity,
} from 'react-native';
import {connect} from 'react-redux';
import {normalize} from '../../../utils/helpers';
import {Header} from '../../../navigation/TabStacks';
import {goBack} from '../../../navigation/NavigationService';
import {
  discussionContacts,
  exceptionContacts,
  allWorkspaceMembers,
  discussionStatus,
  addMember,
} from '../../../../shared/redux/actions/discussions.action.js';

import {
  getContactList,
  selectedContactList,
} from '../../../../shared/redux/actions/create-message.action';
import ContactSelection from '../../../components/ContactSelection';
import {BottomUpModal} from '../../../components/BottomUpModal';
import {permissionOptions} from '../../NewDiscussion';
import {Icon} from '../../../components/Icon/Icon';
import * as Constants from '../../../components/KoraText';
import {withTranslation} from 'react-i18next';
import {emptyArray} from '../../../../shared/redux/constants/common.constants';
class AddParticipantsPost extends Component {
  constructor() {
    super();
    this.permissionLevel = React.createRef();
    this.state = {
      access: permissionOptions[0].key,
    };
  }

  get board() {
    return this.props.route.params.board;
  }

  doneButton() {
    const {t} = this.props;
    const showDoneButton = this.props.contactData?.length > 0;
    return (
      <TouchableOpacity
        //onPress={() => this.onDoneClick()}
        onPress={() => showDoneButton && this.callAddMembers()}
        style={{
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 5,
          borderRadius: 5,
        }}>
        <Text
          style={{
            ...styles.doneTextStyle,
            color: showDoneButton ? '#0D6EFD' : 'grey',
          }}>
          {t('Done')}
        </Text>
      </TouchableOpacity>
    );
  }

  callAddMembers() {
    let members = this.props.contactData?.map((obj) => {
      return {userId: obj._id, access: this.state.access};
    });
    const payload = {addMembers: members};
    const _params = {
      wsId: this.props.activeWsId,
      rId: this.board.id,
    };
    this.props.addMember(_params, payload, {
      onSuccess: () => {
        goBack();
      },
    });
  }

  renderAccessLevel() {
    const _key = this.state.access || permissionOptions[0].key;
    const text = permissionOptions.find(({key}) => key === _key)?.text;
    const {t} = this.props;

    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 16,
          marginLeft: 8,
        }}>
        <Text style={styles.permissionsTextStyle}>{t('Permission Level')}</Text>
        <TouchableOpacity
          underlayColor={'rgba(0,0,0,0.1)'}
          onPress={() => this.permissionLevel.current.openBottomDrawer()}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={styles.textStyle}>{text}</Text>
            <Icon name={'DownArrow'} size={15} />
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  renderPermissionLevel() {
    return (
      <BottomUpModal ref={this.permissionLevel} height={270}>
        <View style={{padding: 14}}>
        {permissionOptions.map((option) => {
          return (
            <TouchableOpacity
              onPress={() => {
                this.setState({access: option.key});
                this.permissionLevel.current.closeBottomDrawer();
              }}
              key={option.key}
              underlayColor={'rgba(0,0,0,0.1)'}
              style={{
                margin: 6,
                borderRadius: 4,
                marginHorizontal: 10,
              }}>
              <View>
                <Text style={styles.optionTextStyle}>{option.text}</Text>
                <Text style={styles.optionDescTextStyle}>
                  {option.description}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
        </View>
      </BottomUpModal>
    );
  }

  render() {
    const {t} = this.props;
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <Header
          {...this.props}
          title={t('Add People')}
          goBack={true}
          rightContent={this.doneButton()}
        />

        <ContactSelection
          inputStyles={{
            borderColor: '#0D6EFD',
            borderWidth: 1,
            borderRadius: 4,
            padding: 8,
            marginVertical: 14,
          }}
          filterList={this.board.members || emptyArray}
          searchLeftContent={() => null}
          shouldFilter={() => false}
          autoFocus={true}
        />

        {this.renderAccessLevel()}
        {this.renderPermissionLevel()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  doneTextStyle: {
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  permissionsTextStyle: {
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    lineHeight: 19,
    color: '#202124',
    opacity: 0.5,
  },
  textStyle: {
    marginRight: 10,
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
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
});

const mapStateToProps = (state) => {
  const {discussion, createMessage, workspace} = state;
  return {
    allDiscussions: discussion.allDiscussions,
    contactList: discussion.contactlistData,
    contactData: createMessage.contactData,
    activeWsId: workspace.activeWsId,
  };
};

export default connect(mapStateToProps, {
  discussionContacts,
  exceptionContacts,
  allWorkspaceMembers,
  discussionStatus,
  getContactList,
  addMember,
  selectedContactList,
})(withTranslation()(AddParticipantsPost));
