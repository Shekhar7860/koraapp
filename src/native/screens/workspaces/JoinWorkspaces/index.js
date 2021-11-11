import React from 'react';
import {Trans, withTranslation} from 'react-i18next';
import {TouchableOpacity} from 'react-native';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {connect} from 'react-redux';
import * as UsersDao from '../../../../dao/UsersDao';
import {
  acceptToJoinWorkSpace,
  requestToJoinWorkSpace,
  getBrowsedWorkspace,
  clearWsData,
} from '../../../../shared/redux/actions/workspace.action';
import {LOADING_MORE_WS} from '../../../../shared/redux/constants/native.constants';
import {BROWSE_WORKSPACE_SUCCESSFUL} from '../../../../shared/redux/constants/workspace.constants';
import {Icon} from '../../../components/Icon/Icon';
import {fontFamily} from '../../../components/KoraText';
import {RoomAvatar} from '../../../components/RoomAvatar';
import {navigate} from '../../../navigation/NavigationService';
import {ROUTE_NAMES} from '../../../navigation/RouteNames';
import {Header} from '../../../navigation/TabStacks';
import {normalize} from '../../../utils/helpers';
import {Loader} from '../../ChatsThreadScreen/ChatLoadingComponent';
const WsListItem = React.memo(
  ({
    item,
    t = () => {},
    onJoinClick = () => {},
    onRequestClick = () => {},
    onPress = () => {},
  }) => {
    const {desc, logo, name, owner, userStatus, type} = item;
    // const {t} = useTranslation();
    const isUserRequested = userStatus === 'requested';
    const isUserInvited = userStatus === 'invited';
    const isTypeOpen = type === 'open';
    const showLock = userStatus === 'nonMember' && isTypeOpen;
    const showJoinButton = userStatus === 'nonMember' || isUserInvited;
    const showRequest = !isUserRequested && isTypeOpen;
    const showJoin = !isUserRequested && !isTypeOpen;
    const {fN, lN} = owner;
    return (
      <TouchableOpacity onPress={() => onPress(item)} style={styles.wsItem}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <RoomAvatar showCircle={false} size={40} boardIcon={logo} />
          <Text style={[styles.itemHeader, {marginLeft: 5}]}>{name}</Text>
          <View style={{flex: 1}} />
          {showLock && <Icon name={'Lock'} size={15} />}
          {/* <View style={{flex: 1}} /> */}
          {isUserInvited && (
            <View style={styles.invitedTagContainer}>
              <Text style={styles.invitedTag}>{t('Invited')}</Text>
            </View>
          )}
        </View>
        <View style={{marginTop: 12}}>
          <Text numberOfLines={2}>{desc}</Text>
        </View>
        <View
          style={{
            marginTop: 15,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <Text
            style={{
              color: '#9AA0A6',
              fontSize: normalize(16),
              lineHeight: normalize(29),
              fontFamily: fontFamily,
            }}>
            {fN || lN}
          </Text>
          {isUserRequested && (
            <Text style={[styles.joinText, {color: '#9AA0A6'}]}>
              {t('Requested')}
            </Text>
          )}
          {showRequest && (
            <Text onPress={() => onRequestClick(item)} style={styles.joinText}>
              {t('Request')}
            </Text>
          )}
          {showJoin && (
            <Text onPress={() => onJoinClick(item)} style={styles.joinText}>
              {t('Join')}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  },
);

const ItemSeparatorComponent = React.memo(() => (
  <View style={styles.separatorStyle} />
));

class JoinWorkspaces extends React.Component {
  constructor(props) {
    super();
  }

  componentDidMount() {
    this.getBrowsedWorkspace();
  }

  componentWillUnmount() {
    this.props.clearWsData();
  }

  getBrowsedWorkspace(skip = 0) {
    this.props.getBrowsedWorkspace({skip});
  }

  renderSearchBox() {
    const {t} = this.props;
    return (
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          padding: 10,
          borderColor: '#E5E8EC',
          borderWidth: 1,
          borderRadius: 8,
          backgroundColor: 'white',
        }}>
        <View style={{}}>
          <Icon name={'Contact_Search'} size={20} />
        </View>
        <TextInput
          style={{marginLeft: 14, flexShrink: 1}}
          placeholder={t('Search workspace')}
          placeholderTextColor={'#8A959F'}
        />
      </View>
    );
  }

  renderText() {
    const {t} = this.props;
    const {ws = [], invitedCount = ''} = this.props.browseWorkspace;
    return (
      <View>
        <Text style={styles.topText}>
          {t('Discover and join the workspace')}
        </Text>
        <Text style={styles.descriptionText}>
          <Trans i18nKey="joinWorkspaceDescription" invitedCount={invitedCount}>
            You have been invited to{' '}
            <Text
              style={[
                styles.descriptionText,
                {fontWeight: '700', marginBottom: 0},
              ]}>
              {{invitedCount}} workspaces,
            </Text>{' '}
            choose the one you need and click on Join button to join
          </Trans>
        </Text>
      </View>
    );
  }

  handleJoinWorkspace = (item) => {
    const payload = {
      wId: item.id,
      userId: UsersDao.getUserId(),
      q: '',
      is_append: false,
      isFirstTimeLoaded: false,
      skip: 0,
    };
    if (item.userStatus === 'invited') {
      this.props.acceptToJoinWorkSpace(payload);
    } else {
      this.props.requestToJoinWorkSpace(payload);
    }
  };

  onPress = (item) => {
    navigate(ROUTE_NAMES.DETAILED_WORKSPACE, {ws: item});
  };

  renderItem = ({item}) => {
    const {t} = this.props;
    return (
      <WsListItem
        item={item}
        t={t}
        onJoinClick={this.handleJoinWorkspace}
        onRequestClick={this.handleJoinWorkspace}
        onPress={this.onPress}
      />
    );
  };

  keyExtractor = (item) => item.id;

  loadMore = () => {
    const {ws = []} = this.props.browseWorkspace;
    const skip = ws.length;
    if (this.props.loadingMore || this.props.searchMode) {
      return;
    }
    this.getBrowsedWorkspace(skip);
  };

  renderListFooter = () => {
    if (this.props.loadingMore) {
      return (
        <View style={{paddingVertical: 10}}>
          <Loader />
        </View>
      );
    }
    return null;
  };

  get wsList() {
    console.log('wsList', this.props.searchHeaderText);
    const {ws = []} = this.props.browseWorkspace;
    const transformedText = this.props.searchHeaderText?.trim()?.toLowerCase();

    return ws.filter(({name = '', desc = ''}) => {
      if (this.props.searchHeaderText === '') {
        return true;
      }
      return (
        name?.toLowerCase()?.includes(transformedText) ||
        desc?.toLowerCase()?.includes(transformedText)
      );
    });
  }
  renderBrowseWorkspaceList() {
    const {ws = []} = this.props.browseWorkspace;
    const {t} = this.props;
    return (
      <FlatList
        bounces={false}
        style={styles.list}
        data={this.wsList}
        scrollEnabled={true}
        renderItem={this.renderItem}
        keyExtractor={this.keyExtractor}
        onEndReached={this.loadMore}
        ListFooterComponent={this.renderListFooter}
        onEndReachedThreshold={0.1}
        extraData={this.props.loadingMore}
        ItemSeparatorComponent={ItemSeparatorComponent}
      />
    );
  }

  render() {
    const {t} = this.props;
    return (
      <View style={styles.safeAreaStyles}>
        <Header
          title={t('Join Workspace')}
          goBack={true}
          navigation={this.props.navigation}
        />
        {!this.props.searchMode && (
          <View style={styles.scrollViewStyles}>
            {this.renderText()}
            {/* {this.renderSearchBox()} */}
          </View>
        )}
        {this.renderBrowseWorkspaceList()}
        <SafeAreaView />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const {workspace, native} = state;
  return {
    browseWorkspace: workspace.browsedWorkspace,
    loadingMore: native?.loaders[LOADING_MORE_WS],
    searchHeaderText: native.searchHeaderText,
    searchMode: native.searchMode,
  };
};

export default connect(mapStateToProps, {
  getBrowsedWorkspace,
  requestToJoinWorkSpace,
  acceptToJoinWorkSpace,
  clearWsData,
})(withTranslation()(JoinWorkspaces));

const styles = StyleSheet.create({
  joinText: {
    color: '#106CF6',
    lineHeight: normalize(26),
    fontFamily: fontFamily,
    fontSize: normalize(16),
    fontWeight: '400',
  },
  separatorStyle: {height: 16},
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
  descriptionText: {
    fontWeight: '400',
    fontSize: normalize(16),
    marginTop: 12,
    marginBottom: 10,
  },
  list: {
    marginTop: 10,
    paddingHorizontal: 18,
    // marginBottom: 100,
  },
  cardHeader: {fontWeight: '700', marginBottom: 7},
  safeAreaStyles: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    flexDirection: 'column',
  },
  scrollViewStyles: {marginHorizontal: 18, marginTop: 20},
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
