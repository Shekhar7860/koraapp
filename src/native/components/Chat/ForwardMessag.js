import React from 'react';
import {SafeAreaView, View, StyleSheet} from 'react-native';
import Toast from 'react-native-simple-toast';
import {Text, Container} from 'native-base';
import {forwardMessage} from '../../../shared/redux/actions/message-preview.action';
import {Loader} from '../../screens/ChatsThreadScreen/ChatLoadingComponent';
import {connect} from 'react-redux';
import {goBack} from '../../navigation/NavigationService';
import ChatComponent from './extras/ChatComponent/ChatComponent';
import ChatFooter from './extras/ChatComponent/ChatForwardFooter';
import {ScrollView} from 'react-native';
import {getContactList} from '../../../shared/redux/actions/create-message.action';
import BackButton from '../../components/BackButton';
import * as UsersDao from '../../../dao/UsersDao';
import * as Type from '../../../shared/redux/constants/message-preview.constants';
import {normalize} from '../../utils/helpers';
import * as Constants from '../KoraText';
import {discussionsACL} from '../../core/AccessControls';
import {
  getAllBoards,
  getShareBoards,
} from '../../../shared/redux/actions/message-board.action';
import * as BoardsDao from '../../../dao/BoardsDao';
export const HeaderView = (props) => {
  /* const [txt, setSearchTxt] = useState('');
 updateSearch = (search) => {
    setSearchTxt(search);
    props.textUpdated(search);
  };  */
  return (
    <SafeAreaView style={styles.headerStyle3}>
      <View style={styles.headerStyle2}>
        <BackButton
          onPress={() => goBack()}
          viewStyle={{paddingRight: 6, justifyContent: 'center'}}
          color="#292929"
        />
        <Text numberOfLines={1} style={styles.headerStyle1}>
          Forward Message
        </Text>
      </View>
    </SafeAreaView>
  );
};

