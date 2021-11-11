// @flow
import {
  View,
  TouchableOpacity,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  SectionList,
  TextInput,
  Platform,
} from 'react-native';
import {withTranslation} from 'react-i18next';

import _, {isEqual, debounce} from 'lodash';
import {connect} from 'react-redux';
import React from 'react';
import {normalize} from '../../utils/helpers';
//import styleConstructor from './style';
import {
  emptyArray,
  emptyObject,
} from '../../../shared/redux/constants/common.constants';
import {Icon} from '../../components/Icon/Icon';
import Placeholder from '../../components/Icon/Placeholder';

import {RoomAvatar} from '../../components/RoomAvatar';
import {SvgIcon} from '../../components/Icon/SvgIcon.js';
import {setActiveWsId} from '../../../shared/redux/actions/workspace.action';
import {ROUTE_NAMES} from '../../navigation/RouteNames';
import {navigate} from '../../navigation/NavigationService';
import {workspaceOptionsModalRef} from '../../components/WorkspaceOptionsModal';
import {cloneDeep} from 'lodash';
import DiscussionMoreOptions from './DiscussionPostsScreen/discussionMoreOptions';

import withObservables from '@nozbe/with-observables';
import {of as of$} from 'rxjs';
import {catchError} from 'rxjs/operators';
import database from '../../realm';
import * as Entity from '../../realm/dbconstants';

const RoomItem = React.memo(
  ({
    show = true,
    onPress = () => {},
    logo,
    name,
    membersCount,
    guestCount,
    isPrivate,
    isStarred,
    boardsString = '',
    onLongPress = () => {},
  }) => {
    return (
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        style={[
          styles.sectionItemView,
          show === true ? styles.empty : styles.displayNone,
        ]}>
        <View style={styles.roomAvatarView}>
          <RoomAvatar
            boardIcon={logo}
            showCircle={false}
            size={normalize(28)}
          />
        </View>
        <View style={styles.view1}>
          <Text style={styles.sectionItemName}>{name}11</Text>
          <View style={styles.view2}>
            {/* {item?.boards?.length ? (
          <Text style={styles.text3}>
            {item?.boards?.length + ' Boards'}
          </Text>
        ) : null}
        {item?.boards?.length > 0 ? <View style={styles.view3} /> : null} */}
            {boardsString !== '' && (
              <>
                <Text style={styles.text3}>{boardsString}</Text>
                <View
                  style={styles.boardsStringStye}
                />
              </>
            )}
            {guestCount ? <Text style={styles.text3}>{guestCount}</Text> : null}
          </View>
        </View>
       {/*  {isPrivate ? (
          <Icon name="LockFilled" size={16} color="#9AA0A6" />
        ) : null} */}
        {isPrivate && isStarred ? <View style={styles.starredStyle} /> : null}
        {isStarred ? (
          <SvgIcon name="Star_Filled" width={16} height={16} />
        ) : null}
      </TouchableOpacity>
    );
  },
  isEqual,
);

const _ModifiedItem = ({
  item,
  section,
  index,
  onLongPress,
  onItemPress,
  searchValue,
}) => {
  if (!item) {
    return null;
  }
  // const name = item?.name?.toLowerCase();
  // const sVal = searchValue.toLowerCase();
  // return name.includes(sVal);

  if (searchValue !== '') {
    const name = item?.name?.toLowerCase();
    const sVal = searchValue.toLowerCase();
    if (!name.includes(sVal)) {
      return null;
    }
  }

  let isPrivate = item?.type === 'private' || false;
  let isStarred = item?.star || item?.isWSStarred;
  if (!item?.logo || !item?.name) {
  }
  let guestCount = '';
  let memberText = item?.id && item?.id[0] === 'i' ? 'Collaborator' : 'Member';
  if (item?.membersCount > 1 || item?.membersCount == 0) {
    guestCount = item?.membersCount + ` ${memberText}s`;
  } else {
    guestCount = item?.membersCount + ` ${memberText}`;
  }
  let boardsString = '';
  if (item.boardCount !== null && item.boardCount !== undefined) {
    boardsString = `${item.boardCount} ${
      item.boardCount > 1 ? 'boards' : 'board'
    }`;
  }
  return (
    <RoomItem
      show={section.show === true}
      isPrivate={isPrivate}
      isStarred={isStarred}
      onLongPress={() => onLongPress(item)}
      onPress={() => onItemPress(item)}
      logo={item?.logo}
      name={item?.name}
      boardsString={boardsString}
      membersCount={item?.membersCount}
      guestCount={guestCount}
    />
  );
};

