import React, {memo} from 'react';
import {View, Image, Text, StyleSheet} from 'react-native';
import {
  getEmojiFromUnicode,
  getIconfromType,
  getIconFromUnicode,
} from '../../utils/emoji';
import {normalize} from '../../utils/helpers';
import * as Constants from '../KoraText';
import ChatDefaultIcons from '../Chat/ChatDefaultIcons';
import FastImage from 'react-native-fast-image';
import {isEqual} from 'lodash/lang';
import WorkspaceDBItemLogo from '../../screens/workspaces/DiscussionRoomsScreen/WorkspaceDBItemLogo';

const defaultIcon = require('./../../assets/Emoji.png');
const FastImageCached = React.memo(({size, logo}) => {
  return (
    <FastImage
      style={{height: size, width: size, borderRadius: size / 2}}
      source={{
        uri: logo,
      }}
    />
  );
});

const DefaultIcon = memo(({size = 48}) => (
  <FastImage
    style={{height: size - 20, width: size - 20}}
    source={defaultIcon}
  />
));

class _RoomAvatar extends React.Component {
  shouldComponentUpdate(nextProps) {
    const diffBoardIcon =
      this.props.boardIcon?.val?.unicode !== nextProps.boardIcon?.val?.unicode;
    const diffSize = this.props.size !== nextProps.size;
    const diffShowCircle = this.props.showCircle !== nextProps.showCircle;
    const diffType = this.props.type !== nextProps.type;
    return diffBoardIcon || diffSize || diffShowCircle || diffType;
  }

  render() {
    const {
      size = 48,
      showCircle = true,
      boardIcon = '',
      wsId = null,
      type = '',
    } = this.props;
    const logo =
      boardIcon?.type === 'link'
        ? boardIcon?.val?.thumbnails.find((e) => e.size === 'smaller')?.url
        : null;
    const ShowIconParticular = () => {
      return <ChatDefaultIcons type={type} />;

      /*  case 'document':
        return <Icon name={'document'} size={22} color={'#000000'} />;
      case 'embeddedweb':
        return <Icon name={'Link'} size={22} color={'#000000'} />;

      case 'task':
        return <Icon name={'tasks'} size={22} color={'#000000'} />;
      case 'table':
        return <Icon name={'Table'} size={22} color={'#000000'} />;
      default:
        return (
          <Image
            style={{height: size - 20, width: size - 20}}
            source={require('./../../assets/NewDiscussionIcon.png')}
          />
        );
        */
    };

    const InnerIcon = ({size = 20}) => {
      if (boardIcon?.type === 'emoji' || boardIcon?.type === 'imoji') {
        const unicode = boardIcon.val.unicode;
        // if (!unicode) {
        //   return <DefaultIcon size={size} />;
        // }
        return (
          <Text
            style={{
              fontSize: normalize(size),
              lineHeight: size + 7,
            }}>
            {getIconFromUnicode(unicode, size, size)}
          </Text>
        );
      }

      return boardIcon != '' ? (
        <FastImageCached size={size} logo={logo} />
      ) : type !== '' ? (
        wsId ? (
          <WorkspaceDBItemLogo id={wsId} />
        ) : (
          <ShowIconParticular />
        )
      ) : (
        <Text>{getIconFromUnicode('1f9a3', size, size)}</Text>
      );
    };

    if (!showCircle) {
      return (
        <View style={{paddingTop: 3}}>
          <InnerIcon size={size} />
        </View>
      );
    }

    return (
      <View
        style={{
          borderRadius: size / 2,
          width: size,
          height: size,
          borderWidth: showCircle ? 1 : null,
          borderColor: '#EFF0F1',
          justifyContent: 'center',
          alignItems: 'center',

          paddingLeft: 1,
          alignSelf: 'center',
        }}>
        <InnerIcon size={size - 22} />
      </View>
    );
  }
}
// const _RoomAvatar = () => {

export const RoomAvatar = memo(_RoomAvatar);

const styles = StyleSheet.create({
  textStyle: {
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    justifyContent: 'center',
    textAlignVertical: 'center',
  },
});
