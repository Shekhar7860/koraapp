import React from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  TouchableHighlight,
  TextInput,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {connect} from 'react-redux';
import {ScrollView} from 'react-native';
import Toast from 'react-native-simple-toast';
import {ROUTE_NAMES} from '../../navigation/RouteNames';
import {Header} from '../../navigation/TabStacks';
import MessageComposebar from '../../components/Composebar/MessageComposebar';
import KoraKeyboardAvoidingView from '../../components/KoraKeyboardAvoidingView';
import {Icon} from '../../components/Icon/Icon';
import {KoraToggleSwitch} from '../../components/toggleButton';
import {KoraReactComponent} from '../../core/KoraReactComponent';
import ContactSelection from '../../components/ContactSelection';
import {navigate} from '../../navigation/NavigationService';
import {
  createDiscussion,
  getDiscWorkspaces,
} from '../../../shared/redux/actions/discussions.action';
import {
  createWorkspace,
  getAllWSMembers,
  getWorkSpaceList,
} from '../../../shared/redux/actions/workspace.action';
import {BottomUpModalShare} from '../../components/BottomUpModal/BottomUpModalShare';
import {setExceptionList} from '../../../shared/redux/actions/native.action';
import {
  getContactList,
  getRecentContactList,
  selectedContactList,
} from '../../../shared/redux/actions/create-message.action';
import {BottomUpModal} from '../../components/BottomUpModal';
import * as Constants from '../../components/KoraText';
import {getEmojiFromUnicode, getIconFromUnicode} from '../../utils/emoji';
import emojiJSON from '../../assets/joypixels/emoji.json';
import {normalize} from '../../utils/helpers';
import {emptyArray} from '../../../shared/redux/constants/common.constants';
import SelectWorkspaces from './selectWorkspace';
import {discussion_roomEmoji} from '../../components/Chat/ChatDefaultIcons';
import * as UsersDao from '../../../dao/UsersDao';
import {Loader} from '../ChatsThreadScreen/ChatLoadingComponent';
import database from '../../realm';
import * as Entity from '../../../native/realm/dbconstants';

const ROW_HEIGHT = 60;
const emojiList = Object.keys(emojiJSON);
export const permissionOptions = [
  {
    key: 40,
    text: 'Full Access',
    description: 'Can edit and share',
  },
  {
    key: 30,
    text: 'Post only',
    description: 'Can post and comment',
  },
  {
    key: 20,
    text: 'Comment only',
    description: 'Can view and comment',
  },
];

class _NewDiscussionScreen extends KoraReactComponent {
  _scrollView = null;
  constructor(props) {
    super();
    this.permissionLevel = React.createRef();
    this.workspacelist = [];
    this.state = {
      profileIcon: false,
      logo: {},
      category: '',
      emoji: '',
      currentTab: 1,
      addUserOpened: false,
      sumMenuOpened: false,
      type: 'discussion',
      allowedForPost: {
        isAllMembers: true,
        members: [],
      },
      name: '',
      desc: '',
      isAllMembers: false,
      access: permissionOptions[1].key,
      // invitedMembers: [],
      showWarning: true,
      members: [],
      wsId: props.activeWsId || '',
      // postingPrivileges: {
      //   admins: 'all',
      //   members: 'all',
      //   owner: 'all',
      // },
    };
  }

  subscribeWorkspaces = () => {
    try {
      if (this.wsSubscription && this.wsSubscription.unsubscribe) {
        this.wsSubscription.unsubscribe();
      }

      const db = database.active;
      this.wsObservable = db.collections
        .get(Entity.Workspaces)
        .query()
        .observeWithColumns(['updated_at']);
      this.wsSubscription = this.wsObservable.subscribe((workspaces) => {
        this.workspacelist = workspaces;
      });
    } catch (e) {
      console.log('error in subscribeWorkspaces', e);
    }
  };

  get wsMembers() {
    return this.props.activeWsMembers;
  }