const enhance = withObservables(['item'], ({item}) => {
  let id = null;
  let entity = null;
  if (typeof item === 'string') {
    if (item[0] === 'i') {
      id = item;
      entity = Entity.Boards;
    } else {
      id = item;
      entity = Entity.Workspaces;
    }
  } else if (item?.type) {
    if (item.type === 'workspace') {
      id = item.id;
      entity = Entity.Workspaces;
    } else if (item.type === 'board') {
      id = item.id;
      entity = Entity.Boards;
    }
  }

  // if (entity === null) {
  //   console.log('TEST', entity, item);
  //   return {
  //     item: of$({}),
  //   };
  // }

  return {
    item: database.active.collections
      .get(entity)
      .findAndObserve(id)
      .pipe(catchError(() => of$(null))),
  };
});

const ModifiedItem = enhance(_ModifiedItem);

const SearchBox = React.memo(({value, onChangeText}) => {
  return (
    <View style={styles.searchView1}>
      <View style={styles.searchView2}>
        <Icon name={'Contact_Search'} size={22} style={styles.searchView3} />
        <TextInput
          numberOfLines={1}
          returnKeyType="search"
          style={styles.searchStyle}
          placeholder="Workspace"
          placeholderTextColor="#8A959F"
          onChangeText={onChangeText}
          value={value}
        />
      </View>
    </View>
  );
}, isEqual);
class WorkspaceList extends React.Component {
  constructor(props) {
    super(props);
    //this.styles = styleConstructor(props.styles);
    this.state = {
      showHeader: false,
      header: 'Starred',
      searchValue: '',
      info: [],
      sections: [],
      board: emptyObject,
    };
    React.createRef();
    this.moreOptions = React.createRef();
  }

  get board() {
    return this.state.board || emptyObject;
  }

  componentDidMount() {
    this.setSections();
  }

  componentDidUpdate(prevProps) {
    if (this.props.sectionListLayout !== prevProps.sectionListLayout) {
      this.setSections();
    }
  }

