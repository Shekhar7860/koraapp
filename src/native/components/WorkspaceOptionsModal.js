import React, {Component, memo, createRef} from 'react';
import {View, Text, StyleSheet,TouchableOpacity} from 'react-native';

import {connect} from 'react-redux';
import {emptyArray} from '../../shared/redux/constants/common.constants';
import {navigate} from '../navigation/NavigationService';
import {ROUTE_NAMES} from '../navigation/RouteNames';
import {normalize} from '../utils/helpers';
import {BottomUpModal} from './BottomUpModal';
import {Icon} from './Icon/Icon';
import {fontFamily} from './KoraText';
import {showToast} from '../core/ErrorMessages';
import SimpleToast from 'react-native-simple-toast';
import Clipboard from '@react-native-community/clipboard';
import {starWorkspace} from '../../shared/redux/actions/workspace.action';
import WorkspaceDao, {getWorkspace} from '../../dao/WorkspacesDao';

export const workspaceOptionsModalRef = createRef();

export const ModalOption = memo(
  ({
    id = '',
    icon = '',
    text = '',
    iconStyle = null,
    textStyle = null,
    onPress = (option) => {},
    color = 'black',
  }) => {
    return (
      <TouchableOpacity
        onPress={() => onPress({icon, text, id})}
        style={styles.opacity}>
        {icon !== '' && (
          <>
            <Icon size={normalize(20)} name={icon} color={color} />
            <View style={{width: 13}} />
          </>
        )}
        <Text style={styles.text}>{text}</Text>
      </TouchableOpacity>
    );
  },
);

const manageOptions = [
  {icon: 'DR_Starred', text: 'Star', id: 'star'},
  // {icon: 'Contact_Search', text: 'Find', id: 'find'},
  // {icon: 'kr-plus-border', text: 'Invite', id: 'invite'},
  {icon: 'External_Link', text: 'Copy Link', id: 'copy_link'},
  // {icon: 'kr-screen_sharing', text: 'Duplicate', id: 'duplicate'},
  // {icon: 'kr-plus-border', text: 'Activity', id: 'activity'},
  // {icon: 'kr-plus-border', text: 'Files', id: 'files'},
  {icon: 'kr-settings', text: 'Manage', id: 'manage'},
  // {icon: 'kr-delete', text: 'Leave', id: 'leave'},
];

class _WorkspaceOptionsModal extends Component {
  constructor(props) {
    super();
    this.modalRef = createRef(null);
    this.state = {
      manageOptions: manageOptions,
      ws: {
        isWSStarred: false,
      },
    };
    this.ws = null;
  }

  removeWsListener() {
    try {
      if (
        this.ws?.removeListener &&
        typeof this.ws?.removeListener === 'function'
      ) {
        this.ws?.removeListener();
      }
    } catch (e) {
      console.log('E3', e);
    }
  }

  get wsId() {
    return this.activeWsId || this.props.activeWsId;
  }

  set wsId(activeWsId) {
    this.activeWsId = activeWsId;
    if (activeWsId) {
      this.addWsListener();
    } else {
      this.removeWsListener();
    }
  }

  componentDidMount() {
    this.addWsListener();
  }

  addWsListener() {
    this.removeWsListener();
    this.ws = getWorkspace(this.wsId);
    if (this.ws?.addListener && typeof this.ws?.addListener === 'function') {
      this.ws.addListener((ws) => {
        this.setState({ws});
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.activeWsId !== this.props.activeWsId) {
      this.addWsListener();
    }
  }

  componentWillUnmount() {
    this.removeWsListener();
  }

  open(activeWsId = null) {
    this.wsId = activeWsId;
    this.modalRef.current.open();
  }

  close() {
    this.modalRef.current.close();
  }

  optionPressed = (option) => {
    if (option.id === 'manage') {
      navigate(ROUTE_NAMES.MANAGE_WORKSPACES, {
        ws: this.state.ws,
        wsId: this.wsId,
      });
      this.close();
    }
    if (option.id === 'copy_link') {
      Clipboard.setString(this.state?.ws?.link?.shareUrl || '');
      SimpleToast.showWithGravity(
        'Workspace link copied!',
        SimpleToast.LONG,
        SimpleToast.CENTER,
      );
      this.close();
    }
    if (option.id === 'star') {
      this.props.starWorkspace({
        wsId: this.wsId,
        value: !this.state?.ws?.isWSStarred,
      });
    }
  };

  render() {
    return (
      <BottomUpModal expandable={true} ref={this.modalRef} height={570}>
        <View style={{height: 6}} />
        {this.state.manageOptions.map((option) => {
          if (option.id === 'star') {
            if (this.state?.ws?.isWSStarred) {
              return (
                <ModalOption
                  key={option.id}
                  {...option}
                  icon={'Favourite'}
                  text={'Starred'}
                  color={'#FFDA2D'}
                  onPress={this.optionPressed}
                />
              );
            }
          }

          return (
            <ModalOption
              key={option.id}
              {...option}
              onPress={this.optionPressed}
            />
          );
        })}
      </BottomUpModal>
    );
  }
}

export const styles = StyleSheet.create({
  opacity: {
    paddingVertical: 15,
    paddingHorizontal: 22.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    lineHeight: normalize(19.36),
    fontSize: normalize(16),
    fontFamily: fontFamily,
    fontWeight: '400',
  },
});
const mapStateToProps = (state) => {
  const {workspace} = state;
  let ws = workspace.workspacelist?.ws || emptyArray;
  let activeWs = ws.find((o) => o.id === workspace.activeWsId);
  return {
    activeWs: activeWs,
    activeWsId: workspace.activeWsId,
  };
};

export const WorkspaceOptionsModal = connect(
  mapStateToProps,
  {starWorkspace},
  null,
  {
    forwardRef: true,
  },
)(_WorkspaceOptionsModal);