  componentDidMount() {
    this.subscribeWorkspaces();
    var IconName =
      discussion_roomEmoji[
        Math.floor(Math.random() * discussion_roomEmoji.length)
      ];
    let logo = {
      type: 'emoji',
      val: IconName,
    };
    this.setState({logo, emoji: getIconFromUnicode(IconName.unicode)});
    if (this.props.activeWsId) {
      this.props.getAllWSMembers(this.props.activeWsId);
    }
    this.props.getContactList('');
    this.props.getRecentContactList('');
    this.props.selectedContactList([]);
  }

  componentWillUnmount() {
    if (this.wsSubscription && this.wsSubscription.unsubscribe) {
      this.wsSubscription.unsubscribe();
    }
  }

  renderHeader() {
    return (
      <Header
        {...this.props}
        title={'New Discussion'}
        goBack={true}
        // rightContent={
        //   <TouchableHighlight
        //     underlayColor={'0,0,0,0.5'}
        //     onPress={() => {
        //       console.log('Done');
        //     }}>
        //     <Text style={styles.rightContentStyle}>Done</Text>
        //   </TouchableHighlight>
        // }
      />
    );
  }

  renderException() {
    return (
      <View style={{backgroundColor: 'white'}}>
        <TouchableHighlight
          style={{
            display: 'flex',
            paddingTop: 5,
            paddingStart: 10,
            paddingEnd: 10,
            marginStart: 10,
            marginEnd: 10,
            marginBottom: 5,
          }}
          underlayColor="rgba(0,0,0,0.05)"
          onPress={() => {
            if (this.props.activeWsId) {
              this.props.setExceptionList([
                ...this.wsMembers,
                ...this.props.contactData,
              ]);
            } else {
              this.props.setExceptionList([...this.props.contactData]);
            }

            navigate(ROUTE_NAMES.ADD_EXCEPTIONS);
          }}>
          <View style={{}}>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={styles.addExceptionsTextStyle}>Add Exceptions</Text>

              <Icon
                name={'Right_Direction'}
                size={normalize(24)}
                color="#9AA0A6"
              />
            </View>
            <Text style={styles.exceptionsDescTextStyle}>
              You can still make a set of people in your discussion room can
              share posts by selecting “Add Exceptions” above.
            </Text>
          </View>
        </TouchableHighlight>
      </View>
    );
  }

  // renderDiscussionRoomName() {
  //   return (
  //     <View
  //       style={{
  //         flexDirection: 'row',
  //         justifyContent: 'center',
  //         alignContent: 'center',
  //         alignItems: 'center',
  //         right: 10,
  //       }}>
  //       <View
  //         style={{
  //           backgroundColor: '#F2F2F2',
  //           borderRadius: 34 / 2,
  //           width: 34,
  //           height: 34,
  //           borderWidth: 1,
  //           borderColor: '#D9DBDE',
  //           justifyContent: 'center',
  //           alignContent: 'center',
  //           alignItems: 'center',
  //         }}>
  //         <Icon name={'Hash'} size={15} color="#BDC1C6" />
  //       </View>

  //       <TextInput
  //         placeholder="Discussion Name"
  //         maxLength={30}
  //         value={this.state.boardName}
  //         onChangeText={(boardName) => this.setState({boardName})}
  //         style={styles.boardNameTextInputStyle}
  //       />
  //     </View>
  //   );
  // }

  checkValidity = () => {
    if (this.state.name.trim() === '') {
      Toast.showWithGravity(
        'Discussion title is required.',
        Toast.SHORT,
        Toast.CENTER,
      );

      return false;
    }

    return true;
  };

