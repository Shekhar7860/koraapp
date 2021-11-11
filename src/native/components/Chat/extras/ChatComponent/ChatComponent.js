import CheckBox from 'react-native-check-box';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TouchableHighlight,
  TextInput,
  FlatList,
  InteractionManager,
  Image,
} from 'react-native';
import {SvgIcon} from '../../../Icon/SvgIcon.js';
import styles from './Style';
import {StyleSheet} from 'react-native';
import {ScrollView} from 'react-native';
import {Avatar} from '../../../Icon/Avatar';
import {Icon} from '../../../../components/Icon/Icon';
import {navigate} from '../../../../navigation/NavigationService';
import {memberListToText, normalize} from '../../../../../native/utils/helpers';
import * as Constants from '../../../../components/KoraText';
import {ROUTE_NAMES} from '../../../../navigation/RouteNames';
import KoraKeyboardAvoidingView from '../../../KoraKeyboardAvoidingView';
import * as UsersDao from '../../../../../dao/UsersDao';
import {emptyArray} from '../../../../../shared/redux/constants/common.constants';
import {discussionsACL} from '../../../../core/AccessControls';
import {RoomAvatar} from '../../../RoomAvatar';
import withObservables from '@nozbe/with-observables';
import {of as of$} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import database from '../../../../../native/realm';
import {Q} from '@nozbe/watermelondb';
import * as Entity from '../../../../../native/realm/dbconstants';

