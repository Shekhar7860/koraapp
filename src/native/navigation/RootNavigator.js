import React, {Component} from 'react';
import {
  Dimensions,
  SafeAreaView,
  View,
  Text,
  StatusBar,
  TouchableOpacityBase,
} from 'react-native';
import {horizontalAnimation} from '../utils/animations';
import VectorIcon from 'react-native-vector-icons/Ionicons';
import {createStackNavigator} from '@react-navigation/stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {isAndroid} from '../utils/PlatformCheck';
import Main from './Main';
import CustomBottomTabBar from './CustomBottomTabBar'
import SplashScreen from '../screens/SplashScreen';
import WorkAssistLogin from '../login/WorkAssistLogin';
import WorkAssistSSOLogin from '../login/WorkAssistSSOLogin';
import {ChatScreen} from '../screens/ChatScreen';
import {NewDiscussionScreen} from '../screens/NewDiscussion';
const DiscussionScreen = NewDiscussionScreen;
import ContactDetailsScreen from '../screens/ContactDetailsScreen';
import GroupDetailsScreen from '../screens/GroupDetailsScreen';
import searchFilter from '../screens/searchFilter';
import ScheduleMeeting from '../screens/Meetings/NewMeeting/scheduleMeeting';
import MeetDetails from '../screens/Meetings/MeetDetails/details';
import DocComments from '../screens/Knowledge/docComments';
import DocCommentReply from '../screens/Knowledge/docCommentReply';
import ViewFiles from '../screens/viewFiles';
import FileDetails from '../screens/fileDetails';
import fileSearchFilter from '../screens/FileSearchFilter';
import GroupDetailsEditScreen from '../screens/GroupDetailsScreen/GroupDetailsEdit';
import DrawerMenu from './DrawerMenu';
import Findly from '../screens/findly/Findly';
import WorkspaceSettings from '../screens/workspaces/ManageWorkspaces/Settings';
const screenWidth = Math.round(Dimensions.get('window').width);
import MediaPreview from './../screens/ChatScreen/MediaPreview';
import ImagePreview from './../screens/ChatScreen/ImagePreview';
import ChatMediaView from './../screens/ChatScreen/ChatMediaView';
import {ROUTE_NAMES} from './RouteNames';
import {AddParticipentsScreen} from '../screens/GroupDetailsScreen/AddParticipentsScreen';
import ForwardMessageScreen from '../components/Chat/ForwardMessag';
import GroupdMessageScreen from '../components/Chat/CreateGroup';
import DiscussionPostsScreen from '../screens/workspaces/DiscussionPostsScreen';
import RoomDetails from '../screens/workspaces/DiscussionRoomDetails';
import EmailDetails from '../components/PostsComponent/EmailDetails';
import RoomDetailsEdit from '../screens/workspaces/DiscussionRoomDetails/RoomDetailsEdit';
import PostViaEmail from '../screens/workspaces/DiscussionRoomDetails/PostViaEmail';
import AddExceptionScreen from '../screens/NewDiscussion/AddException';
import InputUrlViewScreen from '../screens/web/InputUrlViewScreen';
import WebViewScreen from '../screens/web/WebViewScreen';
import CommentSection from '../components/PostsComponent/CommentSection';
import ForwardPostScreen from '../screens/ForwardPostScreen';
import {EditPostScreen} from '../screens/EditPost';
import UniversalSearchView from '../../native/screens/ChatsThreadScreen/UniversalSearchView';
import AddParticipants from '../screens/workspaces/DiscussionRoomDetails/AddParticipantsPost';
import Members from '../screens/workspaces/DiscussionRoomDetails/Members';
import AddParticipantsPost from '../screens/workspaces/DiscussionRoomDetails/AddParticipantsPost';
import styles from '../components/Library/react-native-swipeout/src/styles';
import NewWorskpaces from '../screens/workspaces/NewWorkspaces/index';
import VisibilityScreen from '../screens/workspaces/NewWorkspaces/VisibilityScreen';
import FromScratchScreen from '../screens/workspaces/NewWorkspaces/FromScratchScreen';
import BackButton from '../components/BackButton';
import {normalize} from '../utils/helpers';
import JoinWorkspaces from '../screens/workspaces/JoinWorkspaces';
import DetailedWorkspace from '../screens/workspaces/JoinWorkspaces/DetailedWorkspaceScreen';
import AddParticipantsForwardPostScreen from '../screens/ForwardPostScreen/AddParticipantsForwardPostScreen';
import KoraViewMore from '../screens/findly/views/viewMore/ViewMore';
import KoraFormActions from '../screens/findly/views/PickSlotFormActions';
import TasksViewMore from '../screens/findly/views/viewMore/TasksViewMore';
import EmailsViewMore from '../screens/findly/views/viewMore/EmailsViewMore';
import FilesViewMore from '../screens/findly/views/viewMore/FilesViewMore';
import WebViewDiscussionComponent from '../screens/workspaces/WebViewComponent';
import FormTableView from '../screens/workspaces/FormTableView';
import KoraNotifications from '../screens/findly/views/KoraNotifications';
import ArticlesViewMore from '../screens/findly/views/viewMore/ArticlesViewMore';
import AnnouncementViewMore from '../screens/findly/views/viewMore/AnnouncementViewMore';
import ManageWorkspaceScreen from '../screens/workspaces/ManageWorkspaces';
import ManageWorkspaceMember from '../screens/workspaces/ManageWorkspaces/Members';
import InviteMemberScreen from '../screens/workspaces/ManageWorkspaces/Invite';
import CreateWorkspace from '../screens/NewDiscussion/createWorkspace';
import WorkspaceMembersScreen from '../screens/NewDiscussion/WorkspaceMembers';
import AppLandingScreen from '../screens/PreLoginScreens/AppLandingScreen';
import LoginHome from '../screens/PreLoginScreens/LoginHome';
import SignUpWithEmail from '../screens/PreLoginScreens/SignUpWithEmail';
import SignUpWithPassword from '../screens/PreLoginScreens/SignUpWithPassword';
import SignUpEmailVerifivation from '../screens/PreLoginScreens/SignUpEmailVerifivation';
import SignUpWithSSO from '../screens/PreLoginScreens/SignUpWithSSO';
import LoginWithEmail from '../screens/PreLoginScreens/LoginWithEmail';
import ForgotPassword from '../screens/PreLoginScreens/ForgotPassword';
import ForgotPasswordSentScreen from '../screens/PreLoginScreens/ForgotPasswordSentScreen';
import ResetPassword from '../screens/PreLoginScreens/ResetPassword';
import AccountSelectionScreen from '../screens/PreLoginScreens/AccountSelectionScreen';

