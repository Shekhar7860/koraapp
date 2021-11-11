import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import {DrawerContentScrollView} from '@react-navigation/drawer';
import {APP_NAME} from '../utils/AppConstants';
import {withTranslation} from 'react-i18next';
import {connect} from 'react-redux';
import {Icon} from '../components/Icon/Icon';
import {colors} from './../theme/colors';
import {getCurrentScreenName, navigate} from './NavigationService';
import * as Constants from '../components/KoraText';
import {BottomUpModal} from '../components/BottomUpModal';
import {ROUTE_NAMES} from './RouteNames';
import {
  getWorkSpaceList,
  setActiveWsId,
  getWsListLayout,
} from '../../shared/redux/actions/workspace.action';
import {RoomAvatar} from '../components/RoomAvatar';
import {normalize} from '../utils/helpers';
import {emptyArray} from '../../shared/redux/constants/common.constants';
import Accordion from 'react-native-collapsible/Accordion';
import database from '../realm';
import QuerySectionList from '../components/DrawerMenu/QuerySectionList';
import * as Entity from '../../native/realm/dbconstants';
import WorkspaceDBItem from '../screens/workspaces/DiscussionRoomsScreen/WorkspaceDBItem';
import {Q} from '@nozbe/watermelondb';

export const WorkspaceAssistLogo = React.memo(() => {
  return (
    <View style={styles.workAssistLogoStyle}>
      <Image
        source={require('../assets/WorkAssist.png')}
        style={styles.workAssistLogoStyle1}
      />
      <Text style={styles.workAssistLogoStyle2}>{APP_NAME}</Text>
    </View>
  );
});

const WorkspaceItem = React.memo(
  ({data, onPressWorkspace = () => {}, selected}) => {
    return (
      <TouchableOpacity
        key={data?.id}
        style={[
          styles.drawerMenuItem,
          styles.section2,
          //data?.logo ? {height: 50} : {height: 0},
          {
            marginLeft: -15,
            paddingLeft: 15,
            backgroundColor: selected ? '#EFF0F1' : '#fff',
          },
        ]}
        onPress={() => onPressWorkspace(data?.id)}>
        <View style={styles.menuItem2}>
          <RoomAvatar size={26} showCircle={false} boardIcon={data?.logo} />
        </View>
        <Text style={{...styles.text, marginLeft: 2}}>{data?.name?.trim()}</Text>
        {data?.iconName && (
          <View style={styles.iconName1}>
            <Icon name={data?.iconName} size={24} color="#9AA0A6" />
          </View>
        )}
      </TouchableOpacity>
    );
  },
);

const meetingOptions = [
  {
    id: 1,
    icon: 'More_Apps',
    name: 'All Events',
  },
  {
    id: 2,
    icon: 'Day_View',
    name: 'Meetings',
  },
  {
    id: 3,
    icon: 'Publish',
    name: 'Pending Events',
  },
  {
    id: 4,
    icon: 'Task',
    name: 'Tasks',
  },
  {
    id: 5,
    icon: 'history',
    name: 'Reminders',
  },
  {
    id: 6,
    icon: 'Notes',
    name: 'Meeting Notes',
  },
];

class DrawerMenu extends React.Component {
  constructor(props) {
    super(props);
    this.subscribeWorkspaces();
    this.newWSRef = React.createRef();
    this.timeOut = null;
  }

  state = {
    activeSections: emptyArray,
    menuSelectedState: null,
    workspacelist: emptyArray,
    activeWsId: '',
  };

  componentDidMount() {}

  componentWillUnmount() {
    clearTimeout(this.timeOut);
    if (this.wsSubscription && this.wsSubscription.unsubscribe) {
      this.wsSubscription.unsubscribe();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.workspacelist !== this.props.workspacelist) {
      this.setState({workspacelist: this.props.workspacelist});
    }
    if (prevProps.activeWsId !== this.props.activeWsId) {
      this.setState({activeWsId: this.props.activeWsId});
    }
  }

  get showAddWorkspace() {
    const currScreenName = getCurrentScreenName();
    return (
      currScreenName === ROUTE_NAMES.Workspaces ||
      currScreenName === ROUTE_NAMES.DISCUSSION_ROOMS
    );
  }

