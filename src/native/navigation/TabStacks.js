import {createStackNavigator} from '@react-navigation/stack';
import MessageThreads from '../screens/ChatsThreadScreen/MessageThreads';
import Home from '../screens/home/index';
import Knowledge from '../screens/Knowledge/index';
import Meetings from '../screens/Meetings/index';
import React, {useState, useEffect, useCallback} from 'react';

import {View, TouchableOpacity, StyleSheet, TextInput} from 'react-native';
import {SafeAreaView} from 'react-native';
import {isAndroid} from '../utils/PlatformCheck';
import {Icon} from '../components/Icon/Icon';
import MoreScreen from '../screens/MoreScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ManageAccountsScreen from '../screens/ManageAccountsScreen';
import {ROUTE_NAMES} from './RouteNames';
import {useDispatch, useSelector} from 'react-redux';
import DiscussionRoomsScreen from '../screens/workspaces/DiscussionRoomsScreen';
import WorkspaceList from '../screens/workspaces/WorkspaceList';
import {
  setSearchHeaderMode,
  setSearchHeaderText,
  searchHeaderCancelAction,
  searchHeaderSubmitAction,
} from '../../shared/redux/actions/native.action';
import {RoomAvatar} from '../components/RoomAvatar';
import * as Constants from './../components/KoraText';
import {Text} from './../components/KoraText';
import BackButton from './../components/BackButton';
import {normalize} from '../utils/helpers';
import {workspaceOptionsModalRef} from '../components/WorkspaceOptionsModal';
import {emptyArray} from '../../shared/redux/constants/common.constants';

import withObservables from '@nozbe/with-observables';
import {of as of$} from 'rxjs';
import {catchError} from 'rxjs/operators';
import database from '../realm';
import * as Entity from '../realm/dbconstants';

const Stack = createStackNavigator();

const enhance = withObservables(['wsId'], ({wsId}) => ({
  ws: database.active.collections
    .get(Entity.Workspaces)
    .findAndObserve(wsId)
    .pipe(catchError(() => of$(null))),
}));

const RoomAvatarById = React.memo(
  enhance(({ws}) => {
    return <RoomAvatar boardIcon={ws?.logo} showCircle={true} size={48} />;
  }),
);

const WsNameById = React.memo(
  enhance(({ws}) => {
    return ws.name;
  }),
);

