import React, {Component} from 'react';
import {withTranslation} from 'react-i18next';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
  FlatList,
} from 'react-native';
import {Icon} from '../../components/Icon/Icon.js';
import {Text} from '../../components/KoraText';
import {normalize} from '../../utils/helpers';
import {goBack, navigate} from '../../navigation/NavigationService';
import {emptyArray} from '../../../shared/redux/constants/common.constants';
import {ROUTE_NAMES} from '../../navigation/RouteNames';
import {RoomAvatar} from '../../components/RoomAvatar';
import {workspaceEmojis} from '../../components/Chat/ChatDefaultIcons';
import {getIconFromUnicode} from '../../utils/emoji';
import {BottomUpModalShare} from '../../components/BottomUpModal/BottomUpModalShare.js';
import database from '../../realm';
import * as Entity from '../../../native/realm/dbconstants';
import {workspaceACL} from '../../core/AccessControls';

class SelectWorkspaces extends Component {
  constructor(props) {
    super(props);
    this.permissionLevel = React.createRef();
    this.state = {
      showWorkspaces: props.initialSelectedWsId ? true : false,
      workspacelist: emptyArray,
      selectedWorkspace: {id: props.initialSelectedWsId},
      logo: {},
      emoji: '',
    };
  }

  componentDidMount() {
    this.subscribeWorkspaces();
    var IconName =
      workspaceEmojis[Math.floor(Math.random() * workspaceEmojis.length)];
    let logo = {
      type: 'emoji',
      val: IconName,
    };
    this.setState({logo, emoji: getIconFromUnicode(IconName.unicode, 35, 35)});
    this.timeOut = setTimeout(() => this.props.getWorkSpaceList(), 100);
    this.modifyWSList();
  }

  componentWillUnmount() {
    if (this.wsSubscription && this.wsSubscription.unsubscribe) {
      this.wsSubscription.unsubscribe();
    }
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
        this.setState({workspacelist: workspaces});
      });
    } catch (e) {
      console.log('error in subscribeWorkspaces', e);
    }
  };

  modifyWSList = () => {
    let workspaces = Array.from(this.props.workspacelist);
    if (this.state.selectedWorkspace?.id) {
      // console.log('workspaces', workspaces);
      workspaces = workspaces?.sort(
        (workspace) => workspace.id !== this.state.selectedWorkspace.id,
      );
    }
    this.setState({workspacelist: workspaces});
  };

  componentDidUpdate(prevProps) {
    if (prevProps.workspacelist !== this.props.workspacelist) {
      this.modifyWSList();
    }
    if (this.props.initialSelectedWsId !== prevProps.initialSelectedWsId) {
      this.setState(
        {
          selectedWorkspace: {id: this.props.initialSelectedWsId},
        },
        this.modifyWsList,
      );
      this.props.setWsId(this.props.initialSelectedWsId);
    }
  }

  listOfWorkpaces() {
    const {t} = this.props;
    let {workspacelist, selectedWorkspace} = this.state;
    return (
      <BottomUpModalShare
        ref={(ref) => {
          this.displayWS = ref;
        }}
        height={400}>
        <View style={styles.mainView}>
          <Text style={styles.headerText}>{t('Workspaces')}</Text>
          <TouchableOpacity
            style={{
              padding: 8,
              marginEnd: 10,
            }}
            onPress={() => this.displayWS.closeBottomDrawer()}>
            <Icon name="cross" size={normalize(22)} color={'#202124'} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={workspacelist}
          style={{paddingTop: 5}}
          renderItem={({item, index}) => {
            let isSelected = selectedWorkspace.id === item.id;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  this.setState({selectedWorkspace: item});
                  this.props.setWsId(item.id);
                  this.displayWS.closeBottomDrawer();
                }}
                style={isSelected ? styles.frame5 : styles.frame6}>
                <RoomAvatar
                  showCircle={false}
                  boardIcon={item?.logo}
                  size={26}
                />
                <Text style={styles.workspaceText2}>{item?.name?.trim()}</Text>
              </TouchableOpacity>
            );
          }}
          bounces={false}
        />
      </BottomUpModalShare>
    );
  }
  onCreate = (workspaceName) => {
    let payload = this.props.newWSRequestBody;
    payload.name = workspaceName;
    payload.logo = this.state.logo;
    //console.log('Workspace', payload);
    this.props.createWorkspace(payload, goBack);
  };

  render() {
    const {t} = this.props;
    const {showWorkspaces, selectedWorkspace, workspacelist} = this.state;
    return (
      <View style={[styles.frame1, this.props.mainContainer]}>
        {this.listOfWorkpaces()}
        {showWorkspaces ? (
          <>
            <View style={styles.frame2}>
              <TouchableOpacity
                style={styles.menu}
                onPress={() => {
                  this.displayWS.openBottomDrawer();
                }}>
                <Icon name={'Menu'} size={22} color="#202124" />
              </TouchableOpacity>
              <ScrollView
                horizontal={true}
                bounces={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({selectedWorkspace: ''});
                    this.props.setWsId('');
                    navigate(ROUTE_NAMES.CREATE_WORKSPACE, {
                      onCreate: this.onCreate,
                      emoji: this.state.emoji,
                    });
                    //createModal.current.openModal();
                  }}
                  style={styles.frame3}>
                  <Icon name={'Plus_icon'} size={22} color="#202124" />
                  <Text style={styles.workspaceText}>{t('Create new')}</Text>
                </TouchableOpacity>
                {workspacelist?.map((data, index) => {
                  let isSelected = selectedWorkspace.id === data.id;
                  const {canCreateBoard} = workspaceACL(data);
                  if (!canCreateBoard) {
                    return null;
                  }
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        if (this.state.selectedWorkspace?.id === data.id) {
                          this.props.setWsId('');
                          this.setState({selectedWorkspace: ''});
                        } else {
                          this.props.setWsId(data.id);
                          this.setState({selectedWorkspace: data});
                        }
                      }}
                      style={isSelected ? styles.frame4 : styles.frame3}>
                      <RoomAvatar
                        size={24}
                        showCircle={false}
                        boardIcon={data?.logo}
                      />
                      <Text style={styles.workspaceText}>
                        {data?.name?.trim()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </>
        ) : (
          <TouchableOpacity
            style={styles.selectView}
            onPress={() => this.setState({showWorkspaces: true})}>
            <Icon name={'traceInfo'} size={20} color="#07377F" />
            <Text style={styles.selectText}>Select a workspace</Text>
          </TouchableOpacity>
        )}
        {/* <CreateWorkspace
          ref={createModal}
          onCreate={(workspaceName) => {
            let payload = this.props.newWSRequestBody;
            payload.name = workspaceName;
            payload.logo = this.state.logo;
            //console.log('Workspace', payload);
            this.props.createWorkspace(payload);
            createModal.current.closeModal();
          }}
          emoji={this.state.emoji}
          height={height}
        /> */}
        <View
          style={{
            height: 1,
            backgroundColor: '#E4E5E7',
            marginHorizontal: -15,
          }}
        />
      </View>
    );
  }
}