  sendAction = (composebarObject, createOnly = false) => {
    if (this.state.name === '') {
      Toast.showWithGravity(
        'Discussion title is required.',
        Toast.SHORT,
        Toast.CENTER,
      );
    }
    let createDiscussionReqBody = this.state;
    const allowedForPost = {
      isAllMembers: this.state.allowedForPost.isAllMembers,
      members: this.props.exceptionList
        .filter((obj) => obj.marked)
        .map((obj) => {
          return {userId: obj._id, access: this.state.access};
        }),
    };
    createDiscussionReqBody.members = this.props.contactData?.map((obj) => {
      return {userId: obj._id, access: this.state.access};
    });
    createDiscussionReqBody.allowedForPost = allowedForPost;
    let orgId = UsersDao.getOrgId();
    let id = this.state.wsId || orgId;

    this.props.createDiscussion(
      composebarObject,
      this.state,
      {
        wsId: id,
      },
      (board) => {
        this.props.navigation.replace(ROUTE_NAMES.DISCUSSION, {board: board});
      },
      (status, message = '') => {
        if (status && status === 'failure') {
          if (this.refs?.mcb && composebarObject?.text) {
            this.refs.mcb.setText(composebarObject?.text);
          }
        }
      },
    );
  };
  updateProfilePicture() {
    return (
      <BottomUpModalShare ref="DiscProfilePicture" height={470}>
        <View style={{marginTop: 35}}>
          <View
            style={{
              borderColor: '#EFF0F1',
            }}
          />
          {this.state.currentTab === 1 && (
            <View
              style={{
                marginLeft: 15,
                marginRight: 15,
              }}>
              <View
                style={{
                  borderColor: '#BDC1C6',
                  borderWidth: 1,
                  borderRadius: 4,
                  height: 45,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Icon
                  name={'Contact_Search'}
                  size={18}
                  color={'#5F6368'}
                  style={{padding: 10}}
                />
                <TextInput
                  placeholder="Search emoji"
                  placeholderTextColor="#5F6368"
                  maxLength={15}
                  onChangeText={(category) => this.setState({category})}
                  style={styles.searchTextInputStyle}
                />
              </View>
              <FlatList
                data={emojiList}
                height={360}
                initialNumToRender={8}
                style={{marginTop: 10}}
                horizontal={false}
                numColumns={8}
                columnWrapperStyle={{
                  justifyContent: 'space-between',
                }}
                removeClippedSubviews={true}
                renderItem={({item}) => {
                  return (
                    <TouchableHighlight
                      underlayColor={(0, 0, 0, 0.2)}
                      onPress={() => {
                        this.setState({
                          profileIcon: true,
                          logo: {
                            type: 'emoji',
                            val: {
                              category: emojiJSON[item].category,
                              unicode: item,
                            },
                          },
                          category: emojiJSON[item].category,
                        });
                        this.setState({emoji: getEmojiFromUnicode(item)});
                        this.refs.DiscProfilePicture.closeBottomDrawer();
                      }}
                      style={{
                        margin: 3,
                        // height: 35,
                        // width: 35,
                        alignItems: 'center',
                      }}>
                      <Text style={styles.emojiTextStyle}>
                        {getEmojiFromUnicode(item)}
                      </Text>
                    </TouchableHighlight>
                  );
                }}
                //numColumns={9}
                keyExtractor={(item, index) => item}
              />
            </View>
          )}
        </View>
      </BottomUpModalShare>
    );
  }
  renderNameContent = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 34,
          // marginTop: 3,
        }}>
        {/* <TouchableHighlight
          underlayColor={(0, 0, 0, 0.2)}
          onPress={() => {
            this.refs.DiscProfilePicture.openBottomDrawer();
          }}
          style={{marginLeft: 5}}>
          <View style={styles.emojiView}>
            <Text>{this.state.emoji || ''}</Text>
          </View>
        </TouchableHighlight> */}
        <TextInput
          placeholder="Discussion Room Name"
          placeholderTextColor="#9AA0A6"
          maxLength={50}
          multiline={true}
          value={this.state.name}
          onChangeText={(name) => this.setState({name})}
          style={styles.boardNameTextInputStyle}
        />
      </View>
    );
  };

  renderSubMenu() {
    const _key = this.state.access || permissionOptions[0].key;
    const text = permissionOptions.find(({key}) => key === _key)?.text;
    const wsId = this.state.wsId || this.props.activeWsId || '';
    const ws = this.workspacelist.find((obj) => obj?.wsId === wsId);
    let wsName = ws?.name || 'this workspace';
    // if (wsName.length > 16) {
    //   wsName = wsName.substring(0, 16) + '...';
    // }
    return (
      <View style={{flexDirection: 'column'}}>
        {this.state.wsId ? (
          <View style={{margin: 20, flexDirection: 'row'}}>
            <View style={{paddingHorizontal: 5, marginEnd: 4}}>
              <Icon size={normalize(24)} name={'People'} />
            </View>
            <View
              style={{
                paddingHorizontal: 8,
                //marginStart: ,
                marginEnd: 10,
                flexShrink: 1,
              }}>
              <Text style={styles.textStyle}>
                <Text
                  style={{color: '#0d6efd', textDecorationLine: 'underline'}}
                  onPress={() => {
                    navigate(ROUTE_NAMES.WORKSPACE_MEMBERS_SCREEN, {
                      wsName: wsName,
                      wsId: this.state.wsId,
                    });
                  }}>
                  All Members
                </Text>{' '}
                at{' '}
                <Text style={[styles.textStyle, {fontWeight: '700'}]}>
                  {wsName}
                </Text>{' '}
                can access in this board
              </Text>
            </View>
            <View>
              <KoraToggleSwitch
                isToggleOn={this.state.isAllMembers}
                onChange={(isAllMembers) => this.setState({isAllMembers})}
              />
            </View>
          </View>
        ) : null}

        <View
          style={[
            styles.view1,
            {
              marginTop: this.state.wsId ? 0 : 20,
            },
          ]}>
          <Text style={styles.permissionsTextStyle}>Permission Level</Text>
          <View
            style={{
              flexDirection: 'row',
              marginRight: 5.5,
            }}>
            <TouchableOpacity
              onPress={() => this.permissionLevel.current.openBottomDrawer()}>
              <View style={{flexDirection: 'row'}}>
                <Text style={styles.textStyle2}>{text}</Text>
                <Icon name={'DownArrow'} size={normalize(24)} color="#5F6368" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: '#E4E5E7',
          }}
        />
      </View>
    );
  }

  renderWarning() {
    let {showWarning} = this.state;
    return (
      <View style={styles.frame1}>
        <Icon name={'Tip'} size={24} color="#5F6368" />
        <View style={styles.warningView}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flex: 1,
              flexWrap: 'wrap',
              marginHorizontal: 1,
            }}>
            <Text style={styles.warning}>
              By default members added to the discussion room will be given post
              rights. Click on
            </Text>
            <Icon name={'DownArrow'} size={15} color="#5F6368" />
            <Text style={[styles.warning, {marginLeft: 4}]}>
              to change permissions.
            </Text>
          </View>
          <TouchableHighlight
            underlayColor="rgba(0,0,0,0.05)"
            onPress={() => this.setState({showWarning: !showWarning})}
            style={styles.frame2}>
            <>
              <View style={styles.checkboxStyle}>
                {!showWarning ? (
                  <View style={styles.selectedUI}>
                    <Icon
                      name={'SingleTick'}
                      size={normalize(13)}
                      color={'#fff'}
                      style={styles.checkboxTickImg}
                    />
                  </View>
                ) : (
                  <View style={styles.uncheckedCheckbox} />
                )}
              </View>
              <Text style={styles.warning}>Don’t show this message again</Text>
            </>
          </TouchableHighlight>
        </View>
      </View>
    );
  }

  renderPermissionLevel() {
    return (
      <BottomUpModal ref={this.permissionLevel} height={270}>
        <View style={{padding: 14}}>
          {permissionOptions.map((option) => {
            return (
              <TouchableOpacity
                onPress={() => {
                  this.setState({access: option.key});
                  this.permissionLevel.current.closeBottomDrawer();
                }}
                key={option.key}
                style={{
                  margin: 6,
                  borderRadius: 4,
                  marginHorizontal: 10,
                }}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <View style={{flexDirection: 'column'}}>
                    <Text style={styles.optionTextStyle}>{option.text}</Text>
                    <Text style={styles.descTextStyle}>
                      {option.description}
                    </Text>
                  </View>
                  <View style={{flex: 1}} />
                  <View>
                    {this.state.access === option.key && (
                      <Icon
                        size={normalize(15)}
                        name={'SingleTick'}
                        color={'#07377F'}
                      />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </BottomUpModal>
    );
  }
  scrollToRow() {
    this._scrollView?.scrollTo({y: 2 * ROW_HEIGHT});
    //this._scrollView?.scrollToEnd({animated: true});
  }

  ref = (view) => (this._scrollView = view);

  render() {
    return (
      <>
        {this.renderHeader()}
        {this.renderPermissionLevel()}
        {this.updateProfilePicture()}
        <KoraKeyboardAvoidingView
          style={{
            flex: 1,
            flexDirection: 'column',
            backgroundColor: '#ffffff',
          }}>
          <ScrollView
            ref={this.ref}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps={'always'}>
            <View style={{height: 15}} />
            <SelectWorkspaces
              initialSelectedWsId={this.props.activeWsId}
              setWsId={(wsId) => {
                this.setState({wsId});
              }}
              workspacelist={this.workspacelist}
              newWSRequestBody={this.props.newWSRequestBody}
              getWorkSpaceList={this.props.getWorkSpaceList}
              createWorkspace={this.props.createWorkspace}
            />
            <ContactSelection
              inputStyles={{
                paddingHorizontal: 8,
                paddingLeft: 0,
                marginVertical: 10,
              }}
              onToggleFocus={(val) => {
                // console.log('VALUE', val);
                this.setState({addUserOpened: val});
                this.scrollToRow();
              }}
              onComposebarTextChange={(text) => {
                this.scrollToRow();
                // console.log('onComposebarTextChange ------------->:', text);
              }}
              nameContent={this.renderNameContent}
              searchLeftContent={() => {
                return (
                  <View
                    style={{
                      minHeight: 35,
                      justifyContent: 'center',
                      marginRight: 18,

                      marginLeft: 10,
                      marginVertical: 10,
                    }}>
                    <Icon size={normalize(24)} name={'People'} />
                  </View>
                );
              }}
              searchRightContent={() => {
                return (
                  <View
                    style={{
                      minHeight: 35,
                      marginVertical: 10,

                      justifyContent: 'center',
                    }}>
                    <TouchableOpacity
                      onPress={() => {
                        const {sumMenuOpened} = this.state;
                        this.setState({sumMenuOpened: !sumMenuOpened});
                      }}
                      style={{marginRight: 10, marginLeft: 3}}>
                      {!this.state.sumMenuOpened ? (
                        <Icon size={normalize(24)} name={'DownArrow'} />
                      ) : (
                        <Icon size={normalize(24)} name={'UpArrow'} />
                      )}
                    </TouchableOpacity>
                  </View>
                );
              }}
            />

            <View
              style={[
                {backgroundColor: 'white'},
                !this.state.sumMenuOpened ? {display: 'none'} : {},
              ]}>
              {this.renderSubMenu()}
              {/* <View>
                <ToggleButton
                  ref="add"
                  label="Add all workspace users"
                  isToggleOn={isAllMembers}
                  labelStyle={{
                    color: '#202124',
                    fontWeight: '400',
                    fontSize: 16,
                    fontFamily: Constants.fontFamily,
                  }}
                  onChange={(isAllMembers) => this.setState({isAllMembers})}
                />
              </View>
              <View
                style={{borderBottomWidth: 1, borderBottomColor: '#E4E5E7'}}
              />
              <View>
                <ToggleButton
                  ref="allow"
                  label="Allow members to post"
                  isToggleOn={this.state.allowedForPost.isAllMembers}
                  onChange={(isAllMembers) =>
                    this.setState({
                      allowedForPost: {
                        isAllMembers,
                        members: this.state.allowedForPost.members,
                      },
                    })
                  }
                  labelStyle={{
                    color: '#202124',
                    fontWeight: '400',
                    fontSize: 16,
                    fontFamily: Constants.fontFamily,
                  }}
                />

                {!this.state.allowedForPost.isAllMembers &&
                  this.renderException()}
              </View> */}
            </View>

            {this.state.showWarning ? this.renderWarning() : null}
          </ScrollView>
          {/* <View style={{flex: 1}}></View> */}
          {this.props.showLoader && <Loader />}
          <SafeAreaView style={{flexShrink: 1}}>
            <MessageComposebar
              ref="mcb"
              onSendButtonClick={this.sendAction}
              isShowCamera={true}
              containerStyle={styles.composerbar_container}
              buttons_container={styles.buttons_container}
              sendViewStyle={styles.sendViewStyle}
              send_button_container={styles.send_btn_container_style}
              buttons_sub_container={styles.buttons_sub_container}
              iconStyle={styles.iconStyle}
              isValidData={this.checkValidity}
              isFromNewDR={true}
            />
            <View style={{backgroundColor: 'red'}} />
          </SafeAreaView>
          {/* <SafeAreaView
            forceInset={{bottom: 'never'}}
            style={styles.footerView}>
            <TouchableHighlight
              underlayColor="rgba(0,0,0,0.05)"
              onPress={() => {}}
              style={styles.createView}>
              <Text style={styles.createText}>Create</Text>
            </TouchableHighlight>
            <TouchableHighlight
              underlayColor="rgba(0,0,0,0.05)"
              onPress={() => {}}
              style={styles.cancelView}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableHighlight>
          </SafeAreaView> */}
        </KoraKeyboardAvoidingView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  iconStyle: {
    width: 36,
    height: '100%',
    alignContent: 'center',
    marginStart: 15,

    alignItems: 'center',
    borderRadius: 5,
    justifyContent: 'center',
  },
  composerbar_container: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingLeft: 15,
    paddingRight: 15,
    minHeight: 50,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: '#E6E7E9',
  },
  send_btn_style: {
    padding: 7,
    marginStart: 12,
    width: 34,
    //marginVertical: -2.8,
    // paddingVertical: -2.8,
    justifyContent: 'center',
    alignItems: 'center',

    // marginTop: 0,
  },
  view1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginStart: 20,
    marginEnd: 20,
    marginBottom: 20,
  },
  send_btn_container_style: {
    flexDirection: 'row',
    alignSelf: 'center',
    // justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    height: 50,
  },

  icon_Style: {marginStart: 10},
  buttons_container: {
    flexDirection: 'row',

    // justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: 'white',
    height: 50,
  },
  buttons_sub_container: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    // justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: 'white',
    height: 50,
  },
  sendViewStyle: {
    // height: '100%',
    //  backgroundColor: 'white',
    justifyContent: 'center',
    // marginStart: 10,
    alignItems: 'center',
    borderRadius: 5,
    alignSelf: 'center',
    marginStart: 16,
    padding: 8,
    width: 35,
  },

  createText: {
    fontWeight: '500',
    fontSize: normalize(16),
    color: '#FFFFFF',
  },
  cancelText: {
    fontWeight: '500',
    fontSize: normalize(16),
    color: '#202124',
  },
  tabTextStyle: {
    color: '#201F1E',
    marginLeft: 10,
    marginRight: 10,
    fontWeight: '500',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  textInputStyle: {
    flex: 1,
    fontWeight: '400',
    fontSize: normalize(12),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  emojiTextStyle: {
    fontWeight: '400',
    fontSize: normalize(34),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  searchTextInputStyle: {
    flex: 1,
    fontSize: normalize(14),
    fontWeight: '400',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#202124',
    minHeight: 40,
  },
  rightContentStyle: {
    fontWeight: '500',
    fontSize: normalize(16),
    lineHeight: 20,
    color: '#0D6EFD',
  },
  headerTopicName: {
    fontWeight: 'bold',
    fontSize: normalize(18),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    marginLeft: 10,
  },
  textStyle: {
    lineHeight: 20,
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  messageHeaderContainer: {
    padding: 18,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: 'grey',
    borderBottomWidth: 0.5,
    borderBottomColor: 'grey',
    height: 54,
  },
  headerContactName: {
    fontWeight: '400',
    fontSize: normalize(18),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  addExceptionsTextStyle: {
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#202124',
  },
  exceptionsDescTextStyle: {
    paddingVertical: 10,
    paddingBottom: 20,
    fontWeight: '400',
    fontSize: normalize(14),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    lineHeight: 20,
    color: '#9AA0A6',
  },
  boardNameTextInputStyle: {
    width: '75%',
    marginStart: 12,
    // bottom: 2,
    fontWeight: 'normal',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    lineHeight: normalize(19),
    paddingTop: 0,

    paddingVertical: 0,
  },
  permissionsTextStyle: {
    fontWeight: '500',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    lineHeight: 19,
    color: '#202124',
    opacity: 0.5,
  },
  textStyle2: {
    marginRight: 10,
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  descTextStyle: {
    marginTop: 5,
    fontWeight: '400',
    fontSize: normalize(14),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#5F6368',
  },
  optionTextStyle: {
    fontWeight: '500',
    lineHeight: 20,
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  emojiView: {
    // backgroundColor: '#F2F2F2',
    // borderRadius: 34 / 2,
    width: 34,
    marginVertical: 3,
    height: 34,
    //borderWidth: 1,
    // borderColor: '#D9DBDE',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  frame1: {
    zIndex: -99,
    margin: 10,
    backgroundColor: '#EFF0F1',
    padding: 10,
    flexDirection: 'row',
    borderRadius: 6,
  },
  warning: {
    color: '#5F6368',
    fontSize: normalize(14),
    lineHeight: 18,
  },
  warningView: {
    marginHorizontal: 15,
  },
  uncheckedCheckbox: {
    borderRadius: 2,
    flex: 1,
    backgroundColor: '#fff',
    borderColor: '#BDC1C6',
    borderWidth: 1,
  },
  checkboxTickImg: {
    width: '85%',
    height: '85%',
    tintColor: '#ffffff',
    resizeMode: 'contain',
  },
  checkboxStyle: {
    height: 18,
    width: 18,
    marginRight: 10,
  },
  selectedUI: {
    borderRadius: 2,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D6EFD',
  },
  frame2: {
    marginTop: 10,
    flexDirection: 'row',
    paddingVertical: 10,
  },
  footerView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  cancelView: {
    borderRadius: 4,
    margin: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BDC1C6',
    width: '45%',
    alignItems: 'center',
  },
  createView: {
    backgroundColor: '#0D6EFD',
    borderRadius: 4,
    margin: 10,
    padding: 14,
    width: '45%',
    alignItems: 'center',
  },
});

const mapStateToProps = (state) => {
  const {workspace, native, createMessage, home} = state;
  return {
    newWSRequestBody: native.newWSRequestBody,
    activeWsId: workspace.activeWsId,
    activeWsMembers: workspace.activeWsMembers?.members || emptyArray,
    exceptionList: native.exceptionList,
    contactData: createMessage.contactData,
    showLoader: home.showLoader,
  };
};

export const NewDiscussionScreen = connect(mapStateToProps, {
  getContactList,
  getRecentContactList,
  createDiscussion,
  getDiscWorkspaces,
  getAllWSMembers,
  setExceptionList,
  selectedContactList,
  getWorkSpaceList,
  createWorkspace,
})(_NewDiscussionScreen);