import PostSignUpHome from '../screens/PostSignUpScreens/PostSignUpHome';
import PostSignUpSelectionOne from '../screens/PostSignUpScreens/PostSignUpSelectionOne';
import JoinAccount from '../screens/PostSignUpScreens/JoinAccount';
import BrowseAccounts from '../screens/PostSignUpScreens/BrowseAccounts';
import PostSignUpSelectionTwo from '../screens/PostSignUpScreens/PostSignUpSelectionTwo';
import PostSignUpScreenThree from '../screens/PostSignUpScreens/PostSignUpScreenThree';
import ColorSelectionScreen from '../screens/PostSignUpScreens/ColorSelectionScreen';
import ContactInviteeScreen from '../screens/PostSignUpScreens/ContactInviteeScreen';
import WelComeScreen from '../screens/PostSignUpScreens/WelComeScreen';
import WorkspaceList from '../screens/workspaces/WorkspaceList';
import ListViewMore from '../screens/findly/views/viewMore/ListViewMore';
import RequestAccessScreen from '../screens/PostSignUpScreens/RequestAccessScreen';
import TabScreen from '../screens/TabScreen'
import DiscussionRoomsScreen from '../screens/workspaces/DiscussionRoomsScreen';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const Header = React.memo((props) => {
  return (
    <SafeAreaView
      style={{
        backgroundColor: 'white',
        paddingTop: isAndroid ? StatusBar.currentHeight : 0,
      }}>
      <View style={styles.rootNavigator1}>
        <VectorIcon
          color="#292929"
          name="md-chevron-back-sharp"
          style={styles.rootNavigator2}
          onPress={() => props.navigation.goBack()}
          size={30}
        />
        <Text style={styles.titleTextStyle}>{props.title}</Text>
      </View>
    </SafeAreaView>
  );
});