  handlePress = (element) => {
    this.props.setActiveWsId();
    if (element?.id === 7) {
      this.setState(
        {
          menuSelectedState: element.id,
        },
        () => navigate(ROUTE_NAMES.EVENTS, {contentType: 'All Events'}),
      );
    } else {
      this.setState(
        {
          menuSelectedState: element.id,
        },
        () =>
          navigate(ROUTE_NAMES.MESSAGES, {
            queryItem: element,
            id: element.id,
          }),
      );
    }
  };

  handleMeetingOptions = (element) => {
    return () =>
      this.setState({meetingSelectedState: element.id}, () =>
        navigate(ROUTE_NAMES.EVENTS, {contentType: element.name}),
      );
  };

  renderMeetingMenu = () => {
    const currScreenName = getCurrentScreenName();
    const isInMeetings = currScreenName === ROUTE_NAMES.EVENTS;
    let {meetingSelectedState} = this.state;
    if (isInMeetings && !meetingSelectedState) {
      meetingSelectedState = 1;
    }
    return meetingOptions.map((element) => {
      return (
        <TouchableOpacity
          key={element.id}
          style={[
            styles.meetView,
            {
              backgroundColor:
                meetingSelectedState === element.id ? '#EFF0F1' : 'white',
            },
          ]}
          onPress={this.handleMeetingOptions(element)}>
          <Icon
            name={element.icon}
            size={normalize(23)}
            color={colors.color_202124}
          />
          <Text
            style={[styles.text, {fontSize: normalize(18), color: '#202124'}]}>
            {' '}
            {element.name}{' '}
          </Text>
          <Text style={styles.number}>
            {element.value > 0 ? element.value : ''}
          </Text>
        </TouchableOpacity>
      );
    });
  };

  renderCalendars = () => {
    return (
      <View style={{padding: 10, marginLeft: 17, paddingVertical: 22}}>
        <TouchableOpacity
          style={[styles.drawerMenuItem, styles.drawerMenuItem2]}
          onPress={() => {}}>
          <Text style={styles.calendarTextStyle}>OTHER CALENDARS</Text>
          <Icon
            name="Plus_icon"
            size={normalize(25)}
            color={colors.color_202124}
          />
        </TouchableOpacity>
        <Text style={styles.drawerMenuItem3}>
          Add calendars to view events from your personal calendar or
          colleague's calendar
        </Text>
      </View>
    );
  };

  section1 = () => {
    const currScreenName = getCurrentScreenName();
    const isInMessages = currScreenName === ROUTE_NAMES.MESSAGES;
    let {menuSelectedState} = this.state;
    if (isInMessages && !menuSelectedState) {
      menuSelectedState = 1;
    } else if (currScreenName === ROUTE_NAMES.PROFILE) {
      menuSelectedState = null;
    }
    return (
      <QuerySectionList
        // database={database.active}
        handlePress={this.handlePress}
        menuSelectedState={menuSelectedState}
      />
    );
  };

  onPressWorkspace = (wsId) => {
    this.setState({menuSelectedState: wsId}, () => {
      this.props.setActiveWsId(wsId);
      this.props.navigation.navigate(ROUTE_NAMES.DISCUSSION_ROOMS);
    });
  };

  section2 = (list = emptyArray) => {
    const activeWsId = this.state.activeWsId;

    const currScreenName = getCurrentScreenName();
    return list.map((data) => {
      const selected =
        activeWsId === data?.id &&
        (currScreenName === ROUTE_NAMES.DISCUSSION_ROOMS ||
          currScreenName === ROUTE_NAMES.MESSAGES_DISCUSSION_ROOMS);
      if (data?.logo) {
        return (
          <WorkspaceItem
            key={data?.id}
            data={data}
            selected={selected}
            onPressWorkspace={this.onPressWorkspace}
          />
        );
      }
      return;
    });
  };

  inputWebUrl = () => {
    this.props.navigation.closeDrawer();
    navigate(ROUTE_NAMES.INPUT_URL, {});
  };