export const ChatLoadingIndicator = () => {
  return (
    <View style={styles.chatLoadingStyle}>
      <Loader />
    </View>
  );
};
class ForwardMessag extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      threads: null,
      selectedChats: [],
      selectedContacts: [],
      searchText: '',
      contactData: [],
      searchedChats: [],
      searchedContacts: [],
      cancelCalled: false,
      loading: false,
    };
  }

  onCancel = () => {
    this.setState({cancelCalled: !this.state.cancelCalled});
  };

  onForward = (item, type) => {
    // alert('Under development');
    let chats = this.state.threads;
    chats = chats.map(function (a) {
      if (a.id === item.id) {
        a.isChecked = true;
      }
      return a;
    });
    this.setState({threads: chats});
    console.log('item');
    if (item.type === 'discussion') {
      var selectedMessages = this.props.route.params.selectedMessages;
      var forwardToJson = [];
      var messagesJson = [];
      //preparing doard data
      let messages = {};

      messages.boardId = item._id;
      messages.boardType = item.type;
      messages.wsId = item.wsId;
      console.log('messages', messages);
      forwardToJson.push(messages);
      //preparingg messages
      for (let i = 0; i < selectedMessages.length; i++) {
        messages = [];
        let messageId = selectedMessages[i];
        messagesJson.push(messageId.messageId);
      }
      let payload = {
        forwardTo: forwardToJson,
        messages: messagesJson,
        boardId: selectedMessages[0].boardId,
        boardType: this.props.route.params.boardType,
      };
      this.setState({loading: true});

      this.props.forwardMessage(payload, (typeR) =>
        this.onSuccess(typeR, item, type),
      );
    } else {
      var selectedMessages = this.props.route.params.selectedMessages;
      var forwardToJson = [];
      var messagesJson = [];
      var messagesFinalBind = [];
      // for (let i = 0; i < this.state.selectedChats.length; i++) {
      if (type === 'chats') {
        var messages = {};
        messages['boardId'] = item._id;
        messages['boardType'] = item.type;
        console.log('messages', messages);
        forwardToJson.push(messages);
      } else {
        var contactsTo = {};
        contactsTo['to'] = [item.id];
        forwardToJson.push(contactsTo);
      }

      for (let i = 0; i < selectedMessages.length; i++) {
        var messages = [];
        let messageId = selectedMessages[i];
        messagesJson.push(messageId.messageId);
      }
      let payload = {
        forwardTo: forwardToJson,
        messages: messagesJson,
        boardId: selectedMessages[0].boardId,
        boardType: this.props.route.params.boardType,
      };
      this.setState({loading: true});

      this.props.forwardMessage(payload, (typeR) =>
        this.onSuccess(typeR, item, type),
      );
    }
  };

  onSuccess(type, item, messageType) {
    this.setState({loading: false});
    if (type === Type.FORWARD_MESSAGE_SUCCESSFUL) {
      if (messageType === 'chats') {
        // let chats = this.state.threads;
        // chats = chats.map(function (a) {
        //   if (a.id === item.id) {
        //     a.isChecked = true;
        //   }
        //   return a;
        // });
        // this.setState({threads: chats});
      } else {
        var contacts = this.state.contactData;
        contacts = contacts.map(function (a) {
          if (a === item) {
            a.isChecked = true;
          }
          return a;
        });
        this.setState({contactData: contacts});
      }

      Toast.showWithGravity(
        'Forwarded successfully',
        Toast.SHORT,
        Toast.BOTTOM,
      );
    } else {
      Toast.showWithGravity('Something went wrong.', Toast.SHORT, Toast.BOTTOM);
    }
    // goBack();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.contactData !== this.props.contactData) {
      this.setState({contactData: this.props.contactData});
    }
  }

  checkBoxSelected = (selectedItems, type) => {
    this.onForward(selectedItems, type);
    // if (selectedItems.length == 0) {
    //   this.setState({
    //     selectedChats: [],
    //     selectedContacts: [],
    //     cancelCalled: false,
    //   });
    //   return;
    // }
    // const selectedChats = selectedItems.selectedChats;
    // const selectedContacts = selectedItems.selectedContacts;
    // if (selectedChats.length == 0 && selectedContacts.length == 0) {
    //   this.setState({
    //     selectedChats: selectedChats,
    //     selectedContacts: selectedContacts,
    //     cancelCalled: false,
    //   });
    // } else {
    //   this.setState({
    //     selectedChats: selectedChats,
    //     selectedContacts: selectedContacts,
    //   });
    // }
  };

  filterData = (txt) => {
    this.setState({searchText: txt});
    // this.filterThreadAccordingToSearch(txt);
  };

  componentDidMount = () => {
    this.setState({loading: true});

    /*  let _params = {
      limit: 20,
      offset: 0,
      queryParam: 'share',
    };
    this.props.getShareBoards(_params);
    */

    // InteractionManager.runAfterInteractions(() => {
    setTimeout(async () => {
      var conversation = await BoardsDao.getBoardsShare(null);
      var threadsEdit = [];
      if (conversation?.length > 0) {
        threadsEdit = conversation;
        // console.log('threads in threadedit', threadsEdit);
        // threadsEdit.map((client) => ({...client, isChecked: false}));
      }
       threadsEdit.map(function (a) {
     a.isChecked = false;
   }); 
      const userId = UsersDao.getUserId();
      // threadsEdit = threadsEdit.filter(function (item) {
      //   const {canSendPost} = discussionsACL(item);
      //   if (item.type === 'discussion') {
      //     if (canSendPost) {
      //       return true;
      //     } else {
      //       return false;
      //     }
      //   }
      //   if (item.type === 'groupChat') {
      //     var memberArray = item.members.filter(function (member) {
      //       if (member.id === userId) {
      //         return true;
      //       }
      //     });
      //     if (memberArray.length > 0) {
      //       return true;
      //     } else {
      //       return false;
      //     }
      //   }
      //   if (item.type === 'directChat') {
      //     return true;
      //   }
      // });
      this.setState({threads: threadsEdit, loading: false});
    }, 100);
    //});

    //above
    /* let _params = {
      limit: 20,
      offset: 20,
      queryParam: 0,
    };

    this.props.getAllBoards(_params); */
    this.props.getContactList('');
  };

  render() {
    //  var threadsEdit = this.state.threads;

    // if(this.state.loading) {
    //    return <ChatLoading /> ;
    // }

    return (
      <>
        {this.state.loading ? (
          // <View
          //   style={{ flex: 1 }}
          // >
          //Add other content here

          <View style={styles.chatLoadingStyle}>
            <Loader />
          </View>
        ) : null}

        <Container>
          {/* <Header searchBar rounded autoCorrect={false} >
            <Item style={{ backgroundColor: "#fff" }}>
              <Icon name="ios-search" onPress={() => this.handleSubmit()} />
              <Input
                placeholder="Search"
                onChangeText={(e) => this.handleSearch(e)}
              />
            </Item>
            <Button transparent onPress={() => goBack()}>
              <Text>Cancel</Text>
            </Button>
          </Header> */}
          <HeaderView textUpdated={this.filterData} />

          <ScrollView style={{paddingStart: 5, paddingEnd: 5}}>
            <ChatComponent
              threads={this.state.threads}
              checkBoxSelected={this.checkBoxSelected}
              searchText={this.state.searchText}
              contactData={this.state.contactData}
              onCancelPressed={this.state.cancelCalled}
              selectedMessage={this.props.route.params.selectedMessages || []}
              boardType={this.props.route.params.boardType}
            />
          </ScrollView>
          {(this.state.selectedChats.length > 0 ||
            this.state.selectedContacts.length > 0) && (
            <ChatFooter
              style={styles.chatFooterStyle}
              forwardList={this.onForward}
              onCancle={this.onCancel}
            />
          )}
        </Container>
      </>
    );
  }
}
const styles = StyleSheet.create({
  chatFooterStyle: {marginLeft: 5, marginRight: 5, marginBottom: 0},
  chatLoadingStyle: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    // opacity: 0.5,
    zIndex: 5,
    // backgroundColor: 'clear',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerStyle1: {
    lineHeight: normalize(24),
    fontWeight: 'bold',
    fontSize: normalize(19),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    textAlign: 'left',
    alignSelf: 'center',
    paddingLeft: 16,
    //minWidth: 200,
  },
  headerStyle2: {
    padding: 18,
    paddingVertical: 11.125,
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: 'grey',
    borderBottomWidth: 0.5,
    borderBottomColor: 'grey',
  },
  headerStyle3: {
    backgroundColor: 'white',
  },
});

const mapStateToProps = (state) => {
  const {createMessage, preview, messageBoards} = state;
  return {
    reply: preview.reply,
    replyPrivate: preview.replyPrivate,
    //  threads: messageBoards.boards,
    threads: messageBoards.boards,
    // threads:messageBoards.messageBoardListShare,
    contactData: createMessage.contactlistData,
    forwardResponse: preview.forwardedMsg,
  };
};
export default connect(mapStateToProps, {
  getAllBoards,
  getShareBoards,
  getContactList,
  forwardMessage,
})(ForwardMessag);