// const mapStateToProps = (state) => {
//   console.log('workspace.workspacelist?.ws || emptyArray',state?.workspace?.workspacelist?.ws?.length);
//   const {workspace, native} = state;
//   return {
//     workspacelist: workspace.workspacelist?.ws || emptyArray,
//     newWSRequestBody: native.newWSRequestBody,
//   };
// };

// export default connect(mapStateToProps, {getWorkSpaceList, createWorkspace})(
//   withTranslation()(SelectWorkspaces),
// );

export default withTranslation()(SelectWorkspaces);

const styles = StyleSheet.create({
  frame1: {marginTop: -5, marginBottom: 10, marginHorizontal: 12},
  frame2: {
    flexDirection: 'row',
    // borderBottomWidth: 1,
    // borderBottomColor: '#E4E5E7',
    paddingBottom: 10,
    paddingLeft: 7,
    paddingTop: 2,
    alignItems: 'center',
  },
  menu: {
    width: 36,
    height: 36,
    borderRadius: 36 / 2,
    backgroundColor: '#EFF0F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  frame3: {
    flexDirection: 'row',
    padding: 8,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderColor: '#E4E5E7',
    borderWidth: 1,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  frame4: {
    flexDirection: 'row',
    padding: 8,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderColor: '#85B7FE',
    backgroundColor: '#E7F1FF',
    borderWidth: 1,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  frame6: {
    flexDirection: 'row',
    padding: 10,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  frame5: {
    flexDirection: 'row',
    padding: 10,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#E7F1FF',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  workspaceText: {
    fontSize: normalize(14),
    color: '#202124',
    marginLeft: 10,
  },
  workspaceText2: {
    fontSize: normalize(16),
    color: '#202124',
    marginLeft: 15,
  },
  selectText: {
    fontSize: normalize(14),
    color: '#07377F',
    marginLeft: 19,
    textDecorationLine: 'underline',
  },
  selectView: {
    flexDirection: 'row',
    backgroundColor: '#F3F8FF',
    padding: 15,
    borderRadius: 6,
    marginBottom: 10,
    paddingLeft: 15,
  },
  headerText: {
    flex: 1,
    margin: 20,
    fontWeight: 'bold',
    fontSize: normalize(19),
    color: '#202124',
  },
  mainView: {
    borderBottomWidth: 1,
    borderColor: '#E4E5E7',
    //paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