  renderWsModal() {
    const {t} = this.props;
    const options = [
      {
        id: 'create_new',
        icon: 'enter',
        name: t('Create New'),
      },
      {
        id: 'join_existing',
        icon: 'traits',
        name: t('Join Existing'),
      },
    ];
    const item = ({icon, name, id}) => {
      return (
        <TouchableOpacity
          onPress={() => {
            const route =
              id == 'create_new'
                ? ROUTE_NAMES.NEW_WORKSPACE
                : ROUTE_NAMES.JOIN_WORKSPACES;
            this.props.navigation.navigate(route);
            this.props.navigation.closeDrawer();
            this.newWSRef.current?.close();
          }}
          underlayColor="rgba(0,0,0,0.2)"
          style={styles.modalItem}>
          <>
            <Icon name={icon} size={21} />
            <Text style={[styles.modalTextStyle, {marginLeft: 15}]}>
              {name}
            </Text>
          </>
        </TouchableOpacity>
      );
    };
    return (
      <BottomUpModal height={150} expandable={true} ref={this.newWSRef}>
        <View style={{height: 15}} />
        {item(options[0])}
        {item(options[1])}
        <View style={{height: 40}} />
      </BottomUpModal>
    );
  }

  _renderHeader = (section) => {
    let index = this.state.activeSections[0];
    let groupName = this.props.sections[index]?.name;
    return (
      <View style={styles.header}>
        {groupName === section?.name ? (
          <Icon name="Dropdown_Down" size={21} />
        ) : (
          <Icon name="Right_Arrow" size={21} />
        )}
        <Text style={styles.headerText}>{section.name}</Text>
      </View>
    );
  };

  _renderContent = (section) => {
    return (
      <View
        style={{
          marginLeft: 20,
          borderLeftColor: '#BDC1C6',
          borderLeftWidth: 1,
        }}>
        {section?.so?.map((item) => {
          return (
            <WorkspaceDBItem
              id={item?.id}
              fromMenu={true}
              onPressWorkspace={this.onPressWorkspace}
            />
          );
        })}
      </View>
    );
  };

  subscribeWorkspaces = () => {
    try {
      if (this.wsSubscription && this.wsSubscription.unsubscribe) {
        this.wsSubscription.unsubscribe();
      }
      const whereClause = [Q.experimentalSortBy('modifiedDate', Q.desc)];
     /* 
      const boards = await boardsCollection.query(...whereClause) */
      const db = database.active;
      this.wsObservable = db.collections
        .get(Entity.Workspaces)
        .query(...whereClause)
        .observeWithColumns(['updated_at']);
      this.wsSubscription = this.wsObservable.subscribe((workspaces) => {
        this.setState({workspacelist: workspaces});
      });
    } catch (e) {
      console.log('error in subscribeWorkspaces', e);
    }
  };

