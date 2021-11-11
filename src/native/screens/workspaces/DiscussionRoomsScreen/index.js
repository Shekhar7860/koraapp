import React from 'react';
import {
  StyleSheet,
  View,
  SectionList,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {navigate} from '../../../navigation/NavigationService';
import {ROUTE_NAMES} from '../../../navigation/RouteNames';
import {
  getDiscussions,
  markBoardAsStar,
  muteUnmute,
  deleteDiscussion,
  leaveDiscussion,
} from '../../../../shared/redux/actions/discussions.action';
import BoardItem from './BoardItem';
import * as Constants from '../../../components/KoraText';
import {withTranslation} from 'react-i18next';
import {Icon} from '../../../components/Icon/Icon';
import {setSearchHeaderText} from '../../../../shared/redux/actions/native.action';
import {LOADING_MORE_BOARDS} from '../../../../shared/redux/constants/native.constants';
import {normalize} from '../../../utils/helpers';
// import {setActiveBoard} from '../../../../shared/redux/actions/message-thread.action';
import {
  emptyObject,
} from '../../../../shared/redux/constants/common.constants';
import {Loader} from '../../ChatsThreadScreen/ChatLoadingComponent';
import {Q} from '@nozbe/watermelondb';
import * as Entity from '../../../realm/dbconstants';
import {Header} from '../../../navigation/TabStacks';
import database from '../../../realm';

class DiscussionRoomsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openIndex: 0,
      searchMode: false,
      rooms: [],
    };
    this.timer = null;
  }

  get discussionsOnlyMode() {
    return this.props.route.name === ROUTE_NAMES.MESSAGES_DISCUSSION_ROOMS;
  }

  get workspace() {
    return this.props.route.params.workspace || emptyObject;
  }
  firstTimeLoaded = false;

  componentDidMount() {
    this.firstTimeLoaded = true;

    const whereClause = [Q.where('wsId', this.props.activeWsId)];

    this.messagesObservable = database.active.collections
      .get(Entity.Boards)
      .query(...whereClause)
      .observe();
    this.messagesSubscription = this.messagesObservable.subscribe((rooms) => {
      console.log('ROOMS', rooms.length);
      this.setState({rooms});
    }, console.log);

    this.getDiscussions();
    this.firstTimeLoaded = false;
  }

  componentWillUnmount() {
    if (this.messagesSubscription && this.messagesSubscription.unsubscribe) {
      this.messagesSubscription.unsubscribe();
    }
  }

  checkAndUpdateDiscussionsFlag() {
    if (this.state.discussionsOnlyMode !== this.discussionsOnlyMode) {
      this.setState({discussionsOnlyMode: this.discussionsOnlyMode});
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.activeWsId !== this.props.activeWsId) {
      this.firstTimeLoaded = true;
      this.getDiscussions();
      this.firstTimeLoaded = false;
    }
  }

  getDiscussions(loadMore = false) {
    let extraParams = {};
    if (loadMore) {
      extraParams = {
        limit: 20,
        offset: this.props.discussionList.length,
      };
    }
    if (!this.props.activeWsId || this.props.activeWsId === '') {
      return;
    }
    const _params = {
      wsId: this.props.activeWsId,
      ...extraParams,
      showLoader: this.firstTimeLoaded,
    };
    this.props.getDiscussions(_params, null);
  }

  onEndReached = () => {
    if (this.props.moreAvailable) {
      // this.getDiscussions(false, true);
    }
  };

  get list() {
    let discussionList = this.state.rooms;
    discussionList = discussionList.filter(
      (brd) => brd?.type !== 'file' && brd?.isMember===true,
    );
    const checkTypeDiscussion = this.discussionsOnlyMode;
    if (checkTypeDiscussion) {
      discussionList = discussionList.filter(
        (brd) => brd.type === 'discussion',
      );
    }
   
    if (
      this.props.searchHeaderText !== '' &&
      this.props.searchHeaderText?.length > 0
    ) {
      return discussionList.filter((grp) => {
        return grp.name
          ?.toLowerCase()
          .includes(this.props.searchHeaderText.toLowerCase());
      });
    }
    return discussionList;
  }

  mapppedSectionTitle(type) {
    switch (type?.toLowerCase()) {
      case 'embeddedweb':
        return 'Web Pages';

      case 'document':
        return 'Documents';
      case 'table':
        return 'Applications';
      case 'discussion':
        return 'Discussion Rooms';

      case 'file':
        return 'Files';
      case 'task':
        return 'Tasks';
      default:
        return type;
    }
  }

  get getSections() {
    let listData = this.list;
    let sections = {};
    listData?.forEach((element) => {
      let type = element.type;
      if (sections[type]) {
        sections[type].push(element);
      } else {
        sections[type] = [element];
      }
    });
    let finalMessagesObject = [];

    Object.entries(sections)
      .sort()
      .forEach(([title, data]) => {
        //   let  titleName= (this.mapppedSectionTitle(title) + (data?.length>1?'s':''));
        finalMessagesObject.push({title, data});
      });
    return finalMessagesObject;
  }
  lineSeperator() {
    return <View style={styles.lineSeperator} />;
  }
  renderSearchHeader = () => {
    const {t} = this.props;

    return (
      <View style={styles.searchHeader}>
        <View style={styles.headerSection}>
          {this.state.searchMode ? (
            <Icon
              size={normalize(24)}
              name={'Contact_Search'}
              color={'#202124'}
            />
          ) : (
            <Icon size={normalize(24)} name={'Messages'} />
          )}
        </View>
        {this.state.searchMode ? (
          <TextInput
            placeholder={t('Search Discussion Room')}
            onChangeText={(txt) => this.props.setSearchHeaderText(txt)}
            value={this.props.searchHeaderText}
            style={styles.searchInput}
          />
        ) : (
          <Text style={styles.textStyle}>{t('Discussion')}</Text>
        )}
        <View style={styles.headerSection}>
          <TouchableOpacity
            onPress={() => this.setState({searchMode: !this.state.searchMode})}>
            {this.state.searchMode ? (
              <Icon size={normalize(24)} name={'cross'} />
            ) : (
              <Icon size={normalize(24)} name={'Contact_Search'} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  onClickActions = (data) => {
    switch (data.action) {
      case 'muteButton':
        this.props.muteUnmute(data._params, data.payload);
        break;
      case 'starButton':
        //console.log(JSON.stringify(data.updataDiscData.boards));
        this.props.markBoardAsStar(
          data._params,
          data.payload,
          //data.updataDiscData,
        );
        break;
      case 'deleteButton':
        // let payload = {
        //   id: data._params.rId,
        // };

        this.props.deleteDiscussion(data._params);
        // this.props.leaveDiscussion(data._params, payload, () => {});

        break;
    }
  };

  onThreadClick = (props) => {
    if (props?.type === 'discussion') {
      navigate(ROUTE_NAMES.DISCUSSION, {board: props});
    } else {
      navigate(ROUTE_NAMES.DISCUSSION_WEBVIEW, {
        board: props,
      });
    }
  };

  renderItem = ({item, index}) => {
    return (
      <BoardItem
        item={item}
        index={index}
        onThreadClick={this.onThreadClick}
        openIndex={this.state.openIndex}
        onClickActions={this.onClickActions}
      />
    );
  };

  renderListFooter = () => {
    if (this.props.loadingMore) {
      return <Loader />;
    } else {
      return null;
    }
  };

  renderSHeader = ({section: {title}}) => {
    if (!this.discussionsOnlyMode) {
      return (
        <Text style={styles.sectionStyle}>
          {this.mapppedSectionTitle(title)}
        </Text>
      );
    }
    return null;
  };

  render() {
    const {t} = this.props;
    if (this.props.showLoader) {
      return <Loader />;
    }
    // if (this.list?.length === 0 && this.props.searchHeaderText?.length > 0) {
    //   return (
    //     <View style={{padding: 10}}>
    //       <Text style={styles.noResultsTextStyle}>{t('No match found!')}</Text>
    //     </View>
    //   );
    // }

    return (
      <View style={styles.container}>
        <Header
          goBack={true}
          // backIcon={<Icon name={'cross'} size={30} />}
          navigation={this.props.navigation}
          title={ROUTE_NAMES.DISCUSSION_ROOMS}
        />

        {/*     {this.renderSearchHeader()} */}
        {this.state.rooms?.length !== 0 ? (
          <>
            {this.list?.length === 0 &&
              this.props.searchHeaderText?.length > 0 && (
                <View style={styles.noMatch}>
                  <Text style={styles.noResultsTextStyle}>
                    {t('No match found!')}
                  </Text>
                </View>
              )}
            <SectionList
              renderSectionHeader={this.renderSHeader}
              sections={this.getSections}
              keyboardShouldPersistTaps={'handled'}
              keyboardDismissMode={'on-drag'}
              contentContainerStyle={styles.backgroundWhite}
              onEndReached={this.onEndReached}
              onEndReachedThreshold={0.01}
              ItemSeparatorComponent={this.lineSeperator}
              renderItem={this.renderItem}
              ListFooterComponent={this.renderListFooter}
              keyExtractor={(item) => item.id}
            />
          </>
        ) : (
          <View style={styles.emptyRoom}>
            <Text style={styles.noRoomsTextStyle}>
              {t('No rooms created yet!')}
            </Text>
          </View>
        )}
      </View>
    );
  }
}
const mapStateToProps = (state) => {
  const {discussion, home, native, workspace} = state;
  return {
    // discussionList: discussion.allDiscussions?.boards || emptyArray,
    moreAvailable: Boolean(discussion.allDiscussions?.moreAvailable),
    activeWsId: workspace.activeWsId,
    showLoader: home.showLoader,
    searchHeaderText: native.searchHeaderText,
    searchMode: native.searchMode,
    loadingMore: native.loaders[LOADING_MORE_BOARDS],
  };
};

DiscussionRoomsScreen.propTypes = {
  markBoardAsStar: PropTypes.func,
  muteUnmute: PropTypes.func,
  deleteDiscussion: PropTypes.func,
};

DiscussionRoomsScreen.defaultProps = {
  markBoardAsStar: () => {},
  muteUnmute: () => {},
  deleteDiscussion: () => {},
};

export default connect(mapStateToProps, {
  getDiscussions,
  markBoardAsStar,
  muteUnmute,
  deleteDiscussion,
  leaveDiscussion,
  // setActiveBoard,
  setSearchHeaderText,
})(withTranslation()(DiscussionRoomsScreen));

const styles = StyleSheet.create({
  lineSeperator: {
    height: 1,
    backgroundColor: '#EFF0F1',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    // marginBottom: -2,
    // marginTop: -2,
    marginEnd: 10,
    marginStart: 10,
  },
  backgroundWhite: {backgroundColor: 'white'},
  noMatch: {padding: 10},
  emptyRoom: {
    backgroundColor: 'white',
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {justifyContent: 'center', paddingTop: 10},
  headerSection: {marginHorizontal: 3, marginRight: 5},
  searchInput: {
    marginLeft: 5,
    flex: 1,
    lineHeight: normalize(19),
    fontSize: normalize(16),
  },
  searchHeader: {
    padding: 12,
    margin: 10,
    backgroundColor: '#F2F2F2',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  textStyle: {
    flex: 1,
    marginLeft: 5,
    fontWeight: '600',
    fontSize: normalize(16),
    color: '#202124',
  },
  sectionStyle: {
    padding: 10,

    backgroundColor: '#F2F2F2',

    alignItems: 'center',
    fontSize: normalize(16),
    fontStyle: 'normal',
  },
  noResultsTextStyle: {
    textAlign: 'center',
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  noRoomsTextStyle: {
    fontWeight: '500',
    fontSize: normalize(20),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
});