const generateOptions = (title) => {
  return {
    title: title,
    header: (props) => <Header navigation={props.navigation} title={title} />,
  };
};

const LoginStackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName={ROUTE_NAMES.SPLASH} headerMode="none">
      <Stack.Screen name={ROUTE_NAMES.SPLASH} component={SplashScreen} />
      <Stack.Screen
        name={ROUTE_NAMES.APP_LANDING_SCREEN}
        component={AppLandingScreen}
      />

      <Stack.Screen
        name={ROUTE_NAMES.LOGIN_HOME}
        component={LoginHome}
        options={horizontalAnimation}
      />

      <Stack.Screen
        name={ROUTE_NAMES.SIGN_UP_WITH_EMAIL}
        component={SignUpWithEmail}
        options={horizontalAnimation}
      />
      <Stack.Screen
        name={ROUTE_NAMES.SIGN_UP_PASSWORD}
        component={SignUpWithPassword}
        options={horizontalAnimation}
      />
      <Stack.Screen
        name={ROUTE_NAMES.SIGN_UP_EMAIL_VERIFICATION}
        component={SignUpEmailVerifivation}
        options={horizontalAnimation}
      />
      <Stack.Screen
        name={ROUTE_NAMES.SIGN_UP_SSO}
        component={SignUpWithSSO}
        options={horizontalAnimation}
      />

      <Stack.Screen
        name={ROUTE_NAMES.LOGIN_WITH_EMAIL}
        component={LoginWithEmail}
        options={horizontalAnimation}
      />
      <Stack.Screen
        name={ROUTE_NAMES.FORGOT_PASSWORD}
        component={ForgotPassword}
        options={horizontalAnimation}
      />
      <Stack.Screen
        name={ROUTE_NAMES.FORGOT_PASSWORD_SENT_SCREEN}
        component={ForgotPasswordSentScreen}
        options={horizontalAnimation}
      />
      <Stack.Screen
        name={ROUTE_NAMES.RESET_PASSWORD}
        component={ResetPassword}
        options={horizontalAnimation}
      />

      <Stack.Screen
        name={ROUTE_NAMES.SELECT_ACCOUNT_SCREEN}
        component={AccountSelectionScreen}
        options={horizontalAnimation}
      />

      <Stack.Screen
        name={ROUTE_NAMES.LOGIN}
        component={WorkAssistLogin}
        options={horizontalAnimation}
      />
      <Stack.Screen
        name={ROUTE_NAMES.WorkAssistSSOLogin}
        component={WorkAssistSSOLogin}
        options={horizontalAnimation}
      />
    </Stack.Navigator>
  );
};

//Start point of navigation
const RootNavigator = () => {
  return (
    <Stack.Navigator headerMode="none" initialRouteName={ROUTE_NAMES.LOGIN}>
      <Stack.Screen name={ROUTE_NAMES.LOGIN} component={LoginStackNavigator} />
      <Stack.Screen
        name={ROUTE_NAMES.POST_SIGN_UP_HOME}
        component={AfterSignUpNavigator}
      />
      <Stack.Screen
        name={ROUTE_NAMES.WELCOME_SCREEN}
        component={WelComeScreen}
      />
      <Stack.Screen name={ROUTE_NAMES.MAIN} component={DrawerNavigator} />
    </Stack.Navigator>
  );
};