export const Header = ({
  goBack = false,
  isFromNotificationTab = false,
  logo = null,
  title = '',
  navigation,
  rightContent = null,
  isChat = false,
  backIcon = 'kr-left_direction',
}) => {
  const searchMode = useSelector((s) => s.native.searchMode);
  const searchHeaderText = useSelector((s) => s.native.searchHeaderText);

  const activeWsId = useSelector((s) => s.workspace.activeWsId);
  const workspacelist = useSelector(
    (s) => s.workspace.workspacelist?.ws || emptyArray,
  );
  const [txt, setSearchTxt] = useState('');
  const [searchDonePressedFlag, setSearchDone] = useState(false);

  const dispatch = useDispatch();

  const toggleSearchMode = useCallback(() => {
    dispatch(setSearchHeaderMode(!searchMode));
    dispatch(setSearchHeaderText());
  }, [dispatch, searchMode]);
  const isWorkspaces =
    title === ROUTE_NAMES.MESSAGES_DISCUSSION_ROOMS ||
    title === ROUTE_NAMES.DISCUSSION_ROOMS;
  const isDiscussionRoom = [
    ROUTE_NAMES.DISCUSSION_ROOMS,
    ROUTE_NAMES.MESSAGES_DISCUSSION_ROOMS,
  ].some((n) => n === title);
  let selectedWS = {};
  let newTitle = title;
  if (isDiscussionRoom) {
    console.log('workspacelist', workspacelist);
    selectedWS = workspacelist.find((ws) => ws.id === activeWsId);
    newTitle = selectedWS?.name || '';
  }
  if (newTitle.length > 23) {
    newTitle = newTitle.substring(0, 22) + '...';
  }

  const onComposebarTextChange = useCallback(
    (text) => {
      setSearchTxt(text);
      dispatch(setSearchHeaderText(text));
    },
    [dispatch],
  );

  const optionsPressed = useCallback(() => {
    workspaceOptionsModalRef.current?.open();
  }, []);
  const showSearch = title === 'Chat' || isChat || title === 'Join Workspace';

  const openDrawer = useCallback(() => navigation.openDrawer(), [navigation]);

  const backButtonPress = useCallback(() => {
    if (!searchMode) {
      if (isFromNotificationTab) {
        navigation.goBack();
        //navigation.navigate(ROUTE_NAMES.FINDLY, {});

        navigation.navigate(ROUTE_NAMES.FINDLY, {
          screen:ROUTE_NAMES.KORA_NOTIFICATIONS
        });
      } else {
        navigation.goBack();
        dispatch(setSearchHeaderText());
      }
    } else {
      dispatch(setSearchHeaderText());
      setSearchTxt('');
      toggleSearchMode();
    }
  }, [
    searchMode,
    isFromNotificationTab,
    navigation,
    dispatch,
    toggleSearchMode,
  ]);

  const onCloseClick = useCallback(() => {
    setSearchTxt('');
    dispatch(setSearchHeaderText());
  }, [dispatch]);

  const onSubmitEditing = useCallback(() => {
    setSearchDone(!searchDonePressedFlag);
    dispatch(searchHeaderSubmitAction(searchDonePressedFlag));
  }, [dispatch, setSearchDone, searchDonePressedFlag]);

  const toggleSearchModeCB = useCallback(() => toggleSearchMode(), [
    toggleSearchMode,
  ]);

  const cancelPress = useCallback(() => {
    setSearchTxt('');
    toggleSearchMode();
    dispatch(searchHeaderCancelAction(true));
  }, [toggleSearchMode, dispatch]);
  return (
    <SafeAreaView forceInset={{bottom: 'never'}} style={styles.safeAreaStyle}>
      <View style={styles.mainHeader}>
        {!searchMode && !goBack ? (
          <TouchableOpacity style={styles.drawer} onPress={openDrawer}>
            <Icon name={'Menu'} size={24} color={'#292929'} />
          </TouchableOpacity>
        ) : (
          <BackButton
            onPress={backButtonPress}
            viewStyle={styles.backButton}
            color="#292929"
          />
        )}
        {!searchMode ? (
          <>
            {isDiscussionRoom && (
              <View style={styles.boardTitle}>
                <RoomAvatarById wsId={activeWsId} />
              </View>
            )}
            {logo}
            <Text numberOfLines={1} style={styles.titleTextStyle}>
              {isDiscussionRoom
                ? newTitle || <WsNameById wsId={activeWsId} />
                : newTitle}
            </Text>
          </>
        ) : (
          <View style={styles.inputBorder}>
            <Icon name="Contact_Search" size={normalize(18)} color="#202124" />
            <TextInput
              numberOfLines={1}
              returnKeyType="search"
              style={styles.headerSearch}
              placeholder="Search"
              autoFocus={true}
              onChangeText={onComposebarTextChange}
              onSubmitEditing={onSubmitEditing}
              value={searchHeaderText}
            />
            {txt.length > 0 && (
              <TouchableOpacity style={styles.close} onPress={onCloseClick}>
                <Icon name="Close" size={normalize(18)} color="#202124" />
              </TouchableOpacity>
            )}
          </View>
        )}
        <View style={styles.placeInCenter}>
          {showSearch ? (
            <View style={styles.rowCenter}>
              <TouchableOpacity onPress={toggleSearchModeCB}>
                {!searchMode ? (
                  <Icon name="Contact_Search" size={22} color="black" />
                ) : null}
              </TouchableOpacity>
              <TouchableOpacity onPress={cancelPress}>
                {searchMode ? <Text style={styles.cancel}>Cancel</Text> : null}
              </TouchableOpacity>
            </View>
          ) : null}
          <View style={styles.alignItemsFlexEndSelfCenter}>
            {typeof rightContent === 'function' ? rightContent() : rightContent}
          </View>
          {activeWsId && isWorkspaces && (
            <View style={styles.alignItemsFlexEndSelfCenter}>
              <TouchableOpacity onPress={optionsPressed}>
                <Icon name={'options'} size={24} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const generateOptions = (title) => {
  return {
    title: title,
    header: (props) => <Header navigation={props.navigation} title={title} />,
  };
};

const HomeStack = (props) => {
  let title = props.route?.name || 'Home';
  const options = generateOptions(title, props);
  return (
    <Stack.Navigator headerMode="screen">
      <Stack.Screen name={title} options={options} component={Home} />
    </Stack.Navigator>
  );
};

const KnowledgeStack = (props) => {
  let title = props.route?.name || 'Home';
  const options = generateOptions(title, props);
  return (
    <Stack.Navigator headerMode="screen">
      <Stack.Screen name={title} options={options} component={Knowledge} />
    </Stack.Navigator>
  );
};

const MeetingsStack = (props) => {
  return (
    <Stack.Navigator headerMode="none">
      <Stack.Screen name="Events" component={Meetings} />
    </Stack.Navigator>
  );
};

const ProfileStack = (props) => {
  return (
    <Stack.Navigator headerMode="none">
      <Stack.Screen
        name="Profile"
        //options={generateOptions('Profile', props)}
        component={ProfileScreen}
      />
      <Stack.Screen
        name={ROUTE_NAMES.MANAGE_ACCOUNTS_SCREEN}
        component={ManageAccountsScreen}
      />
    </Stack.Navigator>
  );
};

const WorkspacesStack = (props) => {
  return (
    <Stack.Navigator
      headerMode="screen"
      initialRouteName={ROUTE_NAMES.WORKSPACE_LIST}>
      <Stack.Screen
        name={ROUTE_NAMES.WORKSPACE_LIST}
        options={{title: '', header: () => null}}
        component={WorkspaceList}
        //component={DiscussionRoomsScreen}
      />
    </Stack.Navigator>
  );
};

const MessagesStack = (props) => {
  return (
    <Stack.Navigator
      headerMode="screen"
      initialRouteName={ROUTE_NAMES.MESSAGES}>
      <Stack.Screen
        name={ROUTE_NAMES.MESSAGES}
        options={generateOptions('All Messages', props)}
        component={MessageThreads}
      />
      <Stack.Screen
        name={ROUTE_NAMES.MESSAGES_DISCUSSION_ROOMS}
        options={generateOptions(ROUTE_NAMES.MESSAGES_DISCUSSION_ROOMS, props)}
        component={DiscussionRoomsScreen}
      />
    </Stack.Navigator>
  );
};

const MoreStack = (props) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="More"
        options={generateOptions('More', props)}
        component={MoreScreen}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  alignItemsFlexEndSelfCenter: {
    alignItems: 'flex-end',
    alignSelf: 'center',
    marginRight: 4,
  },
  cancel: {
    color: '#0D6EFD',
    fontSize: normalize(16),
    fontWeight: '500',
  },
  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  placeInCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  backgroundWhite: {backgroundColor: 'white'},
  colorBlack: {color: 'black'},
  colorHighlight: {color: '#0D6EFD'},
  marginTop: {marginTop: normalize(8.5)},
  close: {
    minHeight: 24,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardTitle: {
    paddingHorizontal: 10,
    marginRight: -16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customTabSafeArea: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.8,
    shadowRadius: 1.2,
    paddingBottom: normalize(10),
    elevation: 2,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabItem: {flex: 1, alignItems: 'center', marginTop: 13.5},
  alignItemsCenter: {
    alignItems: 'center',
  },
  backButton: {paddingRight: 0},
  drawer: {margin: -12, padding: 12, zIndex: 999},
  headerSearch: {
    flex: 1,
    fontSize: normalize(16),
    paddingTop: 0,
    paddingBottom: 0,
    marginBottom: 2,
    textAlignVertical: 'center',
    paddingHorizontal: 8,
  },
  mainHeader: {
    paddingHorizontal: 18,
    minHeight: 54,
    maxHeight: 60,
    paddingBottom: isAndroid ? 10 : 0,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#BDC1C6',
    borderBottomWidth: 0.7,
    borderBottomColor: '#BDC1C6',
    backgroundColor: 'white',
  },
  safeAreaStyle: {
    backgroundColor: 'white',
    paddingTop: isAndroid ? 10 : 0,
    paddingBottom: 0,
  },
  titleTextStyle: {
    lineHeight: normalize(24),
    fontWeight: 'bold',
    fontSize: normalize(19),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    textAlign: 'left',
    alignSelf: 'center',
    paddingLeft: 16,
    //minWidth: 200,
    flex: 1,
  },
  textStyle: {
    fontWeight: '500',
    fontSize: normalize(12),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
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
});

export {
  MoreStack,
  MessagesStack,
  WorkspacesStack,
  HomeStack,
  MeetingsStack,
  KnowledgeStack,
  ProfileStack,
};