  setSections = () => {
    let sections = this.props.sectionListLayout || [];
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].show === null || sections[i].show === undefined) {
        sections[i].show = true;
      }
      sections[i].selected = sections[i].selected || 'all';
    }
    this.setState({sections: cloneDeep(sections)});
  };

  get getSections() {
    return this.props.layout;
  }

  onCheckViewableItems = ({viewableItems, changed}) => {
    const {t} = this.props;
    if (viewableItems[0]?.section?.title) {
      this.setState({
        header: t(viewableItems[0].section.title),
        info: viewableItems[0],
      });
    }
  };
  renderOnScroll = (props) => {
    if (props.nativeEvent.contentOffset.y <= 9) {
      this.setState({showHeader: false});
    } else {
      this.setState({showHeader: true});
    }
  };

  onItemPress = (item) => {
    //handle workspace case

    if (Object(item?._raw).hasOwnProperty('isWSStarred')) {
      this.props.setActiveWsId(item?.id);
      this.props.navigation.navigate(ROUTE_NAMES.DISCUSSION_ROOMS);
    }

    if (item.type === 'discussion') {
      if (item?.wsId) {
        this.props.setActiveWsId(item.wsId);
        navigate(ROUTE_NAMES.DISCUSSION, {board: item});
        // this.props.navigation.navigate(ROUTE_NAMES.MESSAGES, {
        //   screen: ROUTE_NAMES.DISCUSSION,
        //   params: {board: item},
        // });
      }
    }
  };

  onLongPress = (item) => {
    // console.log('ITEM', item);
    if (Object(item?._raw).hasOwnProperty('isWSStarred')) {
      workspaceOptionsModalRef.current.open(item.id);
    } else {
      this.setState({board: item}, () => {
        this.moreOptions.current.renderModal();
      });
    }
  };

  renderSectionItem = ({item, index, section}) => {
    return (
      <ModifiedItem
        item={item}
        index={index}
        section={section}
        onLongPress={this.onLongPress}
        onItemPress={this.onItemPress}
        searchValue={this.state.searchValue}
      />
    );
  };

  renderSearchBar = () => {
    return (
      <View style={styles.searchView}>
      <SearchBox
        onChangeText={this.onSearchTextChange}
        value={this.state.searchValue}
      />
      </View>
    );
  };

  renderEmptyPlaceholder() {
    const {t} = this.props;

    return (
      <View style={styles.emptyPlaceHolderContainer}>
        <Placeholder
          name={'workspaces'}
          text={t('No workspace to show')}
          imageStyle={styles.marginBottom10}
          textStyle={styles.placeHolderText}
        />
      </View>
    );
  }

  renderItemSeparator = ()=>{
    return (
      <View style={{width: 10}} />
    );
  }
  reverseSection = (info) => () => {
    const sectionIndex = this.state.sections.findIndex(
      ({title}) => title === info?.section?.title,
    );
    const section = this.state.sections[sectionIndex];
    section.data.reverse();
    const {sections} = this.state;
    sections[sectionIndex] = section;
    this.setState({sections});
  };

  renderHeader = (info) => {
    const {t} = this.props;
    let isEmpty = true;
    if (info?.section?.data?.length > 0) {
      isEmpty = false;
    }
    return (
      <>
        <View style={styles.sectionHeaderMainView}>
          <TouchableOpacity
            style={styles.sectionHeaderView}
            onPress={() => {
              info.section.show = !info?.section.show;
              this.forceUpdate();
            }}>
            <Text style={styles.sectionHeader}>{t(info?.section?.title)}</Text>
            <View style={styles.dropDownIconView}>
              {info?.section.show ? (
                <Icon name="Dropdown_Down" size={16} color="#5F6368" />
              ) : (
                <Icon name="Right_Arrow" size={16} color="#5F6368" />
              )}
            </View>
          </TouchableOpacity>
          {/* <TouchableOpacity
            style={styles.sortIcon}
            onPress={this.reverseSection(info)}>
            <Icon name="Sort" size={26} color="#202124" />
          </TouchableOpacity> */}
        </View>
        {info?.section.show && info.section.groups?.length > 0 && (
          <FlatList
            style={styles.infoSection}
            horizontal={true}
            ItemSeparatorComponent={this.renderItemSeparator}
            // ListFooterComponent={
            //   <View style={{width: 15, backgroundColor: 'red'}} />
            // }
            pagingEnabled={true}
            showsHorizontalScrollIndicator={false}
            data={info.section.groups || emptyArray}
            renderItem={this.renderGroup(info.section)}
          />
        )}
        {isEmpty && this.renderEmptyPlaceholder(info?.section?.title)}
      </>
    );
  };

  filterOnGroupTags = (section, id) => () => {
    const index = this.state.sections.findIndex(
      ({title}) => title === section.title,
    );
    let {sections} = this.state;
    sections[index].selected = id;
    let {sectionListLayout} = this.props;
    if (id !== 'all') {
      const data = sections[index].groups.find((obj) => obj.id === id).data;
      const section = {...sectionListLayout[index]};
      let sectionData = [
        ...section.data.filter((obj) => {
          // if(obj?.id || obj && )
          return Boolean(data[obj?.id]);
        }),
      ];
      sections[index].data = sectionData;
    } else {
      sections = sectionListLayout;
    }
    this.setState({sections: cloneDeep(sections)});
  };

  renderGroup = (section) => ({item}) => {
    const {title, id} = item;
    let selected = section.selected === id;

    return (
      <TouchableOpacity
        onPress={this.filterOnGroupTags(section, id)}
        style={[
          styles.groupTag,
          selected ? styles.selectedColors : styles.empty,
        ]}>
        <Text style={[styles.text, selected ? styles.white : styles.empty]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  onSearchTextChange = (searchValue) => {
    this.setState({searchValue});
  };

  renderDynamicHeader = () => {
    return (
      <View
        style={[
          styles.headerView1,
          this.state.showHeader ? styles.empty : styles.displayNone,
        ]}>
        <SafeAreaView style={styles.headerView2}>
          <TouchableOpacity
            style={styles.headerView3}
            // onPress={() => {
            //   let info = this.state.info;
            //   info.section.show = !this.state.info?.section.show;
            //   this.setState({info});
            // }}
          >
            <Text style={styles.sectionHeader}>{this.state?.header}</Text>
            {/* <View style={{marginLeft: 10}}>
              {this.state.info?.section?.show ? (
                <Icon name="Dropdown_Down" size={16} color="#5F6368" />
              ) : (
                <Icon name="Right_Arrow" size={16} color="#5F6368" />
              )}
            </View> */}
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  };

  filter = () => {
    // const {sections} = this.state;
    const {searchValue} = this.state;
    let {sectionListLayout} = this.props;
    let newSectionList = [];
    if (searchValue.trim() !== '') {
      for (let i = 0; i < sectionListLayout.length; i++) {
        const section = {...sectionListLayout[i]};
        section.data = section.data.filter((obj) => {
          if (obj?.name && typeof obj?.name === 'string') {
            const name = obj?.name?.toLowerCase();
            const sVal = searchValue.toLowerCase();
            return name.includes(sVal);
          }
          if (searchValue === '') {
            return true;
          }
          return false;
        });
        section.selected = 'all';
        newSectionList.push(section);
      }
    } else {
      this.setState({sections: cloneDeep(sectionListLayout)});
      return;
    }

    this.setState({sections: newSectionList});
  };

  filterList = debounce(this.filter, 400);

  navigateToManageRoom = () => {
    const board = this.board;
    navigate(ROUTE_NAMES.ROOM_DETAILS, {
      board: board,
    });
  };
  navigateToFiles = () => {
    const titleName = this.board.name;
    const threadId = this.board.id;
    navigate('View_Files', {
      threadId: threadId,
      thread: this.board,
      titleName: titleName,
    });
  };

  renderBoardOptions = () => {
    // if (this.board) {
    //   return (
    return (
      <DiscussionMoreOptions
        ref={this.moreOptions}
        board={this.board || emptyObject}
        mute={this.board?.mute || emptyObject}
        unreadCount={this.board?.unreadCount || 0}
        titleName={this.board?.name || 0}
        navigateToFiles={this.navigateToFiles}
        navigateToManageRoom={this.navigateToManageRoom}
      />
    );
    //   );
    // }
    // return null;
  };

  render() {
    return (
      <>
        <SafeAreaView style={styles.safeAreaStyle} />
        {this.renderDynamicHeader()}
        {this.renderBoardOptions()}
        <SectionList
          removeClippedSubviews={true}
          extraData={this.state.searchValue}
          sections={this.state.sections}
          ListHeaderComponent={this.renderSearchBar}
          onViewableItemsChanged={this.onCheckViewableItems}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 80,
          }}
          bounces={false}
          stickySectionHeadersEnabled={false}
          onScroll={this.renderOnScroll}
          style={styles.sectionListStyle}
          keyExtractor={(item, index) => {
            if (item?.isWSStarred) {
              return item?.id + index;
            }
            return item?.id || index;
          }}
          renderItem={this.renderSectionItem}
          renderSectionHeader={this.renderHeader}
          // ListEmptyComponent={
          //   <View>
          //     <Text>List is empty</Text>
          //   </View>
          // }
        />
      </>
    );
  }
}

const mapStateToProps = (state) => {
  const {workspace} = state;
  const {wsLayout, sectionListLayout} = workspace;
  //   let wsList = wsLayout?.teamws || emptyArray;
  //   let starredObjects = wsLayout?.starred || emptyArray;
  //   let shared = wsLayout?.sharedBoards || emptyArray;
  return {
    layout: wsLayout,
    sectionListLayout: sectionListLayout,
    backup: sectionListLayout,
    // starred: starredObjects,
    // workspaces: wsList,
    // sharedBoards: shared,
  };
};

export default connect(mapStateToProps, {setActiveWsId})(
  withTranslation()(WorkspaceList),
);

const styles = StyleSheet.create({
  searchView:{ marginTop:Platform.OS === 'ios'?0:normalize(70)},
  groupTag: {
    borderColor: '#E4E5E7',
    backgroundColor: '#EFF0F1',
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 60,
  },
  selectedColors: {
    borderColor: '#5F6368',
    backgroundColor: '#5F6368',
  },
  white: {color: 'white'},
  placeHolderText: {lineHeight: normalize(19), width: '100%'},
  marginBottom10: {marginBottom: 10},
  emptyPlaceHolderContainer: {
    backgroundColor: '#ffffff',
    borderBottomColor: '#D3D4D5',
    borderBottomWidth: 0.5,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  empty: {},
  displayNone: {display: 'none'},
  sectionHeader: {
    fontSize: normalize(16),
    fontWeight: '300',
    color: '#5F6368',
  },
  safeAreaStyle: {backgroundColor: '#ffffff'},
  headerView1: {
    position: 'absolute',
    flexDirection: 'row',
    zIndex: 2,
    top: 0,
    overflow: 'hidden',
    paddingBottom: 5,
    backgroundColor: 'white',
  },
  headerView2: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#E4E5E7',
    shadowColor: '#000',
    shadowOffset: {width: 1, height: 0.5},
    shadowOpacity: 0.2,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerView3: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    //marginRight: 218,
  },
  sectionHeaderView: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    //backgroundColor: 'red',
    padding: 15,
  },
  sectionHeaderMainView: {flexDirection: 'row', alignItems: 'center'},
  sectionListStyle: {backgroundColor: '#F8F9FA', position: 'relative'},
  roomAvatarView: {
    borderRadius: 8,
    backgroundColor: '#F1E9FB',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionItemView: {
    paddingVertical: 13,
    paddingLeft: 16,
    backgroundColor: '#ffffff',
    borderBottomColor: '#D3D4D5',
    borderBottomWidth: 0.5,
    flexDirection: 'row',
    paddingRight: 16.5,
  },
  sectionItemName: {fontSize: normalize(16), fontWeight: '300'},
  text3: {
    fontWeight: '300',
    fontSize: normalize(14),
    color: '#9AA0A6',
  },
  view2: {
    flexDirection: 'row',
    paddingTop: 3,
    alignItems: 'center',
  },
  boardsStringStye:{
    marginHorizontal: 10,
    width: 1,
    height: normalize(14),
    backgroundColor: '#9AA0A6',
  },
  starredStyle:{margin: 5},
  view1: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    flex: 1,
  },
  view3: {
    borderWidth: 0.7,
    borderColor: '#E4E5E7',
    marginHorizontal: 10,
    width: 0,
    height: 10,
  },
  searchView1: {
    backgroundColor: '#F8F9FA',
    paddingTop: 13,
    paddingBottom: 5,
    paddingHorizontal: 16,
    flexShrink: 1,
  },
  searchView2: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E8EC',
    borderRadius: 8,
    flexShrink: 1,
  },
  searchView3:{paddingLeft: 10.25},
  searchStyle: {
    fontSize: normalize(16),
    fontWeight: '400',
    // backgroundColor: 'red',
    width: '100%',
    flexShrink: 1,
    paddingVertical: 9,
    paddingLeft: 10,
  },
  dropDownIconView: {marginLeft: 10},
  infoSection:{paddingHorizontal: 15, paddingBottom: 10},
  sortIcon: {
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    marginRight: 5,
  },
});