const AfterSignUpNavigator = () => {
  return (
    <Stack.Navigator
      headerMode="none"
      initialRouteName={ROUTE_NAMES.POST_SIGN_UP_HOME}>
      <Stack.Screen
        name={ROUTE_NAMES.POST_SIGN_UP_HOME}
        options={horizontalAnimation}
        component={PostSignUpHome}
      />
      <Stack.Screen
        name={ROUTE_NAMES.POST_SIGN_UP_SELECTION_ONE}
        options={horizontalAnimation}
        component={PostSignUpSelectionOne}
      />
      <Stack.Screen
        name={ROUTE_NAMES.JOIN_ACCOUNT}
        options={horizontalAnimation}
        component={JoinAccount}
      />
      <Stack.Screen
        name={ROUTE_NAMES.BROWSE_ACCOUNT}
        options={horizontalAnimation}
        component={BrowseAccounts}
      />
      <Stack.Screen
        name={ROUTE_NAMES.REQUEST_ACCESS_SCREEN}
        options={horizontalAnimation}
        component={RequestAccessScreen}
      />
      <Stack.Screen
        name={ROUTE_NAMES.POST_SIGN_UP_SELECTION_TWO}
        options={horizontalAnimation}
        component={PostSignUpSelectionTwo}
      />
      <Stack.Screen
        name={ROUTE_NAMES.POST_SIGN_UP_SELECTION_THREE}
        options={horizontalAnimation}
        component={PostSignUpScreenThree}
      />
      <Stack.Screen
        name={ROUTE_NAMES.COLOR_SELECTION_SCREEN}
        options={horizontalAnimation}
        component={ColorSelectionScreen}
      />
      <Stack.Screen
        name={ROUTE_NAMES.CONTACT_INVITEE_SCREEN}
        options={horizontalAnimation}
        component={ContactInviteeScreen}
      />
    </Stack.Navigator>
  );
};

const NewWorkspacesNavigator = (props) => {
  return (
    <Stack.Navigator headerMode="none">
      <Stack.Screen
        name={ROUTE_NAMES.NEW_WORKSPACE}
        component={NewWorskpaces}
      />
      <Stack.Screen
        name={ROUTE_NAMES.FROM_SCRATCH}
        component={FromScratchScreen}
      />
      <Stack.Screen
        name={ROUTE_NAMES.VISIBILITY}
        component={VisibilityScreen}
      />
    </Stack.Navigator>
  );
};

const FindlyNavigator = (props) => {
  return (
    <Stack.Navigator>
      <Stack.Screen name={'Test'} component={Findly} /> 
    
      <Stack.Screen
        name={ROUTE_NAMES.KORA_NOTIFICATIONS}
        options={{
          title: 'Notifications',
        }}
        headerBackTitle=""
        component={KoraNotifications}
      />
      <Stack.Screen
        name={ROUTE_NAMES.KORA_VIEW_MORE}
        options={{
          title: '',
        }}
        headerBackTitle=""
        component={KoraViewMore}
      />
      <Stack.Screen
        name={ROUTE_NAMES.ARTICLES_VIEWMORE}
        options={{
          title: '',
        }}
        headerBackTitle=""
        component={ArticlesViewMore}
      />
      <Stack.Screen
        name={ROUTE_NAMES.ANNOUNCEMENT_VIEWMORE}
        options={{
          title: '',
        }}
        headerBackTitle=""
        component={AnnouncementViewMore}
      />

      <Stack.Screen
        name={ROUTE_NAMES.KORA_FORM_ACTIONS}
        options={{
          title: '',
        }}
        headerBackTitle=""
        component={KoraFormActions}
      />
      <Stack.Screen
        name={ROUTE_NAMES.KORA_TASKS_VIEW_MORE}
        options={{
          title: '',
        }}
        headerBackTitle=""
        component={TasksViewMore}
      />
      <Stack.Screen
        name={ROUTE_NAMES.KORA_EMAILS_VIEW_MORE}
        options={{
          title: '',
        }}
        headerBackTitle=""
        component={EmailsViewMore}
      />
      <Stack.Screen
        name={ROUTE_NAMES.FILES_SEARCH_VIEW_MORE}
        options={{
          title: '',
        }}
        headerBackTitle=""
        component={FilesViewMore}
      />
      <Stack.Screen
        name={ROUTE_NAMES.LIST_VIEW_MORE}
        options={{
          title: '',
        }}
        headerBackTitle=""
        component={ListViewMore}
      />
    </Stack.Navigator>
  );
};

const drawerContent = (props) => <DrawerMenu {...props} />;

