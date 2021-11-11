import React from 'react';
import {withTranslation} from 'react-i18next';
import {View} from 'react-native';
import {SafeAreaView} from 'react-native';
import {StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import {fontFamily} from '../../components/KoraText';
import {Header} from '../../navigation/TabStacks';
import {normalize} from '../../utils/helpers';
import ContactSelection from '../../components/ContactSelection';
import {Text} from 'react-native';
import {forwardPost} from '../../../shared/redux/actions/discussions.action';
import Toast from 'react-native-simple-toast';
import * as UsersDao from '../../../dao/UsersDao';
import {
  emptyArray,
  emptyObject,
} from '../../../shared/redux/constants/common.constants';

class AddParticipantsForwardPostScreen extends React.Component {
  get post() {
    return this.props.route.params.post || emptyObject;
  }
  get boardId() {
    return this.props.route.params.boardId || emptyObject;
  }

  get createGroupFlow() {
    return this.props.route.params.createGroupFrom || '';
  }

  renderContactsInputBox() {
    return (
      <ContactSelection
        autoFocus={true}
        fromShare={true}
        inputStyles={styles.contactstyle}
        // filterList={this.board.members || []}
        searchLeftContent={() => null}
        shouldFilter={() => false}
      />
    );
  }

  get contactData() {
    return (
      this.props.contactData?.map((obj) => obj._id || obj.id) || emptyArray
    );
  }

  forwardPost() {
    if (this.createGroupFlow === 'Messages_Flow') {
      var forwardToJson = [];
      var messagesJson = [];
      if (this.contactData.length > 0) {
        var contactsTo = {};
        contactsTo['to'] = this.contactData;
        forwardToJson.push(contactsTo);
      }
      for (let i = 0; i < this.post.length; i++) {
        var messages = {};
        let messageId = this.post[i];
        let messageIdValue = messageId.messageId;
        messagesJson.push(messageIdValue);
      }
      let payload = {
        forwardTo: forwardToJson,
        boardType: this.props.route.params.boardType,
        boardId: this.boardId,
        messages: messagesJson,
      };
      let currentUserId = UsersDao.getUserId();
      let params = {userId: currentUserId};
      this.props.forwardPost(params, payload, () => this.onSuccess());
    } else {
      var forwardToJson = [];
      if (this.contactData.length > 0) {
        var contactsTo = {};
        contactsTo['to'] = this.contactData;
        forwardToJson.push(contactsTo);
      }
      let payload = {
        forwardTo: forwardToJson,
        boardType: 'discussion',
        boardId: this.post.parentId,
        messages: [this.post.postId],
      };
      let currentUserId = UsersDao.getUserId();
      let params = {userId: currentUserId};
      this.props.forwardPost(params, payload, () => this.onSuccess());
    }
  }
  onSuccess() {
    Toast.showWithGravity('Forwarded successfully', Toast.SHORT, Toast.CENTER);
    this.props.navigation.pop(2);
  }
  render() {
    const {t} = this.props;
    const showDone = this.contactData?.length > 0;
    return (
      <View style={styles.safeAreaStyles}>
        <Header
          title={t('New Chat')}
          goBack={true}
          navigation={this.props.navigation}
          rightContent={
            <Text
              onPress={() => {
                showDone && this.forwardPost();
              }}
              style={[
                styles.mediumText,
                showDone > 0 ? {color: '#0D6EFD'} : {color: 'grey'},
              ]}>
              {t('Done')}
            </Text>
          }
        />
        {/* <View style={styles.scrollViewStyles}> */}
        {this.renderContactsInputBox()}
        {/* </View> */}

        <SafeAreaView />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const {createMessage} = state;
  return {contactData: createMessage.contactData};
};

export default connect(mapStateToProps, {forwardPost})(
  withTranslation()(AddParticipantsForwardPostScreen),
);

const styles = StyleSheet.create({
  contactstyle:{
    borderColor: '#0D6EFD',
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    marginBottom: 14,
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
  descriptionText: {
    fontWeight: '400',
    fontSize: normalize(16),
    marginTop: 12,
    marginBottom: 20,
  },
  list: {
    marginTop: 14,
    paddingHorizontal: 18,
    // marginBottom: 100,
  },
  cardHeader: {fontWeight: '700', marginBottom: 7},
  safeAreaStyles: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'column',
  },
  scrollViewStyles: {marginHorizontal: 18, marginTop: 20},
  mediumText: {fontWeight: '500', fontSize: normalize(16)},
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
