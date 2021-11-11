import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import SegmentControl from '../../components/Library/react-native-segment-control';
import UniversalChatFlatList from './UniversalChatFlatList';
import {goBack} from '../../navigation/NavigationService';
import BackButton from '../../components/BackButton';
import {SearchBar} from 'react-native-elements';
import {Icon} from '../../components/Icon/Icon';
import {connect} from 'react-redux';
import {useRef, useState, useEffect} from 'react';
import {universalSearchCall} from '../../../shared/redux/actions/message-thread.action';
import {withTranslation} from 'react-i18next';
import {ROUTE_NAMES} from '../../navigation/RouteNames';
import {navigate} from '../../navigation/NavigationService';
import {normalize} from '../../utils/helpers';
import Placeholder from '../../components/Icon/Placeholder';
import {Loader} from './ChatLoadingComponent';
import * as ContactsDao from '../../../dao/ContactsDao';
import * as Constants from '../../components/KoraText';
import {debounce} from 'lodash';
import * as UsersDao from '../../../dao/UsersDao';
import {useDispatch, useSelector} from 'react-redux';
import {
  setSearchHeaderMode,
  setSearchHeaderText,
  searchHeaderCancelAction,
  searchHeaderSubmitAction,
} from '../../../shared/redux/actions/native.action';
const Two = () => {
  return (
    <View style={styles.containerNoData}>
      <Image
        source={require('../../assets/placeholders/empty-search.png')}
        style={styles.imageStyle}
      />
      <Text style={styles.textStyle}>
        {'Sorry, the earth & stars say nay! Could you please phrase repharse?'}
      </Text>
    </View>
  );
  // </View>
};

// const EmptyComponent = (props) => {
//   return (
//     <View style={styles.emptyContainer}>
//       <Placeholder name={'search'} />
//     </View>
//   );
// };

