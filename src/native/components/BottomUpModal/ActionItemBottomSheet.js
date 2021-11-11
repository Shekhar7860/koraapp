import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import * as Constants from '../KoraText';
import {normalize} from '../../utils/helpers';
import {Icon} from '../../components/Icon/Icon';
import {colors} from '../../theme/colors';
import {text} from 'react-native-communications';
import {SvgIcon} from '../Icon/SvgIcon';
import {RectButton} from 'react-native-gesture-handler';

const sheetIds = {
  START_CONVERSATION: 'starConversation',
  MUTE_ID: 'mute',
  SELECT_MESSAGES_ID: 'selectmessages',
  LEAVE_CONVERSATION_ID: 'leaveConversation',
  MANAGE_GROUP_ID: 'manageGroup',
  MARK_AS_UNREAD_ID: 'markAsUnread',
  DELETE_CONVERSATION: 'delete_conversation',
  CLEAR_CONVERSATION: 'clear_conversation',
  VIEW_FILES: 'view_files',
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 20,
    marginTop: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    // backgroundColor: 'yellow',
  },
  modalOption2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  negativeAction: {
    fontWeight: '400',
    fontSize: normalize(17),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    marginLeft: 15,
    color: '#DD3646',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTextStyle: {
    fontWeight: '500',
    fontSize: normalize(16),
    // lineHeight: 19,
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    // backgroundColor: 'green',
    color: colors.color_202124,
    marginLeft: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textStyle: {
    fontSize: normalize(16),
    fontWeight: '500',
    fontStyle: 'normal',
    color: colors.color_202124,
    fontFamily: Constants.fontFamily,
  },

  headerTextStyle: {
    color: '#202124',
    fontWeight: 'bold',
    fontSize: normalize(17),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  negativeActionText: {
    fontWeight: '400',
    fontSize: normalize(17),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#DD3646',
    justifyContent: 'center',
    alignItems: 'center',
  },
  positiveActionText: {
    fontWeight: '500',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: colors.color_202124,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerOnlyText: {
    marginLeft: 20,
    marginTop: 12,
    marginBottom: 12,
    flexDirection: 'row',

    //flex: 1,
    alignItems: 'center',
    alignContent: 'center',
    // backgroundColor: 'yellow',
  },
});

const propTypes = {
  title: PropTypes.string,
  value: PropTypes.string,
  iconName: PropTypes.string,
};

export default class ActionItemBottomSheet extends React.Component {
  constructor(props) {
    super(props);
  }

  optionSelected = (id) => {
    this.props.optionSelected(id);
  };

  renderIcon(iconName, text) {
    switch (text) {
      case 'Delete':
        return <Icon size={normalize(24)} name={iconName} color="#DD3646" />;
      case 'Leave':
        return <Icon size={normalize(24)} name={iconName} color="#DD3646" />;
      case 'Unstar':
        return <SvgIcon name="Star_Filled" width={24} height={24} />;
      default:
        return <Icon size={normalize(24)} name={iconName} />;
    }
  }

  renderTitle(iconName, title) {
    switch (title) {
      case 'Delete':
        return <Text style={styles.negativeAction}>{title}</Text>;
      case 'Leave':
        return <Text style={styles.negativeAction}>{title}</Text>;
      case 'Cancel':
        return <Text style={styles.positiveActionText}>{title}</Text>;
      default:
        return <Text style={styles.modalTextStyle}>{title}</Text>;
    }
  }

  renderOnlyTitle(iconName, title) {
    switch (title) {
      case 'Delete':
        return <Text style={styles.negativeAction}>{title}</Text>;
      case 'Leave':
        return <Text style={styles.negativeAction}>{title}</Text>;
      case 'Cancel':
        return <Text style={styles.positiveActionText}>{title}</Text>;
      default:
        return <Text style={styles.textStyle}>{title}</Text>;
    }
  }
  getTitleAndIcon(id, isStarred, iconName, title, color, muteOn, isUnread) {
    var _iconName = iconName;
    var _title = title;
    var _color = color;
    switch (id) {
      case sheetIds.START_CONVERSATION:
        _iconName = isStarred ? 'Favourite' : 'DR_Starred';
        _title = isStarred ? 'Unstar' : 'Star';
        _color = isStarred ? '#FFDA2D' : 'black';
        break;

      case sheetIds.MUTE_ID:
        _iconName = muteOn ? 'Mute' : 'Un_Mute';
        _title = muteOn ? 'Unmute' : 'Mute';
        break;

      case sheetIds.MARK_AS_UNREAD_ID:
        //  icon=isUnread?'Mute':'Un_Mute';
        _title = isUnread ? 'Mark As Read' : 'Mark As Unread';
        break;
    }
    return {_iconName, _title, _color};
  }
  actionItemImageAndTitle = () => {
    var {
      title,
      value,
      iconName,
      optionSelected,
      id,
      color,
      isStarred,
      muteOn,
      isUnread,
    } = this.props;
    var updateValue = this.getTitleAndIcon(
      id,
      isStarred,
      iconName,
      title,
      color,
      muteOn,
      isUnread,
    );
    title = updateValue._title;
    iconName = updateValue._iconName;

    return (
      <TouchableOpacity
        onPress={() => {
          optionSelected(id);
        }}
        style={styles.container}
        underlayColor="rgba(0,0,0,0.05)">
        {/* <View style={style.modalOption2}> */}
        <View style={styles.iconStyle}>{this.renderIcon(iconName, title)}</View>
        {this.renderTitle(iconName, title)}
        {/* {title === 'Delete' ? (
                    <Text style={styles.negativeAction}>{title}</Text>
                ) : (
                        <Text style={styles.modalTextStyle}>{title}</Text>
                    )} */}
        {/* <Text style={styles.modalTextStyle}>{text}</Text> */}
        {/* </View> */}
      </TouchableOpacity>
    );
  };

  actionItemOnlyTitle = () => {
    const {title, value, iconName, optionSelected, id, style} = this.props;
    return (
      <TouchableOpacity
        onPress={() => {
          optionSelected(id);
        }}
        style={styles.containerOnlyText}
        underlayColor="rgba(0,0,0,0.05)">
        {/* <View style={style.modalOption2}> */}
        {this.renderOnlyTitle(iconName, title)}
        {/* {title === 'Delete' ? (
                    <Text style={styles.negativeActionText}>{title}</Text>
                ) : (
                        <Text style={styles.textStyle}>{title}</Text>
                    )} */}
        {/* <Text style={styles.modalTextStyle}>{text}</Text> */}
        {/* </View> */}
      </TouchableOpacity>
    );
  };

  actionItemHeader = () => {
    const {title, value, iconName, optionSelected, id} = this.props;
    return (
      <TouchableOpacity
        onPress={() => {
          // optionSelected(id);
        }}
        style={styles.containerOnlyText}
        underlayColor="rgba(0,0,0,0.05)">
        {/* <View style={style.modalOption2}> */}
        {title === 'Delete' ? (
          <Text style={styles.negativeActionText}>{title}</Text>
        ) : (
          <Text style={styles.headerTextStyle}>{title}</Text>
        )}
        {/* <Text style={styles.modalTextStyle}>{text}</Text> */}
        {/* </View> */}
      </TouchableOpacity>
    );
  };

  componentWillUnmount() {}
  render() {
    const {itemType} = this.props;
    switch (itemType) {
      case 'titleOnly':
        return this.actionItemOnlyTitle();
      case 'header':
        return this.actionItemHeader();
      default:
        return this.actionItemImageAndTitle();
    }
    //    if (itemType === 'titleOnly') {
    //    } else {
    //     return this.actionItemImageAndTitle()
    //    }
  }
}

ActionItemBottomSheet.propTypes = {
  title: PropTypes.string,
  value: PropTypes.string,
  iconName: PropTypes.string,
  itemType: PropTypes.string,
  optionSelected: PropTypes.func,
};

//   export default ActionItemBottomSheet;

// const ActionItemBottomSheet = ({
//     iconName,
//     value,
//     title,
//     optionSelected,
//     id,
//   eva: {style, theme},
// }) => {

// };
// ActionItemBottomSheet.propTypes = propTypes;
// export default ActionItemBottomSheet;