const DrawerNavigator = (props) => {
  return (
    // <SafeAreaView>
    <Drawer.Navigator
      drawerStyle={{
        backgroundColor: '#FFF',
        width: screenWidth - 78,
      }}
      hideStatusBar={isAndroid ? false : true}
      statusBarAnimation={'fade'}
      drawerType="slide"
      drawerContent={drawerContent}
      edgeWidth={100}>
      <Drawer.Screen name={ROUTE_NAMES.MAIN} component={AuthStackNavigator} />
    </Drawer.Navigator>
    // </SafeAreaView>
  );
};

//Post auth screens
const AuthStackNavigator = (props) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={ROUTE_NAMES.MAIN}
        options={{
          headerShown: false,
          title: 'Main',
        }}
        component={Main}
      />
      <Stack.Screen
        name={ROUTE_NAMES.CHAT}
        options={{
          title: '',
          headerShown: false,
          headerLeft: () => (
            <BackButton
              onPress={() => props.navigation.goBack()}
              appendStyles={{paddingLeft: 10}}
              color="#292929"
            />
          ),
          headerRight: () => (
            <BackButton
              onPress={() => props.navigation.goBack()}
              appendStyles={{paddingLeft: 10}}
              color="#292929"
            />
          ),
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#292929',
          headerTitleStyle: {
            fontStyle: 'bold',
          },
          headerTitleAlign: 'left',
        }}
        component={ChatScreen}
      />
      <Stack.Screen
        name={ROUTE_NAMES.DISCUSSION_ROOMS}
        options={{
          title: ROUTE_NAMES.DISCUSSION_ROOMS,
          headerShown: false,
        }}
        // component={WorkspaceList}
        component={DiscussionRoomsScreen}
      />
      <Stack.Screen
        name={ROUTE_NAMES.REPLY_PRIVATE_CHAT}
        options={{
          title: '',
          headerShown: false,
          headerLeft: () => (
            <BackButton
              onPress={() => props.navigation.goBack()}
              appendStyles={{paddingLeft: 10}}
              color="#292929"
            />
          ),
          headerRight: () => (
            <BackButton
              onPress={() => props.navigation.goBack()}
              appendStyles={{paddingLeft: 10}}
              color="#292929"
            />
          ),
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#292929',
          headerTitleStyle: {
            fontStyle: 'bold',
          },
          headerTitleAlign: 'left',
        }}
        component={ChatScreen}
      />
      <Stack.Screen
        name={ROUTE_NAMES.NEW_DISCUSSION}
        options={{
          title: '',
          headerShown: false,
          headerLeft: () => (
            <BackButton
              onPress={() => props.navigation.goBack()}
              appendStyles={{paddingLeft: 10}}
              color="#292929"
            />
          ),
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#292929',
          headerTitleStyle: {
            fontStyle: 'bold',
          },
          headerTitleAlign: 'left',
        }}
        component={DiscussionScreen}
      />
      <Stack.Screen
        name={ROUTE_NAMES.CREATE_WORKSPACE}
        options={{
          title: '',
          headerShown: false,
        }}
        component={CreateWorkspace}
      />
      <Stack.Screen
        name={ROUTE_NAMES.ADD_EXCEPTIONS}
        options={{
          title: '',
          headerShown: false,
          headerLeft: () => (
            <BackButton
              onPress={() => props.navigation.goBack()}
              appendStyles={{paddingLeft: 10}}
              color="#292929"
            />
          ),
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#292929',
          headerTitleStyle: {
            fontFamily: 'bold',
          },
          headerTitleAlign: 'left',
        }}
        component={AddExceptionScreen}
      />
      <Stack.Screen
        name={ROUTE_NAMES.CONTACT_DETAILS}
        options={{
          title: '',
          headerShown: false,
        }}
        component={ContactDetailsScreen}
      />
      <Stack.Screen
        name={ROUTE_NAMES.GROUP_DETAILS}
        headerMode="none"
        options={{
          headerShown: false,
        }}
        component={GroupDetailsScreen}
      />
      <Stack.Screen
        name={ROUTE_NAMES.GROUP_DETAILS_EDIT}
        headerMode="none"
        options={{
          headerShown: false,
        }}
        component={GroupDetailsEditScreen}
      />
      <Stack.Screen
        name={ROUTE_NAMES.DISCUSSION_WEBVIEW}
        headerMode="none"
        options={{
          headerShown: false,
        }}
        component={WebViewDiscussionComponent}
      />
      <Stack.Screen
        name={ROUTE_NAMES.TABLE_ROW_EDIT}
        headerMode="none"
        options={{
          headerShown: false,
        }}
        component={FormTableView}
      />
      <Stack.Screen
        name={ROUTE_NAMES.ADD_PARTICIPENTS}
        options={{
          headerShown: false,
          title: 'Media Preview',
          headerLeft: () => (
            <BackButton
              onPress={() => props.navigation.goBack()}
              appendStyles={{paddingLeft: 10}}
              color="white"
            />
          ),

          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#292929',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'left',
        }}
        component={AddParticipentsScreen}
      />
      <Stack.Screen
        name={ROUTE_NAMES.ADD_PARTICIPANTS_POSTS}
        options={{
          headerShown: false,
          title: 'Media Preview',
          headerLeft: () => (
            <BackButton
              onPress={() => props.navigation.goBack()}
              appendStyles={{paddingLeft: 10}}
              color="white"
            />
          ),
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#292929',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'left',
        }}
        component={AddParticipantsPost}
      />
      <Stack.Screen
        name={ROUTE_NAMES.ADD_PARTICIPANTS_FORWARD_POSTS}
        options={{
          headerShown: false,
          title: 'Media Preview',
          headerLeft: () => (
            // <VectorIcon
            //   style={{ paddingLeft: 10 }}
            //   color="white"
            //   name="md-chevron-back-sharp"
            //   onPress={() => props.navigation.goBack()}
            //   size={30}
            // />
            <BackButton
              onPress={() => props.navigation.goBack()}
              appendStyles={{paddingLeft: 10}}
              color="white"
            />
          ),
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#292929',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'left',
        }}
        component={AddParticipantsForwardPostScreen}
      />
      <Stack.Screen
        name={ROUTE_NAMES.MEDIA_PREVIEW}
        options={{
          headerShown: false,
          title: 'Media Preview',
        }}
        component={MediaPreview}
      />
      <Stack.Screen
        name={ROUTE_NAMES.DISCUSSION}
        options={{
          headerShown: false,
          title: 'Room Header',
          headerLeft: () => (
            <BackButton
              onPress={() => props.navigation.goBack()}
              appendStyles={{paddingLeft: 10}}
              color="white"
            />
          ),
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#292929',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'left',
        }}
        component={DiscussionPostsScreen}
      />
      <Stack.Screen
        name={ROUTE_NAMES.FORWARD_POST}
        options={{
          headerShown: false,
          title: 'Forward Post',
          headerLeft: () => (
            <BackButton
              onPress={() => props.navigation.goBack()}
              appendStyles={{paddingLeft: 10}}
              color="white"
            />
          ),
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#292929',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'left',
        }}
        component={ForwardPostScreen}
      />
      <Stack.Screen
        name={ROUTE_NAMES.COMMENT_SECTION}
        options={{
          headerShown: false,
          headerLeft: () => (
            <BackButton
              onPress={() => props.navigation.goBack()}
              appendStyles={{paddingLeft: 10}}
              color="white"
            />
          ),
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#292929',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'left',
        }}
        component={CommentSection}
      />
      <Stack.Screen
        name={ROUTE_NAMES.ROOM_DETAILS}
        options={{
          headerShown: false,
          title: 'Manage Room',
          headerLeft: () => (
            <BackButton
              onPress={() => props.navigation.goBack()}
              appendStyles={{paddingLeft: 10}}
              color="white"
            />
          ),
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#292929',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'left',
        }}
        component={RoomDetails}
      />
      <Stack.Screen
        name={ROUTE_NAMES.EMAIL_DETAILS}
        options={{
          headerShown: false,
          title: 'Email Details',
          headerLeft: () => (
            <BackButton
              onPress={() => props.navigation.goBack()}
              appendStyles={{paddingLeft: 10}}
              color="white"
            />
          ),
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#292929',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'left',
        }}
        component={EmailDetails}
      />
      <Stack.Screen
        name={ROUTE_NAMES.ROOM_DETAILS_EDIT}
        options={{
          headerShown: false,
          title: 'Manage Room',
          headerLeft: () => (
            <BackButton
              onPress={() => props.navigation.goBack()}
              appendStyles={{paddingLeft: 10}}
              color="white"
            />
          ),
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#292929',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'left',
        }}
        component={RoomDetailsEdit}
      />
      <Stack.Screen
        name={ROUTE_NAMES.ADD_PARTICIPANTS}
        options={{
          title: 'Add People',
          headerShown: false,
          headerLeft: () => (
            <BackButton
              onPress={() => props.navigation.goBack()}
              appendStyles={{paddingLeft: 10}}
              color="white"
            />
          ),

          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#292929',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'left',
        }}
        component={AddParticipants}
      />
      <Stack.Screen
        name={ROUTE_NAMES.MEMBERS}
        options={{
          title: 'Members',
          headerShown: false,
          headerLeft: () => (
            <BackButton
              onPress={() => props.navigation.goBack()}
              appendStyles={{paddingLeft: 10}}
              color="white"
            />
          ),

          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#292929',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'left',
        }}
        component={Members}
      />
      <Stack.Screen
        name={ROUTE_NAMES.POST_VIA_EMAIL}
        options={{
          headerShown: false,
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#292929',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'left',
        }}
        component={PostViaEmail}
      />
      <Stack.Screen
        name={ROUTE_NAMES.CHAT_MEDIA_VIEW}
        options={{
          title: 'Media View',
          headerLeft: () => (
            <BackButton
              onPress={() => props.navigation.goBack()}
              appendStyles={{marginLeft: 10}}
              color="white"
            />
          ),

          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#292929',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'left',
        }}
        component={ChatMediaView}
      />
      <Stack.Screen
        name={ROUTE_NAMES.UNIVERSAL_SEARCH}
        options={{
          headerShown: false,
          title: '',
          headerLeft: () => (
            <BackButton
              onPress={() => props.navigation.goBack()}
              appendStyles={{paddingLeft: 10}}
              color="white"
            />
          ),
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#292929',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'left',
        }}
        component={UniversalSearchView}
      />
      <Stack.Screen
        name={ROUTE_NAMES.IMAGE_PREVIEW}
        options={{
          title: 'Image Preview',
          headerLeft: () => (
            <BackButton
              onPress={() => props.navigation.goBack()}
              appendStyles={{paddingLeft: 10}}
              color="white"
            />
          ),

          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#292929',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'left',
        }}
        component={ImagePreview}
      />
      <Stack.Screen
        name={ROUTE_NAMES.FORWARD_MESSAGE}
        options={{
          headerShown: false,
          title: 'Media Preview',
          headerLeft: () => (
            <BackButton
              onPress={() => props.navigation.goBack()}
              appendStyles={{paddingLeft: 10}}
              color="white"
            />
          ),

          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#292929',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'left',
        }}
        component={ForwardMessageScreen}
      />
      <Stack.Screen
        name={ROUTE_NAMES.FILE_DETAILS}
        options={{
          headerShown: false,

          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#292929',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'left',
        }}
        component={FileDetails}
      />
      <Stack.Screen
        name={ROUTE_NAMES.FILES_SEARCH_FILTER}
        options={{
          headerShown: false,

          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#292929',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'left',
        }}
        component={fileSearchFilter}
      />
      {/* <Stack.Screen
        name={ROUTE_NAMES.CREATE_GROUP}
        options={{
          headerShown: false,
          title: 'Create Group',
          headerLeft: () => (
            // <VectorIcon
            //   style={{ paddingLeft: 10 }}
            //   color="white"
            //   name="md-chevron-back-sharp"
            //   onPress={() => props.navigation.goBack()}
            //   size={30}
            // />
            <BackButton
              onPress={() => props.navigation.goBack()}
              appendStyles={{paddingLeft: 10}}
              color="white"
            />
          ),

          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#292929',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'left',
        }}
        component={GroupdMessageScreen}
      /> */}
      {/* <Stack.Screen
        name={ROUTE_NAMES.FORWARD_MESSAGE}
        options={{
          headerShown: false,
          title: 'Forward',
          headerLeft: () => (
            <VectorIcon
              style={{ paddingLeft: 10 }}
              color="white"
              name="md-chevron-back-sharp"
              onPress={() => props.navigation.goBack()}
              size={30}
            />
          ),

          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#292929',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'left',
        }}
        component={ForwardMessageScreen}
      /> */}
      <Stack.Screen
        name={ROUTE_NAMES.INPUT_URL}
        options={{
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#292929',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
        component={InputUrlViewScreen}
      />
      <Stack.Screen
        name={ROUTE_NAMES.EDIT_POST}
        options={{
          headerShown: false,
        }}
        component={EditPostScreen}
      />
      <Stack.Screen
        name={ROUTE_NAMES.WEBVIEW}
        options={{
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#292929',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
        component={WebViewScreen}
      />
      <Stack.Screen
        name={ROUTE_NAMES.FILTER}
        options={{
          headerShown: false,
          title: 'Filters',
          headerLeft: () => (
            <BackButton
              onPress={() => props.navigation.goBack()}
              appendStyles={{paddingLeft: 20}}
              color="white"
            />
          ),

          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#292929',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'left',
        }}
        component={searchFilter}
      />
      <Stack.Screen
        name={ROUTE_NAMES.JOIN_WORKSPACES}
        options={{
          headerShown: false,
        }}
        component={JoinWorkspaces}
      />
      <Stack.Screen
        name={ROUTE_NAMES.DETAILED_WORKSPACE}
        options={{
          headerShown: false,
        }}
        component={DetailedWorkspace}
      />
      <Stack.Screen
        name={ROUTE_NAMES.MANAGE_WORKSPACES}
        options={{
          headerShown: false,
        }}
        component={ManageWorkspaceScreen}
      />
      <Stack.Screen
        name={ROUTE_NAMES.WORKSPACE_LIST}
        options={{
          headerShown: false,
        }}
        component={WorkspaceList}
      />
      <Stack.Screen
        name={ROUTE_NAMES.NEW_MEETING}
        options={{
          headerShown: false,
        }}
        component={ScheduleMeeting}
      />
      <Stack.Screen
        name={ROUTE_NAMES.MEETING_DETAILS}
        options={{
          headerShown: false,
        }}
        component={MeetDetails}
      />
      <Stack.Screen
        name={ROUTE_NAMES.DOC_COMMENTS}
        options={{
          headerShown: false,
        }}
        component={DocComments}
      />
      <Stack.Screen
        name={ROUTE_NAMES.DOC_COMMENT_REPLY}
        options={{
          headerShown: false,
        }}
        component={DocCommentReply}
      />
      <Stack.Screen
        name={ROUTE_NAMES.MANAGE_WORKSPACES_MEMBERS}
        options={{
          headerShown: false,
        }}
        component={ManageWorkspaceMember}
      />
      <Stack.Screen
        name={ROUTE_NAMES.MANAGE_WORKSPACES_INVITE}
        options={{
          headerShown: false,
        }}
        component={InviteMemberScreen}
      />
      <Stack.Screen
        name={ROUTE_NAMES.WORKSPACE_MEMBERS_SCREEN}
        options={{
          headerShown: false,
        }}
        component={WorkspaceMembersScreen}
      />
      <Stack.Screen
        name={ROUTE_NAMES.WORKSPACE_SETTINGS}
        options={{
          title: 'View Files',
          headerShown: false,
          headerLeft: () => (
            <BackButton
              onPress={() => props.navigation.goBack()}
              appendStyles={{paddingLeft: 10}}
              color="white"
            />
          ),

          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#292929',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'left',
        }}
        component={WorkspaceSettings}
      />
      <Stack.Screen
        name={ROUTE_NAMES.VIEW_FILES}
        options={{
          title: 'View Files',
          headerShown: false,
          headerLeft: () => (
            <BackButton
              onPress={() => props.navigation.goBack()}
              appendStyles={{paddingLeft: 10}}
              color="white"
            />
          ),

          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#292929',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'left',
        }}
        component={ViewFiles}
      />
    </Stack.Navigator>
  );
};

export {
  LoginStackNavigator,
  RootNavigator as AppStackNavigator,
  FindlyNavigator,
  NewWorkspacesNavigator,
};