export const HeaderView = (props) => {
  const dispatch = useDispatch();

  const [txt, setSearchTxt] = useState(props.query);
  onPress = () => {
    navigate(ROUTE_NAMES.FILTER);
  };
  const updateSearch = (text) => {
    console.log('----------------------', text);
    setSearchTxt(text);
  };
  return (
    <SafeAreaView
      style={{
        backgroundColor: 'white',
      }}>
      <View style={styles.messageHeaderOuterContainer}>
        <View
          style={{
            padding: 18,
            paddingVertical: 11.125,
            maxHeight: 60,
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
            // shadowColor: 'grey',
            // borderBottomWidth: 0.5,
            // borderBottomColor: 'grey',
            width: '85%',
          }}>
          <BackButton
            onPress={() => {
              dispatch(setSearchHeaderMode(false));
              dispatch(setSearchHeaderText());
              goBack();
            }}
            viewStyle={{paddingRight: 6, justifyContent: 'center'}}
            color="#292929"
          />

          <View style={styles.inputBorder}>
            <Icon name="Contact_Search" size={normalize(18)} color="#202124" />
            <TextInput
              numberOfLines={1}
              returnKeyType="search"
              style={{
                flex: 1,
                fontSize: normalize(16),
                paddingTop: 0,
                paddingBottom: 0,
                marginBottom: 2,
                textAlignVertical: 'center',
                paddingHorizontal: 8,
              }}
              placeholder="Search"
              onChangeText={updateSearch}
              onSubmitEditing={() => {
                props.textUpdated(txt);
              }}
              value={txt}
            />

            {txt !== undefined && txt.length > 0 && (
              <TouchableOpacity
                style={{
                  minHeight: 24,
                  minWidth: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => {
                  setSearchTxt('');
                }}>
                <Icon name="Close" size={normalize(18)} color="#202124" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={{
              height: 54,
              maxHeight: 54,
              flexDirection: 'row',
              alignItems: 'center',
              width: 40,
              justifyContent: 'center',
              // shadowColor: 'grey',
              // borderBottomWidth: 0.5,
              // borderBottomColor: 'grey',
            }}
            onPress={() => this.onPress()}>
            <Icon color={'#202124'} name="Filter" size={24} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

class UnviversalSearchView extends Component {
  constructor(props) {
    super(props);
    var filterChatResult = this.props.route.params.searchThreads.filter(
      (data) => {
        return data.type !== 'discussion';
      },
    );
    var filterRoomResult = this.props.route.params.searchThreads.filter(
      (data) => {
        return data.type === 'discussion';
      },
    );
    this.state = {
      messagesSearchResult: [],
      boardsResult: [],
      discussionRoomResult: filterRoomResult,
      chatResult: filterChatResult,
      searchLoading: true,
      searchText: this.props.route.params.searchMeta,
    };
  }

  componentDidMount = () => {
    this.handleSearchCall();
  };

  async handleSearchCall() {
    var payload = {
      keywords: this.props.route.params.searchMeta,
      type: ['message', 'post', 'comment'],
    };
    if (this.props.filterApplied?.length > 0) {
      payload = {...payload, ...this.props.filterApplied};
    }

    const pictures = await this.props.universalSearchCall(payload, () =>
      this.setState({
        searchLoading: false,
      }),
    );
    this.filterMessageBoardsToSearch(this.props.route.params.searchMeta);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.searchResult !== this.props.searchResult) {
      this.getBoardMappedWithMessage();
      this.setState({
        messagesSearchResult: this.props.searchResult.messages,
        boardsResult: this.props.searchResult.boards,
        searchLoading: false,
      });
    }
  }

  filterThreadAccordingToSearch(query) {
    let userID = UsersDao.getUserId();

    let boards = this.props.messageBoards.filter((board) => {
      return board.type !== 'discussion';
    });
    query = query.toUpperCase();
    let searchResults = boards?.filter((s) => {
      let nameParticipantResult = s?.recentMembers?.filter((par) => {
        // if (!s.topicName) {
        //   return true;
        // }
        var name = par.fN + ' ' + par.lN;

        if (s?.recentMembers === undefined) {
          return false;
        }
        if (par.fn === null && par.lN === null) {
          let contact = ContactsDao.getContact(par.id);
          name = contact.fN + ' ' + contact.lN;
        }
        return name?.toUpperCase().includes(query);
      });
      var memberName =
        s?.members?.length > 2
          ? s?.members
              .filter((a) => a && a.id !== userID)
              .map((a) => a && (a.fN !== null ? a.fN + ' ' + a.lN : a.lN))
              .join(', ')
          : '';
      let name = s?.name;
      return (
        name?.toUpperCase().includes(query) || nameParticipantResult?.length > 0
      );
    });
    var filterDirectChat = searchResults.filter((s) => {
      if (s?.type === 'directChat') {
        return true;
      }
    });

    var filterGroupChatChat = searchResults.filter((s) => {
      if (s?.type === 'groupChat') {
        return true;
      }
    });
    this.setState({
      searchThreads: [...filterDirectChat, ...filterGroupChatChat],
    });
  }

  // filterThreadAccordingToSearch(query) {
  //   query = query.toUpperCase();
  //   let searchResults = boards?.filter((s) => {
  //     // if (!s.topicName) {
  //     //   return true;
  //     // }
  //     var recentMembers = s?.recentMembers.filter(function (el) {
  //       return el != null;
  //     });
  //     let nameParticipantResult = recentMembers?.filter((par) => {
  //       // if (!s.topicName) {
  //       //   return true;
  //       // }
  //       let name = par.fN + ' ' + par.lN;
  //       return name?.toUpperCase().includes(query);
  //     });

  //     let name = s?.name;
  //     return (
  //       name?.toUpperCase().includes(query) || nameParticipantResult?.length > 0
  //     );
  //   });
  //   this.setState({ chatResult: searchResults });
  // }

  filterMessageBoardsToSearch(query) {
    let boards = this.props.messageBoards.filter((board) => {
      return board.type === 'discussion';
    });
    query = query.toUpperCase();
    let searchResults = boards?.filter((s) => {
      let name = s?.name;
      return name?.toUpperCase().includes(query);
    });
    this.setState({discussionRoomResult: searchResults});
  }

  filterData = debounce((txt) => {
    var payload = {
      keywords: txt,
      type: ['message', 'post', 'comment'],
    };
    this.setState({text: txt});
    if (!(this.props.filterApplied?.length === 0)) {
      payload = {...payload, ...this.props.filterApplied};
    }
    this.setState({
      searchLoading: true,
    });
    this.props.universalSearchCall(payload, () =>
      this.setState({
        searchLoading: false,
      }),
    );
    this.filterMessageBoardsToSearch(txt);
    this.filterThreadAccordingToSearch(txt);
  }, 100);

  getBoardMappedWithMessage = (message) => {
    var filterDiscussionBoards = this.props.searchResult.boards.filter(
      (board) => {
        return this.props.searchResult.messages.filter((messageData) => {
          return messageData?.id === board.id && board.type === 'discussion';
        });
      },
    );
  };

  render() {
    let noresultFound = false;
    if (
      this.state.messagesSearchResult.length === 0 &&
      this.state.chatResult.length === 0 &&
      this.state.discussionRoomResult.length === 0
    ) {
      noresultFound = true;
    }
    const MessageSection = () => {
      if (this.state.messagesSearchResult.length > 0) {
        return (
          <UniversalChatFlatList
            data={this.state.messagesSearchResult}
            boards={this.state.boardsResult}
            section={'messages'}
            searchWord={this.state.searchText}
          />
        );
      } else {
        if (!this.state.searchLoading) {
          return Two();
        }
      }
    };

    var segments = [
      {
        title: 'Messages',
        view: MessageSection,
        image: 'Messages',
      },
    ];
    return (
      <View
        style={{
          backgroundColor: 'white',
          flex: 1,
        }}>
        <HeaderView
          query={this.props.route.params.searchMeta}
          textUpdated={this.filterData}
        />
        {this.state.searchLoading ? (
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              zIndex: 5,
              backgroundColor: 'clear',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Loader />
          </View>
        ) : null}

        <SegmentControl segments={segments} />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  let {messageThreadList, native, messageBoards} = state;
  return {
    searchResult: messageThreadList.searchResult,
    messageBoards: messageBoards.boards,
    filterApplied: native.searchFilterData,
  };
};

export default connect(mapStateToProps, {
  universalSearchCall,
})(withTranslation()(UnviversalSearchView));

const styles = StyleSheet.create({
  inputBorder: {
    alignItems: 'center',
    height: normalize(38),
    borderRadius: normalize(12),
    marginStart: normalize(10),
    borderWidth: 1,
    borderColor: '#E5E8EC',
    flexDirection: 'row',
    flex: 1,
    paddingStart: normalize(10),
    marginRight: 10,
    paddingEnd: 10,
  },
  containerNoData: {
    //flex: 1,
    // backgroundColor: 'red',
    margin: 50,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    //  height: '90%',
    //  width: '100%',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    height: 400,
    width: 300,
  },
  text: {
    color: '#0D6EFD',
    fontSize: normalize(16),
    fontWeight: '500',
    width: '100%',
    height: '90%',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
  },
  messageHeaderOuterContainer: {
    marginRight: 0,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: 'grey',
    borderBottomWidth: 0.5,
    borderBottomColor: '#BDC1C6',
    justifyContent: 'space-between',
    height: 54,
  },
  uniChatListStyle: {
    backgroundColor: '#ffffff',
  },
  textStyle: {
    fontWeight: '400',
    fontSize: normalize(19),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    textAlign: 'center',
    lineHeight: 34,
    color: '#9AA0A6',
    width: '80%',
  },
  imageStyle: {
    marginBottom: 60,
  },
});