  render() {
    // console.log('=================DrawerMenu.js================');
    const currScreenName = getCurrentScreenName();
    return (
      <SafeAreaView style={styles.defaultStyle3}>
        <WorkspaceAssistLogo />
        <DrawerContentScrollView contentContainerStyle={styles.defaultStyle2}>
          {/* {currScreenName === ROUTE_NAMES.EVENTS ? (
            <View style={styles.defaultStyle}>
              {this.renderMeetingMenu()}
              {this.renderCalendars()}
            </View>
          ) : ( */}
          <View style={styles.defaultStyle1}>
            {(currScreenName === ROUTE_NAMES.MESSAGES ||
              currScreenName === ROUTE_NAMES.MESSAGES_DISCUSSION_ROOMS ||
              currScreenName === ROUTE_NAMES.EVENTS ||
              currScreenName === ROUTE_NAMES.PROFILE) &&
              this.section1()}

            <View style={styles.drawerMenuItemParent}>
              <View style={[styles.drawerMenuItem, styles.addWorkSpace]}>
                <Text style={styles.workspacesTextStyle}>
                  {!this.showAddWorkspace
                    ? 'WORKSPACES'
                    : 'FILTER BY WORKSPACES'}
                </Text>
                {this.showAddWorkspace && (
                  <View>
                    <Icon
                      name="Plus_icon"
                      size={normalize(25)}
                      color={colors.color_202124}
                    />
                  </View>
                )}
              </View>
              <Accordion
                touchableComponent={TouchableOpacity}
                sections={this.props.sections}
                activeSections={this.state.activeSections}
                renderHeader={this._renderHeader}
                renderContent={this._renderContent}
                onChange={(activeSections) => {
                  this.setState({activeSections: [...activeSections]});
                }}
              />
              {this.section2(this.state.workspacelist)}
            </View>
          </View>
        </DrawerContentScrollView>
        {this.renderWsModal()}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  drawerMenuItem: {
    paddingVertical: 10,
  },
  defaultStyle: {
    paddingTop: 0,
  },
  defaultStyle1: {paddingHorizontal: 10},
  defaultStyle2: {
    paddingTop: 8,
    backgroundColor: 'white',
  },
  defaultStyle3: {flex: 1},
  drawerMenuItemParent: {paddingLeft: 16},
  addWorkSpace: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    marginRight: 23,
    marginLeft: 10,
    justifyContent: 'space-between',
  },
  drawerMenuItem2: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    marginRight: 10,
    justifyContent: 'space-between',
  },
  drawerMenuItem3: {
    fontSize: normalize(18),
    color: '#9AA0A6',
    letterSpacing: 1.5,
  },
  menuItem2: {
    minWidth: normalize(42),
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: normalize(16),
    marginTop: 3,
    fontWeight: 'bold',
  },
  caption: {
    fontWeight: '400',
    fontSize: normalize(14),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    lineHeight: 14,
  },
  number: {
    fontWeight: '400',
    fontSize: normalize(15.5),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    alignSelf: 'center',
    alignContent: 'flex-end',
    flex: 1.5,
  },
  section1: {
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 5,
  },
  section11: {
    width: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section2: {
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 5,
  },
  text: {
    flex: 7,
    marginLeft: 8.5,
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  iconName1: {width: 18, height: 18, marginRight: 18},
  logout: {
    flexDirection: 'row',
    marginLeft: 30,
    alignItems: 'center',
    marginBottom: 25,
  },
  workspacesTextStyle: {
    fontWeight: '400',
    fontSize: normalize(14),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#5F6368',
    letterSpacing: 1.5,
  },
  calendarTextStyle: {
    fontWeight: '600',
    fontSize: normalize(14),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#202124',
    letterSpacing: 1.5,
  },
  footerItemTextStyle: {
    fontWeight: '400',
    fontSize: normalize(18),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    marginLeft: 0,

    textAlignVertical: 'center',
  },
  signoutStyle: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginRight: 13,
  },
  signoutStyle1: {marginLeft: 7, marginTop: 10, justifyContent: 'center'},
  modalTextStyle: {
    fontWeight: '400',
    fontSize: normalize(16),
    lineHeight: 19,
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  signoutStyle2: {
    borderTopWidth: 0.4,
    borderColor: '#9AA0A6',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    marginVertical: 1.5,
    paddingHorizontal: 15,
    marginHorizontal: 1.5,
    borderRadius: 4,
  },
  workAssistLogoStyle: {
    flexDirection: 'row',
    paddingTop: 12,
    alignItems: 'center',
    paddingBottom: 12,
    paddingLeft: 40,
    borderBottomWidth: 0.4,
    borderColor: '#9AA0A6',
  },
  workAssistLogoStyle1: {
    width: 22,
    height: 22,
    marginRight: 8,
  },
  workAssistLogoStyle2: {
    fontWeight: '700',
    fontSize: normalize(25),
  },
  meetView: {
    paddingVertical: 15,
    marginHorizontal: 10,
    flexDirection: 'row',
    borderRadius: 5,
    paddingLeft: 22.6,
  },
  header: {
    flexDirection: 'row',
    paddingLeft: 10,
    marginVertical: 13,
    borderRadius: 4,
  },
  headerText: {
    marginLeft: 15,
    fontSize: normalize(16),
    fontWeight: '600',
    color: '#202124',
  },
});

const mapStateToProps = (state) => {
  const {workspace, sync} = state;
  let wsSections = [];
  const {sections} = workspace;

  Object.keys(sections?.groups || {})?.map((r) => {
    wsSections.push({...sections?.groups[r], id: r});
  });
  return {
    workspacelist: workspace.workspacelist?.ws || emptyArray,
    activeWsId: workspace.activeWsId,
    sections: wsSections,
    syncCompleted: sync.syncCompleted,
  };
};

export default connect(mapStateToProps, {
  getWorkSpaceList,
  setActiveWsId,
  getWsListLayout,
})(withTranslation()(DrawerMenu));