const _RenderThreads = ({item, index, recentMembers, members, setChecked}) => {
  var titleName =
    item.name !== '' && item.name !== undefined ? item.name : null;
  const isDirectChat = item.type === 'directChat';
  const isDiscussion = item.type === 'discussion';
  const isMessageSent = item.isChecked || false;
  let names = isDiscussion ? null : null;
  // recentMembers = recentMembers.filter(function (el) {
  //   return el != null;
  // });
  const userId = UsersDao.getUserId();
  if (recentMembers !== undefined) {
    names = recentMembers
      .filter(
        (a) =>
          a?.id !== undefined && a?.emailId !== undefined && a?.id !== userId,
      )
      .map((a) =>
        a?.fN !== undefined && a?.lN !== undefined
          ? a?.fN + ' ' + a?.lN
          : a?.emailId,
      )
      .join(', ')
      .trim();

    if (names === '' && isDiscussion) {
      names =
        memberListToText(members, item.membersCount) || '[No Members Added]';
    }

    if (isDirectChat && (titleName == null || titleName === undefined)) {
      titleName = recentMembers
        .filter((a) => a.id !== undefined && a.id !== userId)
        .map((a) => a.emailId)
        .join(', ')
        .trim();

      let temp = names;
      names = titleName;
      titleName = temp;
    }
  }

  return (
    <View style={threadStyles.threadStyle1}>
      <View style={threadStyles.threadStyle2}>
        <View
          style={{
            marginEnd: 10,
            minWidth: 55,
            alignItems: 'center',
          }}>
          {isDiscussion ? (
            <SvgIcon name="DR_Icon" width={45} height={45} />
          ) : (
            <Avatar
              name={titleName?.toUpperCase()}
              groupMembers={recentMembers}
              isGroupChat={
                isDirectChat ? false : item.membersCount > 1 || false
              }
              membersCount={item.membersCount}
            />
          )}
        </View>
        <View style={threadStyles.threadStyle3}>
          {titleName != null && (
            <View style={threadStyles.threadStyle4}>
              <Text numberOfLines={1} style={threadStyles.threadStyle5}>
                {titleName}
              </Text>
            </View>
          )}
          {names !== null && names !== undefined && (
            <Text numberOfLines={1} style={{marginTop: 2}}>
              {names}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={() => setChecked('chats', index, item, isMessageSent)}
          style={
            isMessageSent
              ? footerButtonStyles.sentButtonBackground
              : footerButtonStyles.sendButtonBackground
          }>
          <Text
            style={{
              color: isMessageSent ? '#9AA0A6' : '#07377F',
            }}>
            {isMessageSent ? 'Sent' : 'Send'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const enhanceBoardAndMembers = withObservables(['item'], ({item}) => ({
  item: item.observe(),
  members: item.members.observe(),
  recentMembers: item.recentMembers.observe(),
  owner: item.owner
    .observe()
    .pipe(switchMap((_owner) => (_owner ? _owner.contact : of$(null)))),
  creator: item.creator
    .observe()
    .pipe(switchMap((_creator) => (_creator ? _creator.contact : of$(null)))),
}));

const RenderThreads = enhanceBoardAndMembers(_RenderThreads);

export default class ChatComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      chats: [],
      contacts: [],
      searchChats: [],
      searchContacts: [],
      searchEnable: false,
      selectedChats: [],
      selectedContacts: [],
    };
  }

  componentDidMount() {
    // InteractionManager.runAfterInteractions(() => {
    var conversation = this.props.threads; //.splice(0, 6);
    var contactData = this.props.contactData;
    /*    var threadsEdit = [];
    if (conversation?.length > 0) {
      threadsEdit = [...conversation];
      // console.log('threads in threadedit', threadsEdit);
      threadsEdit.map((client) => ({...client, isChecked: false}));
    }
    threadsEdit.map(function (a) {
      a.isChecked = false;
    });
    const userId = UsersDao.getUserId();
    threadsEdit = threadsEdit.filter(function (item) {
      const {canSendPost} = discussionsACL(item);
      if (item.type === 'discussion') {
        if (canSendPost) {
          return true;
        } else {
          return false;
        }
      }
      if (item.type === 'groupChat') {
        var memberArray = item.members.filter(function (member) {
          if (member.id === userId) {
            return true;
          }
        });
        if (memberArray.length > 0) {
          return true;
        } else {
          return false;
        }
      }
      if (item.type === 'directChat') {
        return true;
      }
    }); */
    this.setState({
      chats: conversation,
      contacts: contactData,

      searchEnable: false,
    });
    // });
  }

  componentDidUpdate(prevProps) {
    console.log(
      '------------------------------------->',
      'compoent DId update',
    );
    if (prevProps.threads !== this.props.threads) {
      /*  this.setState({
        chats: this.props.threads,
      }); */
    }
  }

  searchMethod = async (query) => {
    try {
      if(query.length <= 0) {
        this.setState({searchEnable : false});
        return;
      } 
      // this.setState({
      //   searchData: [],
      // });
      console.log('query ', query);
      const db = database.active;
      const boardsCollection = db.collections.get(Entity.Boards);
      // const boardSearched = await boardsCollection
      //   .query(
      //     Q.where('name', Q.like(`${Q.sanitizeLikeString(this.props.query)}%`)),
      //   )
      //   .fetch();
        let searchString = '%' + query + '%';

        const results = await boardsCollection
        .query(
        Q.unsafeSqlQuery(
        'SELECT * from Boards where name LIKE ? or id IN ' +
        '(SELECT member_board_id from BoardMembers where contact_id IN ' +
              '(SELECT id from Contacts where fN LIKE ? OR lN LIKE ?))' +
              ' order by type asc, name asc',
            [searchString, searchString, searchString],
        ),
        )
        .fetch();

        // const resultsOtherThanGroup = await boardsCollection
        // .query(
        // Q.unsafeSqlQuery(
        // 'SELECT * from Boards where type != ? AND id IN ' +
        // '(SELECT member_board_id from BoardMembers where contact_id IN ' +
        // '(SELECT id from Contacts where fN LIKE ? OR lN LIKE ?))',
        //     ['directChat', searchString, searchString],
        // ),
        // )
        // .fetch();
        console.log('searchString ', searchString, results);
        
      this.setState({
        chats: [...results],
        searchEnable: true,
      });

      // this.setState({searchData: boardSearched});
    } catch (e) {
      console.log(e);
    }
  };

  filterThreadAccordingToSearch = (query) => {
    this.searchMethod(query);
    // if (query.length === 0) {
    //   this.setState({
    //     searchEnable: false,
    //     contacts: this.state.searchContacts,
    //     chats: this.state.searchChats,
    //   });
    //   return;
    // }
    // var conversation = this.state.searchChats;
    // query = query.toUpperCase();
    // let searchResults = conversation.filter((s) => {
    //   var recentMembers = s?.members?.filter(function (el) {
    //     return el != null;
    //   });
    //   let nameParticipantResult = recentMembers?.filter((par) => {
    //     let name = par.fN + ' ' + par.lN;
    //     return name?.toUpperCase().includes(query);
    //   });
    //   let name = s.name;
    //   return (
    //     name?.toUpperCase().includes(query) || nameParticipantResult?.length > 0
    //   );
    // });
    // let searchResultsContacts = this.state.searchContacts.filter((s) => {
    //   let name = s.fN + ' ' + s.lN;
    //   return name?.toUpperCase().includes(query);
    // });
    // searchResults.sort(function (a, b) {
    //   return a.type !== 'directChat';
    // });
    // //console.log('Search results', JSON.stringify(searchResults));
    // this.setState({chats: searchResults, contacts: searchResultsContacts});
    // //console.log('thread search result', searchResults);
  };
  setChecked = (type, index, item, isMessageSent) => {
    if (isMessageSent) {
      return;
    }
    /*     if (type === 'chats') {
      var chats = this.state.chats;
      chats = chats.map(function (a) {
        if (a === item) {
          a.isChecked = true;
        }
        return a;
      });
      this.setState({chats: chats});
    } else {
      var contacts = this.state.contacts;
      contacts = contacts.map(function (a) {
        if (a === item) {
          a.isChecked = true;
        }
        return a;
      });
      this.setState({contacts: contacts});
    }  */
    this.props.checkBoxSelected(item, type);
  };

  createGroup = () => {
    // console.log(
    //   'contact data and selected message',
    //   this.props.selectedMessage,
    //   this.state.contactData,
    //   this.props,
    // );
    if (this.props.fromShare && this.props.onNewClick) {
      this.props.onNewClick();
    } else {
      navigate(ROUTE_NAMES.ADD_PARTICIPANTS_FORWARD_POSTS, {
        post: this.props.selectedMessage,
        boardId: this.props.selectedMessage[0].boardId,
        createGroupFrom: 'Messages_Flow',
        boardType: this.props.boardType,
      });
    }
    // navigate('Create Group', {
    //   contacts: this.state.contacts,
    //   selectedMessage: this.props.selectedMessage,
    // });
  };

  onCancle = () => {
    // alert('Under development');
    const {chats, contacts} = this.state;
    this.setState({selectedContacts: [], selectedChats: []});
    chats.map((ob) => {
      ob.isChecked = false;
    });
    contacts.map((ob) => {
      ob.isChecked = false;
    });
    this.setState({chats, contacts});
    this.props.checkBoxSelected([]);
  };

  renderStartThreadButton() {
    return (
      <TouchableHighlight
        underlayColor="rgba(0,0,0,0.05)"
        style={footerButtonStyles.createButtonStyle}
        onPress={this.createGroup}>
        <View style={footerButtonStyles.createButtonStyle1}>
          <View style={footerButtonStyles.createButtonInnerView}>
            <SvgIcon name="Specific" />
          </View>
          <Text style={footerButtonStyles.textStyle}>{'Start a new Chat'}</Text>
          <View style={footerButtonStyles.createButtonStyle4}>
            <Icon name={'Right_Direction'} size={16} color="#202124" />
          </View>
        </View>
      </TouchableHighlight>
    );
  }

  onFocus = () => {
    this.state.searchEnable
      ? null
      : this.setState({
          searchEnable: true,
          searchContacts: this.state.contacts,
          searchChats: this.state.chats,
        });
  };

  renderSearchSection() {
    return (
      <View style={footerButtonStyles.inputBorder}>
        <View style={footerButtonStyles.searchStyle1}>
          <Icon
            name={'Contact_Search'}
            size={18}
            color={'#9AA0A6'}
            style={footerButtonStyles.searchStyle2}
          />
        </View>

        <KoraKeyboardAvoidingView style={footerButtonStyles.searchStyle3}>
          <TextInput
            style={footerButtonStyles.searchTextInputStyle}
            autoCapitalize={'none'}
            placeholder="Search people, chats & rooms"
            onChangeText={this.filterThreadAccordingToSearch}
            onFocus={this.onFocus}
          />
        </KoraKeyboardAvoidingView>
      </View>
    );
  }

  renderContacts(item, index) {
    var titleName = null;
    const isDirectChat = true;
    const isMessageSent = item.isChecked || false;
    let names = item.fN.trim() + ' ' + item.lN.trim();

    return (
      <View style={threadStyles.contactStyle1}>
        <View style={threadStyles.contactStyle2}>
          <View
            style={{
              marginEnd: isDirectChat ? 12 : item.membersCount > 1 ? 9 : 12,
            }}>
            <Avatar
              profileIcon={item?.icon}
              userId={item?.id}
              name={
                isDirectChat ? names?.toUpperCase() : titleName?.toUpperCase()
              }
              groupMembers={isDirectChat ? null : item.recentMembers}
              isGroupChat={
                isDirectChat ? false : item.membersCount > 1 || false
              }
              membersCount={item.membersCount}
            />
          </View>
          <View style={threadStyles.contactStyle3}>
            {titleName != null && (
              <View style={threadStyles.contactStyle4}>
                <Text numberOfLines={1} style={threadStyles.contactStyle5}>
                  {titleName}
                </Text>
              </View>
            )}
            {names !== null && names !== undefined && (
              <Text numberOfLines={1} style={{marginTop: 2}}>
                {names}
              </Text>
            )}
          </View>
          {/* <CheckBox
            onClick={() =>
              this.setChecked('chats', index, !item.isChecked)
            }
            isChecked={item.isChecked}
            checkBoxColor={'grey'}
            checkedCheckBoxColor={'#3366FF'}
          /> */}
          <TouchableOpacity
            onPress={() => this.setChecked('contacts', index, item)}
            style={
              isMessageSent
                ? footerButtonStyles.sentButtonBackground
                : footerButtonStyles.sendButtonBackground
            }>
            <Text
              style={{
                color: isMessageSent ? '#9AA0A6' : '#07377F',
              }}>
              {isMessageSent ? 'Sent' : 'Send'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  renderListEmptyComponent = () => (
    <Text style={{textAlign: 'center'}}>No Match Found</Text>
  );

  render() {

    const {chats, contacts, selectedChats, selectedContacts} = this.state;
    var threads = [];
    if(this.state.searchEnable) {
      threads = this.state.chats; 
    } else {
      threads = this.props.threads;
    }
    return (
      <SafeAreaView style={styles.createGroup1}>
        {this.renderSearchSection()}
        {this.renderStartThreadButton()}
        <ScrollView style={styles.createGroup2}>
          {(selectedChats?.length > 1 ||
            (selectedContacts?.length > 1 && chats?.length > 0)) && (
            <TouchableOpacity onPress={() => this.createGroup()}>
              <View style={styles.createGroupRow}>
                <View style={styles.createGroup3}>
                  {/* <Icon name={'GroupIcon'} size={24} color="white" /> */}
                  <Image
                    style={styles.imageStyle}
                    source={require('../../../../assets/contact/Add-User-Group.png')}
                  />
                </View>
                <View>
                  <View style={styles.nameContainer}>
                    <Text style={styles.createGroupTxt}>
                      Start a new thread
                    </Text>
                  </View>
                  <View style={styles.msgContainer}>
                    <Text style={styles.msgTxt}>
                      Add some people to share the message
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
          {chats?.length > 0 ? (
            <Text style={styles.heading}>Recent Conversations</Text>
          ) : null}

          <FlatList
            data={threads}
            renderItem={({item, index}) => {
              return (
                <RenderThreads
                  item={item}
                  index={index}
                  setChecked={this.setChecked}
                />
              );
            }}
            keyExtractor={(item) => item?.id}
            ListEmptyComponent={this.renderListEmptyComponent}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }
}
// export default connect(null, {
//   forwardMessage
// })(ChatComponent);

const footerButtonStyles = StyleSheet.create({
  createButtonInnerView: {
    width: 44,
    height: 44,
    borderRadius: 44 / 2,
    backgroundColor: '#85B7FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flex: 1,
  },
  createButtonStyle: {
    marginTop: 10,
    marginBottom: 5,
    height: 60,
    alignItems: 'center',
    flexDirection: 'row',
  },
  createButtonStyle1: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  createButtonStyle3: {
    width: 34,
    height: 34,
    borderRadius: 34 / 2,
    backgroundColor: '#85B7FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonStyle4: {flex: 1, alignItems: 'flex-end'},
  textStyle: {
    fontSize: normalize(16),
    fontWeight: '500',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    marginLeft: 10,
  },
  inputBorder: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E8EC',
    flexDirection: 'row',
    minHeight: 40,
    paddingStart: 10,
    marginStart: 15,
    marginEnd: 15,
    marginTop: 15,
    flex: 1,
  },
  searchTextInputStyle: {
    fontWeight: '400',
    fontSize: normalize(14),
    fontStyle: 'normal',
    width: '100%',
    fontFamily: Constants.fontFamily,
  },
  searchStyle1: {
    marginRight: 8,
    alignItems: 'center',
    alignContent: 'center',
  },
  searchStyle2: {
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchStyle3: {flex: 1},
  forwardButtonStyle: {
    width: 95,
    height: 34,
    backgroundColor: '#0D6EFD',
  },
  forwardButton: {
    marginLeft: 20,
    backgroundColor: '#0D6EFD',
    borderRadius: 4,
    borderWidth: 1,
    width: 95,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    borderColor: '#BDC1C6',
  },
  forwardButtonText: {
    color: '#fff',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  cancelButton: {
    marginLeft: 20,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    width: 95,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    borderColor: '#BDC1C6',
  },
  cancelButtonText: {
    color: '#202124',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  sendButtonBackground: {
    minHeight: 30,
    minWidth: 60,
    borderColor: '#85B7FE',
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: '#E7F1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginStart: 10,
  },
  sentButtonBackground: {
    minHeight: 30,
    minWidth: 60,
    borderColor: '#BDC1C6',
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: '#EFF0F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginStart: 10,
  },
});
const threadStyles = StyleSheet.create({
  threadStyle1: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 10,
    minHeight: 45,
    paddingStart: 15,
    paddingEnd: 15,
    justifyContent: 'center',
  },
  threadStyle2: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  threadStyle3: {
    flexDirection: 'column',
    flex: 1,
    padding: 5,
  },
  threadStyle4: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  threadStyle5: {
    color: '#202124',
    fontWeight: '600',
    fontSize: normalize(14),
    fontWeight: 'bold',
    fontStyle: 'normal',
    flexShrink: 1,
    fontFamily: Constants.fontFamily,
  },
  contactStyle1: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 10,
    minHeight: 45,
    paddingStart: 15,
    paddingEnd: 15,
    justifyContent: 'center',
  },
  contactStyle2: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactStyle3: {
    flexDirection: 'column',
    flex: 1,
    padding: 5,
  },
  contactStyle4: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactStyle5: {
    color: '#202124',
    fontWeight: '600',
    fontSize: normalize(14),
    fontWeight: 'bold',
    fontStyle: 'normal',
    flexShrink: 1,
    fontFamily: Constants.fontFamily,
  },
});
